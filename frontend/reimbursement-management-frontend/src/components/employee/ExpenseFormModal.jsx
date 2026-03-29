import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import useCurrencyApi from '../../hooks/useCurrencyApi';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import '../../pages/employee/EmployeePages.css';

const ExpenseFormModal = ({ onClose, expenseConfig, isAutoFillMode }) => {
    // expenseConfig can be null (New Expense) or an existing expense object (Viewing/Editing Draft)
    const { currentUser } = useAuth();
    // expenseConfig can be null (New Expense) or an existing expense object (Viewing/Editing Draft)
    const { addExpense, updateExpenseStatus, settings } = useAdmin();
    // Default base currency from settings
    const companyBaseCurrencyCode = settings.currency ? settings.currency.split(' ')[0] : 'USD';
    const { currencies, loading: currenciesLoading } = useCurrencyApi(companyBaseCurrencyCode);

    const isExisting = !!expenseConfig;
    const isReadonly = isExisting && expenseConfig.status !== 'DRAFT';

    const [formData, setFormData] = useState({
        description: isExisting ? expenseConfig.description : '',
        expenseDate: isExisting ? expenseConfig.created_at.split('T')[0] : '',
        category: isExisting ? expenseConfig.category || '' : '',
        paidBy: currentUser.id, // Bind securely to authorized user ID
        amount: isExisting ? expenseConfig.amount : '',
        currency: isExisting ? expenseConfig.currency : companyBaseCurrencyCode,
        remarks: isExisting ? expenseConfig.remarks || '' : '',
        notes: isExisting ? expenseConfig.notes || '' : '', // the second "description" in wireframe
        receiptImage: isExisting ? expenseConfig.receipt_image : null
    });

    const [isScanning, setIsScanning] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(isExisting ? expenseConfig.receipt_image : null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
            setFormData(prev => ({ ...prev, receiptImage: reader.result }));
            // Trigger OCR Simulation ONLY if we are in auto-fill mode
            if (isAutoFillMode && !isReadonly) {
                handleSimulatedOCRUpload();
            }
        };
        reader.readAsDataURL(file);
    };

    const triggerFileInput = () => {
        document.getElementById('receipt-upload-input').click();
    };

    // Simulated OCR Feature
    const handleSimulatedOCRUpload = () => {
        if (isReadonly) return;
        setIsScanning(true);
        // Simulate network / AI delay
        setTimeout(() => {
            setFormData(prev => ({
                ...prev,
                description: 'Restaurant Bill - The French Laundry',
                expenseDate: new Date().toISOString().split('T')[0],
                category: 'Meals',
                amount: '345.50',
                remarks: 'Client dinner with Acme Corp leads'
            }));
            setIsScanning(false);
        }, 1500);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isExisting) {
            // Update to PENDING not supported yet by current backend logic, typically frontend would call PUT endpoint here
            return onClose();
        } else {
            // Create New
            try {
                await api.post('/api/expense', {
                    user_id: parseInt(currentUser.id, 10),
                    amount: parseFloat(formData.amount),
                    description: formData.description || 'General Expense'
                    // backend currently ignores category, currency, remarks for insertion, but frontend renders them locally
                });
                onClose();
            } catch (err) {
                alert(err.response?.data?.message || "Failed to submit expense. Maybe no workflow rule assigned?");
            }
        }
    };

    return (
        <div className="employee-modal-overlay">
            <div className="employee-modal-content">
                <button className="employee-modal-close" onClick={onClose}>&times;</button>
                
                <div className="modal-header-progress">
                    <div className="upload-header">
                        <input 
                            type="file" 
                            id="receipt-upload-input" 
                            style={{display:'none'}} 
                            accept="image/*" 
                            onChange={handleFileChange} 
                        />
                        <button className="btn-upload" style={{borderColor: 'var(--employee-accent)', color: 'var(--employee-accent)'}} onClick={triggerFileInput}>
                            {isAutoFillMode ? 'Attach Receipt (Auto-Fill)' : 'Attach Receipt (Reference Only)'}
                        </button>
                    </div>
                    
                    <div className="progress-steps">
                        <span className={isExisting ? (expenseConfig.status === 'DRAFT' ? 'step-active' : 'step-dim') : 'step-active'}>Draft</span>
                        <span className="step-dim">&gt;</span>
                        <span className={isExisting && expenseConfig.status === 'PENDING' ? 'step-active' : 'step-dim'}>Waiting approval</span>
                        <span className="step-dim">&gt;</span>
                        <span className={isExisting && expenseConfig.status === 'APPROVED' ? 'step-active' : 'step-dim'}>Approved</span>
                    </div>
                </div>

                {isScanning ? (
                    <div className="ocr-upload-zone">
                        <div className="ocr-loading">
                            <div className="spinner"></div>
                            <p>AI analyzing receipt using OCR algorithms... Extracting metadata.</p>
                        </div>
                    </div>
                ) : (
                    <div className="form-content-wrap">
                        {previewUrl && (
                            <div className="receipt-preview-container" style={{marginBottom: '1.5rem', textAlign: 'center'}}>
                                <p style={{fontSize: '0.8rem', color: 'var(--employee-text-muted)', marginBottom: '0.5rem'}}>Receipt Preview</p>
                                <img src={previewUrl} alt="Receipt Preview" style={{maxHeight: '200px', borderRadius: '8px', border: '1px solid var(--employee-sidebar-border)'}} />
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="employee-form-grid">
                        <div className="form-group">
                            <label>Description</label>
                            <input name="description" value={formData.description} onChange={handleChange} disabled={isReadonly} className="form-input" required />
                        </div>
                        
                        <div className="form-group">
                            <label>Expense Date</label>
                            <input type="date" name="expenseDate" value={formData.expenseDate} onChange={handleChange} disabled={isReadonly} className="form-input" required />
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <input name="category" value={formData.category} onChange={handleChange} disabled={isReadonly} className="form-input" required />
                        </div>

                        <div className="form-group">
                            <label>Paid by:</label>
                            <input type="text" value={currentUser.name} disabled className="form-input" style={{backgroundColor: 'var(--employee-sidebar-bg)'}} />
                        </div>

                        <div className="form-group">
                            <label>Total amount</label>
                            <div style={{display:'flex', gap:'1rem'}}>
                                <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} disabled={isReadonly} className="form-input" style={{flex:1}} required />
                                <select name="currency" value={formData.currency} onChange={handleChange} disabled={isReadonly} className="form-input" style={{width:'80px'}}>
                                    {currenciesLoading ? (
                                        <option value={formData.currency}>{formData.currency}</option>
                                    ) : (
                                        currencies.map(c => (
                                            <option key={c.code} value={c.code}>{c.code}</option>
                                        ))
                                    )}
                                </select>
                            </div>
                            <span style={{fontSize:'0.75rem', color:'#f87171'}}>Selected currency: {formData.currency}</span>
                        </div>

                        <div className="form-group">
                            <label>Remarks</label>
                            <input name="remarks" value={formData.remarks} onChange={handleChange} disabled={isReadonly} className="form-input" />
                        </div>

                        <div className="form-group">
                            <label>Notes</label>
                            <input name="notes" value={formData.notes} onChange={handleChange} disabled={isReadonly} className="form-input" />
                        </div>

                        <div className="employee-modal-footer" style={{gridColumn: '1 / -1'}}>
                            {!isReadonly && (
                                <button type="submit" className="btn-submit-large">Submit</button>
                            )}

                            {isExisting && expenseConfig.action_logs && expenseConfig.action_logs.length > 0 && (
                                <div className="history-log">
                                    <h4 style={{marginBottom:'.5rem', color:'var(--employee-text-muted)'}}>Audit Log History</h4>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Approver/Actor</th>
                                                <th>Status</th>
                                                <th>Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expenseConfig.action_logs.map((log, idx) => (
                                                <tr key={idx}>
                                                    <td>{log.actor}</td>
                                                    <td style={{
                                                        color: log.action === 'Approved' ? '#10b981' : log.action === 'Rejected' ? '#ef4444' : log.action === 'Submitted' ? '#fbbf24' : '#e4e6eb',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {log.action}
                                                    </td>
                                                    <td>{new Date(log.time).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseFormModal;
