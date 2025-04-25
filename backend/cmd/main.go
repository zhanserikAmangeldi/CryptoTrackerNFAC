package main

import (
	"crypto-tracker/cmd/api"
	"log"
)

func main() {
	server := api.NewServer(":8080", nil)
	if err := server.Run(); err != nil {
		log.Fatal(err)
	}
}
