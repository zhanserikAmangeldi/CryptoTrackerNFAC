package deals

import (
	"crypto-tracker/service/user"
	"crypto-tracker/utils"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
	"strconv"
)

type Handler struct {
	service *DealService
	store   *user.Store
}

func NewHandler(service *DealService, store *user.Store) *Handler {
	return &Handler{
		service: service,
		store:   store,
	}
}

func (h *Handler) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/deals", h.CreateDeal).Methods("POST")
	router.HandleFunc("/deals", h.GetAllDeals).Methods("GET")
	router.HandleFunc("/deals/{id:[0-9]+}", h.GetDeal).Methods("GET")
	router.HandleFunc("/deals/{id:[0-9]+}", h.UpdateDeal).Methods("PUT")
	router.HandleFunc("/deals/{id:[0-9]+}", h.DeleteDeal).Methods("DELETE")
	router.HandleFunc("/users/{user_id}/deals", h.GetUserDeals).Methods("GET")
	router.HandleFunc("/users/{user_id}/portfolio", h.GetUserPortfolio).Methods("GET")
}

func (h *Handler) CreateDeal(w http.ResponseWriter, r *http.Request) {
	var deal *Deal

	err := utils.ParseJSON(r, &deal)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}

	defer r.Body.Close()

	vars := mux.Vars(r)
	id, _ := strconv.ParseInt(vars["id"], 10, 64)
	_, err = h.store.GetUserById(int(id))
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}

	if err := h.service.Create(deal); err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}

	utils.WriteJSON(w, http.StatusCreated, deal)
}

func (h *Handler) GetDeal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid deal id"))
		return
	}

	deal, err := h.service.GetByID(id)
	if err != nil {
		if errors.Is(err, errors.New("deal not found")) {
			utils.WriteError(w, http.StatusNotFound, fmt.Errorf("deal not found"))
		} else {
			utils.WriteError(w, http.StatusInternalServerError, err)
		}
		return
	}

	utils.WriteJSON(w, http.StatusOK, deal)
}

func (h *Handler) GetUserDeals(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["user_id"]

	deals, err := h.service.GetByUserID(userID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}

	utils.WriteJSON(w, http.StatusOK, deals)
}

func (h *Handler) GetAllDeals(w http.ResponseWriter, r *http.Request) {
	deals, err := h.service.GetAll()
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}

	utils.WriteJSON(w, http.StatusOK, deals)
}

func (h *Handler) UpdateDeal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid deal id"))
		return
	}

	var deal Deal

	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&deal); err != nil {
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("Invalid request payload"))
		return
	}
	defer r.Body.Close()

	deal.Id = id

	if err := h.service.Update(&deal); err != nil {
		if errors.Is(err, errors.New("deal not found")) {
			utils.WriteError(w, http.StatusNotFound, fmt.Errorf("Deal not found"))
		} else {
			utils.WriteError(w, http.StatusInternalServerError, err)
		}
		return
	}

	utils.WriteJSON(w, http.StatusOK, deal)
}

func (h *Handler) DeleteDeal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, fmt.Errorf("invalid deal ID"))
		return
	}

	if err := h.service.Delete(id); err != nil {
		if errors.Is(err, errors.New("deal not found")) {
			utils.WriteError(w, http.StatusNotFound, fmt.Errorf("deal not found"))
		} else {
			utils.WriteError(w, http.StatusInternalServerError, err)
		}
		return
	}

	utils.WriteJSON(w, http.StatusOK, map[string]string{"result": "success"})
}

func (h *Handler) GetUserPortfolio(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["user_id"]

	portfolio, err := h.service.GetUserPortfolio(userID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, err)
		return
	}

	utils.WriteJSON(w, http.StatusOK, portfolio)
}
