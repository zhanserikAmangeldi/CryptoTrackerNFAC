package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	PublicHost  string
	Port        string
	DatabaseURL string
}

var (
	Envs = initConfig()
)

func initConfig() *Config {
	godotenv.Load()

	return &Config{
		PublicHost:  getEnv("PUBLIC_HOST", "localhost"),
		Port:        getEnv("PORT", "8080"),
		DatabaseURL: getEnv("POSTGRES", "postgres://username:password@localhost:5432/database?sslmode=disable"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}

	return fallback
}
