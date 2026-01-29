import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { THEME_STORAGE_KEY } from '../constants';

const ThemeManager: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if it's a public form route
    const isPublicForm = location.pathname.startsWith('/f/');

    if (isPublicForm) {
      // For public forms, we rely on the PublicFormView/ExpertLanding 
      // to set the theme based on the specific form config.
      // We don't want to override it here with the global admin preference.
      return;
    }

    // Otherwise, use the global admin theme preference
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [location.pathname]);

  return null;
};

export default ThemeManager;
