import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import universityColorsData from '../data/universityColors.json';

type Theme = 'light' | 'dark';

interface UniversityColor {
  name: string;
  primary: string;
  secondary: string;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  universityColors: UniversityColor | null;
  setUniversityColors: (schoolName: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Default colors (purple gradient theme)
const DEFAULT_PRIMARY = '#6366f1';
const DEFAULT_SECONDARY = '#8b5cf6';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      return savedTheme;
    }
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [universityColors, setUniversityColorsState] = useState<UniversityColor | null>(() => {
    const savedSchool = localStorage.getItem('selectedSchool');
    if (savedSchool) {
      const colors = findUniversityColors(savedSchool);
      return colors;
    }
    return null;
  });

  // Function to find university colors by name (fuzzy match)
  function findUniversityColors(schoolName: string): UniversityColor | null {
    if (!schoolName) return null;
    
    const schools = (universityColorsData as { schools: UniversityColor[] }).schools;
    
    // Exact match first
    let found = schools.find(s => s.name === schoolName);
    
    // Fuzzy match - try partial matches
    if (!found) {
      found = schools.find(s => 
        s.name.toLowerCase().includes(schoolName.toLowerCase()) ||
        schoolName.toLowerCase().includes(s.name.toLowerCase())
      );
    }
    
    // Try matching common abbreviations
    if (!found) {
      const abbreviations: Record<string, string> = {
        'MIT': 'Massachusetts Institute of Technology (MIT)',
        'UCLA': 'University of California, Los Angeles (UCLA)',
        'UC Berkeley': 'University of California, Berkeley (UC Berkeley)',
        'USC': 'University of Southern California (USC)',
        'NYU': 'New York University (NYU)',
        'UIUC': 'University of Illinois at Urbana-Champaign (UIUC)',
        'UCSD': 'University of California, San Diego (UCSD)',
        'UCI': 'University of California, Irvine (UCI)',
        'UCSB': 'University of California, Santa Barbara (UCSB)',
        'UCSC': 'University of California, Santa Cruz (UCSC)',
        'UCR': 'University of California, Riverside (UCR)',
        'UCSF': 'University of California, San Francisco (UCSF)',
        'UNC': 'University of North Carolina at Chapel Hill (UNC)',
        'UT Austin': 'University of Texas at Austin (UT Austin)',
        'Penn': 'University of Pennsylvania (Penn)',
        'WashU': 'Washington University in St. Louis (WashU)',
        'UVA': 'University of Virginia (UVA)',
        'RIT': 'Rochester Institute of Technology (RIT)',
        'RPI': 'Rensselaer Polytechnic Institute (RPI)',
        'SMU': 'Southern Methodist University (SMU)',
        'UConn': 'University of Connecticut (UConn)',
        'Caltech': 'California Institute of Technology (Caltech)',
      };
      
      const fullName = abbreviations[schoolName];
      if (fullName) {
        found = schools.find(s => s.name === fullName);
      }
    }
    
    return found || null;
  }

  // Function to set university colors
  const setUniversityColors = (schoolName: string | null) => {
    if (!schoolName) {
      setUniversityColorsState(null);
      localStorage.removeItem('selectedSchool');
      applyColorsToCSS(null);
      return;
    }

    const colors = findUniversityColors(schoolName);
    if (colors) {
      setUniversityColorsState(colors);
      localStorage.setItem('selectedSchool', schoolName);
      applyColorsToCSS(colors);
    } else {
      // If not found, reset to default
      setUniversityColorsState(null);
      localStorage.removeItem('selectedSchool');
      applyColorsToCSS(null);
    }
  };

  // Helper function to convert hex to RGB
  function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '99, 102, 241'; // Default purple RGB
  }

  // Function to generate darker version of color
  function darkenColor(hex: string, amount: number = 0.2): string {
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!rgb) return hex;
    
    const r = Math.max(0, parseInt(rgb[1], 16) - Math.round(255 * amount));
    const g = Math.max(0, parseInt(rgb[2], 16) - Math.round(255 * amount));
    const b = Math.max(0, parseInt(rgb[3], 16) - Math.round(255 * amount));
    
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  }

  // Helper function to determine if a color is light or dark
  function isLightColor(hex: string): boolean {
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!rgb) return false;
    
    const r = parseInt(rgb[1], 16);
    const g = parseInt(rgb[2], 16);
    const b = parseInt(rgb[3], 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  }

  // Function to apply colors to CSS custom properties
  function applyColorsToCSS(colors: UniversityColor | null) {
    const root = document.documentElement;
    if (colors) {
      root.style.setProperty('--university-primary', colors.primary);
      root.style.setProperty('--university-secondary', colors.secondary);
      root.style.setProperty('--university-primary-rgb', hexToRgb(colors.primary));
      root.style.setProperty('--university-secondary-rgb', hexToRgb(colors.secondary));
      root.style.setProperty('--university-primary-dark', darkenColor(colors.primary, 0.2));
      root.style.setProperty('--university-secondary-dark', darkenColor(colors.secondary, 0.2));
      // Use primary color directly for backgrounds
      root.style.setProperty('--university-bg-primary', colors.primary);
      root.style.setProperty('--university-bg-secondary', colors.secondary);
      // Determine text color based on background brightness
      const isLight = isLightColor(colors.primary);
      root.style.setProperty('--university-text-color', isLight ? '#000000' : '#ffffff');
      // For dark mode, use darkened version
      root.style.setProperty('--university-bg-primary-dark', darkenColor(colors.primary, 0.3));
      root.style.setProperty('--university-bg-secondary-dark', darkenColor(colors.secondary, 0.3));
    } else {
      root.style.setProperty('--university-primary', DEFAULT_PRIMARY);
      root.style.setProperty('--university-secondary', DEFAULT_SECONDARY);
      root.style.setProperty('--university-primary-rgb', '99, 102, 241');
      root.style.setProperty('--university-secondary-rgb', '139, 92, 246');
      root.style.setProperty('--university-primary-dark', '#4338ca');
      root.style.setProperty('--university-secondary-dark', '#7c3aed');
      root.style.setProperty('--university-bg-primary', DEFAULT_PRIMARY);
      root.style.setProperty('--university-bg-secondary', DEFAULT_SECONDARY);
      root.style.setProperty('--university-text-color', '#ffffff');
      root.style.setProperty('--university-bg-primary-dark', '#1e1b4b');
      root.style.setProperty('--university-bg-secondary-dark', '#312e81');
    }
  }

  // Apply theme class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Apply university colors on mount and when they change
  useEffect(() => {
    applyColorsToCSS(universityColors);
  }, [universityColors]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, universityColors, setUniversityColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
