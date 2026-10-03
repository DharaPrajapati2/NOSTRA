import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Clock3,
  Database,
  Eye,
  Filter,
  Globe2,
  Hash,
  Layers3,
  Link2,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Network,
  Radar,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
  Zap,
} from "lucide-react";

import "./App.css";

const API_URL = "http://127.0.0.1:8000/analyze";

const DEMO_NPUB =
  "npub1drvpzev3syqt0kjrls50050uzf25gehpz9vgdw08hvex7e0vgfeq0eseet";

const RELAYS = [
  "relay.damus.io",
  "relay.primal.net",
  "nos.lol",
];

function formatCategory(value) {
  if (!value) return "Unknown";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getSeverityClass(severity) {
  if (severity === "review") return "severity-review";
  if (severity === "attention") return "severity-attention";
  return "severity-info";
}

function getSeverityIcon(severity) {
  if (severity === "review") return <ShieldAlert size={15} />;
  if (severity === "attention") return <CircleAlert size={15} />;
  return <CheckCircle2 size={15} />;
}

function getCategoryIcon(category) {
  const icons = {
    link: <Link2 size={18} />,
    external_identity: <Globe2 size={18} />,
    hashtag: <Hash size={18} />,
    location: <MapPin size={18} />,
    email: <MessageCircle size={18} />,
    mention: <UserRound size={18} />,
    media: <Layers3 size={18} />,
    phone: <Activity size={18} />,
  };

  return icons[category] || <Radar size={18} />;
}

function StatCard({ icon, label, value, accent = "purple" }) {
  return (
    <div className={`stat-card stat-${accent}`}>
      <div className="stat-icon">{icon}</div>

      <div className="stat-content">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }) {
  return (
    <span className={`severity-badge ${getSeverityClass(severity)}`}>
      {getSeverityIcon(severity)}
      {severity || "info"}
    </span>
  );
}

function EventCard({ event, index, expanded, onToggle }) {
  const findings = event.findings || [];

  return (
    <div className={`event-card ${expanded ? "event-expanded" : ""}`}>
      <button className="event-header" onClick={onToggle}>
        <div className="event-number">
          <span>{String(index + 1).padStart(2, "0")}</span>
        </div>

        <div className="event-main">
          <div className="event-meta">
            <span>
              <Clock3 size={13} />
              Public event
            </span>

            <span>
              <Zap size={13} />
              {findings.length} signal{findings.length !== 1 ? "s" : ""}
            </span>
          </div>

          <p>
            {event.content || "No readable event content available."}
          </p>
        </div>

        <div className="event-arrow">
          {expanded ? <ChevronUp size={19} /> : <ChevronDown size={19} />}
        </div>
      </button>

      {expanded && (
        <div className="event-details">
          <div className="event-detail-row">
            <span>Event ID</span>
            <code>{event.id || "Unavailable"}</code>
          </div>

          <div className="event-detail-row">
            <span>Author</span>
            <code>{event.author || "Unavailable"}</code>
          </div>

          <div className="event-findings">
            <h4>Detected signals</h4>

            {findings.length === 0 ? (
              <div className="empty-findings">
                <CheckCircle2 size={16} />
                No privacy signals detected in this event.
              </div>
            ) : (
              findings.map((finding, findingIndex) => (
                <div className="finding-row" key={findingIndex}>
                  <div className="finding-icon">
                    {getCategoryIcon(finding.type)}
                  </div>

                  <div>
                    <div className="finding-title">
                      <strong>
                        {formatCategory(finding.type)}
                      </strong>

                      <SeverityBadge
                        severity={finding.severity}
                      />
                    </div>

                    <p>
                      {finding.message ||
                        finding.details ||
                        "Privacy signal detected."}
                    </p>

                    {finding.privacy_signal && (
                      <small>{finding.privacy_signal}</small>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DistributionBar({ label, value, total }) {
  const percentage = total
    ? Math.round((value / total) * 100)
    : 0;

  return (
    <div className="distribution-row">
      <div className="distribution-label">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <div className="distribution-track">
        <div
          className="distribution-fill"
          style={{ width: `${Math.max(percentage, value ? 5 : 0)}%` }}
        />
      </div>

      <span className="distribution-percent">
        {percentage}%
      </span>
    </div>
  );
}

function App() {
  const [npub, setNpub] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAbout, setShowAbout] = useState(false);

  const [expandedEvent, setExpandedEvent] = useState(null);
  const [findingFilter, setFindingFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [analysisStage, setAnalysisStage] = useState(0);

  const stages = [
    "Validating public identity",
    "Connecting to Nostr relays",
    "Collecting public events",
    "Detecting privacy signals",
    "Building intelligence report",
  ];

  const findings = report?.findings || [];
  const events = report?.events || [];

  const filteredFindings = useMemo(() => {
    let result = [...findings];

    if (findingFilter !== "all") {
      result = result.filter(
        (item) => item.severity === findingFilter
      );
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();

      result = result.filter((item) =>
        [
          item.type,
          item.severity,
          item.message,
          item.details,
          item.privacy_signal,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search)
      );
    }

    return result;
  }, [findings, findingFilter, searchTerm]);

  const categoryEntries = Object.entries(report?.categories || {});
  const severityEntries = Object.entries(report?.severity || {});

  const handleDemo = () => {
    setNpub(DEMO_NPUB);
    setReport(null);
    setError("");

    setTimeout(() => {
      document
        .getElementById("analyzer")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleAnalyze = async (event) => {
    event?.preventDefault();

    if (!npub.trim()) {
      setError("Enter a public Nostr npub to begin the analysis.");
      return;
    }

    setLoading(true);
    setError("");
    setReport(null);
    setAnalysisStage(0);

    const interval = setInterval(() => {
      setAnalysisStage((current) =>
        current < stages.length - 1 ? current + 1 : current
      );
    }, 1100);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          npub: npub.trim(),
          limit: 20,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "The analysis request failed."
        );
      }

      setAnalysisStage(stages.length);
      setReport(data);

      setTimeout(() => {
        document
          .getElementById("report")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to connect to the NOSTRA backend."
      );
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setReport(null);
    setError("");
    setExpandedEvent(null);
    setSearchTerm("");
    setFindingFilter("all");

    setTimeout(() => {
      document
        .getElementById("analyzer")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <div className="app-shell">
      {/* BACKGROUND */}
      <div className="background-effects">
        <div className="grid-background" />
        <div className="glow glow-one" />
        <div className="glow glow-two" />
        <div className="glow glow-three" />

        <div className="floating-orb orb-one" />
        <div className="floating-orb orb-two" />
        <div className="floating-orb orb-three" />
      </div>

      {/* NAVBAR */}
      <header className="navbar">
        <div className="nav-inner">
          <button
            className="brand"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            <div className="brand-mark">
              <Radar size={21} />
            </div>

            <div>
              <strong>NOSTRA</strong>
              <span>PRIVACY INTELLIGENCE</span>
            </div>
          </button>

          <nav>
            <a href="#features">Features</a>
            <a href="#analyzer">Analyze</a>
            <a href="#report">Report</a>

            <button
              className="nav-about"
              onClick={() => setShowAbout(true)}
            >
              About
            </button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <main>
        <section className="hero section-container">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="pulse-dot" />
              NOSTR PRIVACY INTELLIGENCE
            </div>

            <h1>
              See what your
              <span> public activity </span>
              reveals.
            </h1>

            <p className="hero-description">
              NOSTRA analyzes public Nostr activity and turns
              scattered signals into a clear privacy intelligence
              report.
            </p>

            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={handleDemo}
              >
                Try live demo
                <ArrowRight size={18} />
              </button>

              <button
                className="secondary-button"
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                Explore NOSTRA
              </button>
            </div>

            <div className="hero-trust">
              <span>
                <LockKeyhole size={15} />
                No private keys
              </span>

              <span>
                <Eye size={15} />
                Public data only
              </span>

              <span>
                <ShieldCheck size={15} />
                User-controlled analysis
              </span>
            </div>
          </div>

          {/* RADAR VISUAL */}
          <div className="hero-visual">
            <div className="radar-card">
              <div className="radar-top">
                <span>
                  <Activity size={14} />
                  LIVE ANALYSIS
                </span>

                <span className="live-indicator">
                  ONLINE
                </span>
              </div>

              <div className="radar">
                <div className="radar-ring ring-one" />
                <div className="radar-ring ring-two" />
                <div className="radar-ring ring-three" />

                <div className="radar-cross horizontal" />
                <div className="radar-cross vertical" />

                <div className="radar-sweep" />

                <span className="radar-node node-one" />
                <span className="radar-node node-two" />
                <span className="radar-node node-three" />
                <span className="radar-node node-four" />

                <div className="radar-core">
                  <Radar size={27} />
                </div>
              </div>

              <div className="radar-footer">
                <div>
                  <span>PUBLIC SIGNALS</span>
                  <strong>SCANNING</strong>
                </div>

                <div>
                  <span>RELAYS</span>
                  <strong>03</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="signal-strip">
          <div className="signal-track">
            <span>PUBLIC EVENTS</span>
            <i>✦</i>
            <span>LINK ANALYSIS</span>
            <i>✦</i>
            <span>IDENTITY SIGNALS</span>
            <i>✦</i>
            <span>RELAY INTELLIGENCE</span>
            <i>✦</i>
            <span>PRIVACY SIGNALS</span>
            <i>✦</i>
            <span>PUBLIC EVENTS</span>
            <i>✦</i>
            <span>LINK ANALYSIS</span>
            <i>✦</i>
            <span>IDENTITY SIGNALS</span>
            <i>✦</i>
          </div>
        </div>

        {/* FEATURES */}
        <section id="features" className="section-container section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                01 / INTELLIGENCE LAYER
              </span>

              <h2>
                Privacy signals,
                <span> made visible.</span>
              </h2>
            </div>

            <p>
              NOSTRA looks beyond individual posts and maps
              the information that can emerge from public
              activity.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card large-feature">
              <div className="feature-number">01</div>

              <div className="feature-icon">
                <Radar />
              </div>

              <h3>Signal Detection</h3>

              <p>
                Detect links, hashtags, mentions, external
                identities, locations and other observable
                privacy signals.
              </p>

              <div className="feature-visual signal-visual">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-number">02</div>

              <div className="feature-icon">
                <Network />
              </div>

              <h3>Relay Coverage</h3>

              <p>
                Analyze public activity across multiple Nostr
                relays instead of relying on a single source.
              </p>

              <div className="mini-network">
                <div />
                <div />
                <div />
                <div />
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-number">03</div>

              <div className="feature-icon">
                <Brain />
              </div>

              <h3>AI Explanation</h3>

              <p>
                Convert raw detection results into readable
                explanations about what each signal means.
              </p>

              <div className="terminal-mini">
                <span>&gt; scanning_identity</span>
                <span>&gt; detecting_signals</span>
                <span>&gt; generating_report</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-number">04</div>

              <div className="feature-icon">
                <Eye />
              </div>

              <h3>Observer View</h3>

              <p>
                Understand the kinds of information another
                person could potentially infer from public
                activity.
              </p>

              <div className="observer-lines">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </section>

        {/* ANALYZER */}
        <section id="analyzer" className="section-container section">
          <div className="analyzer-shell">
            <div className="analyzer-header">
              <div>
                <span className="section-kicker">
                  02 / START ANALYSIS
                </span>

                <h2>
                  Scan a public
                  <span> Nostr identity.</span>
                </h2>

                <p>
                  Enter an npub. NOSTRA only analyzes publicly
                  available activity.
                </p>
              </div>

              <div className="analyzer-status">
                <span className="status-dot" />
                API CONNECTED
              </div>
            </div>

            <form
              className="analyzer-form"
              onSubmit={handleAnalyze}
            >
              <div className="input-wrapper">
                <UserRound size={19} />

                <input
                  value={npub}
                  onChange={(event) =>
                    setNpub(event.target.value)
                  }
                  placeholder="npub1..."
                  spellCheck="false"
                />

                {npub && (
                  <button
                    type="button"
                    className="clear-input"
                    onClick={() => setNpub("")}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="analyze-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw
                      size={18}
                      className="spin"
                    />
                    Analyzing
                  </>
                ) : (
                  <>
                    Analyze identity
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="demo-row">
              <span>Don't have an npub?</span>

              <button onClick={handleDemo}>
                Load demo identity
                <Zap size={14} />
              </button>
            </div>

            {error && (
              <div className="error-box">
                <CircleAlert size={18} />
                <span>{error}</span>
              </div>
            )}

            {loading && (
              <div className="analysis-progress">
                <div className="progress-top">
                  <div>
                    <span>ANALYSIS IN PROGRESS</span>
                    <strong>
                      {Math.min(
                        analysisStage + 1,
                        stages.length
                      )}
                      /{stages.length}
                    </strong>
                  </div>

                  <Activity size={19} />
                </div>

                <div className="stage-list">
                  {stages.map((stage, index) => {
                    const complete = index < analysisStage;
                    const active = index === analysisStage;

                    return (
                      <div
                        className={`stage ${
                          complete
                            ? "stage-complete"
                            : ""
                        } ${
                          active ? "stage-active" : ""
                        }`}
                        key={stage}
                      >
                        <div className="stage-dot">
                          {complete ? (
                            <CheckCircle2 size={15} />
                          ) : (
                            <span />
                          )}
                        </div>

                        <span>{stage}</span>

                        {active && (
                          <RefreshCw
                            size={14}
                            className="spin"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* REPORT */}
        {report && (
          <section
            id="report"
            className="section-container section report-section"
          >
            <div className="report-heading">
              <div>
                <span className="section-kicker">
                  03 / INTELLIGENCE REPORT
                </span>

                <h2>
                  Analysis
                  <span> complete.</span>
                </h2>

                <div className="identity-pill">
                  <UserRound size={14} />
                  <code>{report.npub || npub}</code>
                </div>
              </div>

              <button
                className="refresh-button"
                onClick={resetAnalysis}
              >
                <RefreshCw size={16} />
                New analysis
              </button>
            </div>

            {/* STATS */}
            <div className="stats-grid">
              <StatCard
                icon={<Database />}
                label="Events analyzed"
                value={report.events_analyzed ?? 0}
                accent="purple"
              />

              <StatCard
                icon={<Radar />}
                label="Signals detected"
                value={report.total_findings ?? 0}
                accent="blue"
              />

              <StatCard
                icon={<CircleAlert />}
                label="Attention"
                value={report.severity?.attention ?? 0}
                accent="orange"
              />

              <StatCard
                icon={<ShieldAlert />}
                label="Review"
                value={report.severity?.review ?? 0}
                accent="red"
              />

              <StatCard
                icon={<Server />}
                label="Relays reached"
                value={
                  report.successful_relays?.length ??
                  report.relays_checked?.length ??
                  0
                }
                accent="green"
              />
            </div>

            {/* OVERVIEW */}
            <div className="overview-grid">
              <div className="overview-card main-overview">
                <div className="card-heading">
                  <div>
                    <span>PRIVACY OVERVIEW</span>
                    <h3>Observed public signals</h3>
                  </div>

                  <ShieldCheck size={22} />
                </div>

                <div className="overview-number">
                  <strong>
                    {report.total_findings ?? 0}
                  </strong>

                  <span>
                    signals across{" "}
                    {report.events_analyzed ?? 0} events
                  </span>
                </div>

                <div className="overview-bars">
                  <DistributionBar
                    label="Info"
                    value={report.severity?.info || 0}
                    total={report.total_findings || 0}
                  />

                  <DistributionBar
                    label="Attention"
                    value={
                      report.severity?.attention || 0
                    }
                    total={report.total_findings || 0}
                  />

                  <DistributionBar
                    label="Review"
                    value={report.severity?.review || 0}
                    total={report.total_findings || 0}
                  />
                </div>
              </div>

              <div className="overview-card">
                <div className="card-heading">
                  <div>
                    <span>SIGNAL CATEGORIES</span>
                    <h3>What was observed</h3>
                  </div>

                  <BarChart3 size={22} />
                </div>

                <div className="category-list">
                  {categoryEntries.length === 0 ? (
                    <div className="empty-state">
                      No categorized signals.
                    </div>
                  ) : (
                    categoryEntries.map(
                      ([category, value]) => (
                        <div
                          className="category-item"
                          key={category}
                        >
                          <div className="category-icon">
                            {getCategoryIcon(category)}
                          </div>

                          <div className="category-name">
                            <span>
                              {formatCategory(category)}
                            </span>

                            <div className="category-line">
                              <span
                                style={{
                                  width: `${Math.min(
                                    Number(value) * 12,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>

                          <strong>{value}</strong>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>
            </div>

            {/* AI */}
            <div className="ai-card">
              <div className="ai-orb">
                <Brain size={25} />
              </div>

              <div className="ai-content">
                <div className="ai-title">
                  <span>AI EXPLANATION</span>
                  <Sparkles size={16} />
                </div>

                <h3>
                  What the signals mean
                </h3>

                <p>
                  {report.ai_explanation ||
                    "NOSTRA detected public privacy signals and organized them into an interpretable report."}
                </p>
              </div>
            </div>

            {/* OBSERVER */}
            <div className="observer-card">
              <div className="observer-visual">
                <div className="observer-eye">
                  <Eye size={31} />
                </div>

                <div className="observer-pulse" />
              </div>

              <div className="observer-content">
                <span className="section-kicker">
                  OBSERVER VIEW
                </span>

                <h3>
                  What could someone learn?
                </h3>

                <p>
                  Public activity can contain small pieces of
                  information that become more meaningful when
                  viewed together.
                </p>

                <div className="observer-points">
                  <div>
                    <CheckCircle2 size={16} />
                    <span>
                      External identities and public links
                    </span>
                  </div>

                  <div>
                    <CheckCircle2 size={16} />
                    <span>
                      Repeated topics and visible interests
                    </span>
                  </div>

                  <div>
                    <CheckCircle2 size={16} />
                    <span>
                      Public references contained in events
                    </span>
                  </div>

                  <div>
                    <CheckCircle2 size={16} />
                    <span>
                      Information exposed through metadata
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SIGNAL EXPLORER */}
            <div className="explorer-card">
              <div className="explorer-header">
                <div>
                  <span className="section-kicker">
                    SIGNAL EXPLORER
                  </span>

                  <h3>
                    Inspect detected findings
                  </h3>
                </div>

                <Filter size={20} />
              </div>

              <div className="explorer-controls">
                <div className="search-box">
                  <Search size={17} />

                  <input
                    placeholder="Search signals..."
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                  />
                </div>

                <div className="filter-buttons">
                  {[
                    ["all", "All"],
                    ["info", "Info"],
                    ["attention", "Attention"],
                    ["review", "Review"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      className={
                        findingFilter === value
                          ? "active-filter"
                          : ""
                      }
                      onClick={() =>
                        setFindingFilter(value)
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="finding-list">
                {filteredFindings.length === 0 ? (
                  <div className="empty-findings large-empty">
                    <CheckCircle2 size={22} />
                    No findings match your current filter.
                  </div>
                ) : (
                  filteredFindings.map(
                    (finding, index) => (
                      <div
                        className="signal-row"
                        key={`${finding.type}-${index}`}
                      >
                        <div className="signal-category-icon">
                          {getCategoryIcon(finding.type)}
                        </div>

                        <div className="signal-row-content">
                          <div className="signal-row-top">
                            <strong>
                              {formatCategory(
                                finding.type
                              )}
                            </strong>

                            <SeverityBadge
                              severity={finding.severity}
                            />
                          </div>

                          <p>
                            {finding.message ||
                              finding.details ||
                              "Signal detected."}
                          </p>

                          {finding.details && (
                            <small>
                              {finding.details}
                            </small>
                          )}
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>

            {/* EVENTS */}
            <div className="events-section">
              <div className="events-heading">
                <div>
                  <span className="section-kicker">
                    EVENT TIMELINE
                  </span>

                  <h3>
                    Public activity analyzed
                  </h3>
                </div>

                <span className="event-count">
                  {events.length} events
                </span>
              </div>

              <div className="events-list">
                {events.length === 0 ? (
                  <div className="empty-findings large-empty">
                    No public events were returned.
                  </div>
                ) : (
                  events.map((event, index) => (
                    <EventCard
                      key={event.id || index}
                      event={event}
                      index={index}
                      expanded={
                        expandedEvent ===
                        (event.id || index)
                      }
                      onToggle={() =>
                        setExpandedEvent(
                          expandedEvent ===
                            (event.id || index)
                            ? null
                            : event.id || index
                        )
                      }
                    />
                  ))
                )}
              </div>
            </div>

            {/* RELAYS */}
            <div className="relay-section">
              <div className="relay-header">
                <div>
                  <span className="section-kicker">
                    RELAY COVERAGE
                  </span>

                  <h3>
                    Network sources
                  </h3>
                </div>

                <Network size={21} />
              </div>

              <div className="relay-grid">
                {(report.relays_checked?.length
                  ? report.relays_checked
                  : RELAYS
                ).map((relay) => {
                  const successful =
                    report.successful_relays?.includes(
                      relay
                    );

                  const failed =
                    report.failed_relays?.includes(relay);

                  return (
                    <div className="relay-card" key={relay}>
                      <div className="relay-status">
                        <span
                          className={
                            successful
                              ? "relay-online"
                              : failed
                              ? "relay-failed"
                              : "relay-unknown"
                          }
                        />
                      </div>

                      <div>
                        <strong>{relay}</strong>

                        <span>
                          {successful
                            ? "Successfully queried"
                            : failed
                            ? "Connection failed"
                            : "Checked"}
                        </span>
                      </div>

                      <Server size={18} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SCOPE */}
            <div className="scope-card">
              <div className="scope-icon">
                <LockKeyhole />
              </div>

              <div>
                <span className="section-kicker">
                  ANALYSIS SCOPE
                </span>

                <h3>
                  Built around public information.
                </h3>

                <p>
                  NOSTRA does not require private keys,
                  passwords, or account access. The analysis
                  operates on publicly observable Nostr data
                  returned by the selected relays.
                </p>
              </div>

              <div className="scope-checks">
                <span>
                  <CheckCircle2 size={15} />
                  Public events
                </span>

                <span>
                  <CheckCircle2 size={15} />
                  No private keys
                </span>

                <span>
                  <CheckCircle2 size={15} />
                  Relay-based analysis
                </span>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="brand footer-brand">
            <div className="brand-mark">
              <Radar size={19} />
            </div>

            <div>
              <strong>NOSTRA</strong>
              <span>PRIVACY INTELLIGENCE</span>
            </div>
          </div>

          <span>
            Built for the Nostr ecosystem · Public data
            intelligence
          </span>
        </div>
      </footer>

      {/* ABOUT MODAL */}
      {showAbout && (
        <div
          className="modal-backdrop"
          onClick={() => setShowAbout(false)}
        >
          <div
            className="about-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowAbout(false)}
            >
              <X size={19} />
            </button>

            <div className="modal-icon">
              <Radar size={26} />
            </div>

            <span className="section-kicker">
              ABOUT NOSTRA
            </span>

            <h2>
              Privacy intelligence
              <span> for Nostr.</span>
            </h2>

            <p>
              NOSTRA is an AI-powered privacy analysis
              interface designed to help users understand
              what their publicly visible Nostr activity can
              reveal.
            </p>

            <div className="modal-features">
              <div>
                <ShieldCheck size={17} />
                Public-data analysis
              </div>

              <div>
                <Radar size={17} />
                Multi-relay scanning
              </div>

              <div>
                <Brain size={17} />
                Explainable intelligence
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;