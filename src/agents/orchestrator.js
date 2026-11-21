/**
 * Multi-Agent Hospital RE & SDLC Orchestrator
 * Coordinates:
 * 1. Privacy & Security Guardrail (PHI Masking + Prompt Injection Check)
 * 2. Healthcare RAG Knowledge Base Retrieval
 * 3. Agent 1: Requirement Extraction, Classification & Quality/Conflict Audit
 * 4. Adaptive Clarification & Interview Agent
 * 5. Agent 2: Hybrid MCDA + Deterministic SDLC Selection & Workflow Synthesis
 * 6. Full timestamped Audit Trail for Human-in-the-Loop governance
 */

import { maskSensitivePHI, validateHospitalScenario } from './privacyGuard.js';
import { RequirementAgent } from './requirementAgent.js';
import { SdlcAgent } from './sdlcAgent.js';
import { ClarificationAgent } from './clarificationAgent.js';

export class AgentOrchestrator {
  constructor() {
    this.requirementAgent = new RequirementAgent();
    this.sdlcAgent = new SdlcAgent();
    this.clarificationAgent = new ClarificationAgent();
  }

  async runPipeline(rawScenarioText, options = {}) {
    const {
      stakeholderRole = 'cmo',
      clarificationAnswers = {},
      customFactors = {},
      apiKey = '',
      uploadedDocName = ''
    } = options;

    const logs = [];
    const addLog = (agent, phase, message, status = 'ok') => {
      logs.push({
        id: `log-${logs.length + 1}`,
        timestamp: new Date().toLocaleTimeString(),
        agent,
        phase,
        message,
        status
      });
    };

    // Step 1: Privacy Guardrail — PHI/PII Masking before any LLM or agent sees the text
    const phiResult = maskSensitivePHI(rawScenarioText);
    if (phiResult.totalRedacted > 0) {
      const typesSummary = phiResult.redactions.map((r) => `${r.count}x ${r.type}`).join(', ');
      addLog(
        'Privacy & Security Guard',
        'PHI Redaction',
        `Masked ${phiResult.totalRedacted} sensitive PHI/PII token(s) (${typesSummary}) before agent processing.`,
        'warn'
      );
    } else {
      addLog('Privacy & Security Guard', 'PHI Redaction', 'Scanned input for PHI/PII identifiers (MRN, email, phone, Gov ID, DOB): 0 raw identifiers exposed.');
    }

    // Step 2: Prompt Injection & Domain Validation
    const validation = validateHospitalScenario(phiResult.maskedText);
    if (!validation.isValid) {
      addLog('Coordinator Agent', 'Security & Validation Gate', validation.reason, 'error');
      const err = new Error(validation.reason);
      err.logs = logs;
      throw err;
    }
    addLog(
      'Coordinator Agent',
      'Input Validation',
      `Validated hospital specification${uploadedDocName ? ` (+ attached file: ${uploadedDocName})` : ''} for stakeholder role: ${stakeholderRole.toUpperCase()}.`
    );

    // Step 3: Agent 1 — RAG Retrieval + Requirement Extraction + Quality & Conflict Audit
    const requirementResult = await this.requirementAgent.analyzeScenario(phiResult.maskedText, {
      stakeholderRole,
      clarificationAnswers,
      apiKey
    });

    addLog(
      'Healthcare RAG Retriever',
      'Knowledge Grounding',
      `Retrieved ${requirementResult.retrievedKnowledge.length} versioned regulatory clauses (${requirementResult.metrics.regulatoryStandardsMapped.join(', ')}).`
    );

    if (requirementResult.llmWarning) {
      addLog('Requirement Extraction Agent', 'LLM Fallback', requirementResult.llmWarning, 'warn');
    }

    addLog(
      'Requirement Extraction Agent',
      'Extraction & Classification',
      `Generated ${requirementResult.functionalRequirements.length} FRs & ${requirementResult.nonFunctionalRequirements.length} NFRs via ${requirementResult.generationMode} (Avg Confidence: ${Math.round(requirementResult.metrics.averageConfidence * 100)}%).`
    );

    addLog(
      'Quality & Conflict Agent',
      'IEEE 830 Audit',
      `Quality Score: ${requirementResult.qualityReport.overallScore}/100. Found ${requirementResult.qualityReport.ambiguities.length} vague term(s) and ${requirementResult.qualityReport.conflicts.length} potential stakeholder conflict(s).`,
      requirementResult.qualityReport.conflicts.length > 0 ? 'warn' : 'ok'
    );

    // Step 4: Adaptive Clarification Agent
    const clarifications = this.clarificationAgent.generateClarifications(phiResult.maskedText, stakeholderRole);
    const answeredCount = Object.keys(clarificationAnswers).length;
    addLog(
      'Clarification Interview Agent',
      'Gap Analysis',
      `Prepared ${clarifications.length} hospital clarification prompt(s) (${answeredCount} answered by stakeholder).`
    );

    // Step 5: Agent 2 — Hybrid MCDA + Deterministic SDLC Engine
    const sdlcResult = this.sdlcAgent.evaluateSDLC(requirementResult, customFactors, clarificationAnswers);
    addLog(
      'SDLC Selection Agent',
      'MCDA & Rule Engine',
      `Ranked 6 SDLC models across 8 hospital factors. Top recommendation: ${sdlcResult.recommendedModel} (${sdlcResult.suitabilityScore}).`
    );

    addLog(
      'Human-in-the-Loop Gate',
      'Awaiting Sign-Off',
      'Pipeline complete. Requirements and SDLC blueprint are ready for clinician & compliance officer review.'
    );

    return {
      phiResult,
      requirementResult,
      sdlcResult,
      clarifications,
      logs
    };
  }
}
