import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import './AdminPages.css';

const AllExpenses = () => {
    const { expenses, users } = useAdmin();
    const [filter, setFilter] = useState('ALL');
    const [selectedExpense, setSelectedExpense] = useState(null);

    const filteredExpenses = filter === 'ALL' 
        ? expenses 
        : expenses.filter(e => e.status === filter);

    return (
        <div className="admin-page-container">
            <header className="page-header">
                <div>
                    <h1>All Expenses</h1>
                    <p>Global view of all expense reimbursements across the company.</p>
                </div>
                <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
                    <select 
                        className="fancy-select" 
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        style={{width: '200px'}}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending Approval</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </header>

            <div className="card-container full-width">
                <div className="table-wrapper">
                    <table className="modern-table admin-table">
                        <thead>
                            <tr>
                                <th>Request ID</th>
                                <th>Employee</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map(item => (
                                <tr key={item.id}>
                                    <td className="font-medium text-blue">{item.id}</td>
                                    <td className="font-semibold">{users.find(u => u.id === item.user_id)?.name || 'Unknown User'}</td>
                                    <td><span className="role-pill" style={{backgroundColor:'var(--bg-main)', border:'1px solid var(--border-soft)'}}>{item.category}</span></td>
                                    <td><span className="text-muted" style={{maxWidth:'200px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', display:'block'}} title={item.description}>{item.description}</span></td>
                                    <td className="text-muted">{new Date(item.created_at).toLocaleDateString()}</td>
                                    <td className="font-bold">${item.amount.toLocaleString()}</td>
                                    <td>
                                        <span className={`role-pill role-${item.status.toLowerCase()}`}>
                                            {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button className="text-btn" onClick={() => setSelectedExpense(item)}>View Details</button>
                                    </td>
                                </tr>
                            ))}
                            {filteredExpenses.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{textAlign:'center', padding:'3rem', color:'var(--text-muted)'}}>
                                        No expenses found matching the criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Details */}
            {selectedExpense && (
                <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 1000}}>
                    <div style={{background:'var(--content-bg)', padding:'2rem', borderRadius:'12px', width:'400px', boxShadow:'var(--shadow-lg)'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
                            <h2 style={{margin:0}}>Expense Details</h2>
                            <button className="btn-icon" onClick={() => setSelectedExpense(null)}>✕</button>
                        </div>
                        <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
                            <div><strong>ID:</strong> <span className="text-blue">{selectedExpense.id}</span></div>
                            <div><strong>Employee:</strong> {users.find(u => u.id === selectedExpense.user_id)?.name || 'Unknown'}</div>
                            <div><strong>Category:</strong> {selectedExpense.category}</div>
                            <div><strong>Amount:</strong> ${selectedExpense.amount.toLocaleString()} {selectedExpense.currency}</div>
                            <div><strong>Date:</strong> {new Date(selectedExpense.created_at).toLocaleString()}</div>
                            <div><strong>Status:</strong> {selectedExpense.status}</div>
                            <div><strong>Description:</strong></div>
                            <div style={{background:'var(--bg-main)', padding:'1rem', borderRadius:'6px'}}>{selectedExpense.description}</div>
                        </div>
                        <div style={{marginTop:'2rem', display:'flex', justifyContent:'flex-end'}}>
                            <button className="btn-primary" onClick={() => setSelectedExpense(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllExpenses;
