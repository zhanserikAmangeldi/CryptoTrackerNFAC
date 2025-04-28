import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import AIChat from './AIChat';

function ChatPage() {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="chat-container">
            <h1>AI Crypto Assistant</h1>

            <div className="chat-content">
                <AIChat />
            </div>

            <button onClick={handleLogout} className="logout-button">
                Logout
            </button>
        </div>
    );
}

export default ChatPage;