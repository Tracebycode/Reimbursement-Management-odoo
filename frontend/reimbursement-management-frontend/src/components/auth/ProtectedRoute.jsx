import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) return null; // Or a spinner

    if (!currentUser) {
        // Redirect to login if not logged in
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        // Redirect to appropriate dashboard if role not allowed
        const defaultPath = currentUser.role === 'ADMIN' ? '/admin/dashboard' : 
                          currentUser.role === 'MANAGER' ? '/manager/dashboard' : 
                          '/employee/dashboard';
        return <Navigate to={defaultPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
