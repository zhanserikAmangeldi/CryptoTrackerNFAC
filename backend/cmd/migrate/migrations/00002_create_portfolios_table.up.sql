CREATE TABLE portfolios (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    currency_id VARCHAR(10) NOT NULL,
    amount_owned NUMERIC(20, 8) NOT NULL,
    bought_at_price NUMERIC(20, 8) NOT NULL
);
