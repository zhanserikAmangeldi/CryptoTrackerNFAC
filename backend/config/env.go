package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	PublicHost          string
	Port                string
	DatabaseURL         string
	JWTExpiration       int64 // in seconds
	JWTSecret           string
	AzureOpenAIKey      string
	AzureOpenAIEndpoint string
	ModelDeploymentID   string
	CoinGeckoKey        string
}

var (
	Envs = initConfig()
)

func initConfig() *Config {
	godotenv.Load()

	return &Config{
		PublicHost:          getEnv("PUBLIC_HOST", "localhost"),
		Port:                getEnv("PORT", "8080"),
		DatabaseURL:         getEnv("POSTGRES", "postgres://username:password@localhost:5432/database?sslmode=disable"),
		JWTExpiration:       getEnvAsInt("JWT_Expiration", 3600*24*7),
		JWTSecret:           getEnv("JWT_Secret", "Secret"),
		AzureOpenAIKey:      getEnv("AZURE_OPENAI_KEY", "your azure open api key"),
		AzureOpenAIEndpoint: getEnv("AZURE_OPENAI_ENDPOINT", "you azure open api endpoint"),
		ModelDeploymentID:   getEnv("AZURE_OPENAI_MODEL_DEPLOYMENT_ID", "azure open api model deployment id"),
		CoinGeckoKey:        getEnv("COIN_GECKO_KEY", "your coinGecko key"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}

	return fallback
}

func getEnvAsInt(key string, fallback int64) int64 {
	if value, ok := os.LookupEnv(key); ok {
		i, err := strconv.ParseInt(value, 10, 64)
		if err != nil {
			return fallback
		}

		return i
	}

	return fallback
}
