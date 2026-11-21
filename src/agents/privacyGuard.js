/**
 * Security, Privacy & Input Guardrail Agent
 * 1. Masks Protected Health Information (PHI) & PII before LLM/agent processing
 * 2. Detects prompt-injection attempts
 * 3. Validates that input represents a legitimate hospital/healthcare software scenario
 */

export function maskSensitivePHI(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { maskedText: '', redactions: [], totalRedacted: 0 };
  }

  let maskedText = rawText;
  const redactions = [];

  const rules = [
    {
      type: 'Email Address',
      token: '[REDACTED_PHI_EMAIL]',
      regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g
    },
    {
      type: 'Patient MRN / UHID',
      token: '[REDACTED_PHI_MRN]',
      regex: /\b(?:MRN|UHID|ABHA|PAT-ID)[-:\s#]+[A-Z0-9-]{4,14}\b/gi
    },
    {
      type: 'Government ID (Aadhaar / SSN)',
      token: '[REDACTED_GOV_ID]',
      regex: /\b(?:\d{4}[\s-]\d{4}[\s-]\d{4}|\d{3}-\d{2}-\d{4})\b/g
    },
    {
      type: 'Phone Number',
      token: '[REDACTED_PHI_PHONE]',
      regex: /(?:\+?\d{1,3}[\s-]?)?\b[6-9]\d{9}\b|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/g
    },
    {
      type: 'Date of Birth (DOB)',
      token: '[REDACTED_PHI_DOB]',
      regex: /\b(?:DOB|Date of Birth)[:\s]*\d{1,4}[-/]\d{1,2}[-/]\d{1,4}\b/gi
    }
  ];

  for (const rule of rules) {
    const matches = maskedText.match(rule.regex);
    if (matches && matches.length > 0) {
      redactions.push({
        type: rule.type,
        count: matches.length,
        maskToken: rule.token
      });
      maskedText = maskedText.replace(rule.regex, rule.token);
    }
  }

  const totalRedacted = redactions.reduce((sum, r) => sum + r.count, 0);
  return { maskedText, redactions, totalRedacted };
}

export function validateHospitalScenario(scenario) {
  if (!scenario || typeof scenario !== 'string') {
    return {
      isValid: false,
      reason: 'Scenario input is empty. Please describe a hospital or clinical software module.'
    };
  }

  const text = scenario.trim();
  if (text.length < 15) {
    return {
      isValid: false,
      reason: 'Input is too short. Please provide at least a sentence describing the hospital system or module.'
    };
  }

  const lower = text.toLowerCase();

  // Prompt-injection protection
  const injectionPatterns = [
    /ignore\s+(all\s+)?previous\s+instructions/i,
    /reveal\s+(your\s+)?system\s+prompt/i,
    /disregard\s+(all\s+)?(prior|above|system)\s+(rules|instructions)/i,
    /bypass\s+(security|compliance|guardrails)/i,
    /\bjailbreak\b/i
  ];
  for (const pattern of injectionPatterns) {
    if (pattern.test(lower)) {
      return {
        isValid: false,
        reason: 'Security Guardrail: Prompt-injection pattern detected and blocked before agent execution.'
      };
    }
  }

  // Profanity check
  const inappropriatePattern = /\b(fuck|fucking|shit|bitch|bastard|asshole|cunt)\b/i;
  if (inappropriatePattern.test(lower)) {
    return {
      isValid: false,
      reason: 'Input rejected: Inappropriate language detected. Please enter a valid hospital software specification.'
    };
  }

  const words = lower.match(/[a-z0-9_#+-]+/g) || [];
  if (words.length < 4) {
    return {
      isValid: false,
      reason: 'Input is too brief. Please include the clinical purpose, users, or technical requirements.'
    };
  }

  // Verify software or healthcare engineering context
  const validKeywords = new Set([
    'hospital', 'patient', 'patients', 'doctor', 'doctors', 'physician', 'nurse', 'nursing', 'clinical',
    'clinic', 'ehr', 'emr', 'medical', 'health', 'healthcare', 'icu', 'triage', 'emergency', 'pharmacy',
    'prescription', 'prescriptions', 'lab', 'laboratory', 'radiology', 'pacs', 'dicom', 'hl7', 'fhir',
    'hipaa', 'nabh', 'abdm', 'telemedicine', 'telehealth', 'ward', 'bed', 'opd', 'ipd', 'billing',
    'insurance', 'claims', 'ventilator', 'infusion', 'sepsis', 'diagnostic', 'diagnostics', 'pathology',
    'system', 'software', 'app', 'application', 'module', 'platform', 'portal', 'service', 'api',
    'engine', 'workflow', 'database', 'security', 'privacy', 'compliance', 'audit', 'requirement',
    'requirements', 'verification', 'validation', 'deployment', 'microservice', 'microservices',
    'monitoring', 'alert', 'alerts', 'analytics', 'record', 'records', 'appointment', 'appointments',
    'stable', 'uncertainty', 'approvals', 'risk', 'testing', 'sensor', 'device', 'automated'
  ]);

  const hasContext = words.some((w) => validKeywords.has(w));
  if (!hasContext) {
    return {
      isValid: false,
      reason: 'Input rejected: Description does not appear to describe a hospital or software engineering system.'
    };
  }

  return { isValid: true };
}
