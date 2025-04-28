import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Layout from './layout/layout';
import ProtectedRoute from './components/ProtectedRoute';
import ChatPage from './components/ChatPage';
import './App.css';
import './Chat.css';
import './Crypto.css';
import Portfolio from "./components/Portfolio";
import Transactions from "./components/Transaction";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />


                    <Route element={<ProtectedRoute />}>
                        <Route path="chat" element={<ChatPage />} />
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