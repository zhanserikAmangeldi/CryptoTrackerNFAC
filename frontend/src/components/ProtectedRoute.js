import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';

function ProtectedRoute() {
    return isAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;