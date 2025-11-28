import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useReadProfile, useUpdateProfile } from "@/entities/user";
import { mobileStorage } from "@/shared/lib/storage";
import { getLogger } from "@/shared/services/logger";

// Define the translation function type
type TranslationFunction = (key: string) => string;

// Define the context type
interface LanguageContextType {
  t: TranslationFunction;
  currentLanguage: string;
  setLanguage: (language: string) => void;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Translation data
const translations: Record<string, Record<string, string>> = {
  en: {
    // Common
    "common.loading": "Loading",
    "common.error": "Error",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.close": "Close",
    "common.ok": "OK",
    "common.yes": "Yes",
    "common.no": "No",

    // Auth
    "auth.welcome": "Welcome",
    "auth.login_with_google": "Login with Google",
    "auth.redirecting": "Redirecting...",
    "auth.or": "or",
    "auth.sign_in_with_email": "Sign in with Email",
    "auth.create_account": "Create Account",
    "auth.test_navigation": "Test Navigation",
    "auth.retry_connection": "Retry Connection",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirm_password": "Confirm Password",
    "auth.forgot_password": "Forgot Password?",
    "auth.sign_in": "Sign In",
    "auth.sign_up": "Sign Up",
    "auth.reset_password": "Reset Password",
    "auth.send_reset_email": "Send Reset Email",
    "auth.password_reset_sent": "Password reset email sent",
    "auth.check_email_instructions":
      "Please check your email and follow the instructions",
    "auth.account_created": "Account Created Successfully!",
    "auth.confirm_email_instructions":
      "Please check your email and click the confirmation link to activate your account. You can then sign in.",
    "auth.signup_failed": "Signup Failed",
    "auth.signin_failed": "Sign In Failed",
    "auth.login_successful": "Login successful!",
    "auth.check_credentials":
      "Failed to sign in. Please check your credentials and try again.",
    "auth.unexpected_error": "An unexpected error occurred. Please try again.",
    "auth.network_error":
      "Network error. Please check your internet connection and try again.",
    "auth.google_login_failed": "Google login failed. Please try again.",
    "auth.enter_email": "Please enter your email address",
    "auth.enter_valid_email": "Please enter a valid email address",
    "auth.enter_password": "Please enter your password",
    "auth.passwords_must_match": "Passwords must match",
    "auth.password_too_short": "Password must be at least 6 characters",

    // Auth Button States
    "auth.signing_in": "Signing In...",
    "auth.signing_up": "Signing Up...",

    // Auth Links
    "auth.forgot_password_link": "Forgot Password?",
    "auth.no_account_link": "Don't have an account? Sign Up",
    "auth.have_account_link": "Already have an account? Sign In",

    // Home
    "home.hello": "Hello",
    "home.no_conversations": "No conversations yet",
    "home.new_conversation": "New Conversation",
    "home.logout": "Logout",
    "home.logging_out": "Logging out...",

    // Settings
    "settings.title": "Settings",
    "settings.account": "Account",
    "settings.preferences": "Preferences",
    "settings.data_privacy": "Data & Privacy",
    "settings.about": "About",
    "settings.name": "Name",
    "settings.email": "Email",
    "settings.language": "Language",
    "settings.theme": "Theme",
    "settings.notifications": "Notifications",
    "settings.dark_mode": "Dark Mode",
    "settings.export_data": "Export Data",
    "settings.clear_conversations": "Clear All Conversations",
    "settings.privacy_policy": "Privacy Policy",
    "settings.delete_account": "Delete Account",
    "settings.delete_account_description":
      "Schedule permanent deletion in 14 days. You can continue using the app until then.",
    "settings.delete_account_pending":
      "Deletion scheduled for {date}. You can cancel before the deadline.",
    "settings.delete_account_confirm_title": "Delete your account?",
    "settings.delete_account_confirm_message":
      "We'll schedule your account for deletion in 14 days. You'll remain signed in until the deletion is processed.",
    "settings.delete_account_confirm_action": "Schedule deletion",
    "settings.delete_account_request_success":
      "Deletion scheduled for {date}.",
    "settings.delete_account_request_success_generic":
      "Deletion request scheduled.",
    "settings.delete_account_request_error":
      "Couldn't schedule deletion. Please try again later.",
    "settings.delete_account_screen_title": "Delete Account",
    "settings.delete_account_info_headline":
      "Your account will be permanently deleted after 14 days.",
    "settings.delete_account_info_bullet_chats":
      "All chats and messages will be removed.",
    "settings.delete_account_info_bullet_irreversible":
      "This action cannot be undone after 14 days.",
    "settings.delete_account_info_bullet_cancel":
      "Logging back in within 14 days automatically cancels the request.",
    "settings.delete_account_password_label": "Enter your password to confirm",
    "settings.delete_account_password_required": "Password is required.",
    "settings.delete_account_incorrect_password":
      "Incorrect password. Please try again.",
    "settings.delete_account_oauth_notice":
      "You signed in with {provider}. Tap Continue to confirm.",
    "settings.delete_account_checkbox_label":
      "I understand my account will be deleted after 14 days unless I log back in.",
    "settings.delete_account_button": "Schedule Deletion",
    "settings.delete_account_pending_title": "Deletion Scheduled",
    "settings.delete_account_pending_message":
      "Your account is scheduled for deletion on {date}.",
    "settings.delete_account_cancel_hint":
      "Log back in anytime before this date to cancel.",
    "settings.delete_account_cancel_button": "Cancel Deletion Request",
    "settings.delete_account_cancelled": "Deletion request cancelled.",
    "settings.delete_account_cancel_error":
      "Couldn't cancel deletion. Please try again.",
    "settings.version": "Version",
    "settings.terms_of_service": "Terms of Service",
    "settings.support": "Support",
    "settings.not_set": "Not set",
    "settings.name_updated": "Name updated successfully",
    "settings.name_update_failed": "Failed to update name. Please try again.",
    "settings.name_empty": "Name cannot be empty",

    // Chat
    "chat.new_message": "Type a message...",
    "chat.send": "Send",
    "chat.thinking": "Thinking...",
    "chat.regenerate": "Regenerate",
    "chat.copy": "Copy",
    "chat.delete": "Delete",
    "chat.room_deleted": "Chat room deleted successfully",
    "chat.placeholder": "Type a message...",
    "chat.sending": "...",

    // Sidebar
    "sidebar.new_chat": "New Chat",
    "sidebar.no_messages": "No messages yet",
    "sidebar.user": "User",

    // Menu
    "menu.settings": "Settings",
    "menu.design_showcase": "Design Showcase",
    "menu.ai_model": "AI Model",
    "menu.back": "Back",
    "menu.logout": "Logout",

    // Design Showcase
    "showcase.title": "Design Showcase",
    "showcase.buttons": "Buttons",
    "showcase.primary_buttons": "Primary Buttons",
    "showcase.secondary_buttons": "Secondary Buttons",
    "showcase.outline_ghost_buttons": "Outline & Ghost Buttons",
    "showcase.status_buttons": "Status Buttons",
    "showcase.button_sizes": "Button Sizes",
    "showcase.input_fields": "Input Fields",
    "showcase.text_input": "Text Input",
    "showcase.chat_input": "Chat Input (Multi-line)",
    "showcase.switches": "Switches",
    "showcase.toggle_switch": "Toggle Switch",
    "showcase.language_selector": "Language Selector",
    "showcase.toast_notifications": "Toast Notifications",
    "showcase.alert_dialogs": "Alert Dialogs",
    "showcase.test_toast_types": "Test different toast types",
    "showcase.test_alert_types": "Test different alert types",

    // Button Labels
    "button.primary": "Primary",
    "button.secondary": "Secondary",
    "button.outline": "Outline",
    "button.ghost": "Ghost",
    "button.success": "Success",
    "button.danger": "Danger",
    "button.disabled": "Disabled",
    "button.small": "Small",
    "button.medium": "Medium",
    "button.large": "Large",
    "button.send": "Send",

    // Status Labels
    "status.success": "Success",
    "status.error": "Error",
    "status.warning": "Warning",
    "status.info": "Info",

    // Placeholders
    "placeholder.enter_text": "Enter text here...",
    "placeholder.type_message": "Type a message...",

    // Messages
    "message.success_toast": "Success toast message!",
    "message.error_toast": "Error toast message!",
    "message.warning_toast": "Warning toast message!",
    "message.info_toast": "Info toast message!",
    "message.success_alert": "This is a success alert message!",
    "message.error_alert": "This is an error alert message!",

    // Auth Placeholders
    "auth.placeholder.email": "Email",
    "auth.placeholder.password": "Password",
    "auth.placeholder.confirm_password": "Confirm Password",

    // Welcome Messages
    "welcome.how_are_you": "How are you doing today? 😊",
    "welcome.whats_on_mind": "What's on your mind? 🤔",
    "welcome.how_can_help": "How can I assist you today? ✨",
    "welcome.what_to_chat": "What would you like to chat about? 💬",
    "welcome.ready_to_help": "Ready to help you with anything! 🚀",
    "welcome.shall_we_explore": "What shall we explore today? 🌟",
    "welcome.create_amazing": "Let's create something amazing together! ✨",
    "welcome.next_big_idea": "What's your next big idea? 💡",
    "welcome.ready_adventure": "Ready for an adventure? 🎯",
    "welcome.help_discover": "What can I help you discover? 🔍",

    // Loading Messages
    "loading.thinking": "Thinking...",
    "loading.analyzing": "Analyzing your message...",
    "loading.generating": "Generating response...",
    "loading.processing": "Processing...",
    "loading.creating": "Creating thoughtful reply...",
    "loading.almost_ready": "Almost ready...",

    // Explore
    "explore.title": "Explore",
    "explore.coming_soon": "Coming soon...",

    // Toast Messages
    "toast.language_changed": "Language successfully changed to {language}",
    "toast.language_changed_es": "Idioma cambiado exitosamente a {language}",
    "toast.language_changed_ko":
      "언어가 {language}로 성공적으로 변경되었습니다",
  },
  es: {
    // Common
    "common.loading": "Cargando",
    "common.error": "Error",
    "common.success": "Éxito",
    "common.cancel": "Cancelar",
    "common.save": "Guardar",
    "common.edit": "Editar",
    "common.delete": "Eliminar",
    "common.back": "Atrás",
    "common.next": "Siguiente",
    "common.previous": "Anterior",
    "common.close": "Cerrar",
    "common.ok": "OK",
    "common.yes": "Sí",
    "common.no": "No",

    // Auth
    "auth.welcome": "Bienvenido",
    "auth.login_with_google": "Iniciar sesión con Google",
    "auth.redirecting": "Redirigiendo...",
    "auth.or": "o",
    "auth.sign_in_with_email": "Iniciar sesión con Email",
    "auth.create_account": "Crear Cuenta",
    "auth.test_navigation": "Probar Navegación",
    "auth.retry_connection": "Reintentar Conexión",
    "auth.email": "Correo electrónico",
    "auth.password": "Contraseña",
    "auth.confirm_password": "Confirmar Contraseña",
    "auth.forgot_password": "¿Olvidaste tu contraseña?",
    "auth.sign_in": "Iniciar Sesión",
    "auth.sign_up": "Registrarse",
    "auth.reset_password": "Restablecer Contraseña",
    "auth.send_reset_email": "Enviar Email de Restablecimiento",
    "auth.password_reset_sent":
      "Email de restablecimiento de contraseña enviado",
    "auth.check_email_instructions":
      "Por favor revisa tu correo y sigue las instrucciones",
    "auth.account_created": "¡Cuenta Creada Exitosamente!",
    "auth.confirm_email_instructions":
      "Por favor revisa tu correo y haz clic en el enlace de confirmación para activar tu cuenta. Luego podrás iniciar sesión.",
    "auth.signup_failed": "Registro Fallido",
    "auth.signin_failed": "Inicio de Sesión Fallido",
    "auth.login_successful": "¡Inicio de sesión exitoso!",
    "auth.check_credentials":
      "No se pudo iniciar sesión. Por favor verifica tus credenciales e intenta de nuevo.",
    "auth.unexpected_error":
      "Ocurrió un error inesperado. Por favor intenta de nuevo.",
    "auth.network_error":
      "Error de red. Por favor verifica tu conexión a internet e intenta de nuevo.",
    "auth.google_login_failed":
      "Error en inicio de sesión con Google. Por favor intenta de nuevo.",
    "auth.enter_email": "Por favor ingresa tu dirección de correo",
    "auth.enter_valid_email": "Por favor ingresa un correo válido",
    "auth.enter_password": "Por favor ingresa tu contraseña",
    "auth.passwords_must_match": "Las contraseñas deben coincidir",
    "auth.password_too_short": "La contraseña debe tener al menos 6 caracteres",

    // Auth Button States
    "auth.signing_in": "Iniciando Sesión...",
    "auth.signing_up": "Registrando...",

    // Auth Links
    "auth.forgot_password_link": "¿Olvidaste tu contraseña?",
    "auth.no_account_link": "¿No tienes una cuenta? Regístrate",
    "auth.have_account_link": "¿Ya tienes una cuenta? Inicia Sesión",

    // Home
    "home.hello": "Hola",
    "home.no_conversations": "Aún no hay conversaciones",
    "home.new_conversation": "Nueva Conversación",
    "home.logout": "Cerrar Sesión",
    "home.logging_out": "Cerrando sesión...",

    // Settings
    "settings.title": "Configuración",
    "settings.account": "Cuenta",
    "settings.preferences": "Preferencias",
    "settings.data_privacy": "Datos y Privacidad",
    "settings.about": "Acerca de",
    "settings.name": "Nombre",
    "settings.email": "Correo",
    "settings.language": "Idioma",
    "settings.theme": "Tema",
    "settings.notifications": "Notificaciones",
    "settings.dark_mode": "Modo Oscuro",
    "settings.export_data": "Exportar Datos",
    "settings.clear_conversations": "Borrar Todas las Conversaciones",
    "settings.privacy_policy": "Política de Privacidad",
    "settings.delete_account": "Eliminar Cuenta",
    "settings.delete_account_description":
      "Programa la eliminación permanente en 14 días. Puedes seguir usando la app hasta entonces.",
    "settings.delete_account_pending":
      "Eliminación programada para {date}. Puedes cancelarla antes de la fecha límite.",
    "settings.delete_account_confirm_title": "¿Eliminar tu cuenta?",
    "settings.delete_account_confirm_message":
      "Programaremos tu cuenta para su eliminación en 14 días. Permanecerás conectado hasta que el proceso finalice.",
    "settings.delete_account_confirm_action": "Programar eliminación",
    "settings.delete_account_request_success":
      "Eliminación programada para {date}.",
    "settings.delete_account_request_success_generic":
      "Solicitud de eliminación programada.",
    "settings.delete_account_request_error":
      "No se pudo programar la eliminación. Inténtalo de nuevo más tarde.",
    "settings.delete_account_screen_title": "Eliminar Cuenta",
    "settings.delete_account_info_headline":
      "Tu cuenta se eliminará permanentemente después de 14 días.",
    "settings.delete_account_info_bullet_chats":
      "Todos los chats y mensajes serán eliminados.",
    "settings.delete_account_info_bullet_irreversible":
      "Esta acción no se puede deshacer después de 14 días.",
    "settings.delete_account_info_bullet_cancel":
      "Iniciar sesión dentro de 14 días cancela automáticamente la solicitud.",
    "settings.delete_account_password_label":
      "Ingresa tu contraseña para confirmar",
    "settings.delete_account_password_required": "Se requiere contraseña.",
    "settings.delete_account_incorrect_password":
      "Contraseña incorrecta. Por favor intenta de nuevo.",
    "settings.delete_account_oauth_notice":
      "Iniciaste sesión con {provider}. Toca Continuar para confirmar.",
    "settings.delete_account_checkbox_label":
      "Entiendo que mi cuenta será eliminada después de 14 días a menos que inicie sesión.",
    "settings.delete_account_button": "Programar Eliminación",
    "settings.delete_account_pending_title": "Eliminación Programada",
    "settings.delete_account_pending_message":
      "Tu cuenta está programada para eliminarse el {date}.",
    "settings.delete_account_cancel_hint":
      "Inicia sesión en cualquier momento antes de esta fecha para cancelar.",
    "settings.delete_account_cancel_button": "Cancelar Solicitud de Eliminación",
    "settings.delete_account_cancelled": "Solicitud de eliminación cancelada.",
    "settings.delete_account_cancel_error":
      "No se pudo cancelar la eliminación. Por favor intenta de nuevo.",
    "settings.version": "Versión",
    "settings.terms_of_service": "Términos de Servicio",
    "settings.support": "Soporte",
    "settings.not_set": "No establecido",
    "settings.name_updated": "Nombre actualizado exitosamente",
    "settings.name_update_failed":
      "No se pudo actualizar el nombre. Por favor intenta de nuevo.",
    "settings.name_empty": "El nombre no puede estar vacío",

    // Chat
    "chat.new_message": "Escribe un mensaje...",
    "chat.send": "Enviar",
    "chat.thinking": "Pensando...",
    "chat.regenerate": "Regenerar",
    "chat.copy": "Copiar",
    "chat.delete": "Eliminar",
    "chat.room_deleted": "Sala de chat eliminada exitosamente",
    "chat.placeholder": "Escribe un mensaje...",
    "chat.sending": "...",

    // Sidebar
    "sidebar.new_chat": "Nueva Conversación",
    "sidebar.no_messages": "Aún no hay mensajes",
    "sidebar.user": "Usuario",

    // Menu
    "menu.settings": "Configuración",
    "menu.design_showcase": "Mostrar Diseño",
    "menu.ai_model": "Modelo AI",
    "menu.back": "Atrás",
    "menu.logout": "Cerrar Sesión",

    // Design Showcase
    "showcase.title": "Mostrar Diseño",
    "showcase.buttons": "Botones",
    "showcase.primary_buttons": "Botones Primarios",
    "showcase.secondary_buttons": "Botones Secundarios",
    "showcase.outline_ghost_buttons": "Botones de Contorno y Fantasma",
    "showcase.status_buttons": "Botones de Estado",
    "showcase.button_sizes": "Tamaños de Botones",
    "showcase.input_fields": "Campos de Entrada",
    "showcase.text_input": "Campo de Texto",
    "showcase.chat_input": "Campo de Chat (Multilínea)",
    "showcase.switches": "Interruptores",
    "showcase.toggle_switch": "Interruptor de Encendido/Apagado",
    "showcase.language_selector": "Selector de Idioma",
    "showcase.toast_notifications": "Notificaciones de Toast",
    "showcase.alert_dialogs": "Diálogos de Alerta",
    "showcase.test_toast_types":
      "Probar diferentes tipos de notificaciones de toast",
    "showcase.test_alert_types": "Probar diferentes tipos de alertas",

    // Button Labels
    "button.primary": "Primario",
    "button.secondary": "Secundario",
    "button.outline": "Contorno",
    "button.ghost": "Fantasma",
    "button.success": "Éxito",
    "button.danger": "Peligro",
    "button.disabled": "Deshabilitado",
    "button.small": "Pequeño",
    "button.medium": "Medio",
    "button.large": "Grande",
    "button.send": "Enviar",

    // Status Labels
    "status.success": "Éxito",
    "status.error": "Error",
    "status.warning": "Advertencia",
    "status.info": "Información",

    // Placeholders
    "placeholder.enter_text": "Escribe el texto aquí...",
    "placeholder.type_message": "Escribe un mensaje...",

    // Messages
    "message.success_toast": "¡Mensaje de notificación de éxito!",
    "message.error_toast": "¡Mensaje de notificación de error!",
    "message.warning_toast": "¡Mensaje de notificación de advertencia!",
    "message.info_toast": "¡Mensaje de notificación de información!",
    "message.success_alert": "¡Este es un mensaje de alerta de éxito!",
    "message.error_alert": "¡Este es un mensaje de alerta de error!",

    // Auth Placeholders
    "auth.placeholder.email": "Email",
    "auth.placeholder.password": "Password",
    "auth.placeholder.confirm_password": "Confirm Password",

    // Welcome Messages
    "welcome.how_are_you": "¿Cómo estás hoy? 😊",
    "welcome.whats_on_mind": "¿Qué tienes en la cabeza? 🤔",
    "welcome.how_can_help": "¿Cómo puedo ayudarte hoy? ✨",
    "welcome.what_to_chat": "¿Qué te gustaría charlar? 💬",
    "welcome.ready_to_help": "¡Listo para ayudarte con cualquier cosa! 🚀",
    "welcome.shall_we_explore": "¿Qué vamos a explorar hoy? 🌟",
    "welcome.create_amazing": "¡Vamos a crear algo increíble juntos! ✨",
    "welcome.next_big_idea": "¿Cuál es tu siguiente gran idea? 💡",
    "welcome.ready_adventure": "¿Listo para una aventura? 🎯",
    "welcome.help_discover": "¿Qué puedo ayudarte a descubrir? 🔍",

    // Loading Messages
    "loading.thinking": "Pensando...",
    "loading.analyzing": "Analizando tu mensaje...",
    "loading.generating": "Generando respuesta...",
    "loading.processing": "Procesando...",
    "loading.creating": "Creando respuesta reflexiva...",
    "loading.almost_ready": "Casi listo...",

    // Explore
    "explore.title": "Explorar",
    "explore.coming_soon": "Próximamente...",

    // Toast Messages
    "toast.language_changed": "Language successfully changed to {language}",
    "toast.language_changed_es": "Idioma cambiado exitosamente a {language}",
    "toast.language_changed_ko":
      "언어가 {language}로 성공적으로 변경되었습니다",
  },
  ko: {
    // Common
    "common.loading": "로딩 중",
    "common.error": "오류",
    "common.success": "성공",
    "common.cancel": "취소",
    "common.save": "저장",
    "common.edit": "편집",
    "common.delete": "삭제",
    "common.back": "뒤로",
    "common.next": "다음",
    "common.previous": "이전",
    "common.close": "닫기",
    "common.ok": "확인",
    "common.yes": "예",
    "common.no": "아니오",

    // Auth
    "auth.welcome": "환영합니다",
    "auth.login_with_google": "Google로 로그인",
    "auth.redirecting": "리다이렉팅 중...",
    "auth.or": "또는",
    "auth.sign_in_with_email": "이메일로 로그인",
    "auth.create_account": "계정 만들기",
    "auth.test_navigation": "네비게이션 테스트",
    "auth.retry_connection": "연결 재시도",
    "auth.email": "이메일",
    "auth.password": "비밀번호",
    "auth.confirm_password": "비밀번호 확인",
    "auth.forgot_password": "비밀번호를 잊으셨나요?",
    "auth.sign_in": "로그인",
    "auth.sign_up": "회원가입",
    "auth.reset_password": "비밀번호 재설정",
    "auth.send_reset_email": "재설정 이메일 보내기",
    "auth.password_reset_sent": "비밀번호 재설정 이메일이 전송되었습니다",
    "auth.check_email_instructions": "이메일을 확인하고 지시사항을 따라주세요",
    "auth.account_created": "계정이 성공적으로 생성되었습니다!",
    "auth.confirm_email_instructions":
      "이메일을 확인하고 계정을 활성화하기 위해 확인 링크를 클릭하세요. 그 후 로그인할 수 있습니다.",
    "auth.signup_failed": "회원가입 실패",
    "auth.signin_failed": "로그인 실패",
    "auth.login_successful": "로그인 성공!",
    "auth.check_credentials":
      "로그인에 실패했습니다. 자격 증명을 확인하고 다시 시도해주세요.",
    "auth.unexpected_error":
      "예상치 못한 오류가 발생했습니다. 다시 시도해주세요.",
    "auth.network_error":
      "네트워크 오류입니다. 인터넷 연결을 확인하고 다시 시도해주세요.",
    "auth.google_login_failed":
      "구글 로그인에 실패했습니다. 다시 시도해주세요.",
    "auth.enter_email": "이메일 주소를 입력해주세요",
    "auth.enter_valid_email": "유효한 이메일 주소를 입력해주세요",
    "auth.enter_password": "비밀번호를 입력해주세요",
    "auth.passwords_must_match": "비밀번호가 일치해야 합니다",
    "auth.password_too_short": "비밀번호는 최소 6자 이상이어야 합니다",

    // Auth Button States
    "auth.signing_in": "로그인 중...",
    "auth.signing_up": "회원가입 중...",

    // Auth Links
    "auth.forgot_password_link": "비밀번호를 잊으셨나요?",
    "auth.no_account_link": "계정이 없으신가요? 회원가입",
    "auth.have_account_link": "이미 계정이 있으신가요? 로그인",

    // Home
    "home.hello": "안녕하세요",
    "home.no_conversations": "아직 대화가 없습니다",
    "home.new_conversation": "새 대화",
    "home.logout": "로그아웃",
    "home.logging_out": "로그아웃 중...",

    // Settings
    "settings.title": "설정",
    "settings.account": "계정",
    "settings.preferences": "환경설정",
    "settings.data_privacy": "데이터 및 개인정보",
    "settings.about": "정보",
    "settings.name": "이름",
    "settings.email": "이메일",
    "settings.language": "언어",
    "settings.theme": "테마",
    "settings.notifications": "알림",
    "settings.dark_mode": "다크 모드",
    "settings.export_data": "데이터 내보내기",
    "settings.clear_conversations": "모든 대화 삭제",
    "settings.privacy_policy": "개인정보 처리방침",
    "settings.delete_account": "계정 삭제",
    "settings.delete_account_description":
      "14일 후 자동으로 영구 삭제됩니다. 그때까지 앱을 계속 사용할 수 있습니다.",
    "settings.delete_account_pending":
      "{date}에 삭제가 예정되어 있습니다. 마감 전 언제든 취소할 수 있습니다.",
    "settings.delete_account_confirm_title": "계정을 삭제할까요?",
    "settings.delete_account_confirm_message":
      "계정을 14일 후 삭제하도록 예약합니다. 삭제가 완료될 때까지 로그인 상태가 유지됩니다.",
    "settings.delete_account_confirm_action": "삭제 예약",
    "settings.delete_account_request_success":
      "{date}에 삭제가 예약되었습니다.",
    "settings.delete_account_request_success_generic":
      "삭제 요청이 예약되었습니다.",
    "settings.delete_account_request_error":
      "삭제 예약에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    "settings.delete_account_screen_title": "계정 삭제",
    "settings.delete_account_info_headline":
      "14일 후 계정이 영구적으로 삭제됩니다.",
    "settings.delete_account_info_bullet_chats":
      "모든 채팅과 메시지가 삭제됩니다.",
    "settings.delete_account_info_bullet_irreversible":
      "14일 이후에는 이 작업을 취소할 수 없습니다.",
    "settings.delete_account_info_bullet_cancel":
      "14일 이내에 다시 로그인하면 요청이 자동으로 취소됩니다.",
    "settings.delete_account_password_label": "확인을 위해 비밀번호를 입력하세요",
    "settings.delete_account_password_required": "비밀번호가 필요합니다.",
    "settings.delete_account_incorrect_password":
      "비밀번호가 올바르지 않습니다. 다시 시도해 주세요.",
    "settings.delete_account_oauth_notice":
      "{provider}로 로그인하셨습니다. 계속을 눌러 확인하세요.",
    "settings.delete_account_checkbox_label":
      "14일 이내에 다시 로그인하지 않으면 계정이 삭제된다는 것을 이해합니다.",
    "settings.delete_account_button": "삭제 예약",
    "settings.delete_account_pending_title": "삭제 예약됨",
    "settings.delete_account_pending_message":
      "계정이 {date}에 삭제되도록 예약되었습니다.",
    "settings.delete_account_cancel_hint":
      "이 날짜 전에 언제든지 로그인하면 취소됩니다.",
    "settings.delete_account_cancel_button": "삭제 요청 취소",
    "settings.delete_account_cancelled": "삭제 요청이 취소되었습니다.",
    "settings.delete_account_cancel_error":
      "삭제 취소에 실패했습니다. 다시 시도해 주세요.",
    "settings.version": "버전",
    "settings.terms_of_service": "서비스 약관",
    "settings.support": "지원",
    "settings.not_set": "설정되지 않음",
    "settings.name_updated": "이름이 성공적으로 업데이트되었습니다",
    "settings.name_update_failed":
      "이름 업데이트에 실패했습니다. 다시 시도해주세요.",
    "settings.name_empty": "이름은 비워둘 수 없습니다",

    // Chat
    "chat.new_message": "메시지를 입력하세요...",
    "chat.send": "보내기",
    "chat.thinking": "생각 중...",
    "chat.regenerate": "재생성",
    "chat.copy": "복사",
    "chat.delete": "삭제",
    "chat.room_deleted": "채팅방이 성공적으로 삭제되었습니다",
    "chat.placeholder": "메시지를 입력하세요...",
    "chat.sending": "...",

    // Sidebar
    "sidebar.new_chat": "새 대화",
    "sidebar.no_messages": "아직 메시지가 없습니다",
    "sidebar.user": "사용자",

    // Menu
    "menu.settings": "설정",
    "menu.design_showcase": "디자인 쇼케이스",
    "menu.ai_model": "AI 모델",
    "menu.back": "뒤로",
    "menu.logout": "로그아웃",

    // Design Showcase
    "showcase.title": "디자인 쇼케이스",
    "showcase.buttons": "버튼",
    "showcase.primary_buttons": "주요 버튼",
    "showcase.secondary_buttons": "보조 버튼",
    "showcase.outline_ghost_buttons": "아웃라인 및 환호 버튼",
    "showcase.status_buttons": "상태 버튼",
    "showcase.button_sizes": "버튼 크기",
    "showcase.input_fields": "입력 필드",
    "showcase.text_input": "텍스트 입력",
    "showcase.chat_input": "채팅 입력 (여러 줄)",
    "showcase.switches": "스위치",
    "showcase.toggle_switch": "토글 스위치",
    "showcase.language_selector": "언어 선택기",
    "showcase.toast_notifications": "토스트 알림",
    "showcase.alert_dialogs": "경고 대화 상자",
    "showcase.test_toast_types": "다른 토스트 유형 테스트",
    "showcase.test_alert_types": "다른 경고 유형 테스트",

    // Button Labels
    "button.primary": "주요",
    "button.secondary": "보조",
    "button.outline": "아웃라인",
    "button.ghost": "환호",
    "button.success": "성공",
    "button.danger": "위험",
    "button.disabled": "비활성화",
    "button.small": "작은",
    "button.medium": "중간",
    "button.large": "큰",
    "button.send": "보내기",

    // Status Labels
    "status.success": "성공",
    "status.error": "오류",
    "status.warning": "경고",
    "status.info": "정보",

    // Placeholders
    "placeholder.enter_text": "여기에 텍스트를 입력하세요...",
    "placeholder.type_message": "메시지를 입력하세요...",

    // Messages
    "message.success_toast": "성공적인 토스트 메시지!",
    "message.error_toast": "오류 토스트 메시지!",
    "message.warning_toast": "경고 토스트 메시지!",
    "message.info_toast": "정보 토스트 메시지!",
    "message.success_alert": "이것은 성공적인 경고 메시지입니다!",
    "message.error_alert": "이것은 오류 경고 메시지입니다!",

    // Auth Placeholders
    "auth.placeholder.email": "Email",
    "auth.placeholder.password": "Password",
    "auth.placeholder.confirm_password": "Confirm Password",

    // Welcome Messages
    "welcome.how_are_you": "어떻게 지내세요? 😊",
    "welcome.whats_on_mind": "무슨 생각이 드시나요? 🤔",
    "welcome.how_can_help": "어떻게 도와드릴까요? ✨",
    "welcome.what_to_chat": "어떤 주제로 대화를 나누고 싶으세요? 💬",
    "welcome.ready_to_help": "무엇이든 도와드릴 준비가 되었습니다! 🚀",
    "welcome.shall_we_explore": "오늘 무엇을 탐색해볼까요? 🌟",
    "welcome.create_amazing": "함께 멋진 것을 만들어보아요! ✨",
    "welcome.next_big_idea": "다음 큰 아이디어는 무엇인가요? 💡",
    "welcome.ready_adventure": "모험을 준비하시나요? 🎯",
    "welcome.help_discover": "무엇을 도와드릴 수 있을까요? 🔍",

    // Loading Messages
    "loading.thinking": "생각 중...",
    "loading.analyzing": "메시지를 분석하는 중...",
    "loading.generating": "답변을 생성하는 중...",
    "loading.processing": "처리 중...",
    "loading.creating": "신중한 답변을 만드는 중...",
    "loading.almost_ready": "거의 완료...",

    // Explore
    "explore.title": "탐색",
    "explore.coming_soon": "곧 출시 예정...",

    // Toast Messages
    "toast.language_changed": "Language successfully changed to {language}",
    "toast.language_changed_es": "Idioma cambiado exitosamente a {language}",
    "toast.language_changed_ko":
      "언어가 {language}로 성공적으로 변경되었습니다",
  },
};

// Language provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const logger = getLogger("LanguageContext");

  // Database hooks for profile persistence
  const { profile } = useReadProfile();
  const { updateProfile } = useUpdateProfile();

  const [currentLanguage, setCurrentLanguage] = useState("en");

  // Load language preference from local storage only
  useEffect(() => {
    const loadLanguageFromStorage = async () => {
      try {
        // Try to load from local storage first (fast and immediate)
        const savedLanguage = await mobileStorage.getItem("language");
        
        if (savedLanguage && translations[savedLanguage]) {
          setCurrentLanguage(savedLanguage);
        }
      } catch (error) {
        logger.warn("Failed to load language from storage:", error);
      }
    };

    loadLanguageFromStorage();
  }, []);

  // Memoize translation function to prevent recreation
  const t: TranslationFunction = useCallback(
    (key: string) => {
      const languageTranslations =
        translations[currentLanguage] || translations.en;
      return languageTranslations[key] || key;
    },
    [currentLanguage]
  ); // Only recreate when language actually changes

  // Memoize setLanguage function to prevent recreation
  const setLanguage = useCallback(
    async (language: string) => {
      if (translations[language]) {
        // Update local state immediately
        setCurrentLanguage(language);

        // Save to local storage first (fast and immediate)
        try {
          await mobileStorage.setItem("language", language);
        } catch (error) {
          logger.warn("Failed to save language to local storage:", error);
        }

        // Save to database in background (only when user makes changes)
        if (profile?.id) {
          try {
            logger.debug("Saving language to database:", { language });
            await updateProfile({ language });
            logger.debug("Language saved successfully");
          } catch (error) {
            logger.error(
              "Failed to save language preference to database:",
              error
            );
          }
        } else {
          logger.warn("No profile found, cannot save language to database");
        }
      }
    },
    [profile?.id, updateProfile, logger]
  ); // Include dependencies for database operations

  // Memoize LanguageContext value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      t,
      currentLanguage,
      setLanguage,
    }),
    [t, currentLanguage, setLanguage]
  ); // Only recreate when these actually change

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
    throw new Error(
      "useLanguageContext must be used within a LanguageProvider"
    );
  }
  return context;
};
