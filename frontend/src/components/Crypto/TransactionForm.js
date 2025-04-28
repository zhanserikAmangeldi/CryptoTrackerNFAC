import React, { useState } from 'react';
import { createDeal } from '../../services/portfolioService';
import { getUserIdFromToken } from '../../utils/auth';
import { ErrorMessage } from '../shared/components';

function TransactionForm({ cryptos, onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        currency_id: '',
        count: '',
        price: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.currency_id) return "Please select a cryptocurrency";
        if (!formData.count || parseFloat(formData.count) <= 0) return "Please enter a valid amount";
        if (!formData.price || parseFloat(formData.price) <= 0) return "Please enter a valid price";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            const userId = getUserIdFromToken();

            const dealData = {
                user_id: userId,
                currency_id: formData.currency_id,
                count: parseFloat(formData.count),
                price: parseFloat(formData.price)
            };

            const result = await createDeal(dealData);
            onSuccess(result);
        } catch (err) {
            setError(`Failed to create transaction: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="transaction-form-container">
            <div className="transaction-form">
                <h2>Add New Transaction</h2>

                {error && <ErrorMessage message={error} />}

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
                            {cryptos.map(crypto => (
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
                            onClick={onCancel}
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
    );
}

export default TransactionForm;