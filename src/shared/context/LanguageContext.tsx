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
    'chat.room_deleted': 'Chat room deleted successfully',
    
    // Explore
    'explore.title': 'Explore',
    'explore.coming_soon': 'Coming soon...',
    
    // Toast Messages
    'toast.language_changed': 'Language successfully changed to {language}',
    'toast.language_changed_es': 'Idioma cambiado exitosamente a {language}',
    'toast.language_changed_ko': '언어가 {language}로 성공적으로 변경되었습니다',
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
    'chat.room_deleted': 'Sala de chat eliminada exitosamente',
    
    // Explore
    'explore.title': 'Explorar',
    'explore.coming_soon': 'Próximamente...',
    
    // Toast Messages
    'toast.language_changed': 'Language successfully changed to {language}',
    'toast.language_changed_es': 'Idioma cambiado exitosamente a {language}',
    'toast.language_changed_ko': '언어가 {language}로 성공적으로 변경되었습니다',
  },
  ko: {
    // Common
    'common.loading': '로딩 중',
    'common.error': '오류',
    'common.success': '성공',
    'common.cancel': '취소',
    'common.save': '저장',
    'common.edit': '편집',
    'common.delete': '삭제',
    'common.back': '뒤로',
    'common.next': '다음',
    'common.previous': '이전',
    'common.close': '닫기',
    'common.ok': '확인',
    'common.yes': '예',
    'common.no': '아니오',
    
    // Auth
    'auth.welcome': '환영합니다',
    'auth.login_with_google': 'Google로 로그인',
    'auth.redirecting': '리다이렉팅 중...',
    'auth.or': '또는',
    'auth.sign_in_with_email': '이메일로 로그인',
    'auth.create_account': '계정 만들기',
    'auth.test_navigation': '네비게이션 테스트',
    'auth.retry_connection': '연결 재시도',
    'auth.email': '이메일',
    'auth.password': '비밀번호',
    'auth.confirm_password': '비밀번호 확인',
    'auth.forgot_password': '비밀번호를 잊으셨나요?',
    'auth.sign_in': '로그인',
    'auth.sign_up': '회원가입',
    'auth.reset_password': '비밀번호 재설정',
    'auth.send_reset_email': '재설정 이메일 보내기',
    'auth.password_reset_sent': '비밀번호 재설정 이메일이 전송되었습니다',
    'auth.check_email_instructions': '이메일을 확인하고 지시사항을 따라주세요',
    'auth.account_created': '계정이 성공적으로 생성되었습니다!',
    'auth.confirm_email_instructions': '이메일을 확인하고 계정을 활성화하기 위해 확인 링크를 클릭하세요. 그 후 로그인할 수 있습니다.',
    'auth.signup_failed': '회원가입 실패',
    'auth.signin_failed': '로그인 실패',
    'auth.check_credentials': '로그인에 실패했습니다. 자격 증명을 확인하고 다시 시도해주세요.',
    'auth.unexpected_error': '예상치 못한 오류가 발생했습니다. 다시 시도해주세요.',
    'auth.enter_email': '이메일 주소를 입력해주세요',
    'auth.enter_valid_email': '유효한 이메일 주소를 입력해주세요',
    'auth.enter_password': '비밀번호를 입력해주세요',
    'auth.passwords_must_match': '비밀번호가 일치해야 합니다',
    'auth.password_too_short': '비밀번호는 최소 6자 이상이어야 합니다',
    
    // Home
    'home.hello': '안녕하세요',
    'home.no_conversations': '아직 대화가 없습니다',
    'home.new_conversation': '새 대화',
    'home.logout': '로그아웃',
    'home.logging_out': '로그아웃 중...',
    
    // Settings
    'settings.title': '설정',
    'settings.account': '계정',
    'settings.preferences': '환경설정',
    'settings.data_privacy': '데이터 및 개인정보',
    'settings.about': '정보',
    'settings.name': '이름',
    'settings.email': '이메일',
    'settings.language': '언어',
    'settings.notifications': '알림',
    'settings.dark_mode': '다크 모드',
    'settings.export_data': '데이터 내보내기',
    'settings.clear_conversations': '모든 대화 삭제',
    'settings.privacy_policy': '개인정보 처리방침',
    'settings.version': '버전',
    'settings.terms_of_service': '서비스 약관',
    'settings.support': '지원',
    'settings.not_set': '설정되지 않음',
    'settings.name_updated': '이름이 성공적으로 업데이트되었습니다',
    'settings.name_update_failed': '이름 업데이트에 실패했습니다. 다시 시도해주세요.',
    'settings.name_empty': '이름은 비워둘 수 없습니다',
    
    // Chat
    'chat.new_message': '메시지를 입력하세요...',
    'chat.send': '보내기',
    'chat.thinking': '생각 중...',
    'chat.regenerate': '재생성',
    'chat.copy': '복사',
    'chat.delete': '삭제',
    'chat.room_deleted': '채팅방이 성공적으로 삭제되었습니다',
    
    // Explore
    'explore.title': '탐색',
    'explore.coming_soon': '곧 출시 예정...',
    
    // Toast Messages
    'toast.language_changed': 'Language successfully changed to {language}',
    'toast.language_changed_es': 'Idioma cambiado exitosamente a {language}',
    'toast.language_changed_ko': '언어가 {language}로 성공적으로 변경되었습니다',
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