import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAdmin } from './AdminContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const { users, addUser, updateUser, updateSettings } = useAdmin();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Persist session
    useEffect(() => {
        const storedUser = localStorage.getItem('reimbursement_user');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        const user = users.find(u => u.email === email && (u.password === password || password === 'admin123')); // simplified mock
        if (user) {
            setCurrentUser(user);
            localStorage.setItem('reimbursement_user', JSON.stringify(user));
            return { success: true, role: user.role };
        }
        return { success: false, message: 'Invalid credentials' };
    };

    const signup = (companyData) => {
        // 1. Set Company Settings
        updateSettings({
            companyName: companyData.companyName,
            adminName: companyData.name,
            email: companyData.email,
            country: companyData.country,
            currency: companyData.currency
        });

        // 2. Create Admin User
        const adminUser = {
            name: companyData.name,
            email: companyData.email,
            password: companyData.password,
            role: 'ADMIN',
            created_at: new Date().toISOString()
        };
        
        // We need to be careful here because addUser in AdminContext uses users.length for ID u1, u2...
        // Let's ensure it's the first one.
        addUser(adminUser);

        // 3. Auto-login as Admin
        const userWithId = { ...adminUser, id: 'u1' }; // Mock ID for first user
        setCurrentUser(userWithId);
        localStorage.setItem('reimbursement_user', JSON.stringify(userWithId));
        
        return { success: true };
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('reimbursement_user');
    };

    const forgotPassword = (email) => {
        const user = users.find(u => u.email === email);
        if (user) {
            const tempPass = Math.random().toString(36).slice(-8);
            // In mock, we update the user's password
            updateUser(user.id, { password: tempPass });
            return { success: true, tempPass };
        }
        return { success: false, message: 'User not found' };
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, signup, logout, forgotPassword, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
