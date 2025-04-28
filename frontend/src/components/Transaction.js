import React, { useState, useEffect } from 'react';
import { getUserDeals, createDeal } from '../services/portfolioService';
import { fetchCurrencies } from '../services/currencyService';
import {getAuthToken} from "../services/authService";

function Transactions() {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        currency_id: '',
        count: '',
        price: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedCurrency = 'usd';
    const [topCryptos, setTopCryptos] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const dealsData = await getUserDeals();
                setDeals(dealsData || []);

                const cryptoData = await fetchCurrencies(selectedCurrency, '');
                setTopCryptos(cryptoData);
            } catch (err) {
                setError(`Failed to load data: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAddTransaction = () => {
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setFormData({
            currency_id: '',
            count: '',
            price: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = getAuthToken();
        const arrayToken = token.split('.');
        const tokenPayload = JSON.parse(atob(arrayToken[1]));

        console.log(tokenPayload);
        const id = tokenPayload.userId;

        if (!formData.currency_id || !formData.count || !formData.price) {
            setError("All fields are required");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            const dealData = {
                user_id: parseInt(id),
                currency_id: formData.currency_id,
                count: parseFloat(formData.count),
                price: parseFloat(formData.price)
            };

            console.log(dealData);

            const result = await createDeal(dealData);

            setDeals(prevDeals => [result, ...prevDeals]);

            handleCloseForm();
        } catch (err) {
            setError(`Failed to create transaction: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const getCurrencySymbol = () => {
        return '$';
    };

    if (loading && deals.length === 0) {
        return <div className="transactions-loading">Loading your transactions...</div>;
    }

    return (
        <div className="transactions-container">
            <div className="transactions-header">
                <h1>My Transactions</h1>
                <div className="actions">
                    <button
                        className="add-transaction-btn"
                        onClick={handleAddTransaction}
                    >
                        Add Transaction
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {showForm && (
                <div className="transaction-form-container">
                    <div className="transaction-form">
                        <h2>Add New Transaction</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="currency_id">Cryptocurrency</label>
                                <select
                                    id="currency_id"
                                    name="currency_id"
                                    value={formData.currency_id}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select a cryptocurrency</option>
                                    {topCryptos.map(crypto => (
                                        <option key={crypto.id} value={crypto.id}>
                                            {crypto.name} ({crypto.symbol.toUpperCase()})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="count">Amount</label>
                                <input
                                    type="number"
                                    id="count"
                                    name="count"
                                    step="any"
                                    min="0.0000001"
                                    value={formData.count}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="price">Price per unit ($)</label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    step="any"
                                    min="0.0000001"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={handleCloseForm}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Transaction'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deals.length === 0 ? (
                <div className="empty-transactions">
                    <p>You haven't made any cryptocurrency transactions yet.</p>
                    <p>Click "Add Transaction" to record your first crypto purchase!</p>
                </div>
            ) : (
                <div className="transactions-list">
                    <table className="styled-table">
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Cryptocurrency</th>
                            <th>Amount</th>
                            <th>Price</th>
                            <th>Total Value</th>
                        </tr>
                        </thead>
                        <tbody>
                        {deals.map(deal => (
                            <tr key={deal.id}>
                                <td>{formatDate(deal.created_at)}</td>
                                <td>{deal.currency_id}</td>
                                <td>{parseFloat(deal.count).toFixed(6)}</td>
                                <td>
                                    {getCurrencySymbol()}
                                    {parseFloat(deal.price).toFixed(2)}
                                </td>
                                <td>
                                    {getCurrencySymbol()}
                                    {(parseFloat(deal.count) * parseFloat(deal.price)).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Transactions;