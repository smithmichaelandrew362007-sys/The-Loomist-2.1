import React, { useState, useEffect } from 'react';
import '../styles/style.css';

export function useTheme() {
  const [theme, setTheme] = useState('light');
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('loomist-theme');
    if (!savedTheme) {
      setShowThemePicker(true);
    } else {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const applyTheme = (chosen) => {
    setTheme(chosen);
    document.documentElement.setAttribute('data-theme', chosen);
    localStorage.setItem('loomist-theme', chosen);
    setShowThemePicker(false);
  };

  const toggleTheme = () => {
    setShowThemePicker(true);
  };

  return { theme, showThemePicker, applyTheme, toggleTheme };
}

export function ThemePickerModal({ applyTheme }) {
  return (
    <div className="theme-picker-overlay" role="dialog" aria-modal="true" aria-label="Choose your theme">
      <div className="theme-picker-modal">
        <div className="theme-picker-icon">🧵</div>
        <h2 className="theme-picker-title">Welcome to The Loomist</h2>
        <p className="theme-picker-subtitle">Choose your preferred experience</p>
        <div className="theme-picker-options">
          <button
            id="theme-pick-light"
            className="theme-picker-btn theme-picker-light"
            onClick={() => applyTheme('light')}
          >
            <span className="theme-picker-btn-icon">✨</span>
            <span className="theme-picker-btn-label">Premium</span>
            <span className="theme-picker-btn-desc">Soft teal & cream</span>
          </button>
          <button
            id="theme-pick-dark"
            className="theme-picker-btn theme-picker-dark"
            onClick={() => applyTheme('dark')}
          >
            <span className="theme-picker-btn-icon">🌙</span>
            <span className="theme-picker-btn-label">Dark</span>
            <span className="theme-picker-btn-desc">Jet black & burgundy</span>
          </button>
          <button
            className="theme-picker-btn theme-picker-normal-light"
            onClick={() => applyTheme('normal-light')}
          >
            <span className="theme-picker-btn-icon">☀️</span>
            <span className="theme-picker-btn-label">Light</span>
            <span className="theme-picker-btn-desc">Clean & minimal</span>
          </button>
          <button
            className="theme-picker-btn theme-picker-normal-dark"
            onClick={() => applyTheme('normal-dark')}
          >
            <span className="theme-picker-btn-icon">🌑</span>
            <span className="theme-picker-btn-label">Deep Dark</span>
            <span className="theme-picker-btn-desc">Classic neutral dark</span>
          </button>
          <button
            className="theme-picker-btn theme-picker-midnight"
            onClick={() => applyTheme('midnight')}
          >
            <span className="theme-picker-btn-icon">🌌</span>
            <span className="theme-picker-btn-label">Midnight</span>
            <span className="theme-picker-btn-desc">Deep navy & cyan</span>
          </button>
          <button
            className="theme-picker-btn theme-picker-cyberpunk"
            onClick={() => applyTheme('cyberpunk')}
          >
            <span className="theme-picker-btn-icon">⚡</span>
            <span className="theme-picker-btn-label">Cyberpunk</span>
            <span className="theme-picker-btn-desc">Neon pink & blue</span>
          </button>
          <button
            className="theme-picker-btn theme-picker-forest"
            onClick={() => applyTheme('forest')}
          >
            <span className="theme-picker-btn-icon">🌿</span>
            <span className="theme-picker-btn-label">Earthy</span>
            <span className="theme-picker-btn-desc">Sage & terracotta</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function ThemeToggleButton({ toggleTheme }) {
  return (
    <button
      id="theme-toggle"
      className="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label="Change Theme"
      title="Change Theme"
    >
      🎨
    </button>
  );
}
