import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Persist session
    useEffect(() => {
        const storedUser = localStorage.getItem('reimbursement_user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // If the user doesn't have an org_id, it is a stale mock session from before the API integration.
                if (parsedUser && parsedUser.org_id !== undefined) {
                    setCurrentUser(parsedUser);
                } else {
                    localStorage.removeItem('reimbursement_user');
                    localStorage.removeItem('token');
                }
            } catch (err) {
                console.error("Failed to parse stored user", err);
                localStorage.removeItem('reimbursement_user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post("/api/auth/login", { email, password });
            const user = res.data.data;
            
            // Set user matching our roles
            setCurrentUser(user);
            localStorage.setItem('reimbursement_user', JSON.stringify(user));
            // Add a token anyway if needed by future endpoints
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
            }
            return { success: true, role: user.role };
        } catch (err) {
            return { 
                success: false, 
                message: err.response?.data?.message || 'Invalid credentials'
            };
        }
    };

    const signup = async (companyData) => {
        try {
            const res = await api.post("/api/auth/signup", {
                name: companyData.name,
                email: companyData.email,
                organization_name: companyData.companyName,
                currency: companyData.currency,
                password: companyData.password
            });
            return { success: true };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || 'Signup failed'
            };
        }
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('reimbursement_user');
        localStorage.removeItem('token');
    };

    const forgotPassword = async (email) => {
        // Backend does not support forgot password currently.
        return { success: false, message: 'Not supported by backend yet' };
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, signup, logout, forgotPassword, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
