export type SupportedLanguage = "en" | "es" | "ko";

export interface TermsContent {
  title: string;
  paragraphs: string[];
}

/** Set the canonical effective date here. */
const formatDate = (locale: string) =>
  new Date("2024-03-14").toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

/**
 * ENTERPRISE-GRADE TERMS (no bullets; numbered sections; strong legal drafting).
 * Fill in: [Company Name], [Legal Entity], [Support Email], [Postal Address].
 * Default governing law: Province of Québec, Canada; venue: Montréal courts.
 * US-resident disputes: binding arbitration (AAA) with 30-day opt-out.
 */
export const getTermsContentByLanguage = (
  language: SupportedLanguage
): TermsContent => {
  if (language === "es") {
    return {
      title: "TÉRMINOS Y CONDICIONES DEL SERVICIO",
      paragraphs: [
        `Última actualización: ${formatDate("es-ES")}`,

        "1. ACEPTACIÓN DE LOS TÉRMINOS. Al acceder o utilizar la aplicación y los servicios de [Company Name] (el “Servicio”), usted celebra un acuerdo legalmente vinculante con [Legal Entity] (“la Compañía”) y acepta estos Términos y cualquier política incorporada por referencia. Si no está de acuerdo, no utilice el Servicio.",

        "2. DEFINICIONES. “Contenido del Usuario” significa entradas, archivos, datos y materiales que usted envía al Servicio. “Contenido Generado por IA” significa las salidas generadas por los modelos. “Cuenta” significa el perfil asociado a su uso. “Planes de Pago” significa suscripciones, paquetes de créditos u otros cargos.",

        "3. EL SERVICIO. El Servicio ofrece funciones conversacionales impulsadas por IA, que pueden incluir niveles gratuitos y de pago, betas, y funcionalidades en evolución. La Compañía puede modificar o descontinuar funciones en cualquier momento.",

        "4. ELEGIBILIDAD. Debe tener al menos 13 años (o la edad mínima equivalente en su jurisdicción si es mayor) y contar con capacidad legal para aceptar estos Términos. Si accede en nombre de una entidad, declara tener autoridad para vincularla.",

        "5. CUENTAS Y SEGURIDAD. Usted es responsable de la confidencialidad de sus credenciales y de todas las actividades realizadas con su Cuenta. Debe mantener información precisa y notificarnos de inmediato cualquier uso no autorizado.",

        "6. USO ACEPTABLE. Usted no utilizará el Servicio para actividades ilícitas; para infringir derechos de terceros; para generar o difundir contenido ilegal, dañino, fraudulento, difamatorio, que explote a menores o que infrinja la privacidad; para desarrollar malware, realizar pruebas de penetración no autorizadas, minería de credenciales o spam; para eludir controles de seguridad o límites de uso; ni para extraer datos a gran escala sin permiso por escrito de la Compañía.",

        "7. CONTENIDO DEL USUARIO; LICENCIA. Usted conserva la titularidad de su Contenido del Usuario. Nos otorga una licencia mundial, no exclusiva, gratuita y sublicenciable para alojar, reproducir, procesar y mostrar dicho contenido con el fin de operar y proporcionar el Servicio. El uso para mejorar modelos se realizará solo si usted opta expresamente por ello cuando tal opción esté disponible.",

        "8. CONTENIDO GENERADO POR IA; DERECHOS DE USO. Sujeto a estos Términos y a las limitaciones de terceros, la Compañía le concede una licencia mundial, no exclusiva y no transferible para usar el Contenido Generado por IA para fines lícitos. La IA puede producir resultados similares para otros usuarios; no garantizamos exclusividad ni originalidad. Usted es responsable de verificar la precisión y legalidad del uso del contenido.",

        "9. DERECHOS DE PROPIEDAD INTELECTUAL. El Servicio, incluyendo software, interfaces y marcas, pertenece a la Compañía o sus licenciantes y está protegido por leyes de propiedad intelectual. No se le concede ninguna licencia salvo la expresamente otorgada.",

        "10. TERCEROS Y COMPONENTES DE CÓDIGO ABIERTO. El Servicio puede integrar API de terceros y componentes de código abierto sujetos a sus propias licencias y términos, que usted acepta en la medida aplicable.",

        "11. COMENTARIOS. Si envía ideas, sugerencias o mejoras, otorga a la Compañía un derecho perpetuo, irrevocable, mundial y libre de regalías para usarlas sin compensación ni obligación.",

        "12. PLANES DE PAGO Y FACTURACIÓN. Las suscripciones se renuevan automáticamente hasta su cancelación. Los cargos se facturan por adelantado; los impuestos aplicables y comisiones de terceros corren por su cuenta. Salvo que la ley exija lo contrario, los pagos no son reembolsables. Podremos ajustar precios previa notificación razonable para períodos futuros.",

        "13. PRUEBAS, CRÉDITOS Y BETA. Las pruebas gratuitas, créditos promocionales y funciones beta pueden restringirse, retirarse o expirar. Se proporcionan “tal cual” sin garantías y pueden no reflejar el rendimiento final.",

        "14. PRIVACIDAD. El tratamiento de datos personales se rige por nuestra Política de Privacidad. Al usar el Servicio, usted consiente dicho tratamiento. No vendemos información personal identificable según la legislación aplicable.",

        "15. SEGURIDAD. Mantenemos medidas técnicas y organizativas razonables. Aun así, ningún sistema es completamente seguro; usted utiliza el Servicio bajo su propio riesgo.",

        "16. SIN ASESORAMIENTO PROFESIONAL. El Contenido Generado por IA no constituye asesoramiento legal, médico, financiero ni de otra índole profesional. Debe obtener asesoramiento de un profesional cualificado cuando corresponda.",

        "17. CUMPLIMIENTO, EXPORTACIÓN Y SANCIONES. Usted declara que no se encuentra en, ni es residente de, un país embargado o sujeto a sanciones, ni figura en listas de partes restringidas. Se compromete a cumplir las leyes de exportación y anticorrupción aplicables.",

        "18. INDEMNIZACIÓN. Usted indemnizará y mantendrá indemne a la Compañía y sus afiliadas frente a reclamaciones, daños, pérdidas y gastos derivados de su uso del Servicio o del incumplimiento de estos Términos, en la medida permitida por la ley.",

        "19. EXENCIONES DE GARANTÍAS. El Servicio y el Contenido Generado por IA se proporcionan “tal cual” y “según disponibilidad”, sin garantías de exactitud, fiabilidad, comerciabilidad, idoneidad para un fin particular ni no infracción.",

        "20. LIMITACIÓN DE RESPONSABILIDAD. En la máxima medida permitida, la responsabilidad total de la Compañía por cualquier reclamación derivada del Servicio no excederá los importes pagados por usted al Servicio en los doce (12) meses anteriores. En ningún caso responderemos por daños indirectos, incidentales, especiales, punitivos o consecuentes.",

        "21. SUSPENSIÓN Y TERMINACIÓN. Podemos suspender o terminar el acceso por incumplimiento o riesgo para el Servicio. Al terminar, cesan sus derechos y podremos eliminar o desactivar el acceso a su contenido, conforme a la ley.",

        "22. CAMBIOS EN LOS TÉRMINOS. Podemos modificar estos Términos. Las modificaciones materiales se publicarán con antelación razonable cuando así lo exija la ley. El uso continuado tras la entrada en vigor supone aceptación.",

        "23. LEY APLICABLE Y JURISDICCIÓN. Salvo lo dispuesto en la Sección 24 para residentes en EE. UU., estos Términos se rigen por las leyes de la Provincia de Quebec y las leyes federales de Canadá aplicables, y cualquier disputa se someterá exclusivamente a los tribunales de Montreal, Quebec, sin perjuicio de los derechos imperativos del consumidor en su jurisdicción.",

        "24. ARBITRAJE VINCULANTE (EE. UU.). Si usted reside en Estados Unidos, toda disputa se resolverá mediante arbitraje vinculante ante la AAA conforme a sus Reglas de Arbitraje del Consumidor. No habrá acciones colectivas. Usted puede optar por excluirse dentro de los 30 días siguientes a la aceptación enviando aviso a [Support Email] o a [Postal Address]. Las reclamaciones de menor cuantía pueden presentarse en dicho fuero.",

        "25. DERECHOS DEL CONSUMIDOR. Nada en estos Términos pretende excluir derechos imperativos del consumidor en la UE, el Reino Unido u otras jurisdicciones donde no sea posible la renuncia.",

        "26. AVISOS Y CONTACTO. Podemos enviarle avisos por correo electrónico o dentro del Servicio. Las consultas legales o de soporte deben dirigirse a [Support Email] o a [Postal Address].",

        "27. DMCA/PROPIEDAD INTELECTUAL. Si cree que algún contenido infringe sus derechos, envíe un aviso conforme a la DMCA o normativa aplicable a [Support Email] con la información requerida por ley.",

        "28. FUERZA MAYOR. No seremos responsables por incumplimientos debidos a causas fuera de nuestro control razonable.",

        "29. CESIÓN. Usted no puede ceder estos Términos sin nuestro consentimiento. Podemos cederlos sin su consentimiento en relación con una reorganización, fusión o venta.",

        "30. INTEGRIDAD, DIVISIBILIDAD Y SUPERVIVENCIA. Estos Términos constituyen el acuerdo íntegro. Si alguna disposición es inválida, las restantes permanecerán vigentes. Las secciones que por su naturaleza deban subsistir, subsistirán tras la terminación.",
      ],
    };
  }

  if (language === "ko") {
    return {
      title: "서비스 이용약관",
      paragraphs: [
        `최종 업데이트: ${formatDate("ko-KR")}`,

        "1. 약관의 수락. [Company Name]가 제공하는 애플리케이션 및 관련 서비스(이하 “서비스”)를 이용함으로써 귀하는 [Legal Entity](이하 “회사”)와 법적으로 구속력 있는 계약을 체결하고 본 약관 및 참조로 편입된 정책에 동의합니다. 동의하지 않는 경우 서비스 이용을 중단하십시오.",

        "2. 정의. “사용자 콘텐츠”란 사용자가 서비스에 제출하는 입력, 파일, 데이터 및 자료를 의미합니다. “AI 생성물”이란 모델이 생성한 출력물을 의미합니다. “계정”이란 귀하의 서비스 이용과 연계된 프로필을 의미합니다. “유료 플랜”이란 구독, 크레딧 등 유상 과금을 의미합니다.",

        "3. 서비스. 본 서비스는 AI 기반 대화 기능을 제공하며, 무료 및 유료 기능, 베타 기능 등이 포함될 수 있습니다. 회사는 기능을 언제든지 변경 또는 중단할 수 있습니다.",

        "4. 자격. 귀하는 만 13세 이상(해당 지역법상 더 높은 최소 연령이 있는 경우 그 연령 이상)이어야 하며, 본 약관에 동의할 법적 능력이 있어야 합니다. 법인을 대신하여 가입하는 경우 그 권한을 보유함을 진술·보증합니다.",

        "5. 계정 및 보안. 귀하는 계정 자격증명의 비밀유지와 계정에서 발생하는 모든 활동에 대한 책임이 있습니다. 정확한 정보를 유지하고, 무단 사용을 인지하는 즉시 통지해야 합니다.",

        "6. 허용 사용. 귀하는 불법 행위, 제3자 권리 침해, 불법·유해·명예훼손·아동 착취·프라이버시 침해 콘텐츠의 생성·전송, 악성코드 개발, 무단 침투 테스트, 스팸, 보안 우회, 이용 한도 회피, 대규모 무단 데이터 추출 등에 서비스가 사용되지 않도록 합니다.",

        "7. 사용자 콘텐츠 라이선스. 사용자 콘텐츠의 소유권은 귀하에게 있습니다. 회사는 서비스 제공·운영을 위해 전 세계적·비독점적·무상·서브라이선스 가능한 사용권을 가집니다. 모델 개선 목적의 활용은 해당 옵션이 제공되는 경우 귀하의 명시적 옵트인에 한합니다.",

        "8. AI 생성물 이용권. 본 약관과 제3자 제한에 따라 회사는 귀하에게 합법적 목적 내에서 AI 생성물을 사용할 수 있는 전 세계적·비독점적·양도 불가 라이선스를 부여합니다. 결과물의 배타성·독창성은 보장되지 않으며, 정확성·적법성 확인 책임은 귀하에게 있습니다.",

        "9. 지식재산권. 소프트웨어, 인터페이스, 상표 등을 포함한 서비스는 회사 또는 라이선스 제공자의 재산이며 관련 법으로 보호됩니다. 명시적으로 부여된 권리를 제외하고 어떠한 권리도 이전되지 않습니다.",

        "10. 제3자 및 오픈소스. 서비스는 제3자 API 및 오픈소스 구성요소를 포함할 수 있으며, 해당 라이선스와 약관이 적용됩니다.",

        "11. 피드백. 귀하가 제공하는 아이디어·제안·개선사항에 대하여 회사는 전 세계적·영구적·취소불가·무상으로 사용·복제·배포할 권리를 가집니다.",

        "12. 요금 및 결제. 구독은 해지 전까지 자동 갱신됩니다. 요금은 선청구되며, 적용세금 및 제3자 수수료는 귀하 부담입니다. 법률상 달리 요구되지 않는 한 환불되지 않습니다. 향후 기간에 대한 가격은 합리적 통지 후 변경될 수 있습니다.",

        "13. 체험, 크레딧, 베타. 무료 체험·프로모션 크레딧·베타 기능은 제한·회수·만료될 수 있으며, “있는 그대로” 제공됩니다.",

        "14. 개인정보. 개인정보 처리에 관하여는 개인정보 처리방침이 적용됩니다. 서비스 이용으로 해당 처리에 동의하는 것으로 간주됩니다. 회사는 관련 법이 허용하는 범위에서 개인식별정보를 판매하지 않습니다.",

        "15. 보안. 회사는 합리적인 기술적·관리적 보호조치를 유지하나, 완전한 보안을 보장할 수는 없습니다. 서비스 이용은 귀하의 책임하에 이루어집니다.",

        "16. 전문자문 아님. AI 생성물은 법률·의학·재무 기타 전문적 자문이 아니며, 필요한 경우 자격 있는 전문가의 조언을 받아야 합니다.",

        "17. 준수·수출통제·제재. 귀하는 제재 대상국 또는 제한 명단에 속하지 않으며, 관련 수출입·반부패 법규를 준수합니다.",

        "18. 면책. 법이 허용하는 범위에서, 귀하는 서비스 이용 또는 약관 위반과 관련하여 발생하는 제3자 청구로부터 회사 등을 면책하고 방어하며 손해를 배상합니다.",

        "19. 보증의 부인. 서비스 및 AI 생성물은 “있는 그대로” 및 “제공 가능 범위 내에서” 제공되며, 정확성·신뢰성·상품성·특정목적 적합성·비침해성에 대한 명시적 또는 묵시적 보증이 없습니다.",

        "20. 책임 제한. 법이 허용하는 최대한의 범위에서 회사의 총 책임은 청구 발생 전 12개월 동안 귀하가 지불한 금액을 초과하지 않습니다. 간접·부수·특별·징벌적·결과적 손해에 대해서는 책임지지 않습니다.",

        "21. 중단 및 종료. 위반 또는 서비스 위험이 있는 경우 회사는 접근을 정지·종료할 수 있습니다. 종료 시 귀하의 권리는 즉시 소멸하며, 관련 법에 따라 콘텐츠 접근이 중단되거나 삭제될 수 있습니다.",

        "22. 약관 변경. 회사는 본 약관을 변경할 수 있습니다. 법이 요구하는 경우 중대한 변경은 합리적 사전 고지 후 적용됩니다. 변경 이후 서비스 이용은 변경 수락을 의미합니다.",

        "23. 준거법 및 관할. 미국 거주자에 대한 제24조를 제외하고, 본 약관은 캐나다 퀘벡주 법 및 적용 가능한 캐나다 연방법을 준거법으로 하며, 분쟁은 퀘벡주 몬트리올 소재 법원의 전속 관할에 따릅니다. 이는 각국 소비자 보호의 강행 규정을 침해하지 않습니다.",

        "24. 구속력 있는 중재(미국). 미국 거주자의 모든 분쟁은 AAA 소비자 중재 규칙에 따른 구속력 있는 중재로 해결됩니다. 집단소송은 허용되지 않습니다. 귀하는 수락 후 30일 이내 [Support Email] 또는 [Postal Address]로 통지하여 옵트아웃할 수 있습니다. 소액재판 범위의 청구는 해당 법원에 제기할 수 있습니다.",

        "25. 소비자 권리. 유럽연합·영국 등에서의 강행 소비자 권리는 본 약관으로 배제되지 않습니다.",

        "26. 통지 및 연락처. 회사는 전자우편 또는 서비스 내 고지를 통해 통지할 수 있습니다. 법률 또는 지원 관련 문의는 [Support Email] 또는 [Postal Address]로 연락해 주십시오.",

        "27. 저작권 침해 신고. 권리 침해가 의심되는 경우, 관련 법이 요구하는 정보를 포함하여 [Support Email]로 통지하십시오.",

        "28. 불가항력. 당사는 합리적 통제를 벗어난 사유로 인한 불이행에 대해 책임지지 않습니다.",

        "29. 양도. 귀하는 회사의 사전 서면동의 없이 본 약관상의 권리·의무를 양도할 수 없습니다. 회사는 조직개편·합병·양수도와 관련하여 자유롭게 양도할 수 있습니다.",

        "30. 완전합의·분리가능성·존속. 본 약관은 당사자 간 완전한 합의입니다. 조항 일부가 무효이더라도 나머지는 유효합니다. 성질상 존속해야 하는 조항은 종료 후에도 효력을 가집니다.",
      ],
    };
  }

  return {
    title: "TERMS AND CONDITIONS OF SERVICE",
    paragraphs: [
      `Last Updated: ${formatDate("en-US")}`,

      "1. ACCEPTANCE OF TERMS. By accessing or using the application and related services offered by [Company Name] (the “Service”), you enter a legally binding agreement with [Legal Entity] (the “Company”) and agree to these Terms and any policies incorporated by reference. If you do not agree, do not use the Service.",

      "2. DEFINITIONS. “User Content” means inputs, files, data, and materials you submit. “AI Output” means model-generated outputs. “Account” means your profile associated with the Service. “Paid Plans” means subscriptions, credit packs, or other fee-based offerings.",

      "3. THE SERVICE. The Service provides AI-powered conversational features, which may include free and paid tiers, beta features, and evolving functionality. The Company may modify or discontinue features at any time.",

      "4. ELIGIBILITY. You must be at least 13 years old (or the higher minimum age in your jurisdiction) and have the legal capacity to agree to these Terms. If you access on behalf of an entity, you represent you have authority to bind it.",

      "5. ACCOUNTS AND SECURITY. You are responsible for maintaining the confidentiality of your credentials and for all activity under your Account. You must keep your information accurate and promptly notify us of any unauthorized use.",

      "6. ACCEPTABLE USE. You will not use the Service for unlawful activity; to infringe third-party rights; to generate or disseminate illegal, harmful, exploitative, defamatory, or privacy-invasive content; to develop malware, conduct unauthorized penetration testing, spam, or credential mining; to circumvent security or usage limits; or to perform large-scale scraping without the Company’s prior written consent.",

      "7. USER CONTENT; LICENSE. You retain ownership of your User Content. You grant the Company a worldwide, non-exclusive, royalty-free, sublicensable license to host, reproduce, process, and display your User Content to operate and provide the Service. Use for model improvement occurs only if you expressly opt in where such option is offered.",

      "8. AI OUTPUT; RIGHTS TO USE. Subject to these Terms and third-party restrictions, the Company grants you a worldwide, non-exclusive, non-transferable license to use AI Output for lawful purposes. Similar results may be generated for others; exclusivity and originality are not guaranteed. You are responsible for verifying accuracy and legality of your use.",

      "9. INTELLECTUAL PROPERTY. The Service—including software, interfaces, and trademarks—is owned by the Company or its licensors and protected by intellectual-property laws. No rights are granted except as expressly set forth.",

      "10. THIRD PARTIES AND OPEN SOURCE. The Service may integrate third-party APIs and open-source components subject to their own licenses and terms, which you agree to to the extent applicable.",

      "11. FEEDBACK. If you submit ideas, suggestions, or improvements, you grant the Company a perpetual, irrevocable, worldwide, royalty-free right to use them without compensation or attribution.",

      "12. FEES AND BILLING. Subscriptions renew automatically until canceled. Charges are billed in advance; applicable taxes and third-party fees are your responsibility. Unless required by law, payments are non-refundable. We may adjust prices with reasonable notice for future terms.",

      "13. TRIALS, CREDITS, AND BETA. Free trials, promotional credits, and beta features may be limited, withdrawn, or expire and are provided “as is,” without warranties, and may not reflect final performance.",

      "14. PRIVACY. Personal-data processing is governed by our Privacy Policy. By using the Service, you consent to such processing. We do not sell personally identifiable information as defined by applicable law.",

      "15. SECURITY. We maintain reasonable technical and organizational measures but do not guarantee that the Service is error-free or secure. You use the Service at your own risk.",

      "16. NO PROFESSIONAL ADVICE. AI Output does not constitute legal, medical, financial, or other professional advice. Seek advice from a qualified professional where appropriate.",

      "17. COMPLIANCE, EXPORT, AND SANCTIONS. You represent that you are not located in, and are not a resident of, any embargoed or sanctioned jurisdiction and are not listed on any restricted-party list. You will comply with applicable export-control and anti-corruption laws.",

      "18. INDEMNITY. To the fullest extent permitted by law, you will defend, indemnify, and hold harmless the Company and its affiliates from claims, damages, losses, and expenses arising from your use of the Service or breach of these Terms.",

      "19. DISCLAIMERS. The Service and all AI Output are provided “as is” and “as available,” without warranties of any kind, express or implied, including accuracy, reliability, merchantability, fitness for a particular purpose, and non-infringement.",

      "20. LIMITATION OF LIABILITY. To the maximum extent permitted by law, the Company’s aggregate liability for claims arising out of or relating to the Service will not exceed the amounts you paid for the Service during the twelve (12) months before the event giving rise to liability. In no event will the Company be liable for indirect, incidental, special, punitive, or consequential damages.",

      "21. SUSPENSION AND TERMINATION. We may suspend or terminate access for breach or if your use poses risk to the Service. Upon termination, your rights cease, and we may delete or disable access to content as permitted by law.",

      "22. CHANGES TO TERMS. We may modify these Terms. Where required by law, material changes will be posted with reasonable advance notice. Your continued use after the effective date constitutes acceptance.",

      "23. GOVERNING LAW AND VENUE. Except as provided in Section 24 for U.S. residents, these Terms are governed by the laws of the Province of Québec and the federal laws of Canada applicable therein, and disputes will be brought exclusively in the courts located in Montréal, Québec, without prejudice to non-waivable consumer rights in your jurisdiction.",

      "24. BINDING ARBITRATION (U.S. RESIDENTS). If you reside in the United States, any dispute will be resolved by binding arbitration before the American Arbitration Association under its Consumer Arbitration Rules. Class actions are waived. You may opt out within thirty (30) days of acceptance by sending notice to [Support Email] or [Postal Address]. Either party may bring qualifying claims in small-claims court.",

      "25. CONSUMER RIGHTS. Nothing in these Terms is intended to exclude mandatory consumer rights in the EU, UK, or other jurisdictions where such rights cannot be waived.",

      "26. NOTICES AND CONTACT. We may provide notices via email or in-product messaging. Legal or support inquiries should be directed to [Support Email] or mailed to [Postal Address].",

      "27. DMCA/IP NOTICES. If you believe content infringes your rights, submit a notice compliant with applicable law to [Support Email] with all required information.",

      "28. FORCE MAJEURE. We are not liable for failures caused by events beyond our reasonable control.",

      "29. ASSIGNMENT. You may not assign these Terms without our prior written consent. We may assign without consent in connection with a reorganization, merger, or sale.",

      "30. ENTIRE AGREEMENT; SEVERABILITY; SURVIVAL. These Terms constitute the entire agreement. If any provision is held invalid, the remainder will continue in effect. Provisions that by their nature should survive termination will survive.",
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
