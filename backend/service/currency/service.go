package currency

import (
	"crypto-tracker/config"
	"crypto-tracker/types"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sync"
	"time"
)

const (
	BASE_URL          = "https://api.coingecko.com/api/v3"
	CACHE_EXPIRY      = time.Minute + time.Second*3
	EXCHANGE_RATE_URL = "https://v6.exchangerate-api.com/v6/%s/latest/USD"
)

type Service struct {
	cache           map[string]CachedCurrencies
	mu              sync.RWMutex
	exchangeRates   map[string]float64
	ratesUpdateTime time.Time
	httpClient      *http.Client
	baseURL         string
	exchangeRateURL string
	config          *config.Config
}

type CachedCurrencies struct {
	Data      []types.CurrencyResponse
	Timestamp time.Time
}

func NewService(cfg *config.Config) *Service {
	return &Service{
		cache:           make(map[string]CachedCurrencies),
		exchangeRates:   make(map[string]float64),
		httpClient:      &http.Client{Timeout: 10 * time.Second},
		baseURL:         BASE_URL,
		exchangeRateURL: EXCHANGE_RATE_URL,
		config:          cfg,
	}
}

func (s *Service) GetCurrencyData(currencyCode string) ([]types.CurrencyResponse, error) {
	if !s.IsCurrencySupported(currencyCode) {
		return nil, fmt.Errorf("unsupported currency: %s", currencyCode)
	}

	cacheKey := "result_" + currencyCode

	s.mu.RLock()
	cached, exists := s.cache[cacheKey]
	s.mu.RUnlock()

	if exists && time.Since(cached.Timestamp) < CACHE_EXPIRY {
		log.Printf("Getting %s from cache\n", currencyCode)
		return cached.Data, nil
	}

	// Fetching from gecko api directly supported currencies like eur and usd(kzt for my great sadness do not supported)
	if s.IsCurrencyDirectlySupported(currencyCode) {
		err := s.FetchCurrencyData(currencyCode)
		if err != nil {
			return nil, err
		}

		s.mu.RLock()
		data := s.cache[cacheKey].Data
		s.mu.RUnlock()

		return data, nil
	}

	// If I needed to support more derived currencies I should to change, but, for while is almost enough
	if currencyCode == "kzt" {
		// To get the kzt, we will use usd, and just using the exchange rate api, will convert usd to kzt
		// because of this we should get firstly usd
		_, err := s.GetCurrencyData("usd")
		if err != nil {
			return nil, fmt.Errorf("Failed to get USD data for KZT conversion: %w.", err)
		}

		s.mu.RLock()
		_, rateExists := s.exchangeRates["KZT"]
		rateAge := time.Since(s.ratesUpdateTime)
		s.mu.RUnlock()

		if !rateExists || rateAge > 24*time.Hour {
			return nil, fmt.Errorf("KZT exchange rate data is not available or expired")
		}

		err = s.UpdateKZTData()
		if err != nil {
			return nil, err
		}

		s.mu.RLock()
		kztData := s.cache["result_kzt"].Data
		s.mu.RUnlock()

		return kztData, nil
	}

	return nil, fmt.Errorf("unsupported currency handling for %s", currencyCode)
}

func (s *Service) FetchCurrencyData(currencyCode string) error {
	if !s.IsCurrencyDirectlySupported(currencyCode) {
		return fmt.Errorf("currency %s is not directly supported", currencyCode)
	}

	req, err := http.NewRequest("GET", s.baseURL+"/coins/markets?vs_currency="+currencyCode, nil)
	if err != nil {
		return err
	}

	if s.config.CoinGeckoKey != "" {
		req.Header.Add("x-cg-pro-api-key", s.config.CoinGeckoKey)
	}

	response, err := s.httpClient.Do(req)
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

	s.mu.Lock()
	s.cache[cacheKey] = CachedCurrencies{
		Data:      currencies,
		Timestamp: time.Now(),
	}
	s.mu.Unlock()

	log.Printf("Updated cache for %s\n", currencyCode)
	return nil
}

func (s *Service) FetchExchangeRates() error {
	log.Println("Fetching exchange rates...")

	// Because of Gecko API have not KZT, we should to convert usd to kzt, and for that
	// I use Exchange-Rate API, there we get the exchange of dollar to every currency for that moment
	query := fmt.Sprintf(s.exchangeRateURL, s.config.ExchangeRateKey)
	req, err := http.NewRequest("GET", query, nil)
	if err != nil {
		return fmt.Errorf("error creating exchange rate request: %w", err)
	}

	response, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("error fetching exchange rates: %w", err)
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return fmt.Errorf("exchange rate API returned status code %d", response.StatusCode)
	}

	body, err := io.ReadAll(response.Body)
	if err != nil {
		return fmt.Errorf("error reading exchange rate response: %w", err)
	}

	var rateResponse types.ExchangeRateResponse
	err = json.Unmarshal(body, &rateResponse)
	if err != nil {
		return fmt.Errorf("error parsing exchange rate data: %w", err)
	}

	s.mu.Lock()
	if rate, exists := rateResponse.Rates["EUR"]; exists {
		s.exchangeRates["EUR"] = rate
	}

	if rate, exists := rateResponse.Rates["KZT"]; exists {
		s.exchangeRates["KZT"] = rate
	}

	s.ratesUpdateTime = time.Now()
	s.mu.Unlock()

	log.Printf("Exchange rates updated successfully")
	return nil
}

func (s *Service) GetExchangeRate(currency string) (float64, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	rate, exists := s.exchangeRates[currency]
	if !exists {
		return 0, fmt.Errorf("exchange rate for %s not available", currency)
	}

	return rate, nil
}

func (s *Service) UpdateDerivedCurrencies() error {
	return s.UpdateKZTData()
}

func (s *Service) UpdateKZTData() error {
	s.mu.RLock()
	cachedUSD, existsUSD := s.cache["result_usd"]
	kztRate, rateExists := s.exchangeRates["KZT"]
	s.mu.RUnlock()

	if !existsUSD {
		return fmt.Errorf("USD data not available for KZT conversion")
	}

	if !rateExists {
		return fmt.Errorf("KZT exchange rate not available")
	}

	kztData := make([]types.CurrencyResponse, len(cachedUSD.Data))
	copy(kztData, cachedUSD.Data)

	for i := range kztData {
		kztData[i].CurrentPrice *= kztRate
		kztData[i].PriceChange24Hour *= kztRate
		kztData[i].MarketCap = int(float64(kztData[i].MarketCap) * kztRate)
	}

	s.mu.Lock()
	s.cache["result_kzt"] = CachedCurrencies{
		Data:      kztData,
		Timestamp: time.Now(),
	}
	s.mu.Unlock()

	log.Println("Updated KZT data from USD conversion")
	return nil
}

// Helpers

func (s *Service) GetSupportedDirectCurrencies() []string {
	return []string{"usd", "eur"}
}

func (s *Service) GetSupportedDerivedCurrencies() []string {
	// maybe in feature will add more, but for that moment is norm
	return []string{"kzt"}
}

func (s *Service) GetAllSupportedCurrencies() []string {
	direct := s.GetSupportedDirectCurrencies()
	derived := s.GetSupportedDerivedCurrencies()

	allCurrencies := make([]string, 0, len(direct)+len(derived))
	allCurrencies = append(allCurrencies, direct...)
	allCurrencies = append(allCurrencies, derived...)

	return allCurrencies
}

func (s *Service) IsCurrencySupported(currency string) bool {
	for _, c := range s.GetAllSupportedCurrencies() {
		if c == currency {
			return true
		}
	}
	return false
}

func (s *Service) IsCurrencyDirectlySupported(currency string) bool {
	for _, c := range s.GetSupportedDirectCurrencies() {
		if c == currency {
			return true
		}
	}
	return false
}
