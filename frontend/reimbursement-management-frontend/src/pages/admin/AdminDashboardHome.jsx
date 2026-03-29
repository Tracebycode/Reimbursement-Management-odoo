import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import './AdminDashboardHome.css';

const AdminDashboardHome = () => {
    const navigate = useNavigate();
    const { expenses, users } = useAdmin();
    
    // Mock Statistics Data
    const stats = [
        { 
            id: 1, 
            label: "Total Employees", 
            value: "142", 
            change: "+12%", 
            positive: true,
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        },
        { 
            id: 2, 
            label: "Pending Approvals", 
            value: "28", 
            change: "Requires Action", 
            positive: false,
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        },
        { 
            id: 3, 
            label: "Expenses This Month", 
            value: "$45,210", 
            change: "+8.4%", 
            positive: false,
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        },
        { 
            id: 4, 
            label: "Approved Expenses", 
            value: "156", 
            change: "This month", 
            positive: true,
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        }
    ];

    // Take the 4 most recent expenses
    const recentActivity = expenses.slice(0, 4);

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "ID,User,Amount,Status,Date,Category\n"
            + recentActivity.map(e => `${e.id},${users.find(u => u.id === e.user_id)?.name},${e.amount},${e.status},"${e.created_at}",${e.category}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "recent_expenses_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="dashboard-container">
            <header className="page-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Manage users, configure approval workflows, and monitor all company expenses.</p>
                </div>
                <button className="primary-action-btn" onClick={handleExport}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    Export Report
                </button>
            </header>

            {/* Widgets Section */}
            <div className="widgets-grid">
                {stats.map(stat => (
                    <div className="widget-card" key={stat.id}>
                        <div className="widget-header">
                            <span className="widget-label">{stat.label}</span>
                            <div className="widget-icon">{stat.icon}</div>
                        </div>
                        <div className="widget-body">
                            <h2 className="widget-value">{stat.value}</h2>
                            <span className={`widget-change ${stat.positive ? 'positive' : 'negative'}`}>
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Section */}
            <div className="recent-activity-section">
                <div className="section-header">
                    <h2>Recent Expense Submissions</h2>
                    <button className="text-btn" onClick={() => navigate('/admin/expenses')}>View All</button>
                </div>
                
                <div className="table-wrapper">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Request ID</th>
                                <th>Employee</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentActivity.map(item => (
                                <tr key={item.id}>
                                    <td className="font-medium text-blue">{item.id}</td>
                                    <td className="font-semibold">{users.find(u => u.id === item.user_id)?.name || 'Unknown User'}</td>
                                    <td><span className="category-pill">{item.category}</span></td>
                                    <td className="font-bold">${item.amount.toLocaleString()}</td>
                                    <td className="text-muted">{new Date(item.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge status-${item.status.toLowerCase()}`}>
                                            {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
                                        </span>
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

export default AdminDashboardHome;
