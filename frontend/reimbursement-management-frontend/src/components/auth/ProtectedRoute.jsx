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

    if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes(currentUser.role?.toLowerCase())) {
        // Redirect to appropriate dashboard if role not allowed
        const userRole = currentUser.role?.toLowerCase();
        const defaultPath = userRole === 'admin' ? '/admin/dashboard' : 
                          userRole === 'manager' ? '/manager/dashboard' : 
                          '/employee/dashboard';
        return <Navigate to={defaultPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
