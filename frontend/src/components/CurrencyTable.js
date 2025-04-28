import React, { useEffect, useState } from 'react';
import { fetchCurrencies } from '../services/currencyService';

function CurrencyTable() {
    const [currencies, setCurrencies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('usd');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const availableCurrencies = [
        { value: 'usd', label: 'USD' },
        { value: 'eur', label: 'EUR' },
        { value: 'kzt', label: 'KZT' }
    ];

    useEffect(() => {
        const loadCurrencies = async () => {
            try {
                setLoading(true);
                const data = await fetchCurrencies(selectedCurrency);
                setCurrencies(data);
            } catch (err) {
                setError(`Failed to load currencies: ${err.message}`);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadCurrencies();
    }, [selectedCurrency]);

    const filteredCurrencies = currencies.filter(currency =>
        currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCurrencyChange = (e) => {
        const newCurrency = e.target.value;
        setSelectedCurrency(newCurrency);
    };

    if (loading && currencies.length === 0) {
        return <div className="currencies-loading">Loading cryptocurrency data...</div>;
    }

    if (error) {
        return <div className="currencies-error">{error}</div>;
    }

    return (
        <div>
            <input
                type="text"
                placeholder="Search by name or symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: '16px', padding: '8px', width: '300px' }}
            />

            <div className="currency-selector">
                <label htmlFor="currency-select">Select Fiat Currency: </label>
                <select
                    id="currency-select"
                    value={selectedCurrency}
                    onChange={handleCurrencyChange}
                >
                    {availableCurrencies.map(currency => (
                        <option key={currency.value} value={currency.value}>
                            {currency.label}
                        </option>
                    ))}
                </select>
            </div>

            <table className="styled-table">
                <thead>
                <tr>
                    <th>Logo</th>
                    <th>Name</th>
                    <th>Symbol</th>
                    <th>Current Price</th>
                    <th>Market Cap.</th>
                    <th>Changes in last 24h</th>
                </tr>
                </thead>
                <tbody>
                {
                    filteredCurrencies.map((currency) => {
                        return (
                            <tr key={currency.id}>
                                <td>
                                    <img src={currency.image} alt={currency.id} width={"36"} height={"36"} />
                                </td>
                                <td>{currency.name}</td>
                                <td>{currency.symbol}</td>
                                <td>{currency.current_price.toFixed(2)}</td>
                                <td>{currency.market_cap}</td>
                                <td>{currency.price_change_24h.toFixed(2)}</td>
                            </tr>
                        )
                    })
                }
                </tbody>
            </table>
            <style jsx>{`
                .header-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .currency-selector {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                select {
                    padding: 8px;
                    border-radius: 4px;
                    border: 1px solid #ccc;
                }

                .currencies-loading,
                .currencies-error {
                    text-align: center;
                    padding: 2rem;
                    background-color: #f9f9f9;
                    border-radius: 8px;
                    margin: 1rem 0;
                }

                .currencies-error {
                    color: #d32f2f;
                    background-color: #ffebee;
                }
            `}</style>
        </div>
    );
}

export default CurrencyTable;