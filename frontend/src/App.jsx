import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import AuthModal from "./AuthModal";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function App() {
  const [user, setUser] = useState(undefined);
  const [showAuth, setShowAuth] = useState(false);

  const [step, setStep] = useState("lead");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");

  const [situation, setSituation] = useState("");
  const [consent, setConsent] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  // AI Fill state
  const [selectedForm, setSelectedForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [downloadUrl, setDownloadUrl] = useState("");
  const [pdfReady, setPdfReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u ?? null));
    return unsub;
  }, []);

  function getFirstName(u) {
    if (!u) return "";
    if (u.displayName) return u.displayName.split(" ")[0];
    return u.email.split("@")[0];
  }
  function getInitials(u) {
    if (!u) return "?";
    if (u.displayName) {
      const p = u.displayName.split(" ");
      return (p[0]?.[0] ?? "") + (p[1]?.[0] ?? "");
    }
    return u.email[0].toUpperCase();
  }

  // ── Step 1: Analyze situation ──────────────────────────────────────────────
  function handleFindForms() {
    if (!user) { setShowAuth(true); return; }
    analyzeSituation();
  }

  async function analyzeSituation() {
    setError("");
    if (!situation.trim()) { setError("Please describe your situation."); return; }
    if (!consent) { setError("Please confirm your consent to continue."); return; }
    try {
      setLoading(true);
      setLoadingMsg("Analyzing your situation…");
      const res = await fetch(`${API_BASE}/api/analyze-situation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: getFirstName(user),
          email: user.email,
          situation: situation.trim(),
          consent,
        }),
      });
      if (!res.ok) throw new Error("Failed to analyze situation.");
      const data = await res.json();
      setRecommendations(data.recommended_forms || []);
      setStep("recommendations");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  }

  // ── Step 2: Select form → smart-fill immediately ───────────────────────────
  async function chooseForm(form) {
    setError("");
    setPdfReady(false);
    setDownloadUrl("");
    try {
      setLoading(true);
      setLoadingMsg("AI is reading your situation and pre-filling the form…");

      const res = await fetch(`${API_BASE}/api/smart-fill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_id: form.form_id,
          situation: situation.trim(),
          user_name: user.displayName || getFirstName(user),
          user_email: user.email,
        }),
      });
      if (!res.ok) throw new Error("Failed to fill form.");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSelectedForm(data.form);
      setAnswers(data.answers || {});
      setStep("preview");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  }

  // ── Step 3: Update any answer manually ────────────────────────────────────
  function updateAnswer(key, value) {
    setAnswers((p) => ({ ...p, [key]: value }));
    setPdfReady(false);
    setDownloadUrl("");
  }

  // ── Step 4: Generate PDF ───────────────────────────────────────────────────
  async function generatePdf() {
    setError("");
    try {
      setLoading(true);
      setLoadingMsg("Generating your pre-filled PDF…");
      const res = await fetch(`${API_BASE}/api/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_id: selectedForm.form_id,
          form_name: selectedForm.form_name,
          agency: selectedForm.agency,
          answers,
          questions: selectedForm.questions,
        }),
      });
      if (!res.ok) throw new Error("PDF generation failed.");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDownloadUrl(`${API_BASE}${data.download_url}`);
      setPdfReady(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  }

  function restart() {
    setStep("lead");
    setLoading(false);
    setLoadingMsg("");
    setError("");
    setSituation("");
    setConsent(false);
    setRecommendations([]);
    setSelectedForm(null);
    setAnswers({});
    setDownloadUrl("");
    setPdfReady(false);
  }

  async function handleSignOut() {
    await signOut(auth);
    restart();
  }

  // ── Filled field count ─────────────────────────────────────────────────────
  function filledCount() {
    return Object.values(answers).filter((v) => v && String(v).trim()).length;
  }
  function totalCount() {
    return selectedForm?.questions?.length || 0;
  }

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (user === undefined) {
    return (
      <div className="app-shell" style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <div className="auth-loading">
          <div className="auth-spinner" />
          <p>Loading FormAssist AI…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Loading overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-card">
            <div className="auth-spinner" />
            <p>{loadingMsg || "Please wait…"}</p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="nav">
        <div className="brand">
          <div className="brand-icon">F</div>
          <span>FormAssist AI</span>
        </div>
        <div className="nav-right">
          {user ? (
            <div className="nav-user">
              {user.photoURL ? (
                <>
                  <img
                    src={user.photoURL}
                    className="nav-avatar-img"
                    alt={getInitials(user)}
                    onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                  />
                  <div className="nav-avatar" style={{ display: "none" }}>{getInitials(user)}</div>
                </>
              ) : (
                <div className="nav-avatar">{getInitials(user)}</div>
              )}
              <span className="nav-name">{getFirstName(user)}</span>
              <button className="nav-signout" onClick={handleSignOut}>Sign out</button>
            </div>
          ) : (
            <button className="nav-signup-btn" onClick={() => setShowAuth(true)}>
              Sign up — it's free
            </button>
          )}
        </div>
      </nav>

      {/* ── STEP: LEAD ─────────────────────────────────────────────────────── */}
      {step === "lead" && (
        <main className="landing">
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow">AI-powered form preparation</div>
              <h1>Find the right form without reading pages of confusing instructions.</h1>
              <p className="hero-subtitle">
                {user
                  ? <>Welcome back, <strong>{getFirstName(user)}</strong>! Describe your situation and we'll find and pre-fill the right forms for you.</>
                  : "Describe your situation in plain English. FormAssist AI finds the right forms, pre-fills them with your info, and generates a print-ready packet."}
              </p>
              <div className="hero-actions">
                <a href="#start" className="primary-link">Start now</a>
                <span className="small-note">No official submission. You stay in control.</span>
              </div>
              <div className="feature-row">
                <div className="feature-card"><span>01</span><strong>Explain situation</strong><p>Tell the app what you are trying to do.</p></div>
                <div className="feature-card"><span>02</span><strong>AI finds & fills</strong><p>Forms are recommended and pre-filled instantly.</p></div>
                <div className="feature-card"><span>03</span><strong>Download & submit</strong><p>Review, download PDF, and submit officially.</p></div>
              </div>
            </div>

            <section id="start" className="form-panel">
              <div className="panel-header">
                <div>
                  <h2>Start your helper packet</h2>
                  <p>We'll recommend and pre-fill forms based on your situation.</p>
                </div>
                <div className="secure-badge">Safe fields only</div>
              </div>

              <Progress step={step} />
              {error && <div className="error">{error}</div>}

              {user ? (
                <div className="profile-summary">
                  {user.photoURL ? (
                    <>
                      <img src={user.photoURL} className="profile-avatar-img" alt={getInitials(user)}
                        onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                      <div className="profile-avatar" style={{ display: "none" }}>{getInitials(user)}</div>
                    </>
                  ) : (
                    <div className="profile-avatar">{getInitials(user)}</div>
                  )}
                  <div>
                    <p className="profile-name">{user.displayName || getFirstName(user)}</p>
                    <p className="profile-email">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="signup-nudge">
                  <span>🔐</span>
                  <div>
                    <strong>Sign in to get started</strong>
                    <p><button className="nudge-link" onClick={() => setShowAuth(true)}>Sign up free</button>{" "}— your info will be pre-filled across all forms.</p>
                  </div>
                </div>
              )}

              <label htmlFor="situation">Describe your situation</label>
              <textarea
                id="situation" rows="5" value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="Example: I am moving from California to Washington and need to update my address with USPS and the DMV."
              />

              <div className="checkbox">
                <input id="consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <label htmlFor="consent" className="checkbox-label">
                  I agree that FormAssist AI may use my information to recommend forms and prepare helper packets. I understand this app does not officially submit forms.
                </label>
              </div>

              <button onClick={handleFindForms} disabled={loading}>Find My Forms</button>
              <p className="privacy-note">We do not ask for SSN, payment card, signature, or government ID.</p>
            </section>
          </section>
        </main>
      )}

      {/* ── STEP: RECOMMENDATIONS ──────────────────────────────────────────── */}
      {step === "recommendations" && (
        <main className="workflow-page">
          <section className="workflow-card">
            <div className="workflow-header">
              <div><h1>Recommended Forms</h1><p>Select a form — AI will instantly pre-fill it from your situation.</p></div>
              <div className="badge">AI-Powered</div>
            </div>
            <Progress step={step} />
            {error && <div className="error">{error}</div>}

            {recommendations.length === 0 && (
              <div className="warning">No forms found. Try describing your situation with more detail.</div>
            )}

            <div className="rec-grid">
              {recommendations.map((form) => (
                <div className="rec-card" key={form.form_id}>
                  <div className={`confidence-badge conf-${form.confidence}`}>{form.confidence} match</div>
                  <h3>{form.form_name}</h3>
                  <p>{form.reason}</p>
                  <button className="rec-select-btn" onClick={() => chooseForm(form)} disabled={loading}>
                    Select &amp; Auto-Fill →
                  </button>
                </div>
              ))}
            </div>

            <button className="secondary" onClick={() => setStep("lead")}>← Back</button>
          </section>
        </main>
      )}

      {/* ── STEP: PREVIEW ──────────────────────────────────────────────────── */}
      {step === "preview" && selectedForm && (
        <main className="workflow-page">
          <section className="workflow-card">
            <div className="workflow-header">
              <div>
                <h1>{selectedForm.form_name}</h1>
                <p>{selectedForm.agency} · {selectedForm.description}</p>
              </div>
              <div className="badge">Helper Only</div>
            </div>
            <Progress step={step} />
            {error && <div className="error">{error}</div>}

            {/* Fill stats */}
            <div className="fill-stats">
              <div className="fill-bar-wrap">
                <div className="fill-bar" style={{ width: `${totalCount() ? (filledCount() / totalCount()) * 100 : 0}%` }} />
              </div>
              <span className="fill-label">
                <strong>{filledCount()}</strong> of <strong>{totalCount()}</strong> fields pre-filled by AI
              </span>
            </div>

            <div className="warning" style={{ marginTop: 12 }}>
              Review every field below. Edit anything the AI got wrong, then download your PDF.
              Sensitive info (SSN, payment, signature) should be added by hand before official submission.
            </div>

            {/* Field preview grid */}
            <div className="preview-grid">
              {selectedForm.questions.map((q) => (
                <div
                  key={q.id}
                  className={`preview-field ${["old_street","new_street","old_unit","new_unit"].includes(q.id) ? "full-width" : ""}`}
                >
                  <label htmlFor={`pf_${q.id}`} className="preview-label">
                    {q.label}{q.required && <span className="required-star"> *</span>}
                  </label>
                  {q.type === "single_choice" ? (
                    <select
                      id={`pf_${q.id}`}
                      value={answers[q.id] || ""}
                      onChange={(e) => updateAnswer(q.id, e.target.value)}
                      className={`preview-select ${answers[q.id] ? "filled" : "empty"}`}
                    >
                      <option value="">— select —</option>
                      {q.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : q.type === "date" ? (
                    <input
                      id={`pf_${q.id}`}
                      type="date"
                      value={answers[q.id] || ""}
                      onChange={(e) => updateAnswer(q.id, e.target.value)}
                      className={`preview-input ${answers[q.id] ? "filled" : "empty"}`}
                    />
                  ) : (
                    <input
                      id={`pf_${q.id}`}
                      type={q.type === "email" ? "email" : "text"}
                      value={answers[q.id] || ""}
                      onChange={(e) => updateAnswer(q.id, e.target.value)}
                      placeholder={`Enter ${q.label.toLowerCase()}`}
                      className={`preview-input ${answers[q.id] ? "filled" : "empty"}`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="preview-actions">
              {pdfReady ? (
                <a className="download-btn" href={downloadUrl} target="_blank" rel="noreferrer">
                  ⬇ Download Pre-filled PDF
                </a>
              ) : (
                <button className="generate-btn" onClick={generatePdf} disabled={loading}>
                  {loading ? "Generating PDF…" : "Generate Pre-filled PDF"}
                </button>
              )}
              <button className="secondary" onClick={() => setStep("recommendations")}>← Back to Forms</button>
              <button className="secondary" onClick={restart}>Start Over</button>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

function Progress({ step }) {
  const steps = [
    ["lead", "1. Situation"],
    ["recommendations", "2. Forms"],
    ["preview", "3. Preview & Edit"],
  ];
  return (
    <div className="steps">
      {steps.map(([key, label]) => (
        <span key={key} className={step === key ? "active" : ""}>{label}</span>
      ))}
    </div>
  );
}

export default App;
