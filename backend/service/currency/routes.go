package currency

import (
	"crypto-tracker/config"
	"crypto-tracker/types"
	"crypto-tracker/utils"
	"encoding/json"
	"github.com/gorilla/mux"
	"io"
	"net/http"
)

var (
	BASE_URL = "https://api.coingecko.com/api/v3"
)

type Handler struct {
}

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/currency", h.HandleCurrencies).Methods("GET", "OPTIONS")
}

func (h *Handler) HandleCurrencies(w http.ResponseWriter, r *http.Request) {
	currency := r.URL.Query().Get("currency")
	if currency == "" {
		currency = "usd"
	}

	req, _ := http.NewRequest("GET", BASE_URL+"/coins/markets?vs_currency="+currency, nil)

	req.Header.Add("x-cg-pro-api-key", config.Envs.CoinGeckoKey)

	response, _ := http.DefaultClient.Do(req)

	var currencies []types.CurrencyResponse
	body, err := io.ReadAll(response.Body)

	err = json.Unmarshal([]byte(body), &currencies)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
	}

	err = utils.WriteJSON(w, http.StatusOK, currencies)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
	}
}
