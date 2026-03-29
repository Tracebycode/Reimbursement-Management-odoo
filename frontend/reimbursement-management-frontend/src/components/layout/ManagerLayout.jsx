import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import './ManagerLayout.css';

const ManagerLayout = () => {
    const navigate = useNavigate();
    const { settings } = useAdmin();

    return (
        <div className="manager-layout">
            <aside className="manager-sidebar">
                <div className="manager-sidebar-header">
                    <h2>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'24px', height:'24px'}}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        Manager Hub
                    </h2>
                    <div className="manager-sidebar-brand">{settings.companyName}</div>
                </div>

                <nav className="manager-sidebar-nav">
                    <NavLink to="/manager/dashboard" className={({isActive}) => `manager-nav-link ${isActive ? 'active' : ''}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        Approvals Review
                    </NavLink>
                    <NavLink to="/manager/team-expenses" className={({isActive}) => `manager-nav-link ${isActive ? 'active' : ''}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        Team Expenses
                    </NavLink>
                </nav>

                <div className="manager-sidebar-footer">
                    <button className="manager-nav-link logout" onClick={() => navigate('/admin/dashboard')} style={{background:'transparent', border:'none', width:'100%', cursor:'pointer', textAlign:'left'}}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Switch to Admin
                    </button>
                    <button className="manager-nav-link logout" onClick={() => navigate('/login')} style={{background:'transparent', border:'none', width:'100%', cursor:'pointer', textAlign:'left'}}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Logout
                    </button>
                </div>
            </aside>
            <main className="manager-content">
                <Outlet />
            </main>
        </div>
    );
};

export default ManagerLayout;
