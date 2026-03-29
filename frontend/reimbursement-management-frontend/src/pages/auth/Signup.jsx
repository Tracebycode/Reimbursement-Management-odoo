import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AuthPages.css';
import api from '../../services/api';

const Signup = () => {
    const navigate = useNavigate();

    const [countries, setCountries] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(true);
    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        companyName: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        country: '',
        currency: '',
        currencySymbol: ''
    });

    // Fetch countries + currencies
    useEffect(() => {
        fetch('https://restcountries.com/v3.1/all?fields=name,currencies')
            .then(res => res.json())
            .then(data => {
                const sorted = data.sort((a, b) =>
                    a.name.common.localeCompare(b.name.common)
                );
                setCountries(sorted);
                setLoadingCountries(false);
            })
            .catch(err => {
                console.error("Failed to fetch countries", err);
                setLoadingCountries(false);
            });
    }, []);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'country') {
            const countryObj = countries.find(c => c.name.common === value);

            const currencyCode = countryObj?.currencies
                ? Object.keys(countryObj.currencies)[0]
                : 'USD';

            const currencySymbol = countryObj?.currencies
                ? countryObj.currencies[currencyCode].symbol
                : '$';

            setFormData(prev => ({
                ...prev,
                country: value,
                currency: currencyCode,          // ✅ FIXED
                currencySymbol: currencySymbol   // for UI only
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!formData.country) {
            setError('Please select a country');
            return;
        }

        try {
            setLoading(true);

            const res = await api.post("/api/auth/signup", {
                name: formData.name,
                email: formData.email,
                organization_name: formData.companyName,
                currency: formData.currency,
                password: formData.password
            });

            console.log("Signup success:", res.data);

            alert("Signup successful 🚀");

            navigate("/login");

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Register Company</h1>
                    <p>Setup your organization and admin account</p>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Company Name</label>
                        <input
                            type="text"
                            name="companyName"
                            required
                            className="auth-input"
                            placeholder="e.g. Acme Industries"
                            value={formData.companyName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Admin Full Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="auth-input"
                            placeholder="e.g. Mitchell Rose"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

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
                            placeholder="Minimum 8 characters"
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

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            className="auth-input"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Country of Operation</label>
                        <select
                            name="country"
                            required
                            className="auth-input"
                            value={formData.country}
                            onChange={handleChange}
                            disabled={loadingCountries}
                        >
                            <option value="">Select a country</option>
                            {countries.map(c => (
                                <option key={c.name.common} value={c.name.common}>
                                    {c.name.common}
                                </option>
                            ))}
                        </select>

                        {formData.currency && (
                            <p style={{
                                fontSize: '0.75rem',
                                color: '#10b981',
                                marginTop: '0.25rem'
                            }}>
                                Base Currency: {formData.currency} ({formData.currencySymbol})
                            </p>
                        )}
                    </div>

                    <button type="submit" className="btn-auth" disabled={loading}>
                        {loading ? "Creating..." : "Register Company"}
                    </button>

                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;