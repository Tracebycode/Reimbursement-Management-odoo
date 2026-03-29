import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './AdminPages.css';

const ApprovalRules = () => {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [currentSteps, setCurrentSteps] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentUser && currentUser.org_id) {
            fetchUsers();
        }
    }, [currentUser]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/users', { params: { org_id: currentUser.org_id } });
            setUsers(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (selectedUserId) {
            fetchWorkflow(selectedUserId);
        } else {
            setCurrentSteps([]);
        }
    }, [selectedUserId]);

    const fetchWorkflow = async (employeeId) => {
        try {
            setIsLoading(true);
            const res = await api.get(`/api/workflow/${employeeId}`);
            // Ensure step_order is correctly aligned for the UI array
            const steps = res.data.data || [];
            setCurrentSteps(steps.sort((a, b) => a.step_order - b.step_order));
        } catch(err) {
            if (err.response?.status === 404) {
               setCurrentSteps([]); 
            } else {
               console.error("Failed to fetch workflow", err);
               setCurrentSteps([]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedUserId) return;
        try {
            // Map the frontend currentSteps back into the DB expected format
            const stepsPayload = currentSteps.map((s, index) => ({
                step_order: index + 1,
                role: s.role
            }));
            
            await api.post('/api/workflow', {
                employee_id: selectedUserId,
                steps: stepsPayload
            });
            alert('Workflow rules updated successfully!');
        } catch (err) {
            console.error("Failed to save rules", err);
            alert(err.response?.data?.message || 'Failed to update rules.');
        }
    };

    const handleAddApprover = () => {
        setCurrentSteps([
            ...currentSteps,
            { step_order: currentSteps.length + 1, role: 'manager' }
        ]);
    };

    const handleRemoveApprover = (index) => {
        const updated = [...currentSteps];
        updated.splice(index, 1);
        setCurrentSteps(updated);
    };

    const handleApproverChange = (index, roleValue) => {
        const updated = [...currentSteps];
        updated[index].role = roleValue;
        setCurrentSteps(updated);
    };

    return (
        <div className="admin-page-container">
            <header className="page-header">
                <div>
                    <h1>Approval Workflow Configuration</h1>
                    <p>Define the approval process for expense reimbursements sequentially or conditionally.</p>
                </div>
            </header>

            <div className="card-container full-width rules-wrapper">
                
                {/* Left Sidebar: User Selection */}
                <div className="rules-sidebar">
                    <h3 style={{margin: '0 0 1rem 0', fontSize: '1rem'}}>Select User to Configure</h3>
                    <div className="fancy-input" style={{padding: '0.4rem', marginBottom: '1rem', display: 'flex'}}>
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{border:'none', outline:'none', background:'transparent', width:'100%'}}
                        />
                    </div>
                    <div className="rules-user-list">
                        {filteredUsers.map(u => (
                            <div 
                                key={u.id} 
                                className={`rules-user-item ${selectedUserId === u.id ? 'active' : ''}`}
                                onClick={() => setSelectedUserId(u.id)}
                            >
                                {u.name}
                                <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{u.role}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Main Panel: Rule Configuration */}
                <div className="rules-main">
                    {!selectedUserId ? (
                        <div style={{display:'flex', height:'100%', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', fontStyle:'italic'}}>
                            Select a user from the left pane to configure their approval workflow.
                        </div>
                    ) : isLoading ? (
                        <div style={{display:'flex', height:'100%', alignItems:'center', justifyContent:'center', color:'var(--text-muted)'}}>
                            Loading workflow...
                        </div>
                    ) : (
                        <div className="animation-fade-in" style={{animation: 'fadeIn 0.3s ease-out'}}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--border-soft)', paddingBottom:'1rem', marginBottom:'1.5rem'}}>
                                <h2>Configuration for <span className="text-blue">{users.find(u=>u.id === selectedUserId)?.name}</span></h2>
                                <button className="btn-primary" onClick={handleSave}>Save Rules</button>
                            </div>

                            <div style={{marginTop: '2rem'}}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
                                    <h3 style={{margin:0}}>Approval Steps Sequence</h3>
                                    <button className="text-btn" onClick={handleAddApprover}>+ Add Step</button>
                                </div>

                                {currentSteps.length === 0 && (
                                    <div className="empty-state" style={{padding:'1rem', textAlign:'center', background:'var(--bg-main)', border:'1px dashed var(--border-soft)', borderRadius:'8px', color:'var(--text-muted)'}}>
                                        No workflow steps currently defined. All expenses will be automatically approved or rejected if no workflow is set. 
                                    </div>
                                )}

                                {currentSteps.map((approverStep, index) => (
                                    <div key={index} className="approver-step-row">
                                        <div className="step-number">{index + 1}</div>
                                        <div style={{flexGrow: 1}}>
                                            <select 
                                                className="fancy-select" 
                                                value={approverStep.role}
                                                onChange={e => handleApproverChange(index, e.target.value)}
                                            >
                                                <option value="" disabled>Select Role Level...</option>
                                                <option value="manager">Direct Manager</option>
                                                <option value="hr">HR/Admin</option>
                                                <option value="finance">Finance Team</option>
                                                <option value="director">Director/Executive</option>
                                            </select>
                                        </div>
                                        <button className="btn-icon btn-danger" onClick={() => handleRemoveApprover(index)}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApprovalRules;
