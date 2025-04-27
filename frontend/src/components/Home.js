import React, { useState } from 'react';
import { logout } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import AIChat from './AIChat';
import ChatIcon from './ChatIcon';
import CurrencyTable from "./CurrencyTable";

function    Home() {
    const navigate = useNavigate();
    const [isChatOpen, setIsChatOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    return (
        <div className="home-container">
            <h1>Welcome to the CryptoTracker</h1>

            <div>
                <CurrencyTable />
            </div>

            <button onClick={toggleChat} className="chat-button">
                <ChatIcon />
            </button>

            <div className={`floating-chat-container ${isChatOpen ? 'open' : ''}`}>
                <div className="chat-header">
                    <h3>AI Crypto Assistant</h3>
                    <button onClick={toggleChat} className="close-chat-button">
                        ✕
                    </button>
                </div>
                <div className="floating-chat-content">
                    {isChatOpen && <AIChat />}
                </div>
            </div>

            <button onClick={handleLogout} className="logout-button">
                Logout
            </button>
        </div>
    );
}

export default Home;