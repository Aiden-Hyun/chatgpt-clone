export type SupportedLanguage = "en" | "es" | "ko";

export interface PrivacyContent {
  title: string;
  paragraphs: string[];
}

// We use the full text from docs/privacy/policy.md directly here
// so the in-app experience is complete and offline-friendly.

export const getPrivacyContentByLanguage = (
  language: SupportedLanguage
): PrivacyContent => {
  // Fallback to English for non-localized languages
  // Ideally, you would translate this full text for es/ko as well.
  
  const fullEnglishPolicy = [
    "Last Update: November 22, 2024",

    "MalloAI and its affiliates ('we,' 'our,' or 'us') value the privacy of individuals who use our mobile applications, website, and related services (collectively, our 'Services'). The Services provide an AI-powered chat application that helps customers leverage multiple large language models (LLMs) to accomplish work and general information retrieval. We collect data to perform these Services, to understand how our consumers use the service, to identify new features and opportunities, debug platform issues, and to protect the platform from fraud and abuse. Such data processing is conducted for the following reasons:",

    "• When we have a legal duty.\n• To fulfill our contract with you.\n• When it is in our legitimate interests, data processing is necessary to achieve those interests and our interests are not overridden by your interests or fundamental rights and freedoms.\n• With your consent, when needed and if applicable.",

    "The section titled 'How We Share the Information We Collect' in this Privacy Policy provides information on the Affiliates, Service Providers, and third parties with whom we share information.",

    "This privacy policy (the 'Privacy Policy') explains how we collect, use, and share information from or about MalloAI users ('Users' or 'you' or 'your') or their devices. By using our Services, you acknowledge the collection, use, disclosure, and procedures this Privacy Policy describes. Beyond the Privacy Policy, your use of our Services is also subject to our Terms of Service.",

    "Unless otherwise specified herein, this Privacy Policy applies to all users of our Services, including paid subscribers to our Services such as Pro Plan or Team Plan subscribers (our 'Paid Subscribers'), if and when such subscription tiers are made available. In the event of a conflict between the terms of this Privacy Policy and the terms of a Paid Subscriber's subscription agreement, the terms of the latter will control.",

    "Finally, as noted in our Terms of Service, this Privacy Policy assumes that in accessing our Services you will not include in any prompts (or disclose, send or transmit to MalloAI), or upload any sensitive, personal information or personally identifiable information that is subject to specific regulations or laws that impose increased protections and/or obligations with respect to handling that type of information (including, but not limited to, personal financial, health, social security numbers or other government identification numbers, ethnicity, sexual orientation and political affiliations), such as HIPAA or GLBA, or under international regulations such as GDPR, or any other information where unauthorized disclosure could cause material or severe harm or impact to MalloAI or third parties. Please do not enter such sensitive personal information in prompts or otherwise share such information that could enter our systems.",

    "INFORMATION WE COLLECT",

    "We collect any information that you provide to us, including when you create your account, submit your preferences, or contact us. We also collect information about your device and the ways you use and interact with our Services.",

    "We may collect a variety of information from or about you or your devices from various sources, as described below.",

    "If you do not provide your information when requested, you may not be able to use our Services if that information is necessary to provide you with our Services or if we are legally required to collect it.",

    "Registration and Profile Information. When you sign up for an account, we ask you for your name and email address.",

    "Information We Obtain from Third Parties. If you choose to connect your account on a third-party platform or network to the Services, like using your Google account to access your MalloAI account, we receive information from Google. For example, this information may include your Google username, profile picture, and other profile information. You can see Google's Privacy Policy here: https://policies.google.com/privacy. In the future, we may allow other services to provide log-in services. If so, we will share log-in credentials with the provider and receive information you have shared with the log-in provider.",

    "Third Party Service Collections. We will not use any third-party services (e.g. DropBox, Google Drive, or Microsoft Sharepoint, etc.) to collect information without explicit permission. Personal data collected through these services may include information to help us identify your account, prompts, content created or shared by you, or feedback that you provide to our Services. This data will not be used for developing, improving, or training third party AI and/or ML models. To the extent we transfer any data to our third-party AI providers, it is solely data which our users have represented they have the right to transfer, and to which transfer our users consent. For instance, if a user creates a document on a platform like Google or Microsoft, the user represents that he/she has the ownership and/or rights in that document to upload it to our app, and by uploading it, the user consents based on our internal processes to share it with our third-party AI providers.",

    "Device Information. We receive information about the device and software you use to access our Services, including internet protocol (IP) address, web browser type, operating system version, and device identifiers.",

    "Usage Information. To help us understand how you use our Services, to better personalize them to you, to help us improve them, and to communicate and market to you in the most relevant ways, we automatically receive information about your interactions with our Services, like the pages or other content you view, chat rooms you create, messages you send, and the dates and times of your visits.",

    "Chat Content. We collect and store the chat messages, prompts, and AI-generated responses that you create and receive through our Services. This content is stored in our database to enable you to access your chat history and to provide continuity in your conversations.",

    "Fraud Detection. MalloAI collects user telemetry for abuse and security monitoring purposes. Telemetry might include IP address, client identification signals such as browser user-agent, and actions performed on the platform.",

    "Payment Information. We may receive your payment details if you purchase services or to access services. Payment processing is handled by third-party payment processors as described in the 'How We Share the Information We Collect' section below.",

    "Information from Cookies and Similar Technologies. We collect information using only first-party cookies and similar technologies. On mobile applications, we use secure storage mechanisms provided by the operating system to maintain your session and preferences.",

    "HOW WE USE THE INFORMATION WE COLLECT",

    "We use your information primarily to provide, personalize, maintain the security of, and improve the Services you use. We also use your information to communicate with you and to carry out our marketing; to protect you and others; and to exercise, defend or establish our rights.",

    "We use the information we collect:\n• To provide, maintain, improve, and enhance our Services;\n• To understand and analyze how you use our Services and develop new products, services, features, and functionality;\n• To personalize our services to our members;\n• To communicate with you and provide you with updates and other information relating to our Services, provide information that you request, respond to comments and questions, and otherwise provide customer support;\n• To process payments;\n• For marketing purposes, such as developing and providing promotional materials that may be useful, relevant, valuable or otherwise of interest to you;\n• To generate anonymized, aggregate data containing only de-identified, non-personal information that we may use for any lawful purpose;\n• To find and prevent fraud, and respond to trust and safety issues that may arise;\n• For compliance purposes, including enforcing our Terms of Service or other legal rights, or as may be required by applicable laws and regulations or requested by any judicial process or governmental agency; and\n• For other purposes for which we provide specific notice at the time the information is collected.",

    "You are in control of your profile information and email preferences:\n• You can unsubscribe from our promotional emails via the link provided in the emails. Even if you opt-out of receiving promotional messages from us, you will continue to receive administrative messages from us.\n• You can request the deletion of your user profile and all data associated to it by emailing us at support@malloai.app.",

    "HOW WE SHARE THE INFORMATION WE COLLECT",

    "We share your information with third party vendors who help us to provide and enhance our Services and marketing. We share information with the following categories of third parties.",

    "Who we share with. We may share any information we receive with vendors and service providers retained in connection with the provision of our Services. We have agreements in place with vendors and service providers to address how they may use your information.",

    "Affiliates. Our corporate parent, subsidiaries, and affiliates, for purposes consistent with this Privacy Policy.",

    "Service providers. Companies and individuals that provide services on our behalf or help us operate the Services or our business (such as hosting, information technology, customer support, email delivery, communications channels and website analytics services).",

    "We have service provider relationships and use various Large Language Model (LLM) providers including OpenAI and Anthropic. We use Supabase for authentication, database hosting, and backend infrastructure. We use Google Sign-In for authentication services. We use Stripe for payment processing.",

    "We provide these vendor details to provide additional transparency but don't guarantee that this list is current or complete.",

    "Professional advisors. Professional advisors, such as lawyers, auditors, bankers and insurers, where necessary in the course of the professional services that they render to us.",

    "Authorities and others. Law enforcement, government authorities, and private parties, as we believe in good faith to be necessary or appropriate for the compliance and protection purposes described above.",

    "Business transferees. Acquirers and other relevant participants in business transactions (or negotiations for such transactions) involving a corporate divestiture, merger, consolidation, acquisition, reorganization, sale or other disposition of all or any portion of the business or assets of, or equity interests (including, in connection with a bankruptcy or similar proceedings).",

    "As Required By Law and Similar Disclosures. We may access, preserve, and disclose your information if we believe doing so is required or appropriate to: (a) comply with law enforcement or otherwise lawful requests and legal process, such as a court order or subpoena by public authorities to meet national security or law enforcement requirements; (b) respond to your requests; or (c) protect your, our, or others' rights, property, or safety.",

    "Merger, Sale, or Other Asset Transfers. We may disclose and transfer your information to service providers, advisors, potential transactional partners, or other third parties in connection with the consideration, negotiation, or completion of a corporate transaction in which we are acquired by or merged with another company or we sell, liquidate, or transfer all or a portion of our business or assets.",

    "Consent. We may disclose information from or about you or your devices with your permission.",

    "Links to Other Websites or LLM Tools. Our Services contain links to other websites that are not owned or controlled by us, such as 3rd party websites in chat responses and other business partners. This Policy only applies to information collected by our Services. We have no control over these third party websites, and your use of third party websites and features are subject to privacy policies posted on those websites. We are not responsible or liable for the privacy or business practices of any third party websites linked to our Services. Your use of third parties' websites linked to our Services is at your own risk, so we encourage you to read the privacy policies of any linked third party websites when you leave one of our Services.",

    "YOUR RIGHTS REGARDING YOUR DATA",

    "As explained below, MalloAI provides ways for you to access and delete your personal information as well as exercise applicable data rights that give you certain control over your information. Please note that we are subject to the investigatory and enforcement powers of the United States' Federal Trade Commission (FTC).",

    "A) All Users",

    "Email Subscriptions. You can always unsubscribe from our commercial or promotional emails by clicking unsubscribe in those messages. We will still send you transactional and relational emails about your use of the MalloAI Services.",

    "Push Notifications. You can opt out of receiving push notifications through your app settings. Please note that opting out of receiving push notifications may impact your use of the MalloAI Services (such as notice of Services enhancements).",

    "Profile Information. You can review and edit certain account information you have chosen to add to your profile by logging in to your account settings and profile.",

    "Location Information. We do not collect precise location information. If we begin to collect such information in the future, you can prevent your device from sharing location information through your device's system settings. But if you do, this may impact MalloAI's ability to provide you our full range of features and services.",

    "Accessing Your Information. If you would like to access your information, please email us at support@malloai.app. You can also see information we have about you by logging into your account and viewing things like your profile, settings, and preferences.",

    "Deleting Your Account. If you would like to delete your MalloAI account, please email us at support@malloai.app. In some cases, we will be unable to delete your account, such as if there is an issue with your account related to trust, safety, or fraud. When we delete your account, we may retain certain information for legitimate business purposes or to comply with legal or regulatory obligations. For example, we may retain your information because we may be obligated to do so as part of an open legal claim. When we retain such data, we do so in ways designed to prevent its use for other purposes.",

    "Regardless of where you live, and subject to our obligations under applicable laws, you may have certain rights and choices regarding your information. For example, in addition to choices described elsewhere in this Privacy Policy, you may have some or all of the following rights and choices in general:",

    "B) General Regional Rights",

    "Access Rights: You may have the right to receive certain information, such as the following (these rights, and the applicable types of data and time periods, will vary depending on the laws applicable to the state or country in which you reside):\n• The categories of information we have collected or disclosed about you; the categories of sources of such information; the business or commercial purpose for collecting your information; and the categories of third parties with whom we shared your information.\n• Access to and/or a copy of certain information we hold about you.\n• In some circumstances, you may have the right to obtain certain information in a portable format.",

    "Erasure: You may have the right to request that we delete certain information we have about you. We may either decide to delete your information entirely, or we may anonymize or aggregate your information such that it no longer reasonably identifies you, and may use it to improve our Services. Certain information may be exempt from such requests under applicable law. For example, we need certain types of information so that we can provide our Services to you, we may be required to retain certain information for legal purposes, and there may be other reasons we may need to keep certain information under various applicable laws. In addition, if you ask us to delete your information, you may no longer be able to access or use some of our Services.",

    "Correction: You may have the right to request that we correct certain information we hold about you.",

    "Limitation of Processing: Certain laws may allow you to object to or limit the manner in which we process some of your information, including the ways in which we use or share it. For example, you may have these rights if the processing was undertaken without your consent and without a legitimate business interest (although we may not be required to cease or limit processing in cases where our interests are balanced against your privacy interests).",

    "Regulator Contact: You may have the right to contact or file a complaint with regulators or supervisory authorities about our processing of information. To do so, please contact your local data protection or consumer protection authority.",

    "Postings by Minors: Users of our Services under the age of 18 in certain jurisdictions have the right to require that we delete any content they have posted on one of our Services.",

    "Other: You may have the right to receive information about any financial incentives that we may offer to you, if any. You may also have the right to not be discriminated against (as provided for in applicable law) for exercising certain of your rights.",

    "If you believe that you have specific rights under your jurisdiction and you would like to exercise any of these rights, please submit a support request via email to us at support@malloai.app. Other than a simple marketing opt-out, you will be required to verify your identity before we fulfill your request. In certain jurisdictions, you may be able to designate an authorized agent to make a request on your behalf, subject to certain requirements of your applicable law. We may require that you provide the email address we have on file for you (and verify that you can access that email account) as well as an address, phone number, or other data we have on file, in order to verify your identity. If an agent is submitting the request on your behalf, we reserve the right to validate the agent's authority to act on your behalf, and we may be required to take additional verification measures under applicable law.",

    "C) Important Information for EU and United Kingdom Users",

    "If you are a user from the European Union or United Kingdom you should be aware that we are joint controllers of your information (Data Controller) under the EU General Data Protection Regulation ('GDPR'), the UK General Data Protection Regulation ('UK GDPR'), and such similar laws promulgated in the various EU countries.",

    "You may have certain additional rights regarding your information (as defined in the GDPR and UK GDPR, for instance), including the right to:\n• access your information;\n• rectify your information if it is incorrect or incomplete;\n• have your personally identifiable information erased ('right to be forgotten') if certain grounds are met;\n• withdraw your consent to our processing of your information at any time, but only if our processing is based on consent;\n• object to our processing of your information, if our processing is based on legitimate interests;\n• object to our processing of your information for direct marketing purposes; and\n• receive your information from us in a structured, commonly used, and machine-readable format, and\n• the right to transmit your information to another controller without hindrance from us (data portability).",

    "There is no charge for any of these requests. To make a request, please contact us at support@malloai.app. We try to respond to such requests in a timely manner, but in no event longer than one month.",

    "When we collect your information, we maintain and store it for as long as we determine reasonably necessary to provide our Services to you, unless you exercise your right to erasure described above, or to comply with applicable legal requirements.",

    "If you are a citizen of the European Union or United Kingdom, when we process your information, we will only do so in the following situations:\n• We have a contractual obligation.\n• You have provided your consent. You are able to remove your consent at any time, and you may do this by contacting us at support@malloai.app.\n• We have a legal obligation.\n• We have a legitimate business interest in processing your information. For example, we may process your information to send you marketing communications, relevant content, products or events invitations, or to communicate with you about changes to our Services, and to provide, secure, or improve our Services.",

    "You should be aware that information that you provide to us may be transferred out of the country in which you reside to servers in a country that may not guarantee the same level of protection as the one in which you reside. We do this for a legitimate business purpose in providing the Services as permitted under UK and EU privacy laws, and therefore specific consent is not required under the EU and UK legal schema. We will take all steps reasonably necessary to ensure that your information is treated securely in accordance with this Privacy Policy, and no transfer of your information will take place to a third party unless there are adequate controls in place to protect your information and/or you have provided contractual consent by becoming a User.",

    "If you are a User in the European Union or United Kingdom and have a concern about our processing of personal information that we are not able to resolve, you have the right to lodge a complaint with the data privacy authority where you reside.",

    "D) Information for U.S. Residents",

    "Various U.S. states (e.g., as of the date of this Policy, California, Colorado, Connecticut, Delaware, Indiana, Iowa, Kentucky, Maryland, Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon, Tennessee, Texas, Utah and Virginia) currently allow or will soon allow consumers to opt out of sharing of their data. As such, residents of those states may request that we:\n• Disclose the sources, categories, and specific pieces of information we have collected about you, how that information is used, and with whom we share it\n• Disclose the purpose for collecting your information\n• Disclose the categories of third parties with whom we share your information\n• Delete/rectify/restrict personally identifiable information, subject to certain exceptions (right of rectification not applicable to Utah residents)\n• Though not specifically applicable to us, to disclose, for any 'sales' of personal information, the categories of personal information collected and sold and to what categories of third parties it was sold\n• Though not specifically applicable to us, to opt you out of sales of your information (if any) or subject certain information to automated decision-making algorithms (not applicable to Utah residents)\n• Provide a copy of your information in a readily usable format that allows the information to be transmitted to others",

    "Residents in these states may not be discriminated against for exercising any of the rights described above. Residents of these states may exercise these rights by emailing us at support@malloai.app. Note that if a state law has been ratified but not yet effective, we reserve the right to deny your request as it pertains to that state.",

    "We do not process any data of children.",

    "In general, we, including our vendors and service providers, collect the following California regulated categories of personal information (PI) from you:\n• Identifiers (Yes)\n• Internet or other similar network activity (Yes)\n• Sensory data (Yes)\n• Inferences drawn from other PI (Yes)\n\nWe do NOT collect:\n• PI categories listed in the California Customer Records statute\n• Protected classification characteristics\n• Commercial information\n• Biometric information\n• Geolocation data (precise)\n• Professional or employment-related information\n• Non-public education information",

    "Sharing Your Information for a Business Purpose\nIn the preceding twelve (12) months, we have disclosed the following categories of Personal Information for a business purpose with our Affiliates and Service Providers:\n• Identifiers\n• Internet or other similar network activity\n• Sensory data\n• Inferences drawn from other PI",

    "Shine Your Light Law. Under California law, California residents are entitled, once per calendar year, to ask us for a notice identifying the categories of personal customer information that we share with certain third parties for the third parties' direct marketing purposes, and providing contact information (i.e., names and addresses) for these third parties. If you are a California resident and would like a copy of this notice, please submit a written request to us via email at support@malloai.app.",

    "Opt-Out of Sale in U.S. We do not currently 'sell' (as defined by the California Consumer Privacy Act and other U.S. state laws) any personal information subject to this Privacy Policy, and we do not exchange information for any type of financial incentive.",

    "Do Not Track. Some Internet browsers may be configured to send 'Do Not Track' signals to the online services that you visit. We currently do not respond to 'Do Not Track' or similar signals.",

    "CHILDREN'S PRIVACY",

    "We do not knowingly collect, maintain, or use personal information from children under 18 years of age, and no part of our Services are directed to children. If you learn that a child you are a guardian or parent of has provided us with personal information in violation of this Privacy Policy, then you may alert us at support@malloai.app.",

    "SECURITY",

    "We work hard to protect your information. We make reasonable efforts to protect your information by using physical and electronic safeguards designed to improve the security of the information we maintain. However, as our Services are hosted electronically, we can make no guarantees as to the security or privacy of your information.",

    "As part of our security program, we use vendors with recognized world-class security such as Supabase, Stripe, and Google. We also limit the type and amount of personal information we collect in the first place. All our communications and websites are encrypted (using transport layer security, or TLS, a leading encryption protocol).",

    "CHANGES TO THIS PRIVACY POLICY",

    "We will let you know about any material changes to this Privacy Policy. We will post any adjustments to the Privacy Policy on this page, and the revised version will be effective when it is posted. If we materially change the ways in which we use or share personal information previously collected from you through the Services, we will notify you through the Services, by email, or other communication (such as posting on this website).",

    "CONTACT INFORMATION, INQUIRIES OR COMPLAINTS",

    "You can contact us with your questions, comments, or concerns. Please contact us at:\nEmail: support@malloai.app",

    "For privacy-related inquiries, data deletion requests, or to exercise your rights under applicable privacy laws, please email us at support@malloai.app. We will respond to your request within a reasonable timeframe and in accordance with applicable law."
  ];

  return {
    title: "PRIVACY POLICY",
    paragraphs: fullEnglishPolicy,
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
