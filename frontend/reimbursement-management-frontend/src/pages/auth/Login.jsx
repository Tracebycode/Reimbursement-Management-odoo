import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './AuthPages.css';

const Login = () => {
    const navigate = useNavigate();

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

            const res = await api.post("/api/auth/login", {
                email: formData.email,
                password: formData.password
            });

            const data = res.data;

            console.log("LOGIN SUCCESS:", data);

            // Save token
            if (data.token) {
                localStorage.setItem("token", data.token);
            }

            // Navigate based on role
            if (data.role === 'ADMIN') navigate('/admin/dashboard');
            else if (data.role === 'MANAGER') navigate('/manager/dashboard');
            else navigate('/employee/dashboard');

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Login failed");
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