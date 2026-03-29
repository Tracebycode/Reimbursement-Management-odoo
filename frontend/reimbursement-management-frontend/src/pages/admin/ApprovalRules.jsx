import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import './AdminPages.css';

const ApprovalRules = () => {
    const { users, rules, updateRules } = useAdmin();
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [currentRule, setCurrentRule] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // When selecting a user, load their rule or generate a default one
    useEffect(() => {
        if (selectedUserId) {
            if (rules[selectedUserId]) {
                setCurrentRule({...rules[selectedUserId]});
            } else {
                const userObj = users.find(u => u.id === selectedUserId);
                setCurrentRule({
                    description: `Standard rule for ${userObj.name}`,
                    isManagerApprover: true,
                    approvers: [],
                    sequence: false,
                    minimumPercentage: 100
                });
            }
        } else {
            setCurrentRule(null);
        }
    }, [selectedUserId, rules, users]);

    const handleSave = () => {
        updateRules(selectedUserId, currentRule);
        alert('Rules updated successfully!');
    };

    const handleAddApprover = () => {
        setCurrentRule({
            ...currentRule,
            approvers: [...currentRule.approvers, { user_id: '', required: false }]
        });
    };

    const handleRemoveApprover = (index) => {
        const updated = [...currentRule.approvers];
        updated.splice(index, 1);
        setCurrentRule({ ...currentRule, approvers: updated });
    };

    const handleApproverChange = (index, field, value) => {
        const updated = [...currentRule.approvers];
        updated[index][field] = value;
        setCurrentRule({ ...currentRule, approvers: updated });
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
                    ) : currentRule && (
                        <div className="animation-fade-in" style={{animation: 'fadeIn 0.3s ease-out'}}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--border-soft)', paddingBottom:'1rem', marginBottom:'1.5rem'}}>
                                <h2>Configuration for <span className="text-blue">{users.find(u=>u.id === selectedUserId)?.name}</span></h2>
                                <button className="btn-primary" onClick={handleSave}>Save Rules</button>
                            </div>

                            <div className="form-grid">
                                <div className="form-group" style={{gridColumn: '1 / -1'}}>
                                    <label>Description about rules</label>
                                    <input 
                                        type="text" 
                                        className="fancy-input" 
                                        value={currentRule.description} 
                                        onChange={e => setCurrentRule({...currentRule, description: e.target.value})} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Manager</label>
                                    <input 
                                        type="text" 
                                        className="fancy-input" 
                                        value={users.find(u=>u.id===users.find(curr=>curr.id===selectedUserId)?.manager_id)?.name || 'None'} 
                                        disabled 
                                    />
                                    <p className="helper-text-bottom" style={{marginTop:'0.25rem'}}>Set on User record.</p>
                                </div>
                                <div className="form-group" style={{justifyContent: 'center', paddingTop: '1rem'}}>
                                    <label className="checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            checked={currentRule.isManagerApprover}
                                            onChange={e => setCurrentRule({...currentRule, isManagerApprover: e.target.checked})}
                                        />
                                        Is Manager an approver?
                                    </label>
                                </div>
                            </div>

                            <div style={{marginTop: '2rem'}}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
                                    <h3 style={{margin:0}}>Approval Steps</h3>
                                    <button className="text-btn" onClick={handleAddApprover}>+ Add Step</button>
                                </div>

                                {currentRule.approvers.length === 0 && (
                                    <div className="empty-state" style={{padding:'1rem', textAlign:'center', background:'var(--bg-main)', border:'1px dashed var(--border-soft)', borderRadius:'8px', color:'var(--text-muted)'}}>
                                        No specific approvers configured. (Will rely on manager if checked).
                                    </div>
                                )}

                                {currentRule.approvers.map((approver, index) => (
                                    <div key={index} className="approver-step-row">
                                        <div className="step-number">{index + 1}</div>
                                        <div style={{flexGrow: 1}}>
                                            <select 
                                                className="fancy-select" 
                                                value={approver.user_id}
                                                onChange={e => handleApproverChange(index, 'user_id', e.target.value)}
                                            >
                                                <option value="" disabled>Select User...</option>
                                                {users.map(u => (
                                                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div style={{width: '200px'}}>
                                            <label className="checkbox-label">
                                                <input 
                                                    type="checkbox" 
                                                    checked={approver.required}
                                                    onChange={e => handleApproverChange(index, 'required', e.target.checked)}
                                                />
                                                Required Approval
                                            </label>
                                        </div>
                                        <button className="btn-icon btn-danger" onClick={() => handleRemoveApprover(index)}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div style={{marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-soft)'}}>
                                <label className="checkbox-label" style={{marginBottom: '1rem', fontWeight: 600}}>
                                    <input 
                                        type="checkbox" 
                                        checked={currentRule.sequence}
                                        onChange={e => setCurrentRule({...currentRule, sequence: e.target.checked})}
                                    />
                                    Enforce Approvers Sequence
                                </label>
                                <p className="text-muted" style={{fontSize:'0.85rem', margin: '0 0 1.5rem 1.5rem'}}>
                                    If checked, the request goes sequentially downwards strictly. If rejected at any step, it drops entirely. If unchecked, it blasts out concurrently.
                                </p>
                                
                                <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                                    <label style={{fontWeight:600}}>Minimum Approval percentage:</label>
                                    <div style={{display:'flex', alignItems:'center', background:'var(--content-bg)', border:'1px solid var(--border-soft)', borderRadius:'6px', padding:'0.2rem 0.5rem'}}>
                                        <input 
                                            type="number" 
                                            value={currentRule.minimumPercentage}
                                            onChange={e => setCurrentRule({...currentRule, minimumPercentage: e.target.value})}
                                            min="0" max="100"
                                            style={{border:'none', outline:'none', background:'transparent', width:'50px', textAlign:'right', fontWeight:600}}
                                        />
                                        <span style={{color:'var(--text-muted)', marginLeft:'0.2rem'}}>%</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApprovalRules;
