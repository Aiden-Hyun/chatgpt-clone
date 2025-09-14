export type SupportedLanguage = "en" | "es" | "ko";

export interface TermsContent {
  title: string;
  paragraphs: string[];
}

const formatDate = (locale: string) =>
  new Date().toLocaleDateString(locale, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

export const getTermsContentByLanguage = (
  language: SupportedLanguage
): TermsContent => {
  if (language === "es") {
    return {
      title: "TÉRMINOS Y CONDICIONES DE SERVICIO",
      paragraphs: [
        `Última actualización: ${formatDate("es-ES")}`,
        "1. ACEPTACIÓN DE LOS TÉRMINOS",
        "Al acceder y utilizar esta aplicación de chat con IA, usted acepta estar sujeto a estos Términos y Condiciones de Servicio y todas las leyes y regulaciones aplicables.",
        "2. DESCRIPCIÓN DEL SERVICIO",
        "Esta aplicación proporciona servicios de chat con inteligencia artificial para ayudar a los usuarios con diversas consultas y conversaciones.",
        "3. USO ACEPTABLE",
        "Usted se compromete a:",
        "• Utilizar el servicio de manera legal y ética",
        "• No transmitir contenido ofensivo, ilegal o dañino",
        "• Respetar los derechos de propiedad intelectual",
        "• No intentar comprometer la seguridad del sistema",
        "4. PRIVACIDAD Y DATOS",
        "• Sus conversaciones pueden ser procesadas para mejorar el servicio",
        "• No compartimos información personal con terceros sin consentimiento",
        "• Puede solicitar la eliminación de sus datos en cualquier momento",
        "5. LIMITACIÓN DE RESPONSABILIDAD",
        'El servicio se proporciona "tal como está" sin garantías de ningún tipo. No somos responsables de daños directos, indirectos o consecuentes.',
        "6. MODIFICACIONES",
        "Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación.",
        "7. TERMINACIÓN",
        "Podemos terminar o suspender su acceso al servicio en cualquier momento por violación de estos términos.",
        "8. LEY APLICABLE",
        "Estos términos se rigen por las leyes aplicables en su jurisdicción.",
        "9. CONTACTO",
        "Si tiene preguntas sobre estos términos, puede contactarnos a través de la sección de soporte en la configuración.",
      ],
    };
  }

  if (language === "ko") {
    return {
      title: "서비스 이용약관",
      paragraphs: [
        `최종 업데이트: ${formatDate("ko-KR")}`,
        "1. 약관의 동의",
        "본 AI 채팅 애플리케이션에 접근하고 사용함으로써, 귀하는 본 서비스 이용약관 및 모든 관련 법률과 규정을 준수하는 데 동의합니다.",
        "2. 서비스 설명",
        "본 애플리케이션은 사용자의 다양한 질문과 대화를 돕기 위한 인공지능 채팅 서비스를 제공합니다.",
        "3. 허용 가능한 사용",
        "귀하는 다음을 준수해야 합니다:",
        "• 합법적이고 윤리적인 방식으로 서비스 사용",
        "• 공격적이거나 불법적이거나 유해한 콘텐츠 전송 금지",
        "• 지적 재산권 존중",
        "• 시스템 보안을 침해하려는 시도 금지",
        "4. 개인정보 및 데이터",
        "• 귀하의 대화는 서비스 개선을 위해 처리될 수 있습니다",
        "• 동의 없이 개인정보를 제3자와 공유하지 않습니다",
        "• 언제든지 데이터 삭제를 요청할 수 있습니다",
        "5. 책임의 제한",
        '서비스는 "있는 그대로" 제공되며 어떠한 보증도 하지 않습니다. 직접적, 간접적 또는 결과적 손해에 대해 책임지지 않습니다.',
        "6. 수정",
        "언제든지 본 약관을 수정할 권리를 보유합니다. 변경사항은 게시 즉시 효력을 발생합니다.",
        "7. 종료",
        "본 약관 위반 시 언제든지 서비스 접근을 종료하거나 중단할 수 있습니다.",
        "8. 준거법",
        "본 약관은 귀하의 관할권에서 적용되는 법률에 따라 규율됩니다.",
        "9. 연락처",
        "본 약관에 대한 질문이 있으시면 설정의 지원 섹션을 통해 연락주시기 바랍니다.",
      ],
    };
  }

  return {
    title: "TERMS AND CONDITIONS OF SERVICE",
    paragraphs: [
      `Last updated: ${formatDate("en-US")}`,
      "1. ACCEPTANCE OF TERMS",
      "By accessing and using this AI chat application, you agree to be bound by these Terms and Conditions of Service and all applicable laws and regulations.",
      "2. DESCRIPTION OF SERVICE",
      "This application provides artificial intelligence chat services to assist users with various inquiries and conversations.",
      "3. ACCEPTABLE USE",
      "You agree to:",
      "• Use the service in a lawful and ethical manner",
      "• Not transmit any offensive, illegal, or harmful content",
      "• Respect intellectual property rights",
      "• Not attempt to compromise system security",
      "4. PRIVACY AND DATA",
      "• Your conversations may be processed to improve the service",
      "• We do not share personal information with third parties without consent",
      "• You may request deletion of your data at any time",
      "5. LIMITATION OF LIABILITY",
      'The service is provided "as is" without warranties of any kind. We are not liable for any direct, indirect, or consequential damages.',
      "6. MODIFICATIONS",
      "We reserve the right to modify these terms at any time. Changes will take effect immediately upon posting.",
      "7. TERMINATION",
      "We may terminate or suspend your access to the service at any time for violation of these terms.",
      "8. GOVERNING LAW",
      "These terms are governed by the applicable laws in your jurisdiction.",
      "9. CONTACT",
      "If you have questions about these terms, you can contact us through the support section in settings.",
    ],
  };
};

export const resolveLanguageCode = (
  currentLanguage: string
): SupportedLanguage => {
  const normalized = (currentLanguage || "en").toLowerCase();
  if (normalized.startsWith("ko")) return "ko";
  if (normalized.startsWith("es") || normalized.includes("español"))
    return "es";
  return "en";
};
