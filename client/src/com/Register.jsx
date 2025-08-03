import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.backgroundColor = '#000';
    document.body.style.color = '#fff';
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
    setMessage('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';

    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be 10 digits';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Minimum 6 characters';

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const { email, phone, password, confirmPassword } = formData;
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        email,
        phone,
        password,
        confirmPassword
      });

      setMessage(res.data.message || 'Registration successful');
      navigate('/pro');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleGoToGuest = () => navigate('/pro');
  const handleGoToLogin = () => navigate('/login');

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#000',
    }}>
      <div style={{
        backgroundColor: '#111',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(255,255,255,0.05)',
        width: '100%',
        maxWidth: '400px',
        boxSizing: 'border-box',
        color: '#fff'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Register</h1>

        {message && (
          <p style={{
            backgroundColor: message.toLowerCase().includes('failed') ? '#721c24' : '#155724',
            color: message.toLowerCase().includes('failed') ? '#f8d7da' : '#d4edda',
            padding: '0.75rem',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '1rem',
            fontSize: '0.95rem'
          }}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {[
            { name: 'email', label: 'Email' },
            { name: 'phone', label: 'Phone Number' },
            { name: 'password', label: 'Password' },
            { name: 'confirmPassword', label: 'Confirm Password' },
          ].map(({ name, label }, idx) => (
            <div key={idx} style={{ marginBottom: '1rem' }}>
              <label
                htmlFor={name}
                style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
              >
                {label}:
              </label>
              <input
                id={name}
                type={name.toLowerCase().includes('password') ? 'password' : name === 'phone' ? 'tel' : 'text'}
                name={name}
                placeholder={label}
                value={formData[name]}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  fontSize: '1rem',
                  borderRadius: '8px',
                  backgroundColor: '#222',
                  border: `1px solid ${errors[name] ? '#dc3545' : '#444'}`,
                  color: '#fff',
                }}
              />
              {errors[name] && (
                <p style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '5px' }}>
                  {errors[name]}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.6rem',
              backgroundColor: '#28a745',
              color: 'white',
              fontSize: '1rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Register
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={handleGoToLogin}
            style={{
              width: '100%',
              padding: '0.6rem',
              backgroundColor: '#007bff',
              color: 'white',
              fontSize: '1rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Go to Login
          </button>
          <button
            onClick={handleGoToGuest}
            style={{
              width: '100%',
              padding: '0.6rem',
              backgroundColor: '#ffc107',
              color: '#000',
              fontSize: '1rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
