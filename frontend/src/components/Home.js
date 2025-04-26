import React from 'react';
import { logout } from '../services/authService';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="home-container">
            <h1>Welcome to the CryptoTracker</h1>

            <button onClick={handleLogout} className="logout-button">
                Logout
            </button>
        </div>
    );
}

export default Home;