// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState } from 'react';

export const colorThemes = {
  purple: {
    primary: '#6B46C1',      // Main purple
    primaryDark: '#553C9A',  // Darker purple
    primaryLight: '#805AD5', // Lighter purple
    accent: '#9F7AEA',       // Accent purple
    background: '#FFFFFF',   // White background
    text: '#2D3748',        // Dark text
    lightBg: '#EDE9FE',     // Very light purple
    error: '#E53E3E'        // Red for errors
  },
  ocean: {
    primary: '#2A9D8F',
    primaryDark: '#264653',
    primaryLight: '#45B7B7',
    accent: '#E76F51',
    background: '#F8FAFC',
    text: '#2D3748',
    lightBg: '#E9F2F1',
    error: '#DC3545'
  },
  nature: {
    primary: '#4A8C3F',
    primaryDark: '#2F5A27',
    primaryLight: '#6BAF5E',
    accent: '#D4A373',
    background: '#FAFAF8',
    text: '#2D3748',
    lightBg: '#EDF3EC',
    error: '#DC3545'
  },
  sunset: {
    primary: '#F4A261',
    primaryDark: '#E76F51',
    primaryLight: '#FFB98A',
    accent: '#2A9D8F',
    background: '#FDF8F6',
    text: '#2D3748',
    lightBg: '#FFF0E6',
    error: '#DC3545'
  },
  minimal: {
    primary: '#4A5568',
    primaryDark: '#2D3748',
    primaryLight: '#718096',
    accent: '#3182CE',
    background: '#FFFFFF',
    text: '#2D3748',
    lightBg: '#F7FAFC',
    error: '#DC3545'
  }
};

export type ThemeOption = keyof typeof colorThemes;
type ThemeContextType = {
  currentTheme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;
  colors: typeof colorThemes.purple; // Updated type to use purple theme
};

const THEME_STORAGE_KEY = 'flashcard-app-theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Set 'purple' as the default theme
  const [currentTheme, setCurrentTheme] = useState<ThemeOption>(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return (savedTheme as ThemeOption) || 'purple'; // Changed default to 'purple'
  });

  // Save theme to localStorage when it changes
  React.useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
  }, [currentTheme]);

  const value = {
    currentTheme,
    setTheme: setCurrentTheme,
    colors: colorThemes[currentTheme]
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};