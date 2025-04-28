import { getAuthToken } from '../services/authService';

export const getUserIdFromToken = () => {
    try {
        const token = getAuthToken();
        const arrayToken = token.split('.');
        const tokenPayload = JSON.parse(atob(arrayToken[1]));
        return parseInt(tokenPayload.userId);
    } catch (error) {
        console.error("Error extracting user ID from token:", error);
        throw new Error("Authentication error");
    }
};

export const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};