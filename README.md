# MedSpec AI — Hospital Requirements Engineering & SDLC Selection Platform

An Agentic AI platform tailored for the **Hospital & Healthcare sector** that automates software requirements elicitation, compliance analysis, quality auditing, and hybrid Software Development Life Cycle (SDLC) selection.

## Overview
Gathering software requirements in hospitals is complex because clinical workflows involve strict patient-safety constraints, diverse stakeholders (physicians, nurses, IT architects, compliance officers), and overlapping healthcare regulations. MedSpec AI coordinates specialized agents to transform unstructured clinical scenarios or stakeholder documents into IEEE 830–aligned specifications and a justified, project-specific SDLC workflow.

## Core Capabilities
- **PHI / PII Privacy Guardrail:** Automatically detects and redacts sensitive patient identifiers (MRN/UHID, emails, phone numbers, DOBs, government IDs) before inference, and blocks prompt-injection attempts.
- **Healthcare Regulatory RAG:** Retrieves versioned, jurisdiction-tagged clauses from a healthcare knowledge base (**HIPAA, NABH 5th Edition, ABDM/DPDP Act 2023, HL7 FHIR R4, DICOM, DEA EPCS, IEC 62304, ISO 25010**) to ground requirements with citations and confidence scores.
- **Hybrid Requirements Extraction & Quality Audit (Agent 1):** Supports optional live `gemini-2.5-flash` LLM inference (via user-provided API key) alongside a local RAG-grounded engine. Produces Functional Requirements (FR), Non-Functional Requirements (NFR), ambiguity checks, stakeholder conflict detection, a Clinical Risk Register, and an IEEE 830 Requirements Traceability Matrix (RTM).
- **Adaptive Clarification Interviews:** Identifies unstated hospital constraints (bed capacity, regulatory jurisdiction, clinical RTO/RPO, interoperability, release cadence) and dynamically updates requirements and SDLC scores when answered.
- **Hybrid MCDA SDLC Selection (Agent 2):** Evaluates 8 quantitative clinical project factors using Multi-Criteria Decision Analysis (MCDA) and 6 deterministic rules to rank 6 SDLC models (*Waterfall, V-Model, Spiral, Agile, DevSecOps, Agile–DevSecOps Hybrid*), with live interactive factor sliders and 5-phase hospital workflows.
- **Human-in-the-Loop (HITL) Governance & SRS Export:** Supports per-requirement approval/flagging, reviewer SDLC sign-off, a live agent audit trail, and one-click export to an IEEE 830 Markdown SRS.

## Tech Stack
- **Frontend:** React, Vite, Lucide Icons, Custom CSS
- **Agent & Decision Layer:** Modular ES6 JavaScript (Orchestrator, Privacy Guard, Local RAG Retriever, Requirement Agent, Clarification Agent, MCDA SDLC Agent)
- **Optional LLM Integration:** Google Gemini API (`gemini-2.5-flash`)
- **Testing:** Node.js built-in test assertions (`node:assert/strict`)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Open the local URL shown in the terminal (typically `http://localhost:5173/`).

### Run Automated Verification Tests
```bash
node test_agents.mjs
```

### Optional: Enable Live Gemini LLM Mode
By default, the application runs using the built-in Local Healthcare RAG Engine with no external API key required. To enable live LLM-powered extraction, click **Optional Gemini API Key** in the top bar and paste a valid Gemini API key (held in browser session memory only).

## Project Structure
```text
├── index.html
├── ARCHITECTURE.md
├── README.md
├── test_agents.mjs
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── agents/
    │   ├── orchestrator.js        # Central multi-agent pipeline & audit logger
    │   ├── privacyGuard.js        # PHI/PII masking & prompt-injection guardrail
    │   ├── knowledgeBase.js       # Versioned healthcare standards & RAG retriever
    │   ├── requirementAgent.js    # Agent 1: FR/NFR extraction, quality & conflict audit
    │   ├── clarificationAgent.js  # Adaptive hospital interview gap analysis
    │   ├── sdlcAgent.js           # Agent 2: 8-factor MCDA & 6-model SDLC engine
    │   └── presets.js             # Hospital case studies & SDLC rule profiles
    └── utils/
        └── srsExporter.js         # IEEE 830 Markdown SRS & audit trail exporter
```

## Documentation
See [ARCHITECTURE.md](ARCHITECTURE.md) for the detailed pipeline architecture and module responsibilities.
