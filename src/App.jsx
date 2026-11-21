import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Shield,
  Sliders,
  ChevronDown,
  ChevronUp,
  Award,
  Upload,
  Key,
  Activity,
  MessageSquare,
  FileText,
  RefreshCw,
  CheckCircle,
  Flag
} from 'lucide-react';
import { AgentOrchestrator } from './agents/orchestrator.js';
import { SdlcAgent } from './agents/sdlcAgent.js';
import { HOSPITAL_PRESETS, HOSPITAL_SDLC_EXAMPLES } from './agents/presets.js';
import { STAKEHOLDER_ROLES } from './agents/knowledgeBase.js';
import { generateSRSMarkdown } from './utils/srsExporter.js';

const orchestrator = new AgentOrchestrator();
const liveSdlcAgent = new SdlcAgent();

const FACTOR_LABELS = [
  { key: 'requirementStability', label: 'Requirement Stability' },
  { key: 'changeFrequency', label: 'Change Frequency' },
  { key: 'regulatoryCriticality', label: 'Regulatory Criticality' },
  { key: 'securityRisk', label: 'Security & ePHI Risk' },
  { key: 'technicalUncertainty', label: 'Technical Uncertainty' },
  { key: 'failureConsequence', label: 'Clinical Failure Impact' },
  { key: 'continuousDeploymentNeed', label: 'Continuous Deployment' },
  { key: 'formalVerificationNeed', label: 'Formal Verification (V&V)' }
];

export default function App() {
  const initialPreset = HOSPITAL_PRESETS[0];

  const [scenarioInput, setScenarioInput] = useState(initialPreset.scenarioDescription);
  const [scenarioTitle, setScenarioTitle] = useState(initialPreset.title);
  const [stakeholderRole, setStakeholderRole] = useState(initialPreset.defaultRole || 'cmo');
  const [apiKey, setApiKey] = useState('');
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [uploadedDocName, setUploadedDocName] = useState('');

  const [presetTab, setPresetTab] = useState('hospital'); // 'hospital' | 'rules'
  const [agent1Tab, setAgent1Tab] = useState('reqs'); // 'reqs' | 'quality' | 'rtm'
  const [expandedModelId, setExpandedModelId] = useState(null);

  const [pipelineResult, setPipelineResult] = useState(null);
  const [clarificationAnswers, setClarificationAnswers] = useState({});
  const [approvalMap, setApprovalMap] = useState({});
  const [reviewerName, setReviewerName] = useState('Dr. A. Sharma');
  const [sdlcSignOff, setSdlcSignOff] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);

  const executePipeline = async ({
    text = scenarioInput,
    title = scenarioTitle,
    role = stakeholderRole,
    answers = clarificationAnswers,
    factors = {},
    docName = uploadedDocName
  } = {}) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await orchestrator.runPipeline(text, {
        stakeholderRole: role,
        clarificationAnswers: answers,
        customFactors: factors,
        apiKey,
        uploadedDocName: docName
      });
      setPipelineResult(result);
      setScenarioTitle(title);
      setApprovalMap({});
      setSdlcSignOff(null);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to process this hospital scenario.');
      setPipelineResult((prev) => (err.logs ? { ...(prev || {}), logs: err.logs, failed: true } : null));
    } finally {
      setIsProcessing(false);
    }
  };

  // Run initial Hospital EHR case study on first load
  useEffect(() => {
    executePipeline({
      text: initialPreset.scenarioDescription,
      title: initialPreset.title,
      role: initialPreset.defaultRole,
      factors: initialPreset.defaultFactors
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectHospitalPreset = (preset) => {
    setScenarioInput(preset.scenarioDescription);
    setStakeholderRole(preset.defaultRole || 'cmo');
    setClarificationAnswers({});
    setUploadedDocName('');
    executePipeline({
      text: preset.scenarioDescription,
      title: preset.title,
      role: preset.defaultRole || 'cmo',
      answers: {},
      factors: preset.defaultFactors
    });
  };

  const handleSelectRuleExample = (spec) => {
    setScenarioInput(spec.scenario);
    setClarificationAnswers({});
    setUploadedDocName('');
    executePipeline({
      text: spec.scenario,
      title: spec.title,
      role: stakeholderRole,
      answers: {},
      factors: {}
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = String(ev.target?.result || '').trim();
      if (content) {
        const merged = `${scenarioInput.trim()}\n\n[Uploaded Document: ${file.name}]\n${content.slice(0, 3000)}`;
        setScenarioInput(merged);
        setUploadedDocName(file.name);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSliderChange = (factorKey, newValue) => {
    if (!pipelineResult?.requirementResult || !pipelineResult?.sdlcResult) return;
    const updatedFactors = {
      ...pipelineResult.sdlcResult.evaluatedFactors,
      [factorKey]: Number(newValue),
      _fromSlider: true
    };
    const updatedSdlc = liveSdlcAgent.evaluateSDLC(
      pipelineResult.requirementResult,
      updatedFactors,
      clarificationAnswers
    );
    setPipelineResult((prev) => ({
      ...prev,
      sdlcResult: updatedSdlc
    }));
    setSdlcSignOff(null);
  };

  const handleRequirementDecision = (reqId, status) => {
    setApprovalMap((prev) => ({ ...prev, [reqId]: status }));
    setPipelineResult((prev) => {
      if (!prev) return prev;
      const newLog = {
        id: `hitl-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Human-in-the-Loop Gate',
        phase: 'Requirement Review',
        message: `${reviewerName || 'Reviewer'} marked ${reqId} as "${status}".`,
        status: status === 'Flagged for Revision' ? 'warn' : 'ok'
      };
      return { ...prev, logs: [...(prev.logs || []), newLog] };
    });
  };

  const handleSdlcSignOff = (status) => {
    const roleLabel = STAKEHOLDER_ROLES.find((r) => r.id === stakeholderRole)?.label || stakeholderRole;
    const record = {
      status,
      reviewer: reviewerName.trim() || 'Authorized Hospital Reviewer',
      role: roleLabel,
      timestamp: new Date().toLocaleTimeString()
    };
    setSdlcSignOff(record);
    setPipelineResult((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        logs: [
          ...(prev.logs || []),
          {
            id: `sdlc-hitl-${Date.now()}`,
            timestamp: record.timestamp,
            agent: 'Human-in-the-Loop Gate',
            phase: 'SDLC Sign-Off',
            message: `${record.reviewer} (${record.role}) marked SDLC "${prev.sdlcResult.recommendedModel}" as ${status}.`,
            status: status === 'Approved' ? 'ok' : 'warn'
          }
        ]
      };
    });
  };

  const handleExportSRS = () => {
    if (!pipelineResult?.requirementResult || !pipelineResult?.sdlcResult) return;
    const md = generateSRSMarkdown({
      title: scenarioTitle,
      scenarioText: pipelineResult.phiResult?.maskedText || scenarioInput,
      phiResult: pipelineResult.phiResult,
      requirementResult: pipelineResult.requirementResult,
      sdlcResult: pipelineResult.sdlcResult,
      approvalMap,
      sdlcSignOff,
      auditLogs: pipelineResult.logs || []
    });
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Hospital_SRS_SDLC_${scenarioTitle.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    if (!pipelineResult?.requirementResult || !pipelineResult?.sdlcResult) return;
    const md = generateSRSMarkdown({
      title: scenarioTitle,
      scenarioText: pipelineResult.phiResult?.maskedText || scenarioInput,
      phiResult: pipelineResult.phiResult,
      requirementResult: pipelineResult.requirementResult,
      sdlcResult: pipelineResult.sdlcResult,
      approvalMap,
      sdlcSignOff,
      auditLogs: pipelineResult.logs || []
    });
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reqData = pipelineResult?.requirementResult;
  const sdlcData = pipelineResult?.sdlcResult;
  const clarifications = pipelineResult?.clarifications || [];
  const phiResult = pipelineResult?.phiResult;
  const logs = pipelineResult?.logs || [];

  const approvedCount = Object.values(approvalMap).filter((v) => v === 'Approved').length;
  const totalReqs = (reqData?.functionalRequirements?.length || 0) + (reqData?.nonFunctionalRequirements?.length || 0);

  return (
    <div className="app-wrapper">
      {/* HEADER */}
      <header className="app-header">
        <div className="header-badge">
          <Sparkles size={14} /> MedSpec AI • Hospital Multi-Agent RE &amp; SDLC Platform
        </div>
        <h1>Hospital Requirements Engineering &amp; SDLC Architect</h1>
        <p>
          Agentic AI platform for <strong>Hospital &amp; Clinical Systems</strong> combining PHI Privacy Guardrails, Healthcare Compliance RAG (HIPAA / NABH / ABDM / HL7 FHIR), Adaptive Clarification, Hybrid MCDA SDLC Selection, and Human-in-the-Loop Governance.
        </p>
      </header>

      {/* STAKEHOLDER ROLE & OPTIONAL LIVE GEMINI API CONFIG */}
      <section className="config-strip">
        <div className="config-group">
          <span className="config-label">
            <Shield size={14} /> Stakeholder Role:
          </span>
          <select
            className="role-select"
            value={stakeholderRole}
            onChange={(e) => setStakeholderRole(e.target.value)}
          >
            {STAKEHOLDER_ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="config-group">
          <span className={`mode-pill ${apiKey.trim().length > 10 ? 'live' : ''}`}>
            {apiKey.trim().length > 10 ? 'Live Gemini LLM + RAG Ready' : 'Local Healthcare RAG Engine'}
          </span>
          <button
            type="button"
            className="sample-pill-btn"
            onClick={() => setShowApiConfig((v) => !v)}
          >
            <Key size={13} /> {showApiConfig ? 'Hide LLM Key' : 'Optional Gemini API Key'}
          </button>
          {showApiConfig && (
            <input
              type="password"
              className="api-input"
              placeholder="Paste Gemini API Key (optional)..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          )}
        </div>
      </section>

      {/* INPUT & DOCUMENT INGESTION CARD */}
      <section className="input-card">
        <div className="preset-tabs-header">
          <div className="tab-group">
            <button
              type="button"
              className={`preset-tab-btn ${presetTab === 'hospital' ? 'active' : ''}`}
              onClick={() => setPresetTab('hospital')}
            >
              Hospital Case Studies (5)
            </button>
            <button
              type="button"
              className={`preset-tab-btn ${presetTab === 'rules' ? 'active' : ''}`}
              onClick={() => setPresetTab('rules')}
            >
              Hospital SDLC Rule Profiles (6)
            </button>
          </div>

          <div className="config-group">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.csv,.json"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <button
              type="button"
              className="sample-pill-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={13} /> {uploadedDocName ? `Attached: ${uploadedDocName}` : 'Upload Transcript / Policy (.txt, .md)'}
            </button>
          </div>
        </div>

        <div className="sample-pills">
          {presetTab === 'hospital'
            ? HOSPITAL_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  className="sample-pill-btn"
                  onClick={() => handleSelectHospitalPreset(preset)}
                  title={preset.category}
                >
                  {preset.title.split('&')[0].trim()}
                </button>
              ))
            : HOSPITAL_SDLC_EXAMPLES.map((spec, idx) => (
                <button
                  type="button"
                  key={idx}
                  className="sample-pill-btn spec-rule-pill"
                  onClick={() => handleSelectRuleExample(spec)}
                  title={spec.title}
                >
                  {spec.label}
                </button>
              ))}
        </div>

        <textarea
          className="scenario-textarea"
          value={scenarioInput}
          onChange={(e) => setScenarioInput(e.target.value)}
          placeholder="Describe your hospital software module, clinical workflow, or paste stakeholder notes (Tip: include a sample MRN like MRN-44921 or email to test automatic PHI masking)..."
        />

        <div className="action-bar">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {scenarioInput.trim().length} characters • PHI/PII automatically masked before agent inference
          </span>

          <div className="config-group">
            {reqData && sdlcData && (
              <>
                <button type="button" className="sample-pill-btn" onClick={handleExportSRS}>
                  <Download size={14} /> Export IEEE 830 SRS (.md)
                </button>
                <button type="button" className="sample-pill-btn" onClick={handleCopySummary}>
                  {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy SRS'}
                </button>
              </>
            )}

            <button
              type="button"
              className="submit-btn"
              disabled={isProcessing || !scenarioInput.trim()}
              onClick={() => executePipeline({ text: scenarioInput, title: 'Custom Hospital Scenario' })}
            >
              {isProcessing ? 'Running Multi-Agent Pipeline...' : 'Run Hospital AI Agents'} <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* PHI REDACTION NOTICE */}
      {phiResult && phiResult.totalRedacted > 0 && (
        <div className="info-banner phi">
          <Shield size={20} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Privacy Guardrail Active:</strong> Redacted{' '}
            <strong>{phiResult.totalRedacted} sensitive PHI/PII item(s)</strong> (
            {phiResult.redactions.map((r) => `${r.count} ${r.type}`).join(', ')}) before running requirements analysis.
          </div>
        </div>
      )}

      {/* VALIDATION / SECURITY ERROR BANNER */}
      {errorMessage && (
        <div className="info-banner error">
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Guardrail Rejection:</strong> {errorMessage}
          </div>
        </div>
      )}

      {/* ADAPTIVE CLARIFICATION INTERVIEW PANEL */}
      {reqData && clarifications.length > 0 && (
        <section className="clarif-card">
          <div className="clarif-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, fontSize: '0.96rem' }}>
                <MessageSquare size={16} color="#a5b4fc" /> Adaptive Clarification Agent ({clarifications.length} Hospital Questions)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Answer any unstated hospital constraints below and re-run to dynamically refine NFR SLAs and SDLC scores.
              </div>
            </div>
            <button
              type="button"
              className="sample-pill-btn"
              style={{ borderColor: 'rgba(99, 102, 241, 0.5)', color: '#c7d2fe' }}
              onClick={() => executePipeline({ answers: clarificationAnswers })}
              disabled={isProcessing}
            >
              <RefreshCw size={13} /> Apply Clarifications &amp; Re-Analyze
            </button>
          </div>

          <div className="clarif-grid">
            {clarifications.map((q) => (
              <div key={q.id} className="clarif-item">
                <div className="clarif-topic">{q.topic}</div>
                <div className="clarif-q">{q.question}</div>
                <select
                  className="clarif-select"
                  value={clarificationAnswers[q.id] || ''}
                  onChange={(e) =>
                    setClarificationAnswers((prev) => ({
                      ...prev,
                      [q.id]: e.target.value
                    }))
                  }
                >
                  <option value="">-- Select hospital constraint (optional) --</option>
                  {q.options.map((opt, idx) => (
                    <option key={idx} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* DUAL-AGENT MAIN OUTPUT GRID */}
      {reqData && sdlcData && !pipelineResult?.failed && (
        <main className="agents-grid">
          {/* LEFT PANEL: AGENT 1 — REQUIREMENTS, QUALITY/CONFLICTS, RAG & RTM */}
          <article className="agent-panel agent-1">
            <header className="agent-panel-header">
              <span className="agent-meta-tag">Agent 1: Hospital Requirements &amp; Compliance Engineer</span>
              <h2 className="agent-panel-title">Requirements, Quality Audit &amp; RAG Grounding</h2>
              <div className="badge-row">
                <span className="mini-badge">{reqData.domain}</span>
                <span className="mini-badge good">Quality: {reqData.qualityReport.overallScore}/100</span>
                <span className="mini-badge">Avg Confidence: {Math.round(reqData.metrics.averageConfidence * 100)}%</span>
                <span className="mini-badge">HITL Approved: {approvedCount}/{totalReqs}</span>
              </div>
            </header>

            {/* Sub-navigation */}
            <div className="subtabs">
              <button
                type="button"
                className={`subtab-btn ${agent1Tab === 'reqs' ? 'active' : ''}`}
                onClick={() => setAgent1Tab('reqs')}
              >
                FR &amp; NFR ({totalReqs})
              </button>
              <button
                type="button"
                className={`subtab-btn ${agent1Tab === 'quality' ? 'active' : ''}`}
                onClick={() => setAgent1Tab('quality')}
              >
                Ambiguities &amp; Conflicts ({reqData.qualityReport.ambiguities.length + reqData.qualityReport.conflicts.length})
              </button>
              <button
                type="button"
                className={`subtab-btn ${agent1Tab === 'rtm' ? 'active' : ''}`}
                onClick={() => setAgent1Tab('rtm')}
              >
                RAG Sources &amp; RTM ({reqData.retrievedKnowledge.length})
              </button>
            </div>

            {agent1Tab === 'reqs' && (
              <>
                <div className="section-heading">
                  <span>Functional Requirements ({reqData.functionalRequirements.length})</span>
                  <span>Human-in-the-Loop Controls</span>
                </div>
                <div className="req-list">
                  {reqData.functionalRequirements.map((fr) => {
                    const status = approvalMap[fr.id];
                    return (
                      <div
                        key={fr.id}
                        className={`req-card ${status === 'Approved' ? 'approved' : status === 'Flagged for Revision' ? 'flagged' : ''}`}
                      >
                        <div className="req-top">
                          <span className="req-id">{fr.id}</span>
                          <div className="badge-row" style={{ marginTop: 0 }}>
                            <span className="mini-badge">{fr.priority}</span>
                            <span className="mini-badge good">{Math.round((fr.confidence || 0.92) * 100)}% conf</span>
                          </div>
                        </div>
                        <div className="req-title">{fr.title}</div>
                        <p className="req-desc">{fr.statement}</p>

                        <div className="badge-row">
                          {(fr.citations || []).map((c) => (
                            <span key={c} className="mini-badge cite">{c}</span>
                          ))}
                          {(fr.multiLabels || []).map((lbl) => (
                            <span key={lbl} className="mini-badge">{lbl}</span>
                          ))}
                        </div>

                        {fr.acceptanceCriteria?.length > 0 && (
                          <div className="req-ac">
                            <strong>Acceptance Criteria:</strong>
                            <ul>
                              {fr.acceptanceCriteria.slice(0, 2).map((ac, i) => (
                                <li key={i}>{ac}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="hitl-bar">
                          <span style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>
                            Status: <strong>{status || 'Pending Review'}</strong>
                          </span>
                          <div className="config-group">
                            <button
                              type="button"
                              className={`hitl-btn approve ${status === 'Approved' ? 'active' : ''}`}
                              onClick={() => handleRequirementDecision(fr.id, 'Approved')}
                            >
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button
                              type="button"
                              className={`hitl-btn flag ${status === 'Flagged for Revision' ? 'active' : ''}`}
                              onClick={() => handleRequirementDecision(fr.id, 'Flagged for Revision')}
                            >
                              <Flag size={12} /> Flag
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="section-heading" style={{ marginTop: '1.35rem' }}>
                  <span>Non-Functional Requirements ({reqData.nonFunctionalRequirements.length})</span>
                  <span>Quantified Hospital SLAs</span>
                </div>
                <div className="req-list">
                  {reqData.nonFunctionalRequirements.map((nfr) => {
                    const status = approvalMap[nfr.id];
                    return (
                      <div
                        key={nfr.id}
                        className={`req-card ${status === 'Approved' ? 'approved' : status === 'Flagged for Revision' ? 'flagged' : ''}`}
                      >
                        <div className="req-top">
                          <span className="req-id" style={{ color: 'var(--indigo-light)' }}>{nfr.id}</span>
                          <div className="badge-row" style={{ marginTop: 0 }}>
                            <span className="mini-badge">{nfr.category}</span>
                            <span className="mini-badge good">{Math.round((nfr.confidence || 0.94) * 100)}% conf</span>
                          </div>
                        </div>
                        <div className="req-title">{nfr.title}</div>
                        <p className="req-desc">{nfr.statement}</p>
                        <div style={{ marginTop: '0.45rem', fontSize: '0.78rem', color: 'var(--teal-light)' }}>
                          <strong>Target SLA:</strong> {nfr.targetMetrics}
                        </div>
                        <div className="badge-row">
                          {(nfr.citations || []).map((c) => (
                            <span key={c} className="mini-badge cite">{c}</span>
                          ))}
                        </div>
                        <div className="hitl-bar">
                          <span style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>
                            Status: <strong>{status || 'Pending Review'}</strong>
                          </span>
                          <div className="config-group">
                            <button
                              type="button"
                              className={`hitl-btn approve ${status === 'Approved' ? 'active' : ''}`}
                              onClick={() => handleRequirementDecision(nfr.id, 'Approved')}
                            >
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button
                              type="button"
                              className={`hitl-btn flag ${status === 'Flagged for Revision' ? 'active' : ''}`}
                              onClick={() => handleRequirementDecision(nfr.id, 'Flagged for Revision')}
                            >
                              <Flag size={12} /> Flag
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {agent1Tab === 'quality' && (
              <div>
                <div className="section-heading">
                  <span>Vague / Ambiguous Terms Detected ({reqData.qualityReport.ambiguities.length})</span>
                </div>
                {reqData.qualityReport.ambiguities.length === 0 ? (
                  <div className="req-card">
                    <p className="req-desc">No unquantified vague terms detected. Requirements meet IEEE 830 testability criteria.</p>
                  </div>
                ) : (
                  <div className="req-list">
                    {reqData.qualityReport.ambiguities.map((a, idx) => (
                      <div key={idx} className="req-card flagged">
                        <div className="req-title">Ambiguous Term: &ldquo;{a.term}&rdquo;</div>
                        <p className="req-desc">{a.finding}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--teal-light)', marginTop: '0.35rem' }}>
                          <strong>Fix:</strong> {a.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="section-heading" style={{ marginTop: '1.25rem' }}>
                  <span>Stakeholder &amp; Requirement Conflicts ({reqData.qualityReport.conflicts.length})</span>
                </div>
                {reqData.qualityReport.conflicts.length === 0 ? (
                  <div className="req-card">
                    <p className="req-desc">No conflicting stakeholder constraints detected in this scenario.</p>
                  </div>
                ) : (
                  <div className="req-list">
                    {reqData.qualityReport.conflicts.map((c) => (
                      <div key={c.id} className="req-card flagged">
                        <div className="req-id">{c.id}</div>
                        <div className="req-title">{c.title}</div>
                        <p className="req-desc">{c.description}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--teal-light)', marginTop: '0.35rem' }}>
                          <strong>Suggested Resolution:</strong> {c.resolution}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="section-heading" style={{ marginTop: '1.25rem' }}>
                  <span>Clinical Risk Register ({reqData.riskRegister.length})</span>
                </div>
                <div className="req-list">
                  {reqData.riskRegister.map((r) => (
                    <div key={r.id} className="req-card">
                      <div className="req-top">
                        <span className="req-id">{r.id} • {r.category}</span>
                        <span className="mini-badge">{r.severity}</span>
                      </div>
                      <p className="req-desc">{r.risk}</p>
                      <p style={{ fontSize: '0.79rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                        <strong>Mitigation:</strong> {r.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {agent1Tab === 'rtm' && (
              <div>
                <div className="section-heading">
                  <span>Retrieved Healthcare Regulatory Clauses (RAG)</span>
                </div>
                <div className="req-list">
                  {reqData.retrievedKnowledge.map((kb) => (
                    <div key={kb.id} className="req-card">
                      <div className="req-top">
                        <span className="mini-badge cite">{kb.citation}</span>
                        <span className="mini-badge good">{Math.round(kb.confidence * 100)}% match</span>
                      </div>
                      <div className="req-title">{kb.title}</div>
                      <p className="req-desc">{kb.requirement}</p>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
                        Jurisdiction: {kb.jurisdiction} • Effective: {kb.effectiveDate}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="section-heading" style={{ marginTop: '1.25rem' }}>
                  <span>IEEE 830 Requirements Traceability Matrix (RTM)</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="compact-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Requirement</th>
                        <th>Citations</th>
                        <th>Verification Gate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reqData.traceabilityMatrix.map((row) => (
                        <tr key={row.requirementId}>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--teal-light)' }}>{row.requirementId}</td>
                          <td>{row.title}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>{row.citations}</td>
                          <td>{row.verificationStage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </article>

          {/* RIGHT PANEL: AGENT 2 — MCDA SDLC SELECTION, LIVE SLIDERS & 5-PHASE WORKFLOW */}
          <article className="agent-panel agent-2">
            <header className="agent-panel-header">
              <span className="agent-meta-tag">Agent 2: Hospital SDLC Architect (Hybrid MCDA)</span>
              <h2 className="agent-panel-title">SDLC Selection, Live Factor Tuning &amp; Workflow</h2>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                Combines 8 quantitative clinical factors, MCDA utility scoring, and 6 deterministic governance rules.
              </p>
            </header>

            {/* Primary SDLC Recommendation + HITL Sign-Off */}
            <div className="sdlc-highlight">
              <div className="req-top">
                <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--indigo-light)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Award size={14} /> Primary Recommendation
                </span>
                <span className="mini-badge good">{sdlcData.suitabilityScore} Suitability</span>
              </div>
              <div className="sdlc-name">{sdlcData.recommendedModel}</div>
              {sdlcData.primaryModel?.triggeredRule && (
                <div className="rule-tag">Rule Matched: {sdlcData.primaryModel.triggeredRule}</div>
              )}
              <p className="req-desc" style={{ marginTop: '0.45rem' }}>{sdlcData.justification}</p>

              {/* Human-in-the-Loop SDLC Approval Gate */}
              <div className="signoff-box">
                <input
                  type="text"
                  className="role-select"
                  style={{ width: 155 }}
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="Reviewer Name"
                />
                <button
                  type="button"
                  className={`hitl-btn approve ${sdlcSignOff?.status === 'Approved' ? 'active' : ''}`}
                  onClick={() => handleSdlcSignOff('Approved')}
                >
                  <CheckCircle size={13} /> Approve SDLC
                </button>
                <button
                  type="button"
                  className={`hitl-btn flag ${sdlcSignOff?.status === 'Revision Requested' ? 'active' : ''}`}
                  onClick={() => handleSdlcSignOff('Revision Requested')}
                >
                  <Flag size={13} /> Request Revision
                </button>
                {sdlcSignOff && (
                  <span style={{ fontSize: '0.74rem', color: 'var(--teal-light)' }}>
                    Recorded: {sdlcSignOff.status} ({sdlcSignOff.timestamp})
                  </span>
                )}
              </div>
            </div>

            {/* 6-Model MCDA Ranking */}
            <div className="section-heading">
              <span>Ranked SDLC Models (6 Evaluated)</span>
              <span>Click any model for trade-offs</span>
            </div>
            <div>
              {sdlcData.rankedRecommendations.map((model) => {
                const isOpen = expandedModelId === model.id;
                return (
                  <div key={model.id} className={`mcda-card ${model.rank === 1 ? 'primary' : ''}`}>
                    <div
                      className="mcda-row"
                      onClick={() => setExpandedModelId(isOpen ? null : model.id)}
                    >
                      <div className="rank-num">#{model.rank}</div>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.9rem' }}>{model.name}</strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{model.matchLevel}</span>
                        </div>
                        <div className="score-bar-track">
                          <div className="score-bar-fill" style={{ width: `${model.score}%` }} />
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {model.suitabilityScore}
                        {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </div>
                    </div>

                    {isOpen && (
                      <div className="mcda-details">
                        <p className="req-desc">{model.rationale}</p>
                        <div className="pros-cons">
                          <div>
                            <strong style={{ color: '#34d399' }}>Strengths:</strong>
                            <ul style={{ marginLeft: '1rem', marginTop: '0.2rem', color: 'var(--text-muted)' }}>
                              {model.pros.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                          </div>
                          <div>
                            <strong style={{ color: '#f87171' }}>Constraints:</strong>
                            <ul style={{ marginLeft: '1rem', marginTop: '0.2rem', color: 'var(--text-muted)' }}>
                              {model.cons.map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Interactive 8-Factor Sliders */}
            <div className="section-heading" style={{ marginTop: '1.15rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sliders size={13} /> Interactive Decision Factors (Drag to Re-Rank Live)
              </span>
            </div>
            <div className="sliders-grid">
              {FACTOR_LABELS.map(({ key, label }) => (
                <div key={key} className="slider-tile">
                  <div className="slider-top">
                    <span>{label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--teal-light)' }}>
                      {sdlcData.evaluatedFactors[key]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    className="slider-input"
                    value={sdlcData.evaluatedFactors[key]}
                    onChange={(e) => handleSliderChange(key, e.target.value)}
                  />
                </div>
              ))}
            </div>

            {/* 5-Phase Hospital Workflow */}
            <div className="section-heading" style={{ marginTop: '1.25rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <FileText size={13} /> Hospital-Specific 5-Phase Workflow
              </span>
              <span>{sdlcData.recommendedModel}</span>
            </div>
            <div>
              {sdlcData.projectWorkflow.map((phase) => (
                <div key={phase.phaseNumber} className="phase-card">
                  <div className="phase-head">
                    <strong>Phase {phase.phaseNumber}: {phase.phaseName}</strong>
                    <span className="mini-badge">{phase.durationEstimate}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '0.35rem' }}>{phase.objective}</p>
                  <div style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
                    <strong>Roles:</strong> {phase.responsibleRoles.join(', ')}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--teal-light)', marginTop: '0.2rem' }}>
                    <strong>Compliance Gate:</strong> {phase.complianceCheckpoints}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </main>
      )}

      {/* LIVE MULTI-AGENT AUDIT & TELEMETRY TRAIL */}
      {logs.length > 0 && (
        <section className="audit-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.95rem' }}>
            <Activity size={16} color="#14b8a6" /> Multi-Agent Execution &amp; Human-in-the-Loop Audit Trail ({logs.length} Events)
          </div>
          <div className="audit-list">
            {logs.map((log) => (
              <div key={log.id} className={`audit-row ${log.status === 'warn' ? 'warn' : log.status === 'error' ? 'error' : ''}`}>
                <span className="audit-time">{log.timestamp}</span>
                <div>
                  <strong>[{log.agent} • {log.phase}]</strong> {log.message}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
