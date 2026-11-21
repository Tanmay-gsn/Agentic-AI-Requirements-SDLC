# System Architecture — MedSpec AI (Hospital RE & SDLC Platform)

**Domain:** Hospital & Healthcare Software Engineering  
**Standards:** IEEE 830 (SRS), ISO/IEC 25010, HIPAA Security/Privacy Rules, NABH 5th Edition, ABDM/DPDP Act 2023, HL7 FHIR R4, IEC 62304  

## 1. Multi-Agent Pipeline Overview
Every request passes through `AgentOrchestrator.runPipeline()` in `src/agents/orchestrator.js`:

1. **Privacy & Security Guardrail (`src/agents/privacyGuard.js`)**: Masks raw PHI/PII tokens (MRN/UHID, emails, phone numbers, DOBs, Aadhaar/SSN) and blocks prompt-injection patterns before any agent or LLM processes the text.
2. **Healthcare RAG Retriever (`src/agents/knowledgeBase.js`)**: Scores and retrieves versioned regulatory clauses with jurisdiction metadata, clause IDs, and confidence scores.
3. **Agent 1 — Hospital Requirements & Quality Engineer (`src/agents/requirementAgent.js`)**: Extracts structured FRs/NFRs (either via live `gemini-2.5-flash` grounded in RAG context when an API key is supplied, or via the Local Healthcare RAG Engine), runs IEEE 830 ambiguity and conflict audits, and builds the Risk Register and Traceability Matrix.
4. **Adaptive Clarification Agent (`src/agents/clarificationAgent.js`)**: Identifies missing hospital constraints (bed capacity, compliance regime, clinical RTO/RPO, HL7/FHIR integration, release cadence) and feeds stakeholder answers back into Agent 1 and Agent 2.
5. **Agent 2 — Hospital SDLC Architect (`src/agents/sdlcAgent.js`)**: Extracts 8 quantitative factors, evaluates 6 candidate SDLC models via weighted MCDA + 6 deterministic rules, supports live slider tuning in `src/App.jsx`, and generates a 5-phase hospital SDLC workflow.
6. **Human-in-the-Loop (HITL) Governance & Exporter (`src/App.jsx`, `src/utils/srsExporter.js`)**: Captures per-requirement Approve/Flag decisions, reviewer SDLC sign-off, and timestamped audit logs, exporting everything into an IEEE 830 Markdown SRS.

## 2. File Structure
| Path | Responsibility |
|---|---|
| `src/App.jsx` | Interactive React UI: Stakeholder role selector, file upload, optional Gemini API key, PHI banner, Clarification Q&A, tabbed Agent 1 workspace, interactive MCDA sliders, HITL sign-off, and Audit Trail |
| `src/agents/orchestrator.js` | Central multi-agent coordinator and timestamped audit logger |
| `src/agents/privacyGuard.js` | PHI/PII redaction regex engine + prompt-injection & domain validator |
| `src/agents/knowledgeBase.js` | Versioned healthcare regulatory clauses + local RAG retriever + stakeholder roles |
| `src/agents/requirementAgent.js` | Live Gemini LLM + Local RAG requirement extraction, ambiguity/conflict audit, Risk Register, and RTM |
| `src/agents/clarificationAgent.js` | Hospital-specific adaptive gap analysis and interview prompts |
| `src/agents/sdlcAgent.js` | 8-factor MCDA + 6 deterministic rules + 5-phase hospital SDLC workflows |
| `src/agents/presets.js` | 5 Hospital case studies + 6 Hospital SDLC rule verification scenarios |
| `src/utils/srsExporter.js` | IEEE 830 Hospital SRS & Audit Trail Markdown exporter |
| `test_agents.mjs` | Automated Node.js verification test suite |
