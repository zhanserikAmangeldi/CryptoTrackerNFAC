package main

import (
	"crypto-tracker/cmd/api"
	"crypto-tracker/config"
	"crypto-tracker/database"
	"database/sql"
	"log"
)

func main() {
	db, err := database.NewPostgresDB(config.Envs.DatabaseURL)

	if err != nil {
		log.Fatal(err)
	}

	initDB(db)

	server := api.NewServer(":8080", db)
	if err := server.Run(); err != nil {
		log.Fatal(err)
	}
}

func initDB(db *sql.DB) {
	err := db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Connected to the database")
}
