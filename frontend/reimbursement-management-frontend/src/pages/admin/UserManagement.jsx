import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import './AdminPages.css';

const UserManagement = () => {
    const { users, addUser, updateUser, deleteUser } = useAdmin();
    const [isAddMode, setIsAddMode] = useState(false);
    const [editUserId, setEditUserId] = useState(null);
    
    const [newUser, setNewUser] = useState({
        name: '', email: '', role: 'EMPLOYEE', manager_id: '', department: ''
    });

    const handleSaveUser = () => {
        if (!newUser.name || !newUser.email) {
            alert("Name and Email are required");
            return;
        }
        if (editUserId) {
            updateUser(editUserId, newUser);
        } else {
            addUser(newUser);
            // "Clicking on this button should send a randomly generated unique password..."
            // Mocking the password email notification:
            alert(`A unique random password has been sent to ${newUser.email}`);
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
            <header className="page-header">
                <div>
                    <h1>Employee & Manager Management</h1>
                    <p>Create and manage employees and managers within your organization.</p>
                </div>
                {!isAddMode && (
                    <button className="primary-action-btn" onClick={() => { setIsAddMode(true); setEditUserId(null); setNewUser({ name: '', email: '', role: 'EMPLOYEE', manager_id: '', department: '' }); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Add New User
                    </button>
                )}
            </header>

            <div className="card-container full-width">
                {isAddMode && (
                    <div className="add-user-panel slide-down">
                        <h3>{editUserId ? 'Edit User' : 'Create New User'}</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" className="fancy-input" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="e.g. Jane Smith" />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" className="fancy-input" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="jane@company.com" />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select className="fancy-select" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                                    <option value="EMPLOYEE">Employee</option>
                                    <option value="MANAGER">Manager</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Assign Manager (Optional)</label>
                                <select className="fancy-select" value={newUser.manager_id} onChange={e => setNewUser({...newUser, manager_id: e.target.value})}>
                                    <option value="">None / Self</option>
                                    {managers.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Department</label>
                                <input type="text" className="fancy-input" value={newUser.department} onChange={e => setNewUser({...newUser, department: e.target.value})} placeholder="e.g. Finance" />
                            </div>
                        </div>
                        <div className="panel-actions">
                            <button className="btn-secondary" onClick={() => { setIsAddMode(false); setEditUserId(null); setNewUser({ name: '', email: '', role: 'EMPLOYEE', manager_id: '', department: '' }); }}>Cancel</button>
                            <button className="btn-primary" onClick={handleSaveUser}>{editUserId ? 'Update User' : 'Create User & Send Password'}</button>
                        </div>
                        <p className="helper-text-bottom">Managers can approve expenses submitted by employees assigned to them.</p>
                    </div>
                )}

                <div className="table-wrapper">
                    <table className="modern-table admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Manager</th>
                                <th>Department</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="font-semibold">{user.name}</td>
                                    <td><span className="text-muted">{user.email}</span></td>
                                    <td>
                                        <span className={`role-pill role-${user.role.toLowerCase()}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>{user.manager_id ? users.find(u => u.id === user.manager_id)?.name || 'Unknown' : 'N/A'}</td>
                                    <td>{user.department}</td>
                                    <td className="actions-cell">
                                        <button className="btn-icon" title="Edit" onClick={() => handleEditClick(user)}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                        </button>
                                        <button className="btn-icon btn-danger" title="Delete" onClick={() => deleteUser(user.id)}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                        <button className="text-btn text-small" onClick={() => alert(`Reset link sent to ${user.email}`)}>Send password</button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="empty-state">No users formally configured.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
