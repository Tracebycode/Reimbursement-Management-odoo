import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, forgotPassword } = useAuth();
    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [message, setMessage] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const result = login(formData.email, formData.password);
        if (result.success) {
            if (result.role === 'ADMIN') navigate('/admin/dashboard');
            else if (result.role === 'MANAGER') navigate('/manager/dashboard');
            else navigate('/employee/dashboard');
        } else {
            setError(result.message);
        }
    };

    const handleForgotPass = () => {
        if (!formData.email) {
            setError('Please enter your email first');
            return;
        }
        const res = forgotPassword(formData.email);
        if (res.success) {
            alert(`Password Reset! Your temporary password is: ${res.tempPass}`);
            setMessage(`A new password has been sent to your email. Check your inbox.`);
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Sign In</h1>
                    <p>Enter your credentials to access your portal</p>
                </div>

                {error && <div className="error-msg">{error}</div>}
                {message && <div style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1rem'}}>{message}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            required 
                            className="auth-input" 
                            placeholder="e.g. admin@acme.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="password-input-wrapper">
                        <label style={{fontSize: '0.875rem', fontWeight: 600, color: 'var(--auth-text-muted)', marginBottom: '0.5rem'}}>Password</label>
                        <input 
                            type={showPass ? "text" : "password"} 
                            name="password" 
                            required 
                            className="auth-input" 
                            placeholder="Your password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <button 
                            type="button" 
                            className="toggle-password" 
                            onClick={() => setShowPass(!showPass)}
                            style={{top: '2.5rem'}}
                        >
                            {showPass ? "🙈" : "👁️"}
                        </button>
                    </div>

                    <div className="forgot-password">
                        <button type="button" onClick={handleForgotPass}>Forgot password?</button>
                    </div>

                    <button type="submit" className="btn-auth">Sign In</button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/signup">Signup</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
