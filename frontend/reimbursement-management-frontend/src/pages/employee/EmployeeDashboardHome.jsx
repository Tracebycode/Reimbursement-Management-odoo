import React, { useState, useMemo, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';
import useCurrencyApi from '../../hooks/useCurrencyApi';
import ExpenseFormModal from '../../components/employee/ExpenseFormModal';
import './EmployeePages.css';

const EmployeeDashboardHome = () => {
    const { currentUser } = useAuth();
    const { settings } = useAdmin();
    // Assuming the company sets base currency like 'USD ($)' in settings
    const companyBaseCurrencyCode = settings?.currency ? settings.currency.split(' ')[0] : 'USD';
    const { convert, loading: currencyLoading } = useCurrencyApi(companyBaseCurrencyCode);

    const [myExpenses, setMyExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedExpense, setSelectedExpense] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAutoFill, setIsAutoFill] = useState(false);

    const fetchExpenses = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/api/expenses', { params: { user_id: currentUser.id } });
            setMyExpenses(res.data.data || []);
        } catch (err) {
            console.error("Failed to load expenses", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.id) fetchExpenses();
    }, [currentUser]);

    // Calculate totals with live currency conversion
    const getConvertedTotal = (status) => {
        if (currencyLoading || !myExpenses) return '...';
        const total = myExpenses
            .filter(e => e.status?.toLowerCase() === status.toLowerCase())
            .reduce((sum, e) => {
                const amount = typeof e.amount === 'string' ? parseFloat(e.amount) : (e.amount || 0);
                return sum + convert(amount, e.currency || companyBaseCurrencyCode, companyBaseCurrencyCode);
            }, 0);
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
                            // Handle database field name mismatches securely
                            const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
                            
                            let statusBadgeStyle = { padding: '2px 8px', borderRadius: '12px', fontWeight: '500' };
                            if (expense.status === 'draft' || expense.status === 'DRAFT') {
                                statusBadgeStyle = { ...statusBadgeStyle, border: '1px solid #94a3b8', color: '#94a3b8' };
                            } else if (expense.status === 'pending' || expense.status === 'PENDING') {
                                statusBadgeStyle = { ...statusBadgeStyle, border: '1px solid #fbbf24', color: '#fbbf24' }; // Saffron/Yellow for pending
                            } else if (expense.status === 'approved' || expense.status === 'APPROVED') {
                                statusBadgeStyle = { ...statusBadgeStyle, border: '1px solid #10b981', color: '#10b981', fontWeight: 'bold' };
                            } else if (expense.status === 'rejected' || expense.status === 'REJECTED') {
                                statusBadgeStyle = { ...statusBadgeStyle, border: '1px solid #ef4444', color: '#ef4444', fontWeight: 'bold' };
                            }

                            return (
                                <tr key={expense.id} onClick={() => openExistingForm(expense)} style={{cursor:'pointer'}}>
                                    <td>{expense.description}</td>
                                    <td>{new Date(expense.created_at).toLocaleDateString()}</td>
                                    <td>{expense.category || 'General'}</td>
                                    <td>{currentUser.name}</td>
                                    <td>{expense.remarks || 'None'}</td>
                                    <td>{amount} {expense.currency || companyBaseCurrencyCode}</td>
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
                    onClose={() => {
                        setIsModalOpen(false);
                        fetchExpenses();
                    }} 
                    expenseConfig={selectedExpense} 
                    isAutoFillMode={isAutoFill}
                />
            )}
        </div>
    );
};

export default EmployeeDashboardHome;
