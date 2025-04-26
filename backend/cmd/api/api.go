package api

import (
	"crypto-tracker/service/auth"
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
	corsRouter := auth.CORS(router)

	subrouter := router.PathPrefix("/api/v1").Subrouter()

	userStore := user.NewStore(s.db)
	userService := user.NewHandler(userStore)
	userService.RegisterRoutes(subrouter)

	log.Println("Listening on", s.addr)

	return http.ListenAndServe(s.addr, corsRouter)
}
