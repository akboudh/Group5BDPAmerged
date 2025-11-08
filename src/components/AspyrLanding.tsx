import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './AspyrLanding.css';

interface AspyrLandingProps {
  onStart: () => void;
}

export function AspyrLanding({ onStart }: AspyrLandingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setIsVisible(true);
    // Animate glow intensity
    const interval = setInterval(() => {
      setGlowIntensity(prev => (prev + 0.02) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const glowOpacity = (Math.sin(glowIntensity) + 1) / 2;

  return (
    <div className={`aspyr-landing ${theme}`}>
      <button 
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div className={`landing-content ${isVisible ? 'visible' : ''}`}>
        <div className="logo-container">
          <h1 className="aspyr-logo">
            <span className="logo-letter" style={{ '--delay': '0s' } as React.CSSProperties}>A</span>
            <span className="logo-letter" style={{ '--delay': '0.1s' } as React.CSSProperties}>s</span>
            <span className="logo-letter" style={{ '--delay': '0.2s' } as React.CSSProperties}>p</span>
            <span className="logo-letter" style={{ '--delay': '0.3s' } as React.CSSProperties}>y</span>
            <span className="logo-letter" style={{ '--delay': '0.4s' } as React.CSSProperties}>r</span>
          </h1>
          <div 
            className="logo-glow"
            style={{ opacity: 0.3 + glowOpacity * 0.4 }}
          />
        </div>

        <p className="landing-description">
          Your intelligent career path analyzer. Discover the skills you need, 
          bridge the gaps, and unlock your potential in the tech industry.
        </p>

        <div className="features-preview">
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span>Skill Gap Analysis</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📚</span>
            <span>Personalized Learning</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🚀</span>
            <span>Career Roadmap</span>
          </div>
        </div>

        <button 
          className="start-button"
          onClick={onStart}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <span className="button-text">Get Started</span>
          <span className="button-arrow">→</span>
          <div className="button-glow" />
        </button>
      </div>

      <div className="landing-background">
        <div className="bg-circle circle-1" />
        <div className="bg-circle circle-2" />
        <div className="bg-circle circle-3" />
      </div>
    </div>
  );
}

