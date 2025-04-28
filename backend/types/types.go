package types

import (
	"time"
)

type RegisterPayload struct {
	FirstName string `json:"firstName" validate:"required"`
	LastName  string `json:"lastName" validate:"required"`
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=8,max=255"`
}

type LoginPayload struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8,max=255"`
}

type User struct {
	Id        int       `json:"id"`
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
	Email     string    `json:"email"`
	Password  string    `json:"-"`
	CreatedAt time.Time `json:"createdAt"`
}

type UserStore interface {
	GetUserByEmail(email string) (*User, error)
	GetUserById(id int) (*User, error)
	CreateUser(User) error
}

// AI CHAT structures
type ChatRequest struct {
	Messages     []ChatMessage `json:"messages"`
	SystemPrompt string        `json:"system_prompt,omitempty"`
}

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatResponse struct {
	Message      string `json:"message"`
	FinishReason string `json:"finish_reason,omitempty"`
	UserId       int    `json:"userId"`
	Error        string `json:"error,omitempty"`
}

type CurrencyResponse struct {
	Id                string  `json:"id"`
	Symbol            string  `json:"symbol"`
	Name              string  `json:"name"`
	Image             string  `json:"image"`
	CurrentPrice      float64 `json:"current_price"`
	MarketCap         int     `json:"market_cap"`
	PriceChange24Hour float64 `json:"price_change_24h"`
}

type ExchangeRateResponse struct {
	Success string             `json:"restring"`
	Rates   map[string]float64 `json:"conversion_rates"`
}

type Deal struct {
	Id         int64     `json:"id"`
	UserId     int64     `json:"user_id" validate:"required"`
	CurrencyId string    `json:"currency_id" validate:"required"`
	Count      float64   `json:"count" validate:"required"`
	Price      float64   `json:"price" validate:"required"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type Portfolio struct {
	CurrencyID string  `json:"currency_id"`
	TotalCount float64 `json:"total_count"`
	AvgPrice   float64 `json:"avg_price"`
	TotalCost  float64 `json:"total_cost"`
}
