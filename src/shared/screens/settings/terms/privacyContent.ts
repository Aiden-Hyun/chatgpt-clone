export type SupportedLanguage = "en" | "es" | "ko";

export interface PrivacyContent {
  title: string;
  paragraphs: string[];
}

const formatDate = (locale: string) =>
  new Date("2024-03-14").toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

/**
 * ENTERPRISE-GRADE PRIVACY POLICY (no bullets; numbered sections; global compliance scaffolding).
 * Fill in: [Company Name], [Legal Entity], [Support Email], [Postal Address], [DPO Email], [EEA Representative], [UK Representative].
 * Notes:
 * - Model improvement is strictly opt-in.
 * - No “sale” or “share” under CPRA by default; if you later add ads, revise Section 12 and add opt-out links.
 * - Québec Law 25 disclosures included (incident response, cross-border, privacy by default).
 */
export const getPrivacyContentByLanguage = (
  language: SupportedLanguage
): PrivacyContent => {
  if (language === "es") {
    return {
      title: "POLÍTICA DE PRIVACIDAD",
      paragraphs: [
        `Última actualización: ${formatDate("es-ES")}`,

        "1. QUIÉNES SOMOS. Esta Política de Privacidad describe cómo [Legal Entity] que opera como [Company Name] (“la Compañía”, “nosotros”) trata los datos personales cuando usted utiliza nuestra aplicación y servicios de conversación con IA (el “Servicio”). A efectos del RGPD/UK RGPD, el responsable del tratamiento es [Legal Entity]. Para consultas de privacidad, incluido el Delegado de Protección de Datos, escriba a [DPO Email] o a [Support Email].",

        "2. ALCANCE Y RELACIÓN DE PARTES. Esta Política se aplica al uso individual del Servicio. Para cuentas empresariales, si su organización controla las cuentas de los usuarios finales, su organización es el responsable del tratamiento y nosotros actuamos como encargado; en ese caso, también se aplicarán los acuerdos de tratamiento de datos y las instrucciones de su organización.",

        "3. DEFINICIONES OPERATIVAS. “Datos de Cuenta” son datos de registro, identificación y contacto. “Contenido del Usuario” son entradas, archivos y materiales que usted envía al Servicio. “Salida de IA” son respuestas generadas por modelos. “Datos de Uso” son métricas, acciones dentro del producto y telemetría técnica. “Subencargados” son proveedores que procesan datos en nuestro nombre.",

        "4. CATEGORÍAS DE DATOS QUE TRATAMOS. Tratamos Datos de Cuenta como nombre, correo electrónico y credenciales; Contenido del Usuario como texto, archivos e instrucciones; Salida de IA generada para usted; Datos de Uso e información del dispositivo como identificadores, sistema operativo, zona horaria y direcciones IP truncadas; registros técnicos y de seguridad. No solicitamos categorías especiales salvo que usted decida proporcionarlas en el Contenido del Usuario.",

        "5. FUENTES DE DATOS. Recibimos datos directamente de usted cuando crea una cuenta o utiliza el Servicio; de forma automática mediante cookies o tecnologías similares; y de terceros limitados como proveedores de autenticación, pagos y análisis cuando usted los utiliza con el Servicio.",

        "6. FINES Y BASES LEGALES. Tratamos datos para prestar y mantener el Servicio y cumplir el contrato con usted; para seguridad, prevención de fraude, integridad y disponibilidad basados en intereses legítimos; para comunicación del Servicio y atención al cliente; para cumplir con obligaciones legales y regulatorias; y con su consentimiento para funciones opcionales como marketing o mejora de modelos. Cuando la ley lo exija, usted puede retirar el consentimiento en cualquier momento sin afectar la licitud del tratamiento previo.",

        "7. MEJORA DE MODELOS Y REVISIÓN HUMANA. No utilizamos su Contenido del Usuario ni su Salida de IA para entrenar nuestros modelos a menos que usted opte expresamente por participar cuando dicha opción esté disponible. La revisión humana puede utilizarse de forma limitada para resolver problemas de seguridad, fraude o abuso y para soporte cuando usted lo solicite.",

        "8. DECISIONES AUTOMATIZADAS. El Servicio genera Salida de IA automatizada, pero no adoptamos decisiones con efectos legales o similares sin intervención humana. Usted debe verificar la exactitud y el uso legal de cualquier Salida de IA antes de confiar en ella.",

        "9. CONSERVACIÓN. Conservamos los Datos de Cuenta durante la vigencia de su cuenta y conforme a los requisitos legales. Conservamos Contenido del Usuario según lo necesario para prestar el Servicio y a elección del usuario cuando se proporcionan controles de eliminación. Conservamos registros y telemetría por un periodo limitado y proporcional a fines de seguridad, auditoría y continuidad del negocio. Cuando ya no sean necesarios, eliminamos o anonimizamos los datos de forma segura.",

        "10. TRANSFERENCIAS INTERNACIONALES. Podemos transferir datos a países fuera de su jurisdicción. Cuando se requiera, utilizamos Cláusulas Contractuales Tipo de la UE y el Addendum del Reino Unido, así como salvaguardias adicionales. Para Canadá, cumplimos la Ley de Protección de Información Personal y los documentos electrónicos (PIPEDA) y la Ley 25 de Quebec para las transferencias extraterritoriales.",

        "11. DIVULGACIONES A TERCEROS. Compartimos datos con proveedores de servicios y subencargados que prestan funciones de alojamiento, procesamiento, seguridad, facturación y soporte, conforme a contratos que exigen confidencialidad y uso limitado. También compartimos datos cuando la ley lo exige, para proteger derechos, seguridad y cumplimiento, o en operaciones corporativas como reorganización o adquisición, en cuyo caso se aplicarán salvaguardas equivalentes.",

        "12. VENTA O COMPARTICIÓN SEGÚN CPRA. No vendemos datos personales ni los “compartimos” para publicidad conductual de contexto cruzado según la CPRA. Si en el futuro ofrecemos publicidad basada en intereses, proporcionaremos mecanismos de exclusión aplicables y actualizaremos esta Política.",

        "13. COOKIES Y TECNOLOGÍAS SIMILARES. Utilizamos cookies esenciales para autenticación y seguridad, así como cookies opcionales de análisis y rendimiento. Puede gestionar preferencias a través de la configuración del navegador o controles dentro del producto cuando estén disponibles, y el uso del Servicio puede verse afectado si desactiva ciertas cookies.",

        "14. SEGURIDAD. Mantenemos medidas técnicas y organizativas razonables diseñadas para proteger los datos frente a acceso, uso o divulgación no autorizados. A pesar de nuestros esfuerzos, ningún método es completamente seguro. Notificaremos incidentes conforme a las leyes aplicables, incluida la Ley 25 de Quebec y el RGPD.",

        "15. SUS DERECHOS. Dependiendo de su jurisdicción, puede solicitar acceso, corrección, eliminación, restricción u oposición; portabilidad; retirada del consentimiento; y apelación en caso de denegación. En California puede solicitar acceso, eliminación y corrección, así como conocer categorías y fines; no discriminamos por ejercer derechos. En Brasil puede ejercer derechos de confirmación, acceso, corrección, anonimización, bloqueo, portabilidad, eliminación, información sobre compartición y revocación del consentimiento. Presentaremos respuestas verificables dentro de los plazos legales. Para ejercerlos, contacte [Support Email] o utilice los controles dentro del producto cuando estén disponibles.",

        "16. MENORES. El Servicio no está dirigido a menores de 13 años ni recopilamos conscientemente datos de menores. Si cree que un menor nos proporcionó datos, contáctenos para eliminarlos.",

        "17. CONTROLES DEL USUARIO Y ELECCIONES. Puede actualizar el perfil, gestionar preferencias de comunicación, descargar o eliminar ciertos contenidos y cerrar la cuenta. Si cierra la cuenta, conservaremos la información estrictamente necesaria para obligaciones legales, resolución de disputas y cumplimiento de contratos.",

        "18. PROVEEDORES, SUBENCARGADOS Y TRANSSPARENCIA. Podemos publicar una lista de subencargados principales o proporcionar dicha información previa solicitud. Exigimos obligaciones de confidencialidad y compromisos equivalentes de seguridad y privacidad.",

        "19. AVISOS ESPECÍFICOS PARA CANADÁ. Para residentes en Canadá, cumplimos PIPEDA y la Ley 25 de Quebec. Puede presentar quejas ante la Oficina del Comisionado de Privacidad de Canadá o la autoridad de su provincia. Responderemos a solicitudes de acceso conforme a los plazos legales.",

        "20. AVISOS PARA EL EEE Y EL REINO UNIDO. Puede contactar a nuestro Representante en la UE en [EEA Representative] y a nuestro Representante en el Reino Unido en [UK Representative]. Tiene derecho a presentar reclamaciones ante su autoridad de protección de datos.",

        "21. CAMBIOS EN ESTA POLÍTICA. Podremos actualizar esta Política para reflejar cambios en prácticas o requisitos legales. Cuando la ley lo exija, proporcionaremos aviso con antelación razonable. El uso continuado tras la fecha efectiva implica aceptación.",

        "22. CONTACTO. Para cuestiones de privacidad, para ejercer derechos o para contactar a nuestro DPO, escriba a [DPO Email] o [Support Email], o envíe correspondencia a [Postal Address].",
      ],
    };
  }

  if (language === "ko") {
    return {
      title: "개인정보 처리방침",
      paragraphs: [
        `최종 업데이트: ${formatDate("ko-KR")}`,

        "1. 회사 소개. 본 개인정보 처리방침은 [Company Name]을 운영하는 [Legal Entity](이하 “회사”)가 인공지능 대화 서비스(이하 “서비스”) 이용과 관련하여 개인정보를 어떻게 처리하는지 설명합니다. RGPD/영국 RGPD 상의 개인정보처리자는 [Legal Entity]입니다. 개인정보 문의 및 개인정보보호책임자(DPO) 연락처는 [DPO Email] 또는 [Support Email]입니다.",

        "2. 적용 범위 및 역할. 본 방침은 개인 사용자에게 적용됩니다. 조직이 계정을 관리하는 기업용 환경에서는 조직이 개인정보처리자이고 회사는 수탁자로서 처리하며, 별도의 데이터 처리계약과 조직의 지시에 따릅니다.",

        "3. 용어 정의. “계정 데이터”는 등록·식별·연락처 정보입니다. “사용자 콘텐츠”는 사용자가 서비스에 입력·업로드하는 자료입니다. “AI 생성물”은 모델이 산출한 결과입니다. “사용 데이터”는 제품 내 활동, 성능 및 기술 로그입니다. “하위수탁자”는 당사를 대신해 데이터를 처리하는 공급업체입니다.",

        "4. 처리하는 개인정보. 회사는 계정 데이터로서 이름, 이메일, 자격증명 등을, 사용자 콘텐츠로서 텍스트 및 파일 등을, AI 생성물을, 사용 데이터 및 기기 정보로서 식별자, OS, 시간대, 마스킹된 IP, 보안 및 성능 로그 등을 처리합니다. 민감정보는 원칙적으로 요청하지 않으며, 사용자가 자발적으로 제공하는 경우 해당 법령에 따라 보호합니다.",

        "5. 수집 경로. 회사는 귀하가 계정을 생성하거나 서비스를 이용할 때 직접 정보를 수집하며, 쿠키 등 유사 기술을 통해 자동으로 수집하고, 인증·결제·분석 등 제3자와의 연동을 통해 필요한 범위 내에서 수집합니다.",

        "6. 이용 목적 및 법적 근거. 회사는 계약의 이행과 서비스 제공·유지, 보안·사기 방지·무단사용 방지를 위한 정당한 이익, 서비스 관련 소통과 지원, 법적 의무 준수, 그리고 귀하의 동의가 있는 선택 기능(예: 마케팅, 모델 개선)을 위해 개인정보를 처리합니다. 동의는 언제든 철회할 수 있으며 철회 이전의 처리의 적법성에는 영향을 미치지 않습니다.",

        "7. 모델 개선 및 사람 검토. 회사는 귀하가 명시적으로 옵트인하지 않는 한 사용자 콘텐츠나 AI 생성물을 모델 학습에 사용하지 않습니다. 보안·사기·오용 대응 또는 귀하의 요청에 따른 지원을 위해 제한적으로 사람이 검토할 수 있습니다.",

        "8. 자동화 의사결정. 서비스는 자동으로 AI 생성물을 제공하지만, 법적 또는 유사하게 중대한 효과를 갖는 결정을 사람의 개입 없이 내리지 않습니다. 귀하는 생성물의 정확성과 적법성을 스스로 확인해야 합니다.",

        "9. 보유 기간. 회사는 계정 유지기간 동안 계정 데이터를 보유하며 법적 의무 이행을 위해 필요한 범위에서 추가 보관할 수 있습니다. 사용자 콘텐츠는 서비스 제공에 필요한 기간 또는 이용자가 삭제할 때까지 보관합니다. 보안·감사·연속성 확보를 위한 로그는 합리적인 기간 보관 후 안전하게 삭제 또는 비식별화합니다.",

        "10. 국외 이전. 회사는 데이터가 귀하의 거주 국가 밖으로 이전될 수 있으며, 필요한 경우 EU 표준계약조항과 영국 애드덤을 포함한 적정한 보호조치를 적용합니다. 캐나다 및 퀘벡 거주자의 경우 PIPEDA와 퀘벡 법률 25에 따른 이전 요구사항을 준수합니다.",

        "11. 제3자 제공. 회사는 호스팅, 처리, 보안, 결제, 지원을 수행하는 서비스 제공업체와 계약에 따라 필요한 범위에서 데이터를 공유합니다. 또한 법률상 요구, 권리·안전 보호, 기업거래(합병·양도 등) 시점에 필요한 경우 공유할 수 있으며, 이 경우 동등한 보호조치를 적용합니다.",

        "12. CPRA상 판매/공유 여부. 회사는 CPRA에서 정의하는 개인 정보의 “판매” 또는 맥락 교차 광고 목적의 “공유”를 수행하지 않습니다. 향후 광고 기능을 도입할 경우 관련 옵트아웃 수단을 제공하고 본 방침을 업데이트합니다.",

        "13. 쿠키. 회사는 인증과 보안을 위한 필수 쿠키와 분석·성능 개선을 위한 선택 쿠키를 사용할 수 있습니다. 브라우저 또는 제품 내 설정을 통해 관리할 수 있으며, 일부 기능은 비활성화 시 제한될 수 있습니다.",

        "14. 보안. 회사는 합리적인 기술적·관리적 보호조치를 유지합니다. 완전한 보안을 보장할 수는 없으며, 관련 법에 따라 사고 발생 시 통지 의무를 이행합니다.",

        "15. 이용자의 권리. 관할지에 따라 접근, 정정, 삭제, 처리 제한 또는 반대, 이동권, 동의 철회, 이의제기 및 거절 결정에 대한 이의신청 권리를 행사할 수 있습니다. 캘리포니아 거주자는 접근·삭제·정정 및 범주 통지 권리를, 브라질 거주자는 확인·접근·정정·익명화·차단·이동·삭제·공유 정보·동의 철회 권리를 보유합니다. 권리 행사는 [Support Email] 또는 제품 내 제공되는 도구를 통해 요청할 수 있습니다.",

        "16. 아동. 서비스는 만 13세 미만을 대상으로 하지 않으며, 아동의 개인정보를 고의로 수집하지 않습니다. 관련 사실을 알게 되면 지체 없이 삭제합니다.",

        "17. 사용자 선택. 귀하는 프로필 업데이트, 알림 설정, 데이터 다운로드 또는 삭제, 계정 해지 등 다양한 선택권을 행사할 수 있습니다. 계정 해지 후에도 법적 의무 이행 및 분쟁 해결을 위해 필요한 최소한의 정보는 보관될 수 있습니다.",

        "18. 공급업체 및 하위수탁자. 회사는 주요 하위수탁자 목록을 공개하거나 요청 시 제공할 수 있습니다. 모든 하위수탁자는 비밀유지 및 보안 의무를 부담합니다.",

        "19. 캐나다 관련 고지. 캐나다 거주자는 PIPEDA 및 퀘벡 법률 25에 따른 권리를 행사할 수 있으며, 개인정보보호위원회 등 감독기관에 불만을 제기할 수 있습니다.",

        "20. EEA 및 영국 고지. EU 내 대표자는 [EEA Representative], 영국 내 대표자는 [UK Representative]입니다. 귀하는 해당 지역 감독기관에 불만을 제기할 권리가 있습니다.",

        "21. 본 방침의 변경. 회사는 관행 또는 법령 변경을 반영하기 위해 본 방침을 수정할 수 있습니다. 법이 요구하는 경우 합리적 사전 고지를 제공합니다. 효력 발생일 이후 서비스 이용은 변경에 대한 동의를 의미합니다.",

        "22. 연락처. 권리 행사, 문의 또는 DPO 연락을 위해 [DPO Email] 또는 [Support Email]로 연락하거나 [Postal Address]로 우편을 발송해 주십시오.",
      ],
    };
  }

  return {
    title: "PRIVACY POLICY",
    paragraphs: [
      `Last Updated: ${formatDate("en-US")}`,

      "1. WHO WE ARE. This Privacy Policy explains how [Legal Entity] operating as [Company Name] (“Company,” “we,” “us”) handles personal data when you use our AI conversational application and related services (the “Service”). For GDPR and UK GDPR, the data controller is [Legal Entity]. You may contact our Data Protection Officer at [DPO Email] or our privacy team at [Support Email].",

      "2. SCOPE AND ROLES. This Policy applies to individual use of the Service. For enterprise or workspace accounts where your organization administers end-user accounts, your organization is the controller and we act as processor; in that case, our data processing agreement and your organization’s instructions also apply.",

      "3. OPERATING DEFINITIONS. “Account Data” means registration, identity, and contact data. “User Content” means inputs, files, and materials you submit. “AI Output” means model-generated responses for you. “Usage Data” means product interactions, telemetry, and device information. “Subprocessors” are vendors that process data on our behalf under contract.",

      "4. CATEGORIES OF PERSONAL DATA. We process Account Data such as name, email, and credentials; User Content such as prompts, files, and context you choose to provide; AI Output generated for you; Usage Data and device information such as identifiers, operating system, time zone, and truncated IP addresses; and security, performance, and audit logs. We do not intentionally request special categories unless you choose to provide them in User Content.",

      "5. SOURCES OF DATA. We collect data directly from you when you create an account or use the Service; automatically via cookies and similar technologies; and from limited third parties such as authentication, billing, and analytics providers when you enable them with the Service.",

      "6. PURPOSES AND LEGAL BASES. We process data to provide, maintain, and improve the Service and to perform our contract with you; to protect security, prevent fraud and abuse, and ensure integrity based on our legitimate interests; to communicate about the Service and provide support; to comply with legal and regulatory obligations; and with your consent for optional features such as marketing or model improvement. Where required, you may withdraw consent at any time without affecting prior lawful processing.",

      "7. MODEL IMPROVEMENT AND HUMAN REVIEW. We do not use your User Content or AI Output to train our models unless you explicitly opt in when that choice is offered. Limited human review may occur to address security, fraud, or abuse, or to provide support where you request it.",

      "8. AUTOMATED DECISION-MAKING. The Service generates AI Output automatically, but we do not make decisions with legal or similarly significant effects without human involvement. You are responsible for validating the accuracy and legality of any use of AI Output.",

      "9. RETENTION. We retain Account Data for the life of your account and as required by law. We retain User Content as needed to provide the Service and at your direction where deletion controls are available. We retain logs and telemetry for a limited, proportionate duration for security, audit, and business continuity. When data are no longer needed, we delete or anonymize them securely.",

      "10. INTERNATIONAL TRANSFERS. We may transfer data outside your jurisdiction. Where required, we use EU Standard Contractual Clauses and the UK Addendum, along with additional safeguards. For Canada, we comply with PIPEDA and Québec Law 25 for cross-border disclosures.",

      "11. DISCLOSURES TO THIRD PARTIES. We disclose data to service providers and subprocessors that perform hosting, processing, security, billing, support, and related functions under contracts requiring confidentiality and limited use. We also disclose data where required by law, to protect rights and safety, or in connection with corporate transactions such as reorganization or acquisition, subject to equivalent protections.",

      "12. CPRA SALE/SHARE STATUS. We do not sell personal information or “share” it for cross-context behavioral advertising under the CPRA. If we later introduce interest-based advertising, we will provide applicable opt-out mechanisms and update this Policy.",

      "13. COOKIES AND SIMILAR TECHNOLOGIES. We use essential cookies for authentication and security and optional analytics and performance technologies. You may control preferences through your browser and, where available, in-product settings; disabling certain cookies may affect Service functionality.",

      "14. SECURITY. We maintain reasonable technical and organizational measures designed to protect data against unauthorized access, use, or disclosure. No method is perfectly secure. We will provide breach notifications in accordance with applicable laws, including Québec Law 25 and GDPR.",

      "15. YOUR RIGHTS. Depending on your location, you may request access, rectification, deletion, restriction or objection, portability, withdrawal of consent, and the right to appeal adverse decisions. In California, you may request access, deletion, and correction and receive information about categories and purposes; we do not discriminate for exercising rights. In Brazil, you may request confirmation, access, correction, anonymization, blocking, portability, deletion, information on sharing, and consent revocation. We will respond within applicable timelines upon a verifiable request via [Support Email] or in-product tools where provided.",

      "16. CHILDREN. The Service is not directed to children under 13 and we do not knowingly collect their data. If you believe a child has provided personal data, please contact us so we can delete it.",

      "17. USER CONTROLS AND CHOICES. You may update your profile, manage communications, download or delete certain content, and close your account. Upon closure, we will retain only what is necessary to meet legal obligations, resolve disputes, and enforce agreements.",

      "18. VENDORS, SUBPROCESSORS, AND TRANSPARENCY. We may publish a list of principal subprocessors or provide it on request. All subprocessors are bound by confidentiality and security commitments equivalent to ours.",

      "19. CANADA-SPECIFIC NOTICES. For Canadian residents, we comply with PIPEDA and Québec Law 25. You may bring complaints to the Office of the Privacy Commissioner of Canada or your provincial authority. We will respond to access requests within statutory timelines.",

      "20. EEA AND UK NOTICES. You may contact our EU Representative at [EEA Representative] and our UK Representative at [UK Representative]. You have the right to lodge a complaint with your supervisory authority.",

      "21. CHANGES TO THIS POLICY. We may update this Policy to reflect changes in practices or legal requirements. Where required by law, we will provide reasonable advance notice. Continued use after the effective date constitutes acceptance.",

      "22. CONTACT. To exercise rights or contact our DPO, email [DPO Email] or [Support Email], or write to [Postal Address].",
    ],
  };
};

export const resolvePrivacyLanguageCode = (
  currentLanguage: string
): SupportedLanguage => {
  const normalized = (currentLanguage || "en").toLowerCase();
  if (normalized.startsWith("ko")) return "ko";
  if (normalized.startsWith("es") || normalized.includes("español"))
    return "es";
  return "en";
};
