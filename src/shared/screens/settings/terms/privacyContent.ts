export type SupportedLanguage = "en" | "es" | "ko";

export interface PrivacyContent {
  title: string;
  paragraphs: string[];
}

const formatDate = (locale: string) =>
  new Date().toLocaleDateString(locale, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

export const getPrivacyContentByLanguage = (
  language: SupportedLanguage
): PrivacyContent => {
  if (language === "es") {
    return {
      title: "POLÍTICA DE PRIVACIDAD",
      paragraphs: [
        `Última actualización: ${formatDate("es-ES")}`,
        "Introducción",
        "Valoramos su privacidad y estamos comprometidos a proteger su información personal.",
        "Información que recopilamos",
        "Podemos recopilar información de uso y metadatos para mejorar el servicio. No vendemos su información personal.",
        "Uso de la información",
        "Usamos los datos para proporcionar y mejorar las funciones del servicio, y para prevenir abuso y fraude.",
        "Conservación de datos",
        "Retenemos datos solo durante el tiempo necesario para los fines establecidos en esta política.",
        "Sus derechos",
        "Puede solicitar acceso, corrección o eliminación de sus datos en cualquier momento.",
        "Contacto",
        "Para preguntas sobre privacidad, contáctenos a través de la sección de soporte en la configuración.",
      ],
    };
  }

  if (language === "ko") {
    return {
      title: "개인정보 처리방침",
      paragraphs: [
        `최종 업데이트: ${formatDate("ko-KR")}`,
        "소개",
        "우리는 사용자의 개인정보를 중요하게 여기며, 이를 보호하기 위해 최선을 다합니다.",
        "수집하는 정보",
        "서비스 개선을 위해 사용 정보와 메타데이터를 수집할 수 있습니다. 개인정보를 판매하지 않습니다.",
        "정보의 사용",
        "데이터는 서비스 제공 및 기능 개선, 오남용 및 사기 방지를 위해 사용됩니다.",
        "데이터 보관",
        "이 정책에 명시된 목적을 달성하는 데 필요한 기간 동안만 데이터를 보관합니다.",
        "사용자의 권리",
        "언제든지 데이터 열람, 수정, 삭제를 요청할 수 있습니다.",
        "문의",
        "개인정보 관련 문의는 설정의 지원 섹션을 통해 연락해 주세요.",
      ],
    };
  }

  return {
    title: "PRIVACY POLICY",
    paragraphs: [
      `Last updated: ${formatDate("en-US")}`,
      "Introduction",
      "We value your privacy and are committed to protecting your personal information.",
      "Information We Collect",
      "We may collect usage information and metadata to improve the service. We do not sell your personal information.",
      "How We Use Information",
      "We use data to provide and improve service features, and to prevent abuse and fraud.",
      "Data Retention",
      "We retain data only for as long as necessary for the purposes outlined in this policy.",
      "Your Rights",
      "You may request access, correction, or deletion of your data at any time.",
      "Contact",
      "For privacy questions, contact us through the support section in settings.",
    ],
  };
};

export const resolvePrivacyLanguageCode = (currentLanguage: string): SupportedLanguage => {
  const normalized = (currentLanguage || "en").toLowerCase();
  if (normalized.startsWith("ko")) return "ko";
  if (normalized.startsWith("es") || normalized.includes("español")) return "es";
  return "en";
};


