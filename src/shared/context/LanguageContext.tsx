import React, { createContext, ReactNode, useContext } from 'react';

// Define the translation function type
type TranslationFunction = (key: string) => string;

// Define the context type
interface LanguageContextType {
  t: TranslationFunction;
  currentLanguage: string;
  setLanguage: (language: string) => void;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation data
const translations: Record<string, Record<string, string>> = {
  en: {
    // Common
    'common.loading': 'Loading',
    
    // Auth
    'auth.welcome': 'Welcome',
    'auth.login_with_google': 'Login with Google',
    'auth.redirecting': 'Redirecting...',
    'auth.or': 'or',
    'auth.sign_in_with_email': 'Sign in with Email',
    'auth.create_account': 'Create Account',
    'auth.test_navigation': 'Test Navigation',
    'auth.retry_connection': 'Retry Connection',
    
    // Home
    'home.hello': 'Hello',
    'home.no_conversations': 'No conversations yet',
    'home.new_conversation': 'New Conversation',
    'home.logout': 'Logout',
    'home.logging_out': 'Logging out...',
    
    // Explore
    'explore.title': 'Explore',
    'explore.coming_soon': 'Coming soon...',
  },
  // Add more languages as needed
  es: {
    'common.loading': 'Cargando',
    'auth.welcome': 'Bienvenido',
    'auth.login_with_google': 'Iniciar sesión con Google',
    'auth.redirecting': 'Redirigiendo...',
    'auth.or': 'o',
    'auth.sign_in_with_email': 'Iniciar sesión con Email',
    'auth.create_account': 'Crear Cuenta',
    'auth.test_navigation': 'Probar Navegación',
    'auth.retry_connection': 'Reintentar Conexión',
    'home.hello': 'Hola',
    'home.no_conversations': 'Aún no hay conversaciones',
    'home.new_conversation': 'Nueva Conversación',
    'home.logout': 'Cerrar Sesión',
    'home.logging_out': 'Cerrando sesión...',
    'explore.title': 'Explorar',
    'explore.coming_soon': 'Próximamente...',
  }
};

// Language provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = React.useState('en');

  // Debug when currentLanguage changes
  React.useEffect(() => {
    console.log('🌍 Language changed to:', currentLanguage);
  }, [currentLanguage]);

  const t: TranslationFunction = (key: string) => {
    const languageTranslations = translations[currentLanguage] || translations.en;
    return languageTranslations[key] || key;
  };

  const setLanguage = (language: string) => {
    console.log('🌍 setLanguage called with:', language);
    console.log('🌍 Available languages:', Object.keys(translations));
    if (translations[language]) {
      console.log('🌍 Setting language to:', language);
      setCurrentLanguage(language);
    } else {
      console.log('🌍 Language not found:', language);
    }
  };

  const value: LanguageContextType = {
    t,
    currentLanguage,
    setLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use the language context
export const useLanguageContext = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
}; 