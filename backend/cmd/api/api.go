package api

import (
	"context"
	"crypto-tracker/background"
	"crypto-tracker/config"
	"crypto-tracker/jobs"
	"crypto-tracker/middlewares"
	"crypto-tracker/service/auth"
	"crypto-tracker/service/chat"
	"crypto-tracker/service/currency"
	"crypto-tracker/service/deals"
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

	currencyService := currency.NewService(config.Envs)
	currencyHandler := currency.NewHandler(currencyService)
	currencyHandler.RegisterRoutes(subrouter)

	dealStore := deals.NewDealPostgresRepository(s.db)
	dealService := deals.NewDealService(dealStore)

	dealSubrouter := subrouter.PathPrefix("/deals").Subrouter()

	dealSubrouter.Use(func(next http.Handler) http.Handler {
		return auth.AuthMiddleware(next.ServeHTTP, userStore)
	})

	dealRoutes := deals.NewHandler(dealService, userStore)
	dealRoutes.RegisterRoutes(dealSubrouter)

	s.startBackgroundJobs(currencyService)

	log.Println("Listening on", s.addr)

	return http.ListenAndServe(s.addr, corsRouter)
}

func (s *Server) startBackgroundJobs(currencyService *currency.Service) {
	j := jobs.NewJobs(currencyService)

	background.Go(j.GetCurrencies(context.Background()))
}
