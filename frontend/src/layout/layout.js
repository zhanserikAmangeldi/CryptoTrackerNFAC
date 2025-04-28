import React, {useState} from 'react';
import {Link, Outlet, useLocation} from 'react-router-dom';
import { isAuthenticated, logout } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { FaCommentAlt } from 'react-icons/fa';
import AIChat from "../components/Chat/AIChat";

function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isChatOpen, setIsChatOpen] = useState(false);

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="app-layout">
            <header className="app-header">
                <div className="header-logo">
                    <Link to="/">CryptoTracker</Link>
                </div>
                <nav className="header-nav">
                    {isAuthenticated() && (
                        <div className="nav-links">
                            <Link
                                to="/portfolio"
                                className={`nav-link ${location.pathname === '/portfolio' ? 'active' : ''}`}
                            >
                                Portfolio
                            </Link>

                            <Link
                                to="/deals"
                                className={`nav-link ${location.pathname === '/deals' ? 'active' : ''}`}
                            >
                                Transactions
                            </Link>
                        </div>
                    )}
                    {isAuthenticated() ? (
                        <button onClick={handleLogout} className="auth-button logout">
                            Logout
                        </button>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="auth-button login">Login</Link>
                            <Link to="/register" className="auth-button register">Register</Link>
                        </div>
                    )}
                </nav>
            </header>

            <main className="app-content">
                <Outlet />
            </main>

            <>
                <button onClick={toggleChat} className="chat-button">
                    <FaCommentAlt />
                </button>

                <div className={`floating-chat-container ${isChatOpen ? 'open' : ''}`}>
                    <div className="chat-header">
                        <h3>AI Crypto Assistant</h3>
                        <button onClick={toggleChat} className="close-chat-button">
                            ✕
                        </button>
                    </div>
                    {isAuthenticated() ? (
                        <div className="floating-chat-content">
                            {isChatOpen && <AIChat />}
                        </div>

                    ) : (
                        <div className="auth-prompt">
                            <p>Want to get personalized crypto advice?</p>
                            <div className="auth-prompt-buttons">
                                <Link to="/login" className="auth-button">Login</Link>
                                <span> or </span>
                                <Link to="/register" className="auth-button">Register</Link>
                            </div>
                        </div>
                    )}
                </div>
            </>

            <footer className="app-footer">
                <p>© {new Date().getFullYear()} CryptoTracker</p>
            </footer>
        </div>
    );
}

export default Layout;