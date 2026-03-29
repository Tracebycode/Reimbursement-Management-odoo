import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            setLoading(true);

            const res = await login(formData.email, formData.password);

            if (res.success) {
                console.log("LOGIN SUCCESS:", res);
                
                // Navigate based on role
                if (res.role === 'ADMIN' || res.role === 'admin') navigate('/admin/dashboard');
                else if (res.role === 'MANAGER' || res.role === 'manager') navigate('/manager/dashboard');
                else navigate('/employee/dashboard');
            } else {
                setError(res.message || "Login failed");
            }

        } catch (err) {
            console.error(err);
            setError("Login failed due to an unexpected error");
        } finally {
            setLoading(false);
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
                        <label>Password</label>
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
                        >
                            {showPass ? "🙈" : "👁️"}
                        </button>
                    </div>

                    <button type="submit" className="btn-auth" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </button>

                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/signup">Signup</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;