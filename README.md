# MedSpec AI — Hospital Multi-Agent Requirements Engineering & SDLC Platform

An Agentic AI platform tailored for the **Hospital & Healthcare Industry** that automates:
1. **Requirements Engineering (RE)**: Extracts structured Functional & Non-Functional Requirements grounded in healthcare standards (**HIPAA, NABH 5th Ed., ABDM/DPDP Act 2023, HL7 FHIR R4, DICOM, DEA EPCS, IEC 62304**), audits ambiguities and stakeholder conflicts, and generates an IEEE 830 SRS, Risk Register, and Traceability Matrix.
2. **Hybrid SDLC Selection & Workflow Architecture**: Evaluates 8 clinical project factors using **Multi-Criteria Decision Analysis (MCDA) + 6 Deterministic Rules**, ranks all 6 SDLC models, supports live interactive factor tuning, and synthesizes a 5-phase hospital SDLC workflow with clinical safety and compliance gates.

## Key Capabilities
- **PHI / PII Privacy Guardrail (`src/agents/privacyGuard.js`)**: Automatically masks patient MRN/UHID, emails, phone numbers, DOBs, and Aadhaar/SSN before inference, and blocks prompt-injection attempts.
- **Healthcare Regulatory RAG (`src/agents/knowledgeBase.js`)**: Versioned, jurisdiction-tagged regulatory clauses retrieved per scenario with citations (`KB-HIPAA-01`, `KB-NABH-01`, `KB-FHIR-01`, etc.) and confidence scores.
- **Optional Live Gemini LLM + Local RAG Fallback (`src/agents/requirementAgent.js`)**: Works immediately offline/without keys using the Local Healthcare RAG Engine, or paste a Gemini API key in the top bar to invoke `gemini-2.5-flash` grounded in the retrieved clauses.
- **Adaptive Clarification Interview (`src/agents/clarificationAgent.js`)**: Detects unstated hospital dimensions (bed scale, regulatory jurisdiction, ICU RTO/RPO, HL7/FHIR integration, release cadence) and dynamically refines requirements and SDLC scores when answered.
- **Human-in-the-Loop (HITL) Governance & Audit Trail (`src/App.jsx`, `src/agents/orchestrator.js`)**: Approve or flag individual FRs/NFRs, record reviewer SDLC sign-off, inspect the live agent audit log, and export the complete IEEE 830 Hospital SRS (`.md`).

## How to Install Into Your Existing Vite + React Project
1. Unzip `hospital-re-sdlc-agent.zip`.
2. Copy `index.html`, `README.md`, `ARCHITECTURE.md`, `test_agents.mjs`, and the entire `src/` folder into your project root (overwriting the older files).
3. Delete the unused `src/App.css` file if it is still in your `src/` folder.
4. Run the verification suite and start the app:

```bash
node test_agents.mjs
npm run dev
```

## Quick Demo Script for Your Presentation
1. **Show Hospital Case Studies**: Click **Multi-Hospital EHR** and **Emergency Department (ED) Triage & ICU** to show how requirements, citations, conflicts, and SDLC recommendations change dynamically (`Agile–DevSecOps Hybrid` vs. `V-Model`).
2. **Test PHI Masking Live**: Type `Patient MRN-44921 email patient@hospital.org phone 9876543210` into the text box and click **Run Hospital AI Agents** to show the Privacy Guardrail redacting PHI before inference.
3. **Show Ambiguity & Conflict Detection**: Open the **Ambiguities & Conflicts** tab to show detected vague words and the *Emergency Access vs. Strict RBAC* conflict resolution.
4. **Show Adaptive Clarification + Live Sliders**: Answer a clarification question and click **Apply Clarifications & Re-Analyze**, then drag the **Technical Uncertainty** or **Formal Verification** slider to watch the MCDA ranking shift live.
5. **Show Human-in-the-Loop & SRS Export**: Click **Approve** on requirements, sign off on the SDLC, and click **Export IEEE 830 SRS (.md)**.
