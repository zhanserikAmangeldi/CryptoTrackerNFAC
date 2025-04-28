import {DEAL_URL} from "../utils/Constants";
import {getAuthHeaders, getUserIdFromToken} from "../utils/auth";

export const getUserPortfolio = async () => {
    try {
        const userId = getUserIdFromToken();
        const headers = getAuthHeaders();

        const response = await fetch(`${DEAL_URL}/users/${userId}/portfolio`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch portfolio: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching portfolio:", error);
        throw error;
    }
};

export const getUserDeals = async () => {
    try {
        const userId = getUserIdFromToken();
        const headers = getAuthHeaders();

        const response = await fetch(`${DEAL_URL}/users/${userId}/deals`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch transactions: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching transactions:", error);
        throw error;
    }
};

export const createDeal = async (dealData) => {
    try {
        const headers = getAuthHeaders();

        const response = await fetch(`${DEAL_URL}/`, {
            method: 'POST',
            headers,
            body: JSON.stringify(dealData),
        });

        if (!response.ok) {
            throw new Error(`Failed to create transaction: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating transaction:", error);
        throw error;
    }
};

export const deleteDeal = async (dealId) => {
    try {
        const headers = getAuthHeaders();

        const response = await fetch(`${DEAL_URL}/${dealId}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to delete transaction: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error("Error deleting transaction:", error);
        throw error;
    }
};