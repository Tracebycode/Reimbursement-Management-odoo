import React, { createContext, useState, useContext } from 'react';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
    // 1. User Management State (Schema: id, name, role, email, password, created_at, org_id, manager_id)
    const orgId = 'org-123';
    
    const [users, setUsers] = useState([
        { id: 'u1', name: 'Admin User', email: 'admin@company.com', role: 'ADMIN', manager_id: null, org_id: orgId, created_at: '2026-01-01T10:00:00Z', department: 'Management' },
        { id: 'u2', name: 'Sarah Jenkins', email: 'sarah@company.com', role: 'MANAGER', manager_id: 'u1', org_id: orgId, created_at: '2026-02-15T09:30:00Z', department: 'Sales' },
        { id: 'u3', name: 'Mitchell Rose', email: 'mitchell@company.com', role: 'MANAGER', manager_id: 'u1', org_id: orgId, created_at: '2026-02-16T11:00:00Z', department: 'Engineering' },
        { id: 'u4', name: 'Marc', email: 'marc@company.com', role: 'EMPLOYEE', manager_id: 'u2', org_id: orgId, created_at: '2026-03-01T08:15:00Z', department: 'Sales' },
        { id: 'u5', name: 'John Doe', email: 'john@company.com', role: 'EMPLOYEE', manager_id: 'u3', org_id: orgId, created_at: '2026-03-05T14:20:00Z', department: 'Engineering' }
    ]);

    const addUser = (newUser) => setUsers([...users, { ...newUser, id: `u${Date.now()}`, org_id: orgId, created_at: new Date().toISOString() }]);
    const updateUser = (id, updatedUser) => setUsers(users.map(u => u.id === id ? { ...u, ...updatedUser } : u));
    const deleteUser = (id) => setUsers(users.filter(u => u.id !== id));

    // 2. Global Expenses State (Schema: id, org_id, user_id, amount, description, status, created_at, category, currency, receipt_image)
    const [expenses, setExpenses] = useState([
        { id: "EXP-8901", org_id: orgId, user_id: "u4", amount: 1250, description: "Flight to NY", status: "PENDING", created_at: "2026-06-12T10:42:00Z", category: "Travel", currency: "USD", receipt_image: null },
        { id: "EXP-8900", org_id: orgId, user_id: "u5", amount: 45, description: "Team lunch", status: "APPROVED", created_at: "2026-06-11T09:15:00Z", category: "Meals", currency: "USD", receipt_image: null },
        { id: "EXP-8899", org_id: orgId, user_id: "u4", amount: 320, description: "New monitor", status: "APPROVED", created_at: "2026-06-10T08:00:00Z", category: "Office Supplies", currency: "USD", receipt_image: null },
        { id: "EXP-8898", org_id: orgId, user_id: "u5", amount: 850, description: "Client dinner", status: "REJECTED", created_at: "2026-06-09T17:30:00Z", category: "Entertainment", currency: "USD", receipt_image: null },
    ]);

    // 3. Approval Rules State
    // Restoring structure based on original UI preferences:
    const [rules, setRules] = useState({
        'u4': { 
            description: 'Approval rule for miscellaneous expenses', 
            isManagerApprover: true, 
            approvers: [
                { user_id: 'u5', required: true },
                { user_id: 'u3', required: false },
                { user_id: 'u2', required: false }
            ],
            sequence: false,
            minimumPercentage: 60
        }
    });

    const updateRules = (userId, newRules) => setRules({ ...rules, [userId]: newRules });

    // 4. Company Settings State
    const [settings, setSettings] = useState({
        companyName: "Acme Corp",
        adminName: "Admin User",
        email: "admin@company.com",
        country: "United States",
        currency: "USD ($)"
    });

    const updateSettings = (newSettings) => setSettings({ ...settings, ...newSettings });

    return (
        <AdminContext.Provider value={{
            users, addUser, updateUser, deleteUser,
            expenses, setExpenses,
            rules, updateRules,
            settings, updateSettings
        }}>
            {children}
        </AdminContext.Provider>
    );
};
