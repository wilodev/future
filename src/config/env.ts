export const ENV = {
  PRIVACY_POLICY_URL:
    process.env.COMMONS_PRIVACY_POLICY_URL ||
    'https://www.futurelearn.com/info/terms/privacy-policy/plain',
  TERMS_URL: process.env.COMMONS_TERMS_URL || 'https://www.futurelearn.com/info/terms/plain',
  CONTACT_US_URL:
    process.env.COMMONS_CONTACT_US_URL ||
    'mailto:support@futurelearn.com?subject=SendMail&body=Description',
  FAQ_URL: process.env.COMMONS_FAQ_URL || 'https://futurelearn.zendesk.com/hc/en-us',
  Feedback: process.env.COMMONS_FEEDBACK || 'https://futurelearn.typeform.com/to/ItzTSUEF',
};
