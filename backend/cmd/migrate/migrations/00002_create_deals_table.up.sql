CREATE TABLE deals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    currency_id VARCHAR(10) NOT NULL,
    count NUMERIC(20, 8) NOT NULL,
    price NUMERIC(20, 8) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
