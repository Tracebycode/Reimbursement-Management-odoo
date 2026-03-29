import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import './EmployeeLayout.css';

const EmployeeLayout = () => {
    const navigate = useNavigate();
    const { settings } = useAdmin();

    return (
        <div className="employee-layout">
            <aside className="employee-sidebar">
                <div className="employee-sidebar-header">
                    <h2>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'24px', height:'24px'}}>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Employee Hub
                    </h2>
                    <div className="employee-sidebar-brand">{settings.companyName}</div>
                </div>

                <nav className="employee-sidebar-nav">
                    <NavLink to="/employee/dashboard" className={({isActive}) => `employee-nav-link ${isActive ? 'active' : ''}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        My Expenses
                    </NavLink>
                </nav>

                <div className="employee-sidebar-footer">
                    <button className="employee-nav-link logout" onClick={() => navigate('/login')} style={{background:'transparent', border:'none', width:'100%', cursor:'pointer', textAlign:'left'}}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Logout
                    </button>
                </div>
            </aside>
            <main className="employee-content">
                <Outlet />
            </main>
        </div>
    );
};

export default EmployeeLayout;
