import { getAuthToken } from './authService';

const BASE_URL = "http://localhost:8080/api/v1/deals";

export const getUserPortfolio = async () => {
    try {
        const token = getAuthToken();
        const arrayToken = token.split('.');
        const tokenPayload = JSON.parse(atob(arrayToken[1]));

        console.log(tokenPayload);
        const id = tokenPayload.userId;

        const response = await fetch(`${BASE_URL}/users/${id}/portfolio`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
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
        const token = getAuthToken();
        const arrayToken = token.split('.');
        const tokenPayload = JSON.parse(atob(arrayToken[1]));

        console.log(tokenPayload);
        const id = tokenPayload.userId;

        const response = await fetch(`${BASE_URL}/users/${id}/deals`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
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
        const authToken = getAuthToken();
        const response = await fetch(`${BASE_URL}/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
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