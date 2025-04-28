import {BASE_URL} from "../utils/Constants";

export const login = async (credentials) => {
    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const data = await response.json();
        
        localStorage.setItem('authToken', data.token);
        return data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}

export const register = async (userData) => {
    try {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (response.status >= 400) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || 'Registration failed';
            throw new Error(errorMessage);
        }

        return { success: true, status: response.status };
    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('authToken');
};

export const isAuthenticated = () => {
    return localStorage.getItem('authToken') !== null;
};

export const getAuthToken = () => {
    return localStorage.getItem('authToken');
};