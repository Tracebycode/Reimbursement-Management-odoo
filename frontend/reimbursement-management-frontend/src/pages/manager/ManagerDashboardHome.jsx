import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';
import useCurrencyApi from '../../hooks/useCurrencyApi';
import './ManagerPages.css';

const ManagerDashboardHome = () => {
    const { currentUser } = useAuth();
    const { users, settings } = useAdmin();
    // Assuming the company sets base currency like 'USD ($)' in settings
    const companyBaseCurrencyCode = settings?.currency ? settings.currency.split(' ')[0] : 'USD';
    const { exchangeRates, loading, convert } = useCurrencyApi(companyBaseCurrencyCode);

    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPendingApprovals = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/api/pending-approvals', { params: { approver_id: currentUser.id } });
            setPendingApprovals(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch approvals", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.id) {
            fetchPendingApprovals();
        }
    }, [currentUser]);
    const handleApprove = async (id) => {
        try {
            await api.post('/api/approve', {
                expense_id: id,
                approver_id: parseInt(currentUser.id, 10),
                action: 'approved',
                comment: 'Approved by Manager'
            });
            fetchPendingApprovals();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to approve expense");
        }
    };

    const handleReject = async (id) => {
        try {
            await api.post('/api/approve', {
                expense_id: id,
                approver_id: parseInt(currentUser.id, 10),
                action: 'rejected',
                comment: 'Rejected by Manager'
            });
            fetchPendingApprovals();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to reject expense");
        }
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
                        {isLoading ? (
                            <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>Loading pending approvals...</td></tr>
                        ) : pendingApprovals.length === 0 ? (
                            <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No approvals required. You're all caught up!</td></tr>
                        ) : pendingApprovals.map(approval => {
                            // The backend returns specialized joined records with `expense_id`, `amount`, `description`, etc.
                            const expenseId = approval.expense_id;
                            const currentStatus = approval.approval_status;
                            const isReadonly = currentStatus !== 'pending';
                            
                            // Mocking User lookups for demonstration, backend usually joins this directly but we rely on AdminContext users array for now
                            // Note: Realistically, the expense_owner isn't returned natively by pending-approvals query yet (just description). We gracefully handle it.
                            const employeeName = "Employee"; 
                            
                            // Real calculation based on API response
                            const originalAmount = typeof approval.amount === 'string' ? parseFloat(approval.amount) : approval.amount;
                            const convertedAmount = !loading && convert 
                                ? Math.round(convert(originalAmount, 'USD', companyBaseCurrencyCode))
                                : '...';

                            return (
                                <tr key={approval.approval_id} className={isReadonly ? 'readonly' : ''}>
                                    <td>{approval.description || 'General Expense'}</td>
                                    <td>{employeeName}</td>
                                    <td>General / Other</td>
                                    <td>
                                        <span style={{
                                            color: currentStatus === 'approved' ? '#10b981' : currentStatus === 'rejected' ? '#ef4444' : '#fbbf24',
                                            fontWeight: 600
                                        }}>
                                            {currentStatus ? currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1).toLowerCase() : 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="currency-amount">
                                        {originalAmount} USD (in {companyBaseCurrencyCode}) = <span className="converted">{convertedAmount}</span>
                                    </td>
                                    <td style={{textAlign: 'center'}}>
                                        {!isReadonly && (
                                            <div className="manager-actions">
                                                <button className="btn-approve" onClick={() => handleApprove(expenseId)}>Approve</button>
                                                <button className="btn-reject" onClick={() => handleReject(expenseId)}>Reject</button>
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
