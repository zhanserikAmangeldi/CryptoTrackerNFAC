import React, { useState, useEffect, useCallback } from 'react';
import {getUserPortfolio} from "../../services/portfolioService";
import {EmptyState, ErrorMessage, LoadingSpinner} from "../shared/components";
import {createCurrencyLookup, fetchCurrencies, formatCurrency} from "../../services/currencyService";

function Portfolio() {
    const [portfolio, setPortfolio] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalValue, setTotalValue] = useState(0);
    const [currencyData, setCurrencyData] = useState({});
    const [currencyCode] = useState('usd');

    const loadPortfolio = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const portfolioData = await getUserPortfolio();

            if (!portfolioData || typeof portfolioData !== 'object') {
                throw new Error('Invalid portfolio data received');
            }

            setPortfolio(portfolioData);

            const cryptoIds = Object.keys(portfolioData);

            if (cryptoIds.length > 0) {
                const currencies = await fetchCurrencies(currencyCode, cryptoIds.join(','));
                const lookup = createCurrencyLookup(currencies);
                setCurrencyData(lookup);

                const portfolioTotal = Object.entries(portfolioData).reduce((total, [cryptoId, data]) => {
                    if (lookup[cryptoId]) {
                        const currentPrice = lookup[cryptoId].current_price;
                        return total + (data.total_count * currentPrice);
                    }
                    return total;
                }, 0);

                setTotalValue(portfolioTotal);
            } else {
                setTotalValue(0);
                setCurrencyData({});
            }
        } catch (err) {
            setError(`Failed to load portfolio: ${err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currencyCode]);

    useEffect(() => {
        loadPortfolio();
    }, [loadPortfolio]);

    if (loading) {
        return <LoadingSpinner message="Loading your portfolio..." />;
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={loadPortfolio} />;
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
                            {formatCurrency(totalValue, currencyCode)}
                        </span>
                    </div>
                </div>
            </div>

            {!hasPortfolio ? (
                <EmptyState
                    title="Empty Portfolio"
                    description="You don't have any cryptocurrencies in your portfolio yet. Start adding transactions to build your portfolio!"
                />
            ) : (
                <div className="portfolio-assets">
                    <table className="styled-table">
                        <thead>
                        <tr>
                            <th>Logo</th>
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
                            const cryptoName = currencyData[cryptoId] ? currencyData[cryptoId].name : cryptoId;

                            return (
                                <tr key={cryptoId}>
                                    <td>
                                        {currencyData[cryptoId] && currencyData[cryptoId].image && (
                                            <img
                                                src={currencyData[cryptoId].image}
                                                alt={cryptoName}
                                                className="crypto-icon"
                                                width="24"
                                                height="24"
                                            />
                                        )}
                                    </td>
                                    <td>
                                        {cryptoName}
                                    </td>
                                    <td>{data.total_count.toFixed(3)}</td>
                                    <td>{formatCurrency(data.avg_price, currencyCode)}</td>
                                    <td>{formatCurrency(currentPrice, currencyCode)}</td>
                                    <td>{formatCurrency(currentValue, currencyCode)}</td>
                                    <td className={profitLoss >= 0 ? "profit" : "loss"}>
                                        {formatCurrency(profitLoss, currencyCode)}
                                        <span className="percentage">({profitLossPercentage.toFixed(2)}%)</span>
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