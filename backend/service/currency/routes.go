package currency

import (
	"crypto-tracker/config"
	"crypto-tracker/types"
	"crypto-tracker/utils"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"io"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"
)

var (
	BASE_URL = "https://api.coingecko.com/api/v3"
	Cache    = make(map[string]CachedCurrencies)
	Mu       sync.RWMutex

	ExchangeRates     = make(map[string]float64)
	ExchangeRatesTime time.Time
)

type CachedCurrencies struct {
	Data      []types.CurrencyResponse
	Timestamp time.Time
}

type Handler struct {
}

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/currency", h.HandleCurrencies).Methods("GET", "OPTIONS")
}

func (h *Handler) HandleCurrencies(w http.ResponseWriter, r *http.Request) {

	requestedCurrency := r.URL.Query().Get("currency")
	if requestedCurrency == "" {
		requestedCurrency = "usd"
	}
	requestedCurrency = strings.ToLower(requestedCurrency)

	if requestedCurrency != "usd" && requestedCurrency != "eur" && requestedCurrency != "kzt" {
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("unsupported currency: %s", requestedCurrency))
		return
	}

	directApiSupport := requestedCurrency == "usd" || requestedCurrency == "eur"

	if directApiSupport {
		cacheKey := "result_" + requestedCurrency

		Mu.RLock()
		cached, exists := Cache[cacheKey]
		Mu.RUnlock()

		if exists && time.Since(cached.Timestamp) < time.Minute+time.Second*3 {
			log.Printf("Get %s from cache\n", requestedCurrency)
			currencies := cached.Data
			err := utils.WriteJSON(w, http.StatusOK, currencies)
			if err != nil {
				utils.WriteError(w, http.StatusInternalServerError, err)
			}
			return
		}

		log.Printf("Fetching %s data from API\n", requestedCurrency)
		req, err := http.NewRequest("GET", BASE_URL+"/coins/markets?vs_currency="+requestedCurrency, nil)
		if err != nil {
			utils.WriteError(w, http.StatusInternalServerError, err)
			return
		}

		req.Header.Add("x-cg-pro-api-key", config.Envs.CoinGeckoKey)

		client := &http.Client{Timeout: 10 * time.Second}
		response, err := client.Do(req)
		if err != nil {
			utils.WriteError(w, http.StatusInternalServerError, err)
			return
		}
		defer response.Body.Close()

		if response.StatusCode != http.StatusOK {
			utils.WriteError(w, response.StatusCode, nil)
			return
		}

		body, err := io.ReadAll(response.Body)
		if err != nil {
			utils.WriteError(w, http.StatusInternalServerError, err)
			return
		}

		var currencies []types.CurrencyResponse
		err = json.Unmarshal(body, &currencies)
		if err != nil {
			utils.WriteError(w, http.StatusInternalServerError, err)
			return
		}
		Mu.Lock()
		Cache[cacheKey] = CachedCurrencies{
			Data:      currencies,
			Timestamp: time.Now(),
		}
		Mu.Unlock()

		// Return the fresh data
		err = utils.WriteJSON(w, http.StatusOK, currencies)
		if err != nil {
			utils.WriteError(w, http.StatusInternalServerError, err)
		}
		return
	}

	Mu.RLock()
	cachedUSD, existsUSD := Cache["result_usd"]
	Mu.RUnlock()

	if !existsUSD || time.Since(cachedUSD.Timestamp) >= time.Minute+time.Second*3 {
		log.Println("Fetching USD data for KZT conversion")
		req, err := http.NewRequest("GET", BASE_URL+"/coins/markets?vs_currency=usd", nil)
		if err != nil {
			utils.WriteError(w, http.StatusInternalServerError, err)
			return
		}

		req.Header.Add("x-cg-pro-api-key", config.Envs.CoinGeckoKey)

		client := &http.Client{Timeout: 10 * time.Second}
		response, err := client.Do(req)
		if err != nil {
			utils.WriteError(w, http.StatusInternalServerError, err)
			return
		}
		defer response.Body.Close()

		if response.StatusCode != http.StatusOK {
			utils.WriteError(w, response.StatusCode, nil)
			return
		}

		body, err := io.ReadAll(response.Body)
		if err != nil {
			utils.WriteError(w, http.StatusInternalServerError, err)
			return
		}

		var currencies []types.CurrencyResponse
		err = json.Unmarshal(body, &currencies)
		if err != nil {
			utils.WriteError(w, http.StatusInternalServerError, err)
			return
		}

		Mu.Lock()
		Cache["result_usd"] = CachedCurrencies{
			Data:      currencies,
			Timestamp: time.Now(),
		}
		cachedUSD = Cache["result_usd"]
		Mu.Unlock()
	}

	rate, exists := ExchangeRates["KZT"]
	if !exists || ExchangeRatesTime.IsZero() || time.Since(ExchangeRatesTime) > 24*time.Hour {
		utils.WriteError(w, http.StatusServiceUnavailable,
			fmt.Errorf("KZT exchange rate data is not available, please try again later"))
		return
	}

	Mu.RLock()
	cachedKZT, existsKZT := Cache["result_kzt"]
	Mu.RUnlock()

	if existsKZT && time.Since(cachedKZT.Timestamp) < time.Minute+time.Second*3 {
		log.Println("Get KZT from cache")
		err := utils.WriteJSON(w, http.StatusOK, cachedKZT.Data)
		if err != nil {
			utils.WriteError(w, http.StatusInternalServerError, err)
		}
		return
	}

	log.Println("Converting USD to KZT")
	kztRate := rate

	kztData := make([]types.CurrencyResponse, len(cachedUSD.Data))
	copy(kztData, cachedUSD.Data)

	for i := range kztData {
		kztData[i].CurrentPrice *= kztRate
		kztData[i].PriceChange24Hour *= kztRate
		kztData[i].MarketCap = int(float64(kztData[i].MarketCap) * kztRate)
	}

	Mu.Lock()
	Cache["result_kzt"] = CachedCurrencies{
		Data:      kztData,
		Timestamp: time.Now(),
	}
	Mu.Unlock()

	err := utils.WriteJSON(w, http.StatusOK, kztData)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
	}
}
