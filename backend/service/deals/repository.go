package deals

import (
	"database/sql"
	"errors"
	"time"
)

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

type DealRepository interface {
	Create(deal *Deal) error
	GetByID(id int64) (*Deal, error)
	GetByUserID(userId string) ([]*Deal, error)
	GetAll() ([]*Deal, error)
	Update(deal *Deal) error
	Delete(id int64) error
}

type Repository struct {
	DB *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{DB: db}
}

func (r *Repository) GetAll() ([]*Deal, error) {
	query := `
		SELECT id, user_id, currency_id, count, price, created_at, updated_at
		FROM deals
		ORDER BY created_at DESC
	`

	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var deals []*Deal

	for rows.Next() {
		var deal Deal
		var createdAt, updatedAt time.Time

		err := rows.Scan(
			&deal.Id,
			&deal.UserId,
			&deal.CurrencyId,
			&deal.Count,
			&deal.Price,
			&createdAt,
			&updatedAt,
		)

		if err != nil {
			return nil, err
		}

		deal.CreatedAt = createdAt
		deal.UpdatedAt = updatedAt

		deals = append(deals, &deal)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return deals, nil
}

func (r *Repository) Create(deal *Deal) error {
	query := `
		INSERT INTO deals (user_id, currency_id, count, price, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err := r.DB.QueryRow(
		query,
		deal.UserId,
		deal.CurrencyId,
		deal.Count,
		deal.Price,
	).Scan(&deal.Id, &deal.CreatedAt, &deal.UpdatedAt)

	if err != nil {
		return err
	}

	return nil
}

func (r *Repository) GetByID(id int64) (*Deal, error) {
	query := `
		SELECT id, user_id, currency_id, count, price, created_at, updated_at
		FROM deals
		WHERE id = $1
	`

	var deal Deal
	var createdAt, updatedAt time.Time

	err := r.DB.QueryRow(query, id).Scan(
		&deal.Id,
		&deal.UserId,
		&deal.CurrencyId,
		&deal.Count,
		&deal.Price,
		&createdAt,
		&updatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	deal.CreatedAt = createdAt
	deal.UpdatedAt = updatedAt

	return &deal, nil
}

func (r *Repository) GetByUserID(userID string) ([]*Deal, error) {
	query := `
		SELECT id, user_id, currency_id, count, price, created_at, updated_at
		FROM deals
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var deals []*Deal

	for rows.Next() {
		var deal Deal
		var createdAt, updatedAt time.Time

		err := rows.Scan(
			&deal.Id,
			&deal.UserId,
			&deal.CurrencyId,
			&deal.Count,
			&deal.Price,
			&createdAt,
			&updatedAt,
		)

		if err != nil {
			return nil, err
		}

		deal.CreatedAt = createdAt
		deal.UpdatedAt = updatedAt

		deals = append(deals, &deal)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return deals, nil
}

func (r *Repository) Update(deal *Deal) error {
	query := `
		UPDATE deals
		SET user_id = $1, currency_id = $2, count = $3, price = $4, updated_at = NOW()
		WHERE id = $5
		RETURNING updated_at
	`

	var updatedAt time.Time

	err := r.DB.QueryRow(
		query,
		deal.UserId,
		deal.CurrencyId,
		deal.Count,
		deal.Price,
		deal.Id,
	).Scan(&updatedAt)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return errors.New("deal not found")
		}
		return err
	}

	deal.UpdatedAt = updatedAt

	return nil
}

func (r *Repository) Delete(id int64) error {
	query := `DELETE FROM deals WHERE id = $1`

	result, err := r.DB.Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("deal not found")
	}

	return nil
}
