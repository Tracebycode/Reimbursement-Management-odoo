import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './AdminPages.css';

const UserManagement = () => {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    
    const [isAddMode, setIsAddMode] = useState(false);
    const [toast, setToast] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [newUser, setNewUser] = useState({
        name: '', email: '', role: 'employee', manager_id: '', department: ''
    });

    useEffect(() => {
        if (currentUser && currentUser.org_id) {
            fetchUsers();
        }
    }, [currentUser]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/api/users', { params: { org_id: currentUser.org_id } });
            setUsers(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch users", err);
            setToast({ message: "Failed to load users", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const generatePassword = (userEmail) => {
        const pass = "password123"; // Using mock generation as we don't have an email service
        setToast({ message: `Password for ${userEmail}: ${pass}`, type: 'success' });
        setTimeout(() => setToast(null), 10000);
        return pass;
    };

    const handleSaveUser = async () => {
        if (!newUser.name || !newUser.email) {
            setToast({ message: "Name and Email are required", type: 'error' });
            return;
        }
        
        const tempPass = generatePassword(newUser.email);
        
        try {
            await api.post('/api/users', {
                org_id: parseInt(currentUser.org_id, 10),
                name: newUser.name,
                email: newUser.email,
                role: newUser.role.toLowerCase(), // Ensure lowercase as expected by backend
                manager_id: newUser.manager_id ? parseInt(newUser.manager_id, 10) : undefined,
                password: tempPass
            });
            
            setToast({ message: "User created successfully", type: 'success' });
            setTimeout(() => setToast(null), 3000);
            
            // Reload users
            fetchUsers();
            
            setNewUser({ name: '', email: '', role: 'employee', manager_id: '', department: '' });
            setIsAddMode(false);
            
        } catch (err) {
            setToast({ message: err.response?.data?.message || "Failed to create user", type: 'error' });
        }
    };

    // Anyone who isn't a basic 'employee' can act as a manager for workflow purposes
    const managers = users.filter(u => u.role?.toLowerCase() !== 'employee');

    return (
        <div className="admin-page-container">
            {toast && (
                <div className={`toast-notification ${toast.type}`}>
                    {toast.message}
                    <button onClick={() => setToast(null)}>×</button>
                </div>
            )}
            <header className="page-header">
                <div>
                    <h1>User Management</h1>
                    <p>Assign roles, managers, and manage credentials.</p>
                </div>
                {!isAddMode && (
                    <button className="primary-action-btn" onClick={() => setIsAddMode(true)}>
                        New User
                    </button>
                )}
            </header>

            <div className="card-container full-width">
                {isAddMode && (
                    <div className="add-user-panel slide-down" style={{marginBottom: '2rem'}}>
                        <div className="form-grid">
                            <input type="text" className="fancy-input" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="User Name" />
                            <select className="fancy-select" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                                <option value="employee">Employee</option>
                                <option value="manager">Manager</option>
                                <option value="hr">HR/Admin</option>
                                <option value="finance">Finance</option>
                                <option value="director">Director/Executive</option>
                                <option value="admin">System Admin</option>
                            </select>
                            <select className="fancy-select" value={newUser.manager_id} onChange={e => setNewUser({...newUser, manager_id: e.target.value})}>
                                <option value="">Select Manager</option>
                                {managers.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                            <input type="email" className="fancy-input" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="Email" />
                        </div>
                        <div className="panel-actions" style={{marginTop: '1rem', justifyContent: 'flex-start', gap: '1rem'}}>
                            <button className="btn-primary" onClick={handleSaveUser}>Save User</button>
                            <button className="btn-secondary" onClick={() => setIsAddMode(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                <div className="table-wrapper">
                        {isLoading ? (
                            <p style={{padding: '2rem', textAlign: 'center'}}>Loading users...</p>
                        ) : (
                        <table className="modern-table admin-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Manager</th>
                                    <th>Email</th>
                                    <th style={{textAlign: 'right'}}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td className="font-semibold">{user.name}</td>
                                        <td>
                                            <span className="role-badge" style={{textTransform: 'capitalize'}}>{user.role}</span>
                                        </td>
                                        <td>
                                            {managers.find(m => String(m.id) === String(user.manager_id))?.name || "None"}
                                        </td>
                                        <td><span className="text-muted">{user.email}</span></td>
                                        <td style={{textAlign: 'right'}}>
                                            <button className="send-pass-btn" onClick={() => generatePassword(user.email)}>
                                                Send password
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        )}
                    </div>
                </div>
            </div>
    );
};

export default UserManagement;
