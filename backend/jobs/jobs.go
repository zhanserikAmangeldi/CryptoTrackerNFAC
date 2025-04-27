package jobs

import (
	"context"
	"crypto-tracker/background"
	"crypto-tracker/config"
	"crypto-tracker/service/currency"
	"crypto-tracker/types"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

type Jobs struct {
}

func NewJobs() *Jobs {
	return &Jobs{}
}

func (j *Jobs) GetCurrencies(ctx context.Context) background.JobFunc {
	return func() {
		fetchExchangeRates()

		currencyTicker := time.NewTicker(60 * time.Second)
		exchangeRateTicker := time.NewTicker(1 * time.Hour)

		defer currencyTicker.Stop()
		defer exchangeRateTicker.Stop()

		supportedCurrencies := []string{"usd", "eur"}

		for _, currencyCode := range supportedCurrencies {
			err := getCurrencyData(currencyCode)
			if err != nil {
				log.Printf("Error fetching %s data: %v\n", currencyCode, err)
			}
		}

		updateKZTData()

		for {
			select {
			case <-ctx.Done():
				return
			case <-currencyTicker.C:
				for _, currencyCode := range supportedCurrencies {
					err := getCurrencyData(currencyCode)
					if err != nil {
						log.Printf("Error fetching %s data: %v\n", currencyCode, err)
					}
				}

				updateKZTData()

			case <-exchangeRateTicker.C:
				fetchExchangeRates()
			}
		}
	}
}

func getCurrencyData(currencyCode string) error {
	req, err := http.NewRequest("GET", currency.BASE_URL+"/coins/markets?vs_currency="+currencyCode, nil)
	if err != nil {
		return err
	}

	if config.Envs.CoinGeckoKey != "" {
		req.Header.Add("x-cg-pro-api-key", config.Envs.CoinGeckoKey)
	}

	client := &http.Client{Timeout: 10 * time.Second}
	response, err := client.Do(req)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return fmt.Errorf("API returned status code %d", response.StatusCode)
	}

	body, err := io.ReadAll(response.Body)
	if err != nil {
		return err
	}

	var currencies []types.CurrencyResponse
	err = json.Unmarshal(body, &currencies)
	if err != nil {
		return err
	}

	cacheKey := "result_" + currencyCode

	currency.Mu.Lock()
	currency.Cache[cacheKey] = currency.CachedCurrencies{
		Data:      currencies,
		Timestamp: time.Now(),
	}
	currency.Mu.Unlock()
	log.Printf("Background job: Updated cache for %s\n", currencyCode)

	return nil
}

func fetchExchangeRates() {
	log.Println("Fetching exchange rates...")

	query := "https://v6.exchangerate-api.com/v6/" + config.Envs.ExchangeRateKey + "/latest/USD"
	req, err := http.NewRequest("GET", query, nil)
	if err != nil {
		log.Printf("Error creating exchange rate request: %v\n", err)
		return
	}

	client := &http.Client{Timeout: 10 * time.Second}
	response, err := client.Do(req)
	if err != nil {
		log.Printf("Error fetching exchange rates: %v\n", err)
		return
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		log.Printf("Exchange rate API returned status code %d\n", response.StatusCode)
		return
	}

	body, err := io.ReadAll(response.Body)
	if err != nil {
		log.Printf("Error reading exchange rate response: %v\n", err)
		return
	}
	log.Println(string(body))

	var rateResponse types.ExchangeRateResponse
	err = json.Unmarshal(body, &rateResponse)
	if err != nil {
		log.Printf("Error parsing exchange rate data: %v\n", err)
		return
	}
	log.Println(rateResponse)
	currency.Mu.Lock()
	if rate, exists := rateResponse.Rates["EUR"]; exists {
		currency.ExchangeRates["EUR"] = rate
	}

	if rate, exists := rateResponse.Rates["KZT"]; exists {
		currency.ExchangeRates["KZT"] = rate
	}

	currency.ExchangeRatesTime = time.Now()
	currency.Mu.Unlock()

	log.Printf("Exchange rates updated successfully")
}

func updateKZTData() {
	currency.Mu.RLock()
	cachedUSD, existsUSD := currency.Cache["result_usd"]
	kztRate, rateExists := currency.ExchangeRates["KZT"]
	currency.Mu.RUnlock()

	if !existsUSD {
		log.Println("USD data not available for KZT conversion")
		return
	}

	if !rateExists {
		log.Println("KZT exchange rate not available, skipping KZT data generation")
		return
	}

	kztData := make([]types.CurrencyResponse, len(cachedUSD.Data))
	copy(kztData, cachedUSD.Data)

	for i := range kztData {
		kztData[i].CurrentPrice *= kztRate
		kztData[i].PriceChange24Hour *= kztRate
		kztData[i].MarketCap = int(float64(kztData[i].MarketCap) * kztRate)
	}

	currency.Mu.Lock()
	currency.Cache["result_kzt"] = currency.CachedCurrencies{
		Data:      kztData,
		Timestamp: time.Now(),
	}
	currency.Mu.Unlock()

	log.Println("Background job: Updated KZT data from USD conversion")
}
