package currency

import (
	"crypto-tracker/utils"
	"fmt"
	"github.com/gorilla/mux"
	"log"
	"net/http"
	"strings"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
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

	if !h.service.IsCurrencySupported(requestedCurrency) {
		supportedList := strings.Join(h.service.GetAllSupportedCurrencies(), ", ")
		utils.WriteError(
			w,
			http.StatusBadRequest,
			fmt.Errorf("unsupported currency: %s (supported: %s)", requestedCurrency, supportedList))
		return
	}

	log.Printf("Getting data for %s\n", requestedCurrency)
	currencyData, err := h.service.GetCurrencyData(requestedCurrency)
	if err != nil {
		code := http.StatusInternalServerError
		if strings.Contains(err.Error(), "not available") {
			code = http.StatusServiceUnavailable
		}
		utils.WriteError(w, code, err)
		return
	}

	err = utils.WriteJSON(w, http.StatusOK, currencyData)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
	}
}
