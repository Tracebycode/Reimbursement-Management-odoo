import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import './AdminPages.css';

const Settings = () => {
    const { settings, updateSettings } = useAdmin();

    const handleSave = () => {
        alert('Company settings successfully updated!');
    };

    return (
        <div className="admin-page-container">
            <header className="page-header">
                <div>
                    <h1>Company Settings</h1>
                    <p>Manage global configuration and defaults for your organization workspace.</p>
                </div>
                <button className="primary-action-btn" onClick={handleSave}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                    Save Settings
                </button>
            </header>

            <div className="card-container full-width" style={{maxWidth: '800px', margin: '0 auto'}}>
                <div className="form-grid" style={{gridTemplateColumns: 'minmax(300px, 1fr)'}}>
                    <div className="form-group">
                        <label>Company Name</label>
                        <input 
                            type="text" 
                            className="fancy-input" 
                            value={settings.companyName}
                            onChange={(e) => updateSettings({ companyName: e.target.value })}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Admin Full Name</label>
                        <input 
                            type="text" 
                            className="fancy-input" 
                            value={settings.adminName}
                            onChange={(e) => updateSettings({ adminName: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Contact Email Address</label>
                        <input 
                            type="email" 
                            className="fancy-input" 
                            value={settings.email}
                            onChange={(e) => updateSettings({ email: e.target.value })}
                        />
                    </div>

                    <div style={{height:'1px', background:'var(--border-base)', margin:'1rem 0'}}></div>

                    <div className="form-group">
                        <label>Country of Operation</label>
                        <select 
                            className="fancy-select" 
                            value={settings.country}
                            onChange={(e) => updateSettings({ country: e.target.value })}
                        >
                            <option value="United States">United States</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="India">India</option>
                            <option value="Germany">Germany</option>
                        </select>
                        <p className="helper-text-bottom">Selecting a country sets the default currency.</p>
                    </div>

                    <div className="form-group">
                        <label>Default Currency (Auto-set based on Country)</label>
                        <input 
                            type="text" 
                            className="fancy-input" 
                            value={settings.currency}
                            disabled 
                            style={{backgroundColor: 'var(--bg-page)'}}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
