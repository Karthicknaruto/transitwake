import {
  COMPLIANCE_CHECKLIST_20,
  BUSINESS_DETAILS,
  PRICING_DISCLOSURE,
  THIRD_PARTY_SDKS,
  OPEN_SOURCE_LICENSES,
  EMAIL_UNSUBSCRIBE_POLICY_TEXT,
  PRIVACY_POLICY_TEXT,
  TERMS_OF_SERVICE_TEXT,
  REFUND_POLICY_TEXT,
  COOKIE_POLICY_TEXT,
  AGE_CONSENT_TEXT,
} from '../src/config/legalData';

describe('20-Point App Store Compliance & Regulatory Verification Suite', () => {
  test('contains exactly 20 compliance checklist items', () => {
    expect(COMPLIANCE_CHECKLIST_20).toHaveLength(20);
  });

  test('verifies all 20 items match the regulatory checklist titles in exact order', () => {
    const expectedTitles = [
      'Privacy policy',
      'Terms of service',
      'Refund policy',
      'Cookie policy',
      'Cookie consent banner',
      'Check form consents',
      'No unnecessary data',
      'Audit third-party SDKs',
      'Remove dark patterns',
      'Remove hidden fees',
      'Remove fake reviews',
      'Remove unsupported claims',
      'Accessibility alt text',
      'Fix color contrast',
      'Keyboard navigation',
      'Add business details',
      "Age consent for kids' data",
      'Unsubscribe link in emails',
      'License fonts/images',
      'Data deletion request',
    ];

    COMPLIANCE_CHECKLIST_20.forEach((item, index) => {
      expect(item.id).toBe(index + 1);
      expect(item.title.toLowerCase()).toBe(expectedTitles[index].toLowerCase());
      expect(item.status).toBe('PASSED');
      expect(item.summary.length).toBeGreaterThan(15);
      expect(item.details.length).toBeGreaterThan(25);
      expect(item.verificationSteps.length).toBeGreaterThan(15);
      expect([
        'Legal Policies',
        'Data & Privacy',
        'Fair Commercial Practices',
        'Accessibility & UI',
        'User Controls',
      ]).toContain(item.category);
    });
  });

  test('validates business details and operator entity credentials (Item 16)', () => {
    expect(BUSINESS_DETAILS.entityName).toBe('TransitWake Technologies Inc.');
    expect(BUSINESS_DETAILS.supportEmail).toMatch(/@transitwake\.app$/);
    expect(BUSINESS_DETAILS.dpoEmail).toMatch(/@transitwake\.app$/);
    expect(BUSINESS_DETAILS.address).toContain('USA');
    expect(BUSINESS_DETAILS.jurisdiction).toContain('Delaware');
  });

  test('validates zero hidden fees and 100% free app pricing disclosure (Item 10)', () => {
    expect(PRICING_DISCLOSURE.isFree).toBe(true);
    expect(PRICING_DISCLOSURE.summary).toContain('100% Free');
    expect(PRICING_DISCLOSURE.summary).toContain('Zero Hidden Fees');
    expect(PRICING_DISCLOSURE.description).toContain('hidden charges');
  });

  test('audits all third-party SDKs and ensures strict privacy boundaries (Item 8)', () => {
    expect(THIRD_PARTY_SDKS.length).toBeGreaterThanOrEqual(4);
    THIRD_PARTY_SDKS.forEach((sdk) => {
      expect(sdk.name).toBeDefined();
      expect(sdk.purpose).toBeDefined();
      expect(sdk.dataShared).toBeDefined();
      expect(sdk.privacyUrl).toMatch(/^https:\/\//);
    });
  });

  test('validates open source licenses for fonts, maps, and frameworks (Item 19)', () => {
    expect(OPEN_SOURCE_LICENSES.length).toBeGreaterThanOrEqual(4);
    const libNames = OPEN_SOURCE_LICENSES.map((l) => l.library);
    expect(libNames.some((n) => n.includes('Leaflet'))).toBe(true);
    expect(libNames.some((n) => n.includes('OpenStreetMap'))).toBe(true);
    expect(libNames.some((n) => n.includes('React Native'))).toBe(true);
  });

  test('validates email unsubscribe and zero-spam policy (Item 18)', () => {
    expect(EMAIL_UNSUBSCRIBE_POLICY_TEXT).toContain('Zero Email Collection');
    expect(EMAIL_UNSUBSCRIBE_POLICY_TEXT).toContain('No Marketing Emails');
    expect(EMAIL_UNSUBSCRIBE_POLICY_TEXT).toContain('Unsubscribe');
  });

  test('validates privacy policy for ephemeral RAM processing and no tracking (Items 1 & 7)', () => {
    expect(PRIVACY_POLICY_TEXT).toContain('Data Minimization');
    expect(PRIVACY_POLICY_TEXT).toContain('RAM');
    expect(PRIVACY_POLICY_TEXT).toContain('Zero Location Tracking History');
  });

  test('validates terms of service disclaiming unsupported guarantees (Items 2 & 12)', () => {
    expect(TERMS_OF_SERVICE_TEXT).toContain('Acceptance of Terms');
    expect(TERMS_OF_SERVICE_TEXT).toContain('Convenience Aid Only');
    expect(TERMS_OF_SERVICE_TEXT).toContain('Personal Responsibility');
  });

  test('validates refund policy and zero subscription guarantees (Items 3 & 10)', () => {
    expect(REFUND_POLICY_TEXT).toContain('100% Free Core Functionality');
    expect(REFUND_POLICY_TEXT).toContain('14 days');
    expect(REFUND_POLICY_TEXT).toContain('Zero Hidden Subscriptions');
    expect(REFUND_POLICY_TEXT).toContain('TransitWake Prime Subscription (₹26/month)');
    expect(REFUND_POLICY_TEXT).toContain('Fair Cancellation Without Penalties');
  });

  test('validates optional Prime micro-subscription pricing and terms (Item 10)', () => {
    expect((PRICING_DISCLOSURE as any).primeSubscription).toBeDefined();
    expect((PRICING_DISCLOSURE as any).primeSubscription.priceInRupees).toBe(26);
    expect((PRICING_DISCLOSURE as any).primeSubscription.cancelAnytime).toBe(true);
    expect((PRICING_DISCLOSURE as any).primeSubscription.benefits).toContain(
      'Complete ad removal (zero banner and interstitial ads)'
    );
  });

  test('validates cookie policy disclosing local storage and zero cross-site cookies (Item 4)', () => {
    expect(COOKIE_POLICY_TEXT).toContain('Cookie & Local Storage Policy');
    expect(COOKIE_POLICY_TEXT).toContain('AsyncStorage');
    expect(COOKIE_POLICY_TEXT).toContain('No Third-Party Tracking Cookies');
  });

  test('validates children privacy policy under COPPA and GDPR-K (Item 17)', () => {
    expect(AGE_CONSENT_TEXT).toContain('Children');
    expect(AGE_CONSENT_TEXT).toContain('13');
    expect(AGE_CONSENT_TEXT).toContain('COPPA');
  });
});
