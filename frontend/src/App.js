import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Home from './components/Home';
import Layout from './layout/layout';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import './components/Chat/Chat.css';
import './components/Crypto/Crypto.css';
import Portfolio from "./components/Crypto/Portfolio";
import Transactions from "./components/Crypto/Transactions";
import AIChat from "./components/Chat/AIChat";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />


                    <Route element={<ProtectedRoute />}>
                        <Route path="chat" element={<AIChat />} />
                        <Route path="portfolio" element={<Portfolio />} />
                        <Route path="deals" element={<Transactions />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;