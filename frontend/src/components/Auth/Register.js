import React, { useState } from 'react';
import { register } from '../../services/authService';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (userData.password !== userData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (userData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setError('');
        setLoading(true);

        try {
            const { confirmPassword, ...registrationData } = userData;
            await register(registrationData);
            navigate('/login');
        } catch (error) {
            setError('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-form-container">
            <div className="auth-form-card">
                <h2>Register</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input
                            className={"input-auth"}
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={userData.firstName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            className={"input-auth"}
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={userData.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            className={"input-auth"}
                            type="email"
                            id="email"
                            name="email"
                            value={userData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            className={"input-auth"}
                            type="password"
                            id="password"
                            name="password"
                            value={userData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            className={"input-auth"}
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={userData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-submit-button" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <p className="auth-alternative">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;