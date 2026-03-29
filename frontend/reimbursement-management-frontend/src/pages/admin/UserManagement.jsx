import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import './AdminPages.css';

const UserManagement = () => {
    const { users, addUser, updateUser, deleteUser } = useAdmin();
    const [isAddMode, setIsAddMode] = useState(false);
    const [editUserId, setEditUserId] = useState(null);
    const [toast, setToast] = useState(null);
    
    const [newUser, setNewUser] = useState({
        name: '', email: '', role: 'EMPLOYEE', manager_id: '', department: ''
    });

    const generatePassword = (userEmail) => {
        const pass = Math.random().toString(36).slice(-8);
        setToast({ message: `Password for ${userEmail}: ${pass}`, type: 'success' });
        setTimeout(() => setToast(null), 10000);
    };

    const handleSaveUser = () => {
        if (!newUser.name || !newUser.email) {
            setToast({ message: "Name and Email are required", type: 'error' });
            return;
        }
        if (editUserId) {
            updateUser(editUserId, newUser);
        } else {
            addUser(newUser);
            generatePassword(newUser.email);
        }
        setNewUser({ name: '', email: '', role: 'EMPLOYEE', manager_id: '', department: '' });
        setIsAddMode(false);
        setEditUserId(null);
    };

    const handleEditClick = (user) => {
        setNewUser({ name: user.name, email: user.email, role: user.role, manager_id: user.manager_id || '', department: user.department || '' });
        setEditUserId(user.id);
        setIsAddMode(true);
    };

    const managers = users.filter(u => u.role === 'MANAGER' || u.role === 'ADMIN');

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
                                <option value="EMPLOYEE">Employee</option>
                                <option value="MANAGER">Manager</option>
                                <option value="ADMIN">Admin</option>
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
                                        <select 
                                            className="inline-select" 
                                            value={user.role} 
                                            onChange={(e) => updateUser(user.id, { role: e.target.value })}
                                        >
                                            <option value="EMPLOYEE">Employee</option>
                                            <option value="MANAGER">Manager</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select 
                                            className="inline-select" 
                                            value={user.manager_id || ''} 
                                            onChange={(e) => updateUser(user.id, { manager_id: e.target.value })}
                                        >
                                            <option value="">None</option>
                                            {managers.filter(m => m.id !== user.id).map(m => (
                                                <option key={m.id} value={m.id}>{m.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td><span className="text-muted">{user.email}</span></td>
                                    <td style={{textAlign: 'right'}}>
                                        <button className="send-pass-btn" onClick={() => generatePassword(user.email)}>
                                            Send password
                                        </button>
                                        <button className="btn-icon btn-danger" title="Delete" onClick={() => deleteUser(user.id)} style={{marginLeft: '0.5rem'}}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
