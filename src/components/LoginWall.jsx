import React, { useState } from 'react';
import '../styles/style.css'; 

export default function LoginWall({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple mock login for now to bypass Firebase issues
    if (username.length > 2 && password === 'fashion') {
      setIsAuthenticated(true);
    } else {
      setError('Invalid credentials. Password is "fashion"');
    }
  };

  if (isAuthenticated) {
    return children;
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      background: 'var(--color-bg)',
      color: 'var(--color-text)'
    }}>
      <div style={{
        background: 'var(--color-surface)',
        padding: '2.5rem',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.05)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}>
        <div style={{ 
          fontSize: '2.5rem', 
          marginBottom: '1rem', 
          width: '70px', 
          height: '70px', 
          margin: '0 auto 1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          borderRadius: '50%', 
          background: 'var(--color-gold)', 
          color: 'var(--color-bg)',
          fontWeight: 'bold',
          fontFamily: 'serif'
        }}>L</div>
        
        <h2 style={{ marginBottom: '0.5rem', color: 'var(--color-text)', fontFamily: 'serif' }}>The Loomist</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Please sign in to explore fashion history.</p>

        {error && <div style={{ color: '#ff4d4d', fontSize: '0.9rem', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(255,77,77,0.1)', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(0,0,0,0.2)',
              color: 'white',
              textAlign: 'center'
            }}
            required
          />
          <input 
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(0,0,0,0.2)',
              color: 'white',
              textAlign: 'center'
            }}
            required
          />
          <button 
            type="submit"
            style={{
              background: 'var(--color-gold)',
              color: 'var(--color-bg)',
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '0.5rem',
              transition: 'transform 0.2s'
            }}
            onMouseOver={e => e.target.style.transform = 'scale(1.02)'}
            onMouseOut={e => e.target.style.transform = 'scale(1)'}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
