package api

import (
	"context"
	"crypto-tracker/background"
	"crypto-tracker/config"
	"crypto-tracker/jobs"
	"crypto-tracker/middlewares"
	"crypto-tracker/service/chat"
	"crypto-tracker/service/currency"
	"crypto-tracker/service/user"
	"database/sql"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

type Server struct {
	addr string
	db   *sql.DB
}

func NewServer(addr string, db *sql.DB) *Server {
	return &Server{
		addr: addr,
		db:   db,
	}
}

func (s *Server) Run() error {
	router := mux.NewRouter()
	corsRouter := middlewares.CORS(router)

	subrouter := router.PathPrefix("/api/v1").Subrouter()

	userStore := user.NewStore(s.db)
	userService := user.NewHandler(userStore)
	userService.RegisterRoutes(subrouter)

	chatService, _ := chat.NewHandler(config.Envs, userStore)
	chatService.RegisterRoutes(subrouter)

	currencyService := currency.NewHandler()
	currencyService.RegisterRoutes(subrouter)

	s.startBackgroundJobs()

	log.Println("Listening on", s.addr)

	return http.ListenAndServe(s.addr, corsRouter)
}

func (s *Server) startBackgroundJobs() {
	j := jobs.NewJobs()

	background.Go(j.GetCurrencies(context.Background()))
}
