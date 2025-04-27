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
