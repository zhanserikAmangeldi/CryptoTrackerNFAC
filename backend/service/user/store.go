package user

import (
	"crypto-tracker/types"
	"database/sql"
	"fmt"
)

type Store struct {
	database *sql.DB
}

func NewStore(db *sql.DB) *Store {
	return &Store{database: db}
}

func scanRowsIntoUser(rows *sql.Rows) (*types.User, error) {
	user := new(types.User)

	err := rows.Scan(
		&user.Id,
		&user.FirstName,
		&user.LastName,
		&user.Email,
		&user.Password,
		&user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *Store) GetUserByEmail(email string) (*types.User, error) {
	rows, err := s.database.Query("SELECT * FROM users WHERE email = ?", email)
	if err != nil {
		return nil, err
	}

	user := new(types.User)
	for rows.Next() {
		user, err = scanRowsIntoUser(rows)
		if err != nil {
			return nil, err
		}
	}

	if user.Id == 0 {
		return nil, fmt.Errorf("User not found.")
	}

	return user, nil
}

func (s *Store) GetUserById(id int) (*types.User, error) {
	rows, err := s.database.Query("SELECT * FROM users WHERE id = ?", id)
	if err != nil {
		return nil, err
	}

	user := new(types.User)
	for rows.Next() {
		err := rows.Scan(
			&user.Id,
			&user.FirstName,
			&user.LastName,
			&user.Email,
			&user.Password,
			&user.CreatedAt,
		)

		if err != nil {
			return nil, err
		}
	}

	if user.Id == 0 {
		return nil, fmt.Errorf("User not found.")
	}

	return user, nil
}

func (s *Store) CreateUser(user types.User) error {
	_, err := s.database.Exec(
		"INSERT INTO users (firstName, lastName, email, password) VALUES ($1, $2, $3, $4);",
		user.FirstName, user.LastName, user.Email, user.Password,
	)
	if err != nil {
		return err
	}

	return nil
}
