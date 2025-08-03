import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = 'http://localhost:5000/api/auth/login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await axios.post(API_URL, { email, password });
      const { token, role } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);

      role === 'admin' ? navigate('/pro') : navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#000',
        color: '#fff',
      }}
    >
      <div
        style={{
          backgroundColor: '#111',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(255, 255, 255, 0.05)',
          width: '100%',
          maxWidth: '400px',
          boxSizing: 'border-box',
        }}
      >
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Login</h1>

        {error && (
          <div
            style={{
              backgroundColor: '#2c0b0e',
              color: '#f87171',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              textAlign: 'center',
              border: '1px solid #b91c1c',
            }}
          >
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Email:
            </label>
            <input
              type="email"
              value={email}
              disabled={isLoading}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                fontSize: '1rem',
                border: '1px solid #444',
                borderRadius: '8px',
                backgroundColor: '#222',
                color: '#fff',
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Password:
            </label>
            <input
              type="password"
              value={password}
              disabled={isLoading}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                fontSize: '1rem',
                border: '1px solid #444',
                borderRadius: '8px',
                backgroundColor: '#222',
                color: '#fff',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.6rem',
              fontSize: '1rem',
              color: '#fff',
              backgroundColor: isLoading ? '#666' : '#4f46e5',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginTop: '1rem',
              transition: 'background-color 0.2s',
            }}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Don't have an account?{' '}
          <a href="/" style={{ color: '#818cf8', textDecoration: 'underline' }}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
