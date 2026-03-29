import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import './ManagerPages.css';

const ManagerDashboardHome = () => {
    const { expenses, users, updateExpenseStatus } = useAdmin();

    // In a real app, this would be the logged in user's ID
    // We are currently forcing "u2" (Sarah Jenkins) or "u3" (Mitchell Rose) who are managers.
    // Let's assume we are viewing as u1 (Admin) or u2 (Manager) globally.
    // We will just show all expenses for demonstration of the dashboard,
    // or specifically expenses where the reporter's manager is the logged-in user.
    // For this mock, we will show all expenses to ensure the table populates.
    
    // Mock currency conversion utility
    const MOCK_EXCHANGE_RATE_TO_INR = 88; // 1 USD = 88 INR

    const handleApprove = (id) => {
        updateExpenseStatus(id, 'APPROVED');
    };

    const handleReject = (id) => {
        updateExpenseStatus(id, 'REJECTED');
    };

    return (
        <div className="manager-page-container">
            <header className="manager-header">
                <div>
                    <h1>Approvals to review</h1>
                    <p>Review and act upon expense requests submitted by your team.</p>
                </div>
            </header>

            <div className="manager-card">
                <table className="manager-table">
                    <thead>
                        <tr>
                            <th>Approval Subject</th>
                            <th>Request Owner</th>
                            <th>Category</th>
                            <th>Request Status</th>
                            <th>Total amount (in company's currency)</th>
                            <th style={{textAlign: 'center'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.length === 0 ? (
                            <tr><td colSpan="6" style={{textAlign: 'center'}}>No approvals required.</td></tr>
                        ) : expenses.map(expense => {
                            const isReadonly = expense.status !== 'PENDING';
                            const employee = users.find(u => u.id === expense.user_id) || { name: 'Unknown' };
                            
                            // Mock calculation
                            const convertedAmount = Math.round(expense.amount * MOCK_EXCHANGE_RATE_TO_INR);

                            return (
                                <tr key={expense.id} className={isReadonly ? 'readonly' : ''}>
                                    <td>{expense.description || 'none'}</td>
                                    <td>{employee.name}</td>
                                    <td>{expense.category}</td>
                                    <td>
                                        <span style={{
                                            color: expense.status === 'APPROVED' ? '#10b981' : expense.status === 'REJECTED' ? '#ef4444' : '#fbbf24',
                                            fontWeight: 600
                                        }}>
                                            {expense.status.charAt(0) + expense.status.slice(1).toLowerCase()}
                                        </span>
                                    </td>
                                    <td className="currency-amount">
                                        {expense.amount} {expense.currency === 'USD' ? '$' : expense.currency} (in INR) = <span className="converted">{convertedAmount}</span>
                                    </td>
                                    <td style={{textAlign: 'center'}}>
                                        {!isReadonly && (
                                            <div className="manager-actions">
                                                <button className="btn-approve" onClick={() => handleApprove(expense.id)}>Approve</button>
                                                <button className="btn-reject" onClick={() => handleReject(expense.id)}>Reject</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManagerDashboardHome;
