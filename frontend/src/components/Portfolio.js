import React, { useState, useEffect } from 'react';
import { getUserPortfolio } from '../services/portfolioService';
import { fetchCurrencies, createCurrencyLookup } from '../services/currencyService';

function Portfolio() {
    const [portfolio, setPortfolio] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalValue, setTotalValue] = useState(0);
    const [currencyData, setCurrencyData] = useState({});
    const selectedCurrency = 'usd';

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const portfolioData = await getUserPortfolio();

                if (typeof portfolioData === 'object' && portfolioData !== null) {
                    setPortfolio(portfolioData);

                    const cryptoIds = Object.keys(portfolioData).join(',');

                    if (cryptoIds) {
                        const currencies = await fetchCurrencies(selectedCurrency, cryptoIds);

                        const lookup = createCurrencyLookup(currencies);
                        setCurrencyData(lookup);

                        let portfolioTotal = 0;

                        Object.entries(portfolioData).forEach(([cryptoId, data]) => {
                            if (lookup[cryptoId]) {
                                const currentPrice = lookup[cryptoId].current_price;
                                portfolioTotal += data.total_count * currentPrice;
                            }
                        });

                        setTotalValue(portfolioTotal);
                    }
                } else {
                    setError('Invalid portfolio data received');
                }
            } catch (err) {
                setError(`Failed to load portfolio: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getCurrencySymbol = () => {
        return '$';
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    if (loading) {
        return <div className="portfolio-loading">Loading your portfolio...</div>;
    }

    if (error) {
        return <div className="portfolio-error">{error}</div>;
    }

    const portfolioEntries = Object.entries(portfolio);
    const hasPortfolio = portfolioEntries.length > 0;

    return (
        <div className="portfolio-container">
            <div className="portfolio-header">
                <h1>My Portfolio</h1>
                <div className="portfolio-summary">
                    <div className="portfolio-total-value">
                        <span>Total Value:</span>
                        <span className="value-amount">
                            {getCurrencySymbol()}{formatMoney(totalValue)}
                        </span>
                    </div>
                </div>
            </div>

            {!hasPortfolio ? (
                <div className="empty-portfolio">
                    <p>You don't have any cryptocurrencies in your portfolio yet.</p>
                    <p>Start adding transactions to build your portfolio!</p>
                </div>
            ) : (
                <div className="portfolio-assets">
                    <table className="styled-table">
                        <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Holdings</th>
                            <th>Avg. Buy Price</th>
                            <th>Current Price</th>
                            <th>Current Value</th>
                            <th>Profit/Loss</th>
                        </tr>
                        </thead>
                        <tbody>
                        {portfolioEntries.map(([cryptoId, data]) => {
                            const currentPrice = currencyData[cryptoId] ? currencyData[cryptoId].current_price : 0;
                            const currentValue = data.total_count * currentPrice;
                            const investedValue = data.total_count * data.avg_price;
                            const profitLoss = currentValue - investedValue;
                            const profitLossPercentage = investedValue > 0 ? (profitLoss / investedValue) * 100 : 0;

                            return (
                                <tr key={cryptoId}>
                                    <td className="asset-name">
                                        {currencyData[cryptoId] ? currencyData[cryptoId].name : cryptoId}
                                    </td>
                                    <td>{data.total_count.toFixed(6)}</td>
                                    <td>
                                        {getCurrencySymbol()}
                                        {formatMoney(data.avg_price)}
                                    </td>
                                    <td>
                                        {getCurrencySymbol()}
                                        {formatMoney(currentPrice)}
                                    </td>
                                    <td>
                                        {getCurrencySymbol()}
                                        {formatMoney(currentValue)}
                                    </td>
                                    <td className={profitLoss >= 0 ? "profit" : "loss"}>
                                        {getCurrencySymbol()}
                                        {formatMoney(profitLoss)}
                                        ({profitLossPercentage.toFixed(2)}%)
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Portfolio;