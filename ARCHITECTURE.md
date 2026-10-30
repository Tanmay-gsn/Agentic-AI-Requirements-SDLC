# System Architecture & UML Specification

**Project:** Dual-Agent AI System: Requirements & SDLC Identification  
**Architectural Baseline:** Multi-Agent Expert System / Decision Support Architecture  
**Standards Conformance:** IEEE 830 (SRS), ISO/IEC 25010 (Software Quality), Multi-Criteria Decision Analysis (MCDA)  
**Document Version:** 1.0.0  

---

## Table of Contents
1. [Executive Architectural Summary](#1-executive-architectural-summary)
2. [Architectural Principles & Design Patterns](#2-architectural-principles--design-patterns)
3. [System Component & Package Architecture (UML Component Diagram)](#3-system-component--package-architecture)
4. [Static Object Model (UML Class Diagram)](#4-static-object-model-uml-class-diagram)
5. [Dynamic Interaction & Pipeline Execution (UML Sequence Diagram)](#5-dynamic-interaction--pipeline-execution-uml-sequence-diagram)
6. [Decision Logic & MCDA Engine (UML Activity Diagram)](#6-decision-logic--mcda-engine-uml-activity-diagram)
7. [System Lifecycle & State Transitions (UML State Machine Diagram)](#7-system-lifecycle--state-transitions-uml-state-machine-diagram)
8. [Data Models & Data Dictionary](#8-data-models--data-dictionary)
9. [Verification, Validation & Quality Metrics](#9-verification-validation--quality-metrics)

---

## 1. Executive Architectural Summary

The **Dual-Agent AI Requirements & SDLC System** is a deterministic, rule-informed agentic application engineered to solve two fundamental software engineering lifecycle tasks:
1. **Task (i) — Software Requirements Elicitation & Analysis (Agent 1: `RequirementAgent`)**:
   Transforms raw, unstructured natural-language problem statements into structured, testable, and prioritized specifications. It produces atomic **Functional Requirements (FR)**, **Non-Functional Requirements (NFR)** mapped across critical quality attributes (Performance, Security, Reliability, Maintainability), an **IEEE 830 Traceability Matrix**, and an automated **Quality & Ambiguity Audit**.
2. **Task (ii) — Life Cycle Model Selection & Workflow Architecture (Agent 2: `SdlcAgent`)**:
   Applies **Multi-Criteria Decision Analysis (MCDA)** across 8 quantitative project dimensions to evaluate, score, and rank 6 candidate lifecycle models (*Waterfall, V-Model, Spiral Model, Agile (Scrum), DevSecOps, and Agile–DevSecOps Hybrid*). It enforces deterministic industry rules and synthesizes an actionable, 5-phase project execution roadmap with security checkpoints, compliance gates, deliverables, and role assignments.

Complementing these two core agents are:
- **`ClarificationAgent`**: Proactively detects unstated dimensions (e.g., peak TPS, disaster recovery tolerance, statutory jurisdictions) and constructs structured interview prompts.
- **`AgentOrchestrator`**: Coordinates pipeline synchronization, input validation guardrails, telemetry logging, and shared-state handoffs.
- **`srsExporter`**: Compiles multi-agent outputs into an IEEE 830 compliant markdown Software Requirements Specification (SRS).

---

## 2. Architectural Principles & Design Patterns

The architecture incorporates industry-standard software engineering patterns:

| Pattern / Principle | Application in System | Purpose |
|---|---|---|
| **Pipes and Filters / Pipeline** | `AgentOrchestrator.runPipeline()` | Linear execution pipeline where input validation feeds Agent 1, whose output feeds Clarification and Agent 2 sequentially. |
| **Strategy & MCDA Pattern** | `SdlcAgent._performMCDA()` | Decouples lifecycle scoring algorithms and weighting formulas from model definitions, enabling dynamic factor adjustment. |
| **Deterministic Rule Engine** | Specification rule matching in `SdlcAgent` | Guarantees reproducible, formal decisions for established engineering axioms (e.g. strict V&V requires V-Model; regulated evolving scope requires DevSecOps Hybrid). |
| **Fail-Fast Input Guardrail** | `validateScenario()` in `requirementAgent.js` | Rejects non-software prompts, vulgarity, and insufficient tokens before invoking downstream analysis engines (no default fallbacks). |
| **Traceability Matrix Pattern** | `traceabilityMatrix` generation | Maps each functional and non-functional requirement forward to verification stages and regulatory frameworks according to IEEE 830. |
| **Presenter / Single-Page Architecture** | `App.jsx` + React 19 + Tailwind CSS | High-speed, client-side rendering with real-time MCDA factor overrides and responsive SRS generation without server roundtrips. |

---

## 3. System Component & Package Architecture

The system is organized into distinct structural tiers, maintaining separation of concerns between user interaction, multi-agent orchestration, core elicitation and scoring engines, and regulatory knowledge bases.

```mermaid
flowchart TD
    subgraph PresentationTier["Presentation Tier (Client-Side / React 19)"]
        UI["App.jsx (Main Dashboard View)"]
        Controls["Factor Slider Controls & Scenario Presets"]
        LogViewer["Multi-Agent Pipeline Telemetry Log"]
    end

    subgraph OrchestrationTier["Orchestration & Coordination Tier"]
        Orch["AgentOrchestrator<br/>(orchestrator.js)"]
        Validator["Input Validation & Guardrail Engine<br/>(validateScenario)"]
    end

    subgraph AgentTier["Autonomous Agent Tier"]
        Agent1["Agent 1: RequirementAgent<br/>(requirementAgent.js)<br/>• Domain Classifier<br/>• FR/NFR Extractor<br/>• IEEE 830 RTM Generator<br/>• Quality Auditor"]
        Agent2["Agent 2: SdlcAgent<br/>(sdlcAgent.js)<br/>• 8-Factor Normalizer<br/>• MCDA Scoring Engine<br/>• Deterministic Rule Matcher<br/>• 5-Phase Workflow Synthesizer"]
        AgentClar["ClarificationAgent<br/>(clarificationAgent.js)<br/>• Gap Analysis<br/>• Adaptive Interview Prompts"]
    end

    subgraph KnowledgeTier["Knowledge Base & Presets Tier"]
        KB["knowledgeBase.js<br/>• PCI-DSS v4.0<br/>• RBI Cyber Security<br/>• GDPR & HIPAA<br/>• ISO 27001 / ISO 25010"]
        Presets["presets.js<br/>• FinTech & Core Banking<br/>• HealthTech EHR<br/>• E-Commerce & Proctoring"]
    end

    subgraph ExportTier["Documentation & Delivery Tier"]
        SRSExp["srsExporter.js<br/>(IEEE 830 SRS Document Exporter)"]
    end

    UI -->|"User Trigger / Slider Overrides"| Orch
    Controls -->|"Supplies MCDA Custom Weights"| Orch
    Orch -->|"1. Validate & Sanitize"| Validator
    Orch -->|"2. Elicit Requirements"| Agent1
    Orch -->|"3. Identify Ambiguities"| AgentClar
    Orch -->|"4. Execute MCDA Selection"| Agent2
    Agent1 -.->|"References Regulatory Requirements"| KB
    Agent2 -.->|"References Lifecycle Characteristics"| KB
    Presets -.->|"Supplies Pre-built Context"| UI
    Agent1 -->|"Pipes RequirementResult"| Agent2
    Orch -->|"Broadcasts Telemetry"| LogViewer
    UI -->|"Triggers Export"| SRSExp
    SRSExp -.->|"Assembles Synthesized SRS Markdown"| UI
```

---

## 4. Static Object Model (UML Class Diagram)

The class diagram below illustrates the system's object-oriented structure, class attributes, method signatures, data entities, and inter-class associations.

```mermaid
classDiagram
    direction TB

    class AgentOrchestrator {
        +RequirementAgent requirementAgent
        +SdlcAgent sdlcAgent
        +ClarificationAgent clarificationAgent
        +runPipeline(scenarioText: string, customFactors: object, onLogUpdate: function) Promise~PipelineResult~
    }

    class RequirementAgent {
        +string name
        +identifyRequirements(scenario: string) RequirementResult
        +analyzeScenario(scenario: string) Promise~RequirementResult~
    }

    class SdlcAgent {
        +string name
        +evaluateSDLC(arg1: any, arg2: any, arg3: any) SdlcResult
        +identifySDLC(arg1: any, arg2: any, arg3: any) SdlcResult
        -_processSDLC(scenario: string, reqData: RequirementResult, factors: object) SdlcResult
        -_extractFactors(text: string, reqData: RequirementResult, factors: object) MCDAFactors
        -_performMCDA(text: string, reqData: RequirementResult, factors: MCDAFactors) RankedModel[]
        -_generateWorkflowPhases(modelName: string, factors: MCDAFactors) WorkflowPhase[]
    }

    class ClarificationAgent {
        +string name
        +generateClarifications(scenarioText: string, domain: string) ClarificationQuestion[]
    }

    class InputValidator {
        <<utility>>
        +validateScenario(scenario: string) ValidationResult
    }

    class SRSExporter {
        <<utility>>
        +generateSRSMarkdown(title: string, scenarioText: string, reqResult: RequirementResult, sdlcResult: SdlcResult) string
    }

    class RequirementResult {
        +string scenario
        +string domain
        +FunctionalRequirement[] functionalRequirements
        +NonFunctionalRequirement[] nonFunctionalRequirements
        +number totalCount
        +Metrics metrics
        +QualityReport qualityReport
        +TraceabilityItem[] traceabilityMatrix
    }

    class FunctionalRequirement {
        +string id
        +string title
        +string category
        +string priority
        +string riskLevel
        +string sourceStakeholder
        +string statement
        +string userStory
        +string[] acceptanceCriteria
        +string businessJustification
        +string[] applicableRegulations
    }

    class NonFunctionalRequirement {
        +string id
        +string title
        +string category
        +string priority
        +string statement
        +string targetMetrics
        +string[] applicableRegulations
    }

    class SdlcResult {
        +string recommendedModel
        +number suitabilityScore
        +string justification
        +RankedModel primaryModel
        +RankedModel[] rankedRecommendations
        +MCDAFactors evaluatedFactors
        +KeyPhase[] keyPhases
        +WorkflowPhase[] projectWorkflow
        +AlternativeModel[] alternatives
    }

    class MCDAFactors {
        +number requirementStability
        +number changeFrequency
        +number regulatoryCriticality
        +number securityRisk
        +number technicalUncertainty
        +number failureConsequence
        +number continuousDeploymentNeed
        +number formalVerificationNeed
    }

    class WorkflowPhase {
        +number phaseNumber
        +string phaseName
        +string durationEstimate
        +string objective
        +string[] responsibleRoles
        +string[] activities
        +string[] deliverables
        +string[] securityControls
        +string complianceCheckpoints
        +string entryCriteria
        +string exitCriteria
    }

    class QualityReport {
        +number overallScore
        +string status
        +string testabilityRating
        +Ambiguity[] ambiguities
    }

    %% Associations and Dependencies
    AgentOrchestrator *-- RequirementAgent : contains
    AgentOrchestrator *-- SdlcAgent : contains
    AgentOrchestrator *-- ClarificationAgent : contains
    AgentOrchestrator ..> InputValidator : calls
    RequirementAgent ..> InputValidator : calls
    SdlcAgent ..> InputValidator : calls

    RequirementAgent ..> RequirementResult : produces
    RequirementResult *-- FunctionalRequirement : aggregates
    RequirementResult *-- NonFunctionalRequirement : aggregates
    RequirementResult *-- QualityReport : includes

    SdlcAgent ..> SdlcResult : produces
    SdlcResult *-- MCDAFactors : contains
    SdlcResult *-- WorkflowPhase : contains
    SdlcAgent ..> RequirementResult : consumes

    AgentOrchestrator ..> SRSExporter : utilizes
```

---

## 5. Dynamic Interaction & Pipeline Execution (UML Sequence Diagram)

The sequence diagram details the end-to-end runtime lifecycle: user interaction, multi-agent coordination, intermediate validation checks, and document generation.

```mermaid
sequenceDiagram
    autonumber
    actor User as Software Architect / Engineer
    participant UI as App.jsx (React Presentation)
    participant Orch as AgentOrchestrator
    participant Val as validateScenario() Guardrail
    participant ReqAgent as Agent 1: RequirementAgent
    participant ClarAgent as ClarificationAgent
    participant SdlcAgent as Agent 2: SdlcAgent (MCDA Engine)
    participant Exporter as srsExporter.js

    User->>UI: Selects Preset Scenario or types custom prompt
    opt User modifies MCDA tuning sliders
        User->>UI: Adjusts Stability, Risk, or Regulatory weights
    end
    UI->>Orch: runPipeline(scenarioText, customFactors, onLogUpdate)

    Orch->>Val: validateScenario(scenarioText)
    alt Invalid Input (Profanity, <3 tokens, non-software)
        Val-->>Orch: { isValid: false, reason: "..." }
        Orch-->>UI: Throws Error("Pipeline execution rejected")
        UI-->>User: Displays Error Alert (Rejection Guardrail)
    else Valid Software Scenario
        Val-->>Orch: { isValid: true }
    end

    Orch->>Orch: addLog("Coordinator Agent", "Initialization", "Validation Passed")
    
    %% Step 2: Agent 1 Execution
    Orch->>ReqAgent: analyzeScenario(scenarioText)
    Note over ReqAgent: 1. Detect Domain (FinTech, HealthCare, E-Commerce, etc.)<br/>2. Extract Atomic Functional Requirements (FR-01..n)<br/>3. Extract Non-Functional Requirements (NFR-01..n)<br/>4. Build IEEE 830 Traceability Matrix<br/>5. Formulate Quality & Testability Audit
    ReqAgent-->>Orch: Return RequirementResult

    Orch->>Orch: addLog("Requirement Extraction Agent", "Categorization", "Extracted FRs and NFRs")
    Orch->>Orch: addLog("Quality & Conflict Agent", "Quality Audit", "Audit Score 94/100")

    %% Step 3: Clarification Agent Execution
    Orch->>ClarAgent: generateClarifications(scenarioText, domain)
    Note over ClarAgent: Inspects gaps in Throughput (TPS),<br/>Statutory Jurisdiction, DR (RPO/RTO), and Cadence
    ClarAgent-->>Orch: Return ClarificationQuestion[]
    Orch->>Orch: addLog("Clarification Agent", "Adaptive Interview", "Generated follow-up prompts")

    %% Step 4: Agent 2 Execution
    Orch->>SdlcAgent: evaluateSDLC(RequirementResult, customFactors)
    Note over SdlcAgent: 1. Normalize 8 MCDA Dimensions (0-100)<br/>2. Compute weighted utility across 6 models<br/>3. Apply Deterministic Rule Overrides<br/>4. Rank models & construct primary rationale<br/>5. Synthesize 5-Phase Project Workflow
    SdlcAgent-->>Orch: Return SdlcResult

    Orch->>Orch: addLog("SDLC Selection Agent", "Workflow Synthesis", "Generated 5 Project Phases")
    Orch->>Orch: addLog("Coordinator Agent", "Orchestration Complete", "Ready for Human Review")

    Orch-->>UI: Return { requirementResult, sdlcResult, clarifications, logs }
    UI-->>User: Renders Dual-Agent Dashboard, Model Ranking & Workflow Timeline

    %% Step 5: Optional SRS Export
    opt User Requests Export
        User->>UI: Clicks "Download SRS Document" or "Copy SRS"
        UI->>Exporter: generateSRSMarkdown(title, scenarioText, reqResult, sdlcResult)
        Exporter-->>UI: Formatted IEEE 830 Markdown
        UI-->>User: Downloads .md file / Copies to clipboard
    end
```

---

## 6. Decision Logic & MCDA Engine (UML Activity Diagram)

The activity diagram depicts the internal decision-making process of **Agent 2 (`SdlcAgent`)**, showing how quantitative factors and deterministic specification rules resolve into the optimal SDLC model.

```mermaid
flowchart TD
    Start(["Input: Scenario Specification + RequirementResult"]) --> ExtractFactors["Extract & Clamp 8 Factors (Range: 0 - 100)<br/>Stability, ChangeFreq, Regulatory, Security, Uncertainty, FailureConsequence, DeployNeed, FormalVerif"]
    
    ExtractFactors --> CheckCustom{"User Defined Custom Overrides?"}
    CheckCustom -- Yes --> ApplyOverrides["Apply customFactors values"]
    CheckCustom -- No --> ApplyBaseline["Retain NLP Extracted Baseline"]
    
    ApplyOverrides --> CalcMCDA["Calculate Multi-Criteria Utility Formulation for all 6 Models"]
    ApplyBaseline --> CalcMCDA

    subgraph MCDAScoring["MCDA Weighted Multi-Criteria Utility Formulation"]
        W["Waterfall Score = (Stab × 0.38) + (Verif × 0.22) + ((100-Chg) × 0.25) + ((100-Unc) × 0.15)"]
        V["V-Model Score = (Verif × 0.38) + (Fail × 0.22) + (Reg × 0.18) + (Stab × 0.12) + ((100-Chg) × 0.10)"]
        S["Spiral Score = (Unc × 0.44) + (Fail × 0.24) + ((100-Stab) × 0.16) + (Chg × 0.16)"]
        A["Agile Score = (Chg × 0.42) + ((100-Stab) × 0.26) + (Deploy × 0.20) + ((100-Verif) × 0.12)"]
        D["DevSecOps Score = (Deploy × 0.38) + (Sec × 0.32) + (Chg × 0.18) + ((100-Stab) × 0.12)"]
        H["Hybrid Score = (Reg × 0.28) + (Sec × 0.24) + (Chg × 0.22) + (Deploy × 0.14) + (Verif × 0.12)"]
    end

    CalcMCDA --> MCDAScoring
    MCDAScoring --> RuleEngine{"Evaluate Deterministic Specification Rules"}

    RuleEngine -- "Stable reqs + Extensive approvals" --> RuleWaterfall["Trigger Rule 1: Set Waterfall = 96% (Top Rank)"]
    RuleEngine -- "Strict verification / validation" --> RuleVModel["Trigger Rule 2: Set V-Model = 96% (Top Rank)"]
    RuleEngine -- "High uncertainty / technical risk" --> RuleSpiral["Trigger Rule 3: Set Spiral Model = 96% (Top Rank)"]
    RuleEngine -- "Frequently changing requirements" --> RuleAgile["Trigger Rule 4: Set Agile = 95% (Top Rank)"]
    RuleEngine -- "Continuous secure deployment" --> RuleDevSecOps["Trigger Rule 5: Set DevSecOps = 96% (Top Rank)"]
    RuleEngine -- "High regulation + evolving requirements" --> RuleHybrid["Trigger Rule 6: Set Agile–DevSecOps Hybrid = 96% (Top Rank)"]
    RuleEngine -- "No specific rule triggered" --> StandardRank["Sort models by raw computed MCDA score"]

    RuleWaterfall --> AssembleRankings["Assemble & Sort rankedRecommendations (1 through 6)"]
    RuleVModel --> AssembleRankings
    RuleSpiral --> AssembleRankings
    RuleAgile --> AssembleRankings
    RuleDevSecOps --> AssembleRankings
    RuleHybrid --> AssembleRankings
    StandardRank --> AssembleRankings

    AssembleRankings --> SynthesizePhases["Synthesize 5 Project-Specific Workflow Phases<br/>(Activities, Deliverables, Security Gates, Entry/Exit Criteria)"]
    SynthesizePhases --> OutputResult(["Return SdlcResult"])
```

---

## 7. System Lifecycle & State Transitions (UML State Machine Diagram)

The state machine outlines the lifecycle of a scenario analysis within the application runtime.

```mermaid
stateDiagram-v2
    [*] --> Idle : Application Initialized

    Idle --> ValidatingInput : User selects preset or clicks 'Run Analysis'
    
    state ValidatingInput {
        [*] --> SanitizingInput
        SanitizingInput --> ProfanityCheck
        ProfanityCheck --> TokenCountCheck
        TokenCountCheck --> DomainKeywordCheck
        DomainKeywordCheck --> [*]
    }

    ValidatingInput --> Rejected : Validation Failed (Profanity / Non-Software / Too Brief)
    Rejected --> Idle : Error displayed on UI; await corrected input

    ValidatingInput --> RequirementsElicitation : Validation Passed

    state RequirementsElicitation {
        [*] --> ClassifyDomain
        ClassifyDomain --> ExtractFunctionalReqs
        ExtractFunctionalReqs --> ExtractNonFunctionalReqs
        ExtractNonFunctionalReqs --> GenerateTraceabilityMatrix
        GenerateTraceabilityMatrix --> AuditQualityAndAmbiguity
        AuditQualityAndAmbiguity --> [*]
    }

    RequirementsElicitation --> ClarificationInterview : RequirementResult Generated

    state ClarificationInterview {
        [*] --> InspectThroughputGap
        InspectThroughputGap --> InspectRegulatoryGap
        InspectRegulatoryGap --> InspectDRGap
        InspectDRGap --> InspectCadenceGap
        InspectCadenceGap --> [*]
    }

    ClarificationInterview --> SDLCAnalysis : Gaps Identified

    state SDLCAnalysis {
        [*] --> FactorExtraction
        FactorExtraction --> MCDAUtilityComputation
        MCDAUtilityComputation --> DeterministicRuleOverride
        DeterministicRuleOverride --> ModelRanking
        ModelRanking --> WorkflowPhaseSynthesis
        WorkflowPhaseSynthesis --> [*]
    }

    SDLCAnalysis --> SynthesisComplete : SdlcResult Formulated
    
    SynthesisComplete --> Idle : Modify Input or Switch Preset
    SynthesisComplete --> ExportingSRS : User triggers 'Download SRS' or 'Copy SRS'
    
    ExportingSRS --> SynthesisComplete : Markdown File Streamed / Copied
```

---

## 8. Data Models & Data Dictionary

### 8.1 Functional Requirement (`FR`) Data Schema
Each functional requirement generated by Agent 1 follows this schema:
```typescript
interface FunctionalRequirement {
  id: string;                      // e.g. "FR-01", "FR-02"
  title: string;                   // Concise functional name
  category: string;                // e.g. "Authentication", "Core Processing"
  priority: "High" | "Medium" | "Low";
  riskLevel: "Critical" | "High" | "Medium" | "Low";
  sourceStakeholder: string;       // Originating stakeholder persona
  statement: string;               // Formal IEEE 830 requirement statement
  userStory: string;               // Agile user story format: "As a... I want... So that..."
  acceptanceCriteria: string[];    // Verifiable Gherkin/acceptance bullet points
  businessJustification: string;   // Economic or strategic rationale
  applicableRegulations: string[]; // e.g. ["PCI-DSS Req 8.3", "RBI 2FA Mandate"]
}
```

### 8.2 Non-Functional Requirement (`NFR`) Data Schema
```typescript
interface NonFunctionalRequirement {
  id: string;                      // e.g. "NFR-01", "NFR-02"
  title: string;                   // e.g. "Data Encryption & Key Management"
  category: "Security" | "Performance" | "Availability" | "Auditability" | "Maintainability";
  priority: "Critical" | "High" | "Medium";
  statement: string;               // Formal constraint specification
  targetMetrics: string;           // Quantifiable target (e.g. "P99 < 800ms; 99.99% uptime")
  applicableRegulations: string[]; // e.g. ["PCI-DSS", "ISO 27001"]
}
```

### 8.3 The 8 MCDA Project Dimensions
Agent 2 scores project suitability across 8 normalized dimensions (0 to 100):
1. **`requirementStability`**: Extent to which requirements are fully specified and static versus evolving.
2. **`changeFrequency`**: Anticipated frequency of scope adjustments, sprint iterations, or feature pivots.
3. **`regulatoryCriticality`**: Degree of statutory governance (PCI-DSS, RBI, HIPAA, GDPR, FDA).
4. **`securityRisk`**: Exposure to financial transactions, sensitive PII/PHI, or external threats.
5. **`technicalUncertainty`**: Degree of novel research, unproven third-party algorithms, or hardware risk.
6. **`failureConsequence`**: Severity of system failure (loss of life, critical financial loss, reputational catastrophe).
7. **`continuousDeploymentNeed`**: Urgency of canary releases, automated CI/CD pipelines, and fast time-to-market.
8. **`formalVerificationNeed`**: Requirement for mathematical proof, bilateral V&V, and exhaustive audit traceability.

### 8.4 Candidate SDLC Models Evaluated
1. **Waterfall**: Linear-sequential life cycle with strict phase gate sign-offs.
2. **V-Model**: Bilateral verification and validation lifecycle with direct phase-to-testing tier mapping.
3. **Spiral Model**: Risk-driven iterative lifecycle focusing on repeated prototyping and risk mitigation loops.
4. **Agile (Scrum)**: Iterative, sprint-based delivery maximizing responsiveness to changing product backlogs.
5. **DevSecOps**: Automated CI/CD pipeline model embedding security-as-code and continuous deployment gates.
6. **Agile–DevSecOps Hybrid**: Balanced enterprise model combining iterative sprint agility with formal continuous compliance and security gates.

---

## 9. Verification, Validation & Quality Metrics

The system enforces automated verification via `test_agents.mjs`:
- **Deterministic Specification Tests**: Validates that standard industry scenarios trigger expected models with 100% precision.
- **Fail-Fast Rejection Tests**: Ensures that vulgar inputs, non-software sentences, and trivial strings are formally rejected by both agents without fallback to Agile.
- **IEEE 830 Conformance Check**: Confirms that generated SRS files include complete requirement breakdowns, MCDA rankings, RTM matrices, and executive sign-off blocks.

