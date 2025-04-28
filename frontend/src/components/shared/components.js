import React from 'react';

export const LoadingSpinner = ({ message = "Loading..." }) => (
    <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{message}</p>
    </div>
);

export const ErrorMessage = ({ message, onRetry }) => (
    <div className="error-message">
        <p>{message}</p>
        {onRetry && (
            <button className="retry-button" onClick={onRetry}>
                Retry
            </button>
        )}
    </div>
);

export const Toast = ({ message, type = 'success', onClose }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (onClose) onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`toast-notification ${type}`}>
            <span>{message}</span>
            <button className="toast-close" onClick={onClose}>×</button>
        </div>
    );
};

export const EmptyState = ({ title, description, action }) => (
    <div className="empty-state">
        <h3>{title}</h3>
        <p>{description}</p>
        {action}
    </div>
);

export const CurrencySelector = ({ selectedCurrency, onChange }) => {
    const availableCurrencies = [
        { value: 'usd', label: 'USD' },
        { value: 'eur', label: 'EUR' },
        { value: 'kzt', label: 'KZT' }
    ];

    return (
        <div className="currency-selector">
            <label htmlFor="currency-select">Select Fiat Currency: </label>
            <select
                id="currency-select"
                value={selectedCurrency}
                onChange={(e) => onChange(e.target.value)}
            >
                {availableCurrencies.map(currency => (
                    <option key={currency.value} value={currency.value}>
                        {currency.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

