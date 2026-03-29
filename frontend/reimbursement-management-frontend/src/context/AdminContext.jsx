import React, { createContext, useState, useContext } from 'react';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
    // 1. User Management State (Schema: id, name, role, email, password, created_at, org_id, manager_id)
    const orgId = 'org-123';
    
    const [users, setUsers] = useState([]);
    
    const addUser = (newUser) => {
        const id = `u${users.length + 1}`;
        setUsers([...users, { ...newUser, id, org_id: orgId, created_at: new Date().toISOString() }]);
    };
    const updateUser = (id, updatedUser) => setUsers(users.map(u => u.id === id ? { ...u, ...updatedUser } : u));
    const deleteUser = (id) => setUsers(users.filter(u => u.id !== id));

    // 2. Global Expenses State (Schema: id, org_id, user_id, amount, description, status, created_at, category, currency, receipt_image, action_logs)
    const [expenses, setExpenses] = useState([]);

    const updateExpenseStatus = (id, newStatus, actorName = 'System') => {
        setExpenses(expenses.map(exp => {
            if (exp.id === id) {
                const newLog = { actor: actorName, action: newStatus === 'PENDING' ? 'Submitted' : newStatus === 'APPROVED' ? 'Approved' : 'Rejected', time: new Date().toISOString() };
                return { ...exp, status: newStatus, action_logs: [...(exp.action_logs || []), newLog] };
            }
            return exp;
        }));
    };

    const addExpense = (newExpense) => {
        const id = `EXP-${Math.floor(1000 + Math.random() * 9000)}`;
        setExpenses([{ ...newExpense, id, org_id: orgId, created_at: new Date().toISOString(), action_logs: [] }, ...expenses]);
    };

    // 3. Approval Rules State
    const [rules, setRules] = useState({});

    const updateRules = (userId, newRules) => setRules({ ...rules, [userId]: newRules });

    // 4. Company Settings State
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('company_settings');
        return saved ? JSON.parse(saved) : {
            companyName: "",
            adminName: "",
            email: "",
            country: "",
            currency: ""
        };
    });

    const updateSettings = (newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        localStorage.setItem('company_settings', JSON.stringify(updated));
    };

    return (
        <AdminContext.Provider value={{
            users, addUser, updateUser, deleteUser,
            expenses, setExpenses, updateExpenseStatus, addExpense,
            rules, updateRules,
            settings, updateSettings
        }}>
            {children}
        </AdminContext.Provider>
    );
};
