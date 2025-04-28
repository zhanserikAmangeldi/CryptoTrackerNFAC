import React, { useEffect, useState, useCallback } from 'react';
import { fetchCurrencies } from '../../services/currencyService';
import { LoadingSpinner, ErrorMessage, CurrencySelector } from '../shared/components';
import { formatCurrency } from '../../services/currencyService';

function CurrencyTable() {
    const [currencies, setCurrencies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('usd');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadCurrencies = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchCurrencies(selectedCurrency);
            setCurrencies(data);
        } catch (err) {
            setError(`Failed to load currencies: ${err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [selectedCurrency]);

    useEffect(() => {
        loadCurrencies();
    }, [loadCurrencies]);

    const filteredCurrencies = currencies.filter(currency =>
        currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCurrencyChange = (newCurrency) => {
        setSelectedCurrency(newCurrency);
    };

    if (loading && currencies.length === 0) {
        return <LoadingSpinner message="Loading cryptocurrency data..." />;
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={loadCurrencies} />;
    }

    return (
        <div className="currency-table-container">
            <div className="currency-table-header">
                <input
                    type="text"
                    placeholder="Search by name or symbol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />

                <CurrencySelector
                    selectedCurrency={selectedCurrency}
                    onChange={handleCurrencyChange}
                />
            </div>

            <table className="styled-table">
                <thead>
                <tr>
                    <th>Logo</th>
                    <th>Name</th>
                    <th>Symbol</th>
                    <th>Current Price</th>
                    <th>Market Cap</th>
                    <th>24h Change</th>
                </tr>
                </thead>
                <tbody>
                {filteredCurrencies.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="no-results">
                            No cryptocurrencies found matching "{searchTerm}"
                        </td>
                    </tr>
                ) : (
                    filteredCurrencies.map((currency) => (
                        <tr key={currency.id}>
                            <td>
                                <img src={currency.image} alt={currency.name} width="36" height="36" />
                            </td>
                            <td>{currency.name}</td>
                            <td>{currency.symbol.toUpperCase()}</td>
                            <td>{formatCurrency(currency.current_price, selectedCurrency)}</td>
                            <td>{formatCurrency(currency.market_cap, selectedCurrency)}</td>
                            <td className={currency.price_change_24h >= 0 ? "profit" : "loss"}>
                                {formatCurrency(currency.price_change_24h, selectedCurrency)}
                                <span className="percentage">({(currency.current_price/(currency.current_price + currency.price_change_24h)).toFixed(2)}%)</span>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
}

export default CurrencyTable;