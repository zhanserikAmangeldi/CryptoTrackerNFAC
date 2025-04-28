import React, {useState, useEffect, useCallback} from 'react';
import {getUserDeals, deleteDeal} from '../../services/portfolioService';
import {fetchCurrencies, formatCurrency} from '../../services/currencyService';
import {EmptyState, ErrorMessage, formatDate, LoadingSpinner, Toast} from "../shared/components";
import ConfirmDialog from "../shared/ConfirmDialog";
import TransactionForm from "./TransactionForm";

function Transactions() {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [topCryptos, setTopCryptos] = useState([]);
    const [currencyCode] = useState('usd');
    const [dealToDelete, setDealToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [dealsData, cryptoData] = await Promise.all([
                getUserDeals(),
                fetchCurrencies(currencyCode, '')
            ]);

            setDeals(dealsData || []);
            setTopCryptos(cryptoData);
        } catch (err) {
            setError(`Failed to load data: ${err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currencyCode]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAddTransaction = () => {
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
    };

    const handleTransactionSuccess = (newDeal) => {
        setDeals(prevDeals => [newDeal, ...prevDeals]);
        setShowForm(false);
    };

    const getCurrencyName = (currencyId) => {
        const crypto = topCryptos.find(c => c.id === currencyId);
        return crypto ? crypto.name : currencyId;
    };

    const handleDeleteClick = (deal) => {
        setDealToDelete(deal);
    };

    const confirmDelete = async () => {
        if (!dealToDelete) return;

        try {
            setIsDeleting(true);
            await deleteDeal(dealToDelete.id);

            setDeals(prevDeals => prevDeals.filter(deal => deal.id !== dealToDelete.id));

            setToast({
                show: true,
                message: 'Transaction deleted successfully',
                type: 'success'
            });
        } catch (err) {
            setToast({
                show: true,
                message: `Failed to delete transaction: ${err.message}`,
                type: 'error'
            });
        } finally {
            setIsDeleting(false);
            setDealToDelete(null);
        }
    };

    const cancelDelete = () => {
        setDealToDelete(null);
    };

    const closeToast = () => {
        setToast({ ...toast, show: false });
    };

    if (loading && deals.length === 0) {
        return <LoadingSpinner message="Loading your transactions..." />;
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

            {error && <ErrorMessage message={error} onRetry={loadData} />}

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={closeToast}
                />
            )}

            {dealToDelete && (
                <ConfirmDialog
                    title="Delete Transaction"
                    message={`Are you sure you want to delete this transaction of ${parseFloat(dealToDelete.count).toFixed(3)} ${getCurrencyName(dealToDelete.currency_id)}?`}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                    isLoading={isDeleting}
                    confirmText="Delete"
                    cancelText="Cancel"
                    confirmButtonClass="danger-btn"
                />
            )}

            {showForm && (
                <TransactionForm
                    cryptos={topCryptos}
                    onSuccess={handleTransactionSuccess}
                    onCancel={handleCloseForm}
                />
            )}

            {!loading && deals.length === 0 ? (
                <EmptyState
                    title="No Transactions Yet"
                    description="You haven't made any cryptocurrency transactions yet. Click 'Add Transaction' to record your first crypto purchase!"
                />
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
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {deals.map(deal => {
                            const count = parseFloat(deal.count);
                            const price = parseFloat(deal.price);
                            const total = count * price;

                            return (
                                <tr key={deal.id}>
                                    <td>{formatDate(deal.created_at)}</td>
                                    <td>{getCurrencyName(deal.currency_id)}</td>
                                    <td>{count.toFixed(3)}</td>
                                    <td>{formatCurrency(price, currencyCode)}</td>
                                    <td>{formatCurrency(total, currencyCode)}</td>
                                    <td className="actions-cell">
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDeleteClick(deal)}
                                            aria-label="Delete transaction"
                                        >
                                            Delete
                                        </button>
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

export default Transactions;