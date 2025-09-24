/**
 * Korean translations
 */
export const koTranslations: Record<string, string> = {
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
  'auth.login_successful': '로그인 성공!',
  'auth.check_credentials': '로그인에 실패했습니다. 자격 증명을 확인하고 다시 시도해주세요.',
  'auth.unexpected_error': '예상치 못한 오류가 발생했습니다. 다시 시도해주세요.',
  'auth.network_error': '네트워크 오류입니다. 인터넷 연결을 확인하고 다시 시도해주세요.',
  'auth.google_login_failed': '구글 로그인에 실패했습니다. 다시 시도해주세요.',
  'auth.enter_email': '이메일 주소를 입력해주세요',
  'auth.enter_valid_email': '유효한 이메일 주소를 입력해주세요',
  'auth.enter_password': '비밀번호를 입력해주세요',
  'auth.passwords_must_match': '비밀번호가 일치해야 합니다',
  'auth.password_too_short': '비밀번호는 최소 6자 이상이어야 합니다',
  
  // Auth Button States
  'auth.signing_in': '로그인 중...',
  'auth.signing_up': '회원가입 중...',
  
  // Auth Links
  'auth.forgot_password_link': '비밀번호를 잊으셨나요?',
  'auth.no_account_link': '계정이 없으신가요? 회원가입',
  'auth.have_account_link': '이미 계정이 있으신가요? 로그인',
  
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
  'settings.theme': '테마',
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
  'chat.placeholder': '메시지를 입력하세요...',
  'chat.sending': '...',
  
  // Sidebar
  'sidebar.new_chat': '새 대화',
  'sidebar.no_messages': '아직 메시지가 없습니다',
  'sidebar.user': '사용자',
  
  // Menu
  'menu.settings': '설정',
  'menu.design_showcase': '디자인 쇼케이스',
  'menu.ai_model': 'AI 모델',
  'menu.back': '뒤로',
  'menu.logout': '로그아웃',
  
  // Design Showcase
  'showcase.title': '디자인 쇼케이스',
  'showcase.buttons': '버튼',
  'showcase.primary_buttons': '주요 버튼',
  'showcase.secondary_buttons': '보조 버튼',
  'showcase.outline_ghost_buttons': '아웃라인 및 환호 버튼',
  'showcase.status_buttons': '상태 버튼',
  'showcase.button_sizes': '버튼 크기',
  'showcase.input_fields': '입력 필드',
  'showcase.text_input': '텍스트 입력',
  'showcase.chat_input': '채팅 입력 (여러 줄)',
  'showcase.switches': '스위치',
  'showcase.toggle_switch': '토글 스위치',
  'showcase.language_selector': '언어 선택기',
  'showcase.toast_notifications': '토스트 알림',
  'showcase.alert_dialogs': '경고 대화 상자',
  'showcase.test_toast_types': '다른 토스트 유형 테스트',
  'showcase.test_alert_types': '다른 경고 유형 테스트',
  
  // Button Labels
  'button.primary': '주요',
  'button.secondary': '보조',
  'button.outline': '아웃라인',
  'button.ghost': '환호',
  'button.success': '성공',
  'button.danger': '위험',
  'button.disabled': '비활성화',
  'button.small': '작은',
  'button.medium': '중간',
  'button.large': '큰',
  'button.send': '보내기',
  
  // Status Labels
  'status.success': '성공',
  'status.error': '오류',
  'status.warning': '경고',
  'status.info': '정보',
  
  // Placeholders
  'placeholder.enter_text': '여기에 텍스트를 입력하세요...',
  'placeholder.type_message': '메시지를 입력하세요...',
  
  // Messages
  'message.success_toast': '성공적인 토스트 메시지!',
  'message.error_toast': '오류 토스트 메시지!',
  'message.warning_toast': '경고 토스트 메시지!',
  'message.info_toast': '정보 토스트 메시지!',
  'message.success_alert': '이것은 성공적인 경고 메시지입니다!',
  'message.error_alert': '이것은 오류 경고 메시지입니다!',
  
  // Auth Placeholders
  'auth.placeholder.email': 'Email',
  'auth.placeholder.password': 'Password',
  'auth.placeholder.confirm_password': 'Confirm Password',
  
  // Welcome Messages
  'welcome.how_are_you': '어떻게 지내세요? 😊',
  'welcome.whats_on_mind': '무슨 생각이 드시나요? 🤔',
  'welcome.how_can_help': '어떻게 도와드릴까요? ✨',
  'welcome.what_to_chat': '어떤 주제로 대화를 나누고 싶으세요? 💬',
  'welcome.ready_to_help': '무엇이든 도와드릴 준비가 되었습니다! 🚀',
  'welcome.shall_we_explore': '오늘 무엇을 탐색해볼까요? 🌟',
  'welcome.create_amazing': '함께 멋진 것을 만들어보아요! ✨',
  'welcome.next_big_idea': '다음 큰 아이디어는 무엇인가요? 💡',
  'welcome.ready_adventure': '모험을 준비하시나요? 🎯',
  'welcome.help_discover': '무엇을 도와드릴 수 있을까요? 🔍',
  
  // Loading Messages
  'loading.thinking': '생각 중...',
  'loading.analyzing': '메시지를 분석하는 중...',
  'loading.generating': '답변을 생성하는 중...',
  'loading.processing': '처리 중...',
  'loading.creating': '신중한 답변을 만드는 중...',
  'loading.almost_ready': '거의 완료...',
  
  // Explore
  'explore.title': '탐색',
  'explore.coming_soon': '곧 출시 예정...',
  
  // Toast Messages
  'toast.language_changed': 'Language successfully changed to {language}',
  'toast.language_changed_es': 'Idioma cambiado exitosamente a {language}',
  'toast.language_changed_ko': '언어가 {language}로 성공적으로 변경되었습니다',
};
