import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import useCurrencyApi from '../../hooks/useCurrencyApi';
import ExpenseFormModal from '../../components/employee/ExpenseFormModal';
import './EmployeePages.css';

const EmployeeDashboardHome = () => {
    const { expenses, users, settings } = useAdmin();
    // Assuming the company sets base currency like 'USD ($)' in settings
    const companyBaseCurrencyCode = settings.currency ? settings.currency.split(' ')[0] : 'USD';
    const { convert, loading: currencyLoading } = useCurrencyApi(companyBaseCurrencyCode);

    // In our mock, the employee is "u5" (John Doe)
    const CURRENT_USER_ID = 'u5';
    
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAutoFill, setIsAutoFill] = useState(false);

    // Filter to only this user's expenses
    const myExpenses = useMemo(() => expenses.filter(exp => exp.user_id === CURRENT_USER_ID), [expenses, CURRENT_USER_ID]);

    // Calculate totals with live currency conversion
    const getConvertedTotal = (status) => {
        if (currencyLoading) return '...';
        const total = myExpenses
            .filter(e => e.status === status)
            .reduce((sum, e) => sum + convert(e.amount, e.currency, companyBaseCurrencyCode), 0);
        return Math.round(total).toLocaleString();
    };

    const draftTotal = getConvertedTotal('DRAFT');
    const pendingTotal = getConvertedTotal('PENDING');
    const approvedTotal = getConvertedTotal('APPROVED');

    const openNewForm = () => {
        setSelectedExpense(null);
        setIsAutoFill(false);
        setIsModalOpen(true);
    };

    const openUploadForm = () => {
        setSelectedExpense(null);
        setIsAutoFill(true);
        setIsModalOpen(true);
    };

    const openExistingForm = (expense) => {
        setSelectedExpense(expense);
        setIsAutoFill(false);
        setIsModalOpen(true);
    };

    return (
        <div className="employee-page-container">
            <header className="employee-header">
                <div>
                    <h1>My Expenses</h1>
                    <p>Track your reimbursements and submit new receipts.</p>
                </div>
                <div className="employee-header-actions">
                    <button className="btn-upload" onClick={openUploadForm}>Upload</button>
                    <button className="btn-new" onClick={openNewForm}>New +</button>
                </div>
            </header>

            {/* Quick Trackers */}
            <div className="employee-tracker-grid">
                <div className="tracker-card">
                    <div className="tracker-header">
                        <span className="tracker-label">Draft</span>
                        <div className="tracker-icon" style={{backgroundColor: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8'}}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </div>
                    </div>
                    <div className="tracker-value">{draftTotal} {companyBaseCurrencyCode}</div>
                </div>
                
                <div className="tracker-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>

                <div className="tracker-card">
                    <div className="tracker-header">
                        <span className="tracker-label">Waiting Approval</span>
                        <div className="tracker-icon" style={{backgroundColor: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24'}}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                    </div>
                    <div className="tracker-value">{pendingTotal} {companyBaseCurrencyCode}</div>
                </div>

                <div className="tracker-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>

                <div className="tracker-card">
                    <div className="tracker-header">
                        <span className="tracker-label">Approved</span>
                        <div className="tracker-icon" style={{backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981'}}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                    </div>
                    <div className="tracker-value">{approvedTotal} {companyBaseCurrencyCode}</div>
                </div>
            </div>

            {/* Table */}
            <div className="manager-card" style={{borderColor: 'var(--employee-sidebar-border)'}}>
                <table className="manager-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Date</th>
                            <th>Category</th>
                            <th>Paid By</th>
                            <th>Remarks</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myExpenses.length === 0 ? (
                            <tr><td colSpan="7" style={{textAlign:'center'}}>You have no expenses logged.</td></tr>
                        ) : myExpenses.map(expense => {
                            const employee = users.find(u => u.id === expense.user_id) || { name: 'Unknown' };
                            
                            let statusBadgeStyle = { padding: '2px 8px', borderRadius: '12px', fontWeight: '500' };
                            if (expense.status === 'DRAFT') {
                                statusBadgeStyle = { ...statusBadgeStyle, border: '1px solid #94a3b8', color: '#94a3b8' };
                            } else if (expense.status === 'PENDING') {
                                statusBadgeStyle = { ...statusBadgeStyle, border: '1px solid #fbbf24', color: '#fbbf24' }; // Saffron/Yellow for pending
                            } else if (expense.status === 'APPROVED') {
                                statusBadgeStyle = { ...statusBadgeStyle, border: '1px solid #10b981', color: '#10b981', fontWeight: 'bold' };
                            } else if (expense.status === 'REJECTED') {
                                statusBadgeStyle = { ...statusBadgeStyle, border: '1px solid #ef4444', color: '#ef4444', fontWeight: 'bold' };
                            }

                            return (
                                <tr key={expense.id} onClick={() => openExistingForm(expense)} style={{cursor:'pointer'}}>
                                    <td>{expense.description}</td>
                                    <td>{new Date(expense.created_at).toLocaleDateString()}</td>
                                    <td>{expense.category}</td>
                                    <td>{employee.name}</td>
                                    <td>{expense.remarks || 'None'}</td>
                                    <td>{expense.amount} {expense.currency}</td>
                                    <td>
                                        <span style={statusBadgeStyle}>
                                            {expense.status === 'PENDING' ? 'Submitted' : expense.status.charAt(0) + expense.status.slice(1).toLowerCase()}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <ExpenseFormModal 
                    onClose={() => setIsModalOpen(false)} 
                    expenseConfig={selectedExpense} 
                    isAutoFillMode={isAutoFill}
                />
            )}
        </div>
    );
};

export default EmployeeDashboardHome;
