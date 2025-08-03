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
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.close': 'Close',
    'common.ok': 'OK',
    'common.yes': 'Yes',
    'common.no': 'No',
    
    // Auth
    'auth.welcome': 'Welcome',
    'auth.login_with_google': 'Login with Google',
    'auth.redirecting': 'Redirecting...',
    'auth.or': 'or',
    'auth.sign_in_with_email': 'Sign in with Email',
    'auth.create_account': 'Create Account',
    'auth.test_navigation': 'Test Navigation',
    'auth.retry_connection': 'Retry Connection',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirm_password': 'Confirm Password',
    'auth.forgot_password': 'Forgot Password?',
    'auth.sign_in': 'Sign In',
    'auth.sign_up': 'Sign Up',
    'auth.reset_password': 'Reset Password',
    'auth.send_reset_email': 'Send Reset Email',
    'auth.password_reset_sent': 'Password reset email sent',
    'auth.check_email_instructions': 'Please check your email and follow the instructions',
    'auth.account_created': 'Account Created Successfully!',
    'auth.confirm_email_instructions': 'Please check your email and click the confirmation link to activate your account. You can then sign in.',
    'auth.signup_failed': 'Signup Failed',
    'auth.signin_failed': 'Sign In Failed',
    'auth.check_credentials': 'Failed to sign in. Please check your credentials and try again.',
    'auth.unexpected_error': 'An unexpected error occurred. Please try again.',
    'auth.enter_email': 'Please enter your email address',
    'auth.enter_valid_email': 'Please enter a valid email address',
    'auth.enter_password': 'Please enter your password',
    'auth.passwords_must_match': 'Passwords must match',
    'auth.password_too_short': 'Password must be at least 6 characters',
    
    // Home
    'home.hello': 'Hello',
    'home.no_conversations': 'No conversations yet',
    'home.new_conversation': 'New Conversation',
    'home.logout': 'Logout',
    'home.logging_out': 'Logging out...',
    
    // Settings
    'settings.title': 'Settings',
    'settings.account': 'Account',
    'settings.preferences': 'Preferences',
    'settings.data_privacy': 'Data & Privacy',
    'settings.about': 'About',
    'settings.name': 'Name',
    'settings.email': 'Email',
    'settings.language': 'Language',
    'settings.notifications': 'Notifications',
    'settings.dark_mode': 'Dark Mode',
    'settings.export_data': 'Export Data',
    'settings.clear_conversations': 'Clear All Conversations',
    'settings.privacy_policy': 'Privacy Policy',
    'settings.version': 'Version',
    'settings.terms_of_service': 'Terms of Service',
    'settings.support': 'Support',
    'settings.not_set': 'Not set',
    'settings.name_updated': 'Name updated successfully',
    'settings.name_update_failed': 'Failed to update name. Please try again.',
    'settings.name_empty': 'Name cannot be empty',
    
    // Chat
    'chat.new_message': 'Type a message...',
    'chat.send': 'Send',
    'chat.thinking': 'Thinking...',
    'chat.regenerate': 'Regenerate',
    'chat.copy': 'Copy',
    'chat.delete': 'Delete',
    
    // Explore
    'explore.title': 'Explore',
    'explore.coming_soon': 'Coming soon...',
  },
  es: {
    // Common
    'common.loading': 'Cargando',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'common.close': 'Cerrar',
    'common.ok': 'OK',
    'common.yes': 'Sí',
    'common.no': 'No',
    
    // Auth
    'auth.welcome': 'Bienvenido',
    'auth.login_with_google': 'Iniciar sesión con Google',
    'auth.redirecting': 'Redirigiendo...',
    'auth.or': 'o',
    'auth.sign_in_with_email': 'Iniciar sesión con Email',
    'auth.create_account': 'Crear Cuenta',
    'auth.test_navigation': 'Probar Navegación',
    'auth.retry_connection': 'Reintentar Conexión',
    'auth.email': 'Correo electrónico',
    'auth.password': 'Contraseña',
    'auth.confirm_password': 'Confirmar Contraseña',
    'auth.forgot_password': '¿Olvidaste tu contraseña?',
    'auth.sign_in': 'Iniciar Sesión',
    'auth.sign_up': 'Registrarse',
    'auth.reset_password': 'Restablecer Contraseña',
    'auth.send_reset_email': 'Enviar Email de Restablecimiento',
    'auth.password_reset_sent': 'Email de restablecimiento de contraseña enviado',
    'auth.check_email_instructions': 'Por favor revisa tu correo y sigue las instrucciones',
    'auth.account_created': '¡Cuenta Creada Exitosamente!',
    'auth.confirm_email_instructions': 'Por favor revisa tu correo y haz clic en el enlace de confirmación para activar tu cuenta. Luego podrás iniciar sesión.',
    'auth.signup_failed': 'Registro Fallido',
    'auth.signin_failed': 'Inicio de Sesión Fallido',
    'auth.check_credentials': 'No se pudo iniciar sesión. Por favor verifica tus credenciales e intenta de nuevo.',
    'auth.unexpected_error': 'Ocurrió un error inesperado. Por favor intenta de nuevo.',
    'auth.enter_email': 'Por favor ingresa tu dirección de correo',
    'auth.enter_valid_email': 'Por favor ingresa un correo válido',
    'auth.enter_password': 'Por favor ingresa tu contraseña',
    'auth.passwords_must_match': 'Las contraseñas deben coincidir',
    'auth.password_too_short': 'La contraseña debe tener al menos 6 caracteres',
    
    // Home
    'home.hello': 'Hola',
    'home.no_conversations': 'Aún no hay conversaciones',
    'home.new_conversation': 'Nueva Conversación',
    'home.logout': 'Cerrar Sesión',
    'home.logging_out': 'Cerrando sesión...',
    
    // Settings
    'settings.title': 'Configuración',
    'settings.account': 'Cuenta',
    'settings.preferences': 'Preferencias',
    'settings.data_privacy': 'Datos y Privacidad',
    'settings.about': 'Acerca de',
    'settings.name': 'Nombre',
    'settings.email': 'Correo',
    'settings.language': 'Idioma',
    'settings.notifications': 'Notificaciones',
    'settings.dark_mode': 'Modo Oscuro',
    'settings.export_data': 'Exportar Datos',
    'settings.clear_conversations': 'Borrar Todas las Conversaciones',
    'settings.privacy_policy': 'Política de Privacidad',
    'settings.version': 'Versión',
    'settings.terms_of_service': 'Términos de Servicio',
    'settings.support': 'Soporte',
    'settings.not_set': 'No establecido',
    'settings.name_updated': 'Nombre actualizado exitosamente',
    'settings.name_update_failed': 'No se pudo actualizar el nombre. Por favor intenta de nuevo.',
    'settings.name_empty': 'El nombre no puede estar vacío',
    
    // Chat
    'chat.new_message': 'Escribe un mensaje...',
    'chat.send': 'Enviar',
    'chat.thinking': 'Pensando...',
    'chat.regenerate': 'Regenerar',
    'chat.copy': 'Copiar',
    'chat.delete': 'Eliminar',
    
    // Explore
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