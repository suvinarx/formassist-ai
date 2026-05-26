import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import AuthModal from "./AuthModal";
import BrowseByCategory from "./components/BrowseByCategory.jsx";
import PopularForms from "./components/PopularForms";
import CategoryPage from "./pages/CategoryPage";
import FormDetailPage from "./pages/FormDetailpage.jsx";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const SITUATION_CHIPS = [
  "Moving states", "Name change", "Lost document",
  "Benefits enrollment", "Vehicle transfer", "Address update",
];

const SAMPLE_PACKETS = [
  { title: "Address Change", meta: ["USPS Form 3575", "6 fields pre-filled"] },
  { title: "DMV Transfer",   meta: ["Title Transfer REG 227", "11 fields pre-filled"] },
  { title: "Name Change",    meta: ["SS-5, DS-82", "14 fields pre-filled"] },
  { title: "Benefits Enrollment", meta: ["CMS-40B", "9 fields pre-filled"] },
];

const FAQS = [
  { q: "Does FormAssist AI officially submit forms on my behalf?", a: "No. FormAssist AI prepares a helper packet — a pre-filled PDF you can review, complete, and submit yourself through the appropriate official channels. We never submit anything on your behalf." },
  { q: "What information do you collect?", a: "We only collect the situational details you type in, your name, and your email address for account purposes. We never ask for your Social Security Number, payment card details, government ID, or signature." },
  { q: "How accurate is the AI pre-fill?", a: "The AI extracts information directly from your situation description and is highly accurate for standard details like names, addresses, and dates. Always review every field before submitting the official form." },
  { q: "Can I use this for any type of form?", a: "FormAssist AI currently supports common government and administrative forms across categories like address changes, vehicle transfers, name changes, and benefits enrollment. More form types are added regularly." },
  { q: "Is my data secure?", a: "Yes. Your data is encrypted in transit and at rest. We do not sell or share your personal information with third parties, and you can request deletion of your data at any time." },
  { q: "Do I need an account to use FormAssist AI?", a: "You need a free account to generate form packets. This allows us to securely associate your information with your session and provide a better experience across multiple forms." },
];

function MainApp({ user, setShowAuth, handleSignOut, getFirstName, getInitials }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep]       = useState("lead");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError]     = useState("");
  const [situation, setSituation] = useState("");
  const [consent, setConsent] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [downloadUrl, setDownloadUrl] = useState("");
  const [pdfReady, setPdfReady] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // Handle prefill from form detail page
  useEffect(() => {
    if (location.state?.prefillForm) {
      const f = location.state.prefillForm;
      setSituation(`I need to fill out ${f.form_name} (${f.agency}).`);
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  function handleFindForms() {
    if (!user) { setShowAuth(true); return; }
    analyzeSituation();
  }

  async function analyzeSituation() {
    setError("");
    if (!situation.trim()) { setError("Please describe your situation."); return; }
    if (!consent) { setError("Please confirm your consent to continue."); return; }
    try {
      setLoading(true); setLoadingMsg("Analyzing your situation…");
      const res = await fetch(`${API_BASE}/api/analyze-situation`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: getFirstName(user), email: user.email, situation: situation.trim(), consent }),
      });
      if (!res.ok) throw new Error("Failed to analyze situation.");
      const data = await res.json();
      setRecommendations(data.recommended_forms || []);
      setStep("recommendations");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); setLoadingMsg(""); }
  }

  async function chooseForm(form) {
    setError(""); setPdfReady(false); setDownloadUrl("");
    try {
      setLoading(true); setLoadingMsg("AI is reading your situation and pre-filling the form…");
      const res = await fetch(`${API_BASE}/api/smart-fill`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_id: form.form_id, situation: situation.trim(), user_name: user.displayName || getFirstName(user), user_email: user.email }),
      });
      if (!res.ok) throw new Error("Failed to fill form.");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSelectedForm(data.form); setAnswers(data.answers || {});
      setStep("preview");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); setLoadingMsg(""); }
  }

  function updateAnswer(key, value) {
    setAnswers((p) => ({ ...p, [key]: value }));
    setPdfReady(false); setDownloadUrl("");
  }

  async function generatePdf() {
    setError("");
    try {
      setLoading(true); setLoadingMsg("Generating your pre-filled PDF…");
      const res = await fetch(`${API_BASE}/api/generate-pdf`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_id: selectedForm.form_id, form_name: selectedForm.form_name, agency: selectedForm.agency, answers, questions: selectedForm.questions }),
      });
      if (!res.ok) throw new Error("PDF generation failed.");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDownloadUrl(`${API_BASE}${data.download_url}`); setPdfReady(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); setLoadingMsg(""); }
  }

  function restart() {
    setStep("lead"); setLoading(false); setLoadingMsg(""); setError("");
    setSituation(""); setConsent(false); setRecommendations([]);
    setSelectedForm(null); setAnswers({}); setDownloadUrl(""); setPdfReady(false);
  }

  function filledCount() { return Object.values(answers).filter((v) => v && String(v).trim()).length; }
  function totalCount()  { return selectedForm?.questions?.length || 0; }
  function fillPercent() { return totalCount() ? Math.round((filledCount() / totalCount()) * 100) : 0; }

  return (
    <>
      {loading && (
        <div className="fa-overlay">
          <div className="fa-overlay-card">
            <div className="fa-spinner" />
            <p>{loadingMsg || "Please wait…"}</p>
          </div>
        </div>
      )}

      {/* Steps bar */}
      <div className="fa-steps-bar">
        <StepItem num={1} label="Describe situation" active={step === "lead"} />
        <div className="fa-step-divider" />
        <StepItem num={2} label="Choose form" active={step === "recommendations"} />
        <div className="fa-step-divider" />
        <StepItem num={3} label="Review & download" active={step === "preview"} banner />
      </div>

      {/* ── LEAD ── */}
      {step === "lead" && (
        <>
          <div className="fa-main">
            <div className="fa-left">
              <div className="fa-eyebrow">AI-powered form preparation</div>
              <h1 className="fa-h1">Find and complete the right form — without the confusion.</h1>
              <p className="fa-hero-sub">
                {user
                  ? <>Welcome back, <strong>{getFirstName(user)}</strong>! Describe your situation and we'll find and pre-fill the right forms for you.</>
                  : "Describe your situation in plain English. We'll identify the right forms, pre-fill them from your details, and generate a ready-to-submit PDF."}
              </p>
              <div className="fa-feature-list">
                <Feature svg='<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>' title="Plain English input" desc="No legal jargon — just describe what you need." />
                <Feature svg='<circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>' title="AI pre-fills the form" desc="Answers are extracted from your situation automatically." />
                <Feature svg='<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>' title="Print-ready PDF" desc="Download, review, and submit through official channels." />
              </div>
              <div className="fa-sample-label">Sample completed packets</div>
              <div className="fa-sample-grid">
                {SAMPLE_PACKETS.map((p) => (
                  <div key={p.title} className="fa-sample-card">
                    <div className="fa-sample-title">{p.title}</div>
                    {p.meta.map((m) => <div key={m} className="fa-sample-meta"><span className="fa-dot" />{m}</div>)}
                  </div>
                ))}
              </div>
            </div>

            <div className="fa-right">
              <div className="fa-panel-title">Unsure which form to fill?</div>
              <p className="fa-panel-sub">We'll recommend and pre-fill the right forms for your situation.</p>
              <div className="fa-trust-row">
                <TrustBadge icon="🔒" label="No SSN required" />
                <TrustBadge icon="🛡" label="Helper packet only" />
                <TrustBadge icon="👁" label="No submission" />
              </div>
              {!user && (
                <div className="fa-signup-nudge">
                  <span>🔐</span>
                  <div>
                    <strong>Sign in to get started</strong>
                    <p><button className="fa-nudge-link" onClick={() => setShowAuth(true)}>Sign up free</button>{" "}— your info will be pre-filled across all forms.</p>
                  </div>
                </div>
              )}
              {error && <div className="fa-error">{error}</div>}
              <label className="fa-field-label" htmlFor="situation">Describe your situation</label>
              <textarea id="situation" className="fa-textarea" rows={5} value={situation} onChange={(e) => setSituation(e.target.value)} placeholder="Example: I'm moving from California to Washington and need to update my address with USPS and transfer my vehicle title." />
              <div className="fa-chips">
                {SITUATION_CHIPS.map((chip) => (
                  <button key={chip} className="fa-chip" onClick={() => setSituation((s) => s ? s + " " + chip.toLowerCase() : chip)}>{chip}</button>
                ))}
              </div>
              <div className="fa-consent-row">
                <input id="consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <label htmlFor="consent" className="fa-consent-label">I agree that FormAssist AI may use my information to recommend forms and prepare helper packets. I understand this app does not officially submit forms.</label>
              </div>
              <button className="fa-cta-btn" onClick={handleFindForms} disabled={loading}>Find my forms →</button>
              <p className="fa-privacy-note">We never ask for SSN, payment cards, signatures, or government IDs.</p>
            </div>
          </div>

          {/* Browse by Category */}
          <BrowseByCategory />

          {/* Popular Forms */}
          <PopularForms />

          {/* FAQ */}
          <section className="fa-faq-section">
            <div className="fa-faq-inner">
              <div className="fa-faq-header">
                <div className="fa-eyebrow" style={{ color: "#6b7a99" }}>Common questions</div>
                <h2 className="fa-faq-title">Frequently asked questions</h2>
                <p className="fa-faq-subtitle">Everything you need to know before getting started.</p>
              </div>
              <div className="fa-faq-list">
                {FAQS.map((faq, i) => (
                  <div key={i} className={`fa-faq-item${openFaq === i ? " open" : ""}`}>
                    <button className="fa-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                      <span>{faq.q}</span>
                      <span className="fa-faq-chevron">{openFaq === i ? "−" : "+"}</span>
                    </button>
                    {openFaq === i && <div className="fa-faq-a">{faq.a}</div>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── RECOMMENDATIONS ── */}
      {step === "recommendations" && (
        <div className="fa-main">
          <div className="fa-left">
            <div className="fa-eyebrow">AI analysis complete</div>
            <h1 className="fa-h1" style={{ fontSize: "1.4rem" }}>{recommendations.length} form{recommendations.length !== 1 ? "s" : ""} match your situation</h1>
            <p className="fa-hero-sub">Select a form — AI will instantly pre-fill it from your situation.</p>
            {error && <div className="fa-error">{error}</div>}
            {recommendations.length === 0 && <div className="fa-warning">No forms found. Try describing your situation with more detail.</div>}
            <div className="fa-rec-list">
              {recommendations.map((form) => (
                <div key={form.form_id} className="fa-rec-card">
                  <div className="fa-rec-top">
                    <span className="fa-rec-name">{form.form_name}</span>
                    <span className={`fa-conf-badge fa-conf-${form.confidence}`}>{form.confidence} match</span>
                  </div>
                  <p className="fa-rec-reason">{form.reason}</p>
                  <button className="fa-rec-select" onClick={() => chooseForm(form)} disabled={loading}>Select &amp; auto-fill →</button>
                </div>
              ))}
            </div>
          </div>
          <div className="fa-right">
            <div className="fa-panel-title">Your situation summary</div>
            <p className="fa-panel-sub">The AI extracted these key details from your description.</p>
            <div className="fa-summary-box">
              <div className="fa-summary-label">Your situation</div>
              <div className="fa-summary-text">{situation}</div>
            </div>
            <div className="fa-panel-note">Not seeing the right form?{" "}<button className="fa-inline-link" onClick={() => setStep("lead")}>Edit your situation</button></div>
            <button className="fa-secondary-btn" onClick={() => setStep("lead")}>← Back</button>
          </div>
        </div>
      )}

      {/* ── PREVIEW ── */}
      {step === "preview" && selectedForm && (
        <div className="fa-main">
          <div className="fa-left">
            <div className="fa-eyebrow">{selectedForm.agency} · {selectedForm.description}</div>
            <h1 className="fa-h1" style={{ fontSize: "1.4rem" }}>{selectedForm.form_name} — pre-filled by AI</h1>
            <div className="fa-fill-bar-row">
              <div className="fa-fill-track"><div className="fa-fill-fill" style={{ width: `${fillPercent()}%` }} /></div>
              <span className="fa-fill-label"><strong>{filledCount()}</strong> of <strong>{totalCount()}</strong> fields pre-filled by AI</span>
            </div>
            <div className="fa-warning">Review every field. Edit anything the AI got wrong. Sensitive info (SSN, payment, signature) should be added by hand before official submission.</div>
            {error && <div className="fa-error">{error}</div>}
            <div className="fa-preview-grid">
              {selectedForm.questions.map((q) => {
                const isLong = ["old_street","new_street","old_unit","new_unit"].includes(q.id);
                const isFilled = !!(answers[q.id] && String(answers[q.id]).trim());
                return (
                  <div key={q.id} className={`fa-pf${isLong ? " fa-pf-full" : ""}`}>
                    <label className="fa-pf-label" htmlFor={`pf_${q.id}`}>{q.label}{q.required && <span className="fa-required"> *</span>}</label>
                    {q.type === "single_choice" ? (
                      <select id={`pf_${q.id}`} value={answers[q.id] || ""} onChange={(e) => updateAnswer(q.id, e.target.value)} className={`fa-pf-input${isFilled ? " filled" : ""}`}>
                        <option value="">— select —</option>
                        {q.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : q.type === "date" ? (
                      <input id={`pf_${q.id}`} type="date" value={answers[q.id] || ""} onChange={(e) => updateAnswer(q.id, e.target.value)} className={`fa-pf-input${isFilled ? " filled" : ""}`} />
                    ) : (
                      <input id={`pf_${q.id}`} type={q.type === "email" ? "email" : "text"} value={answers[q.id] || ""} onChange={(e) => updateAnswer(q.id, e.target.value)} placeholder={`Enter ${q.label.toLowerCase()}`} className={`fa-pf-input${isFilled ? " filled" : ""}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="fa-right">
            <div className="fa-panel-title">Generate your PDF</div>
            <p className="fa-panel-sub">Once you've reviewed the fields, download your pre-filled helper packet.</p>
            <div className="fa-checklist">
              <CheckRow done label="AI pre-fill complete" />
              <CheckRow done={filledCount() > 0} label="Form fields reviewed" />
              <CheckRow done={pdfReady} label="PDF ready to download" />
            </div>
            {pdfReady
              ? <a className="fa-cta-btn fa-download-btn" href={downloadUrl} target="_blank" rel="noreferrer">⬇ Download pre-filled PDF</a>
              : <button className="fa-cta-btn" onClick={generatePdf} disabled={loading}>{loading ? "Generating PDF…" : "Generate pre-filled PDF"}</button>
            }
            <button className="fa-secondary-btn" onClick={() => setStep("recommendations")}>← Back to forms</button>
            <button className="fa-ghost-btn" onClick={restart}>Start over</button>
            <div className="fa-reminder-box">
              <div className="fa-reminder-label">Important reminder</div>
              <p className="fa-reminder-text">This is a helper packet only. You must submit the completed form through official channels. We never store your SSN, payment information, or signatures.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  const [user, setUser]         = useState(undefined);
  const [showAuth, setShowAuth] = useState(false);

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
    if (u.displayName) { const p = u.displayName.split(" "); return (p[0]?.[0] ?? "") + (p[1]?.[0] ?? ""); }
    return u.email[0].toUpperCase();
  }
  async function handleSignOut() { await signOut(auth); }

  if (user === undefined) {
    return (
      <div className="fa-shell fa-center">
        <div className="fa-spinner-wrap">
          <div className="fa-spinner" />
          <p className="fa-spinner-label">Loading FormAssist AI…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fa-shell">
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Global Nav */}
      <nav className="fa-nav">
        <div className="fa-brand">
          <div className="fa-brand-mark">F</div>
          <span className="fa-brand-name">FormAssist AI</span>
        </div>
        <div className="fa-nav-right">
          {user ? (
            <div className="fa-nav-user">
              {user.photoURL
                ? <img src={user.photoURL} className="fa-avatar-img" alt={getInitials(user)} onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                : null}
              <div className="fa-avatar" style={user.photoURL ? { display: "none" } : {}}>{getInitials(user)}</div>
              <span className="fa-nav-name">{getFirstName(user)}</span>
              <button className="fa-nav-signout" onClick={handleSignOut}>Sign out</button>
            </div>
          ) : (
            <button className="fa-nav-cta" onClick={() => setShowAuth(true)}>Sign up — it's free</button>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={
          <MainApp
            user={user}
            setShowAuth={setShowAuth}
            handleSignOut={handleSignOut}
            getFirstName={getFirstName}
            getInitials={getInitials}
          />
        } />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/form/:formId" element={<FormDetailPage />} />
      </Routes>
    </div>
  );
}

// ── Shared small components ───────────────────────────────────────────────────

function StepItem({ num, label, active, banner }) {
  return (
    <div className={`fa-step-item${active ? " active" : ""}${banner ? " has-banner" : ""}`}>
      <span className="fa-step-num">{num}</span>
      {label}
      {banner && (
        <div className="fa-step-banner" role="tooltip">
          <div className="fa-banner-grid">
            <div className="fa-banner-item">
              <div className="fa-banner-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><rect x="3" y="4" width="18" height="16" rx="2"/></svg></div>
              <div className="fa-banner-title">Review every field</div>
              <div className="fa-banner-desc">Carefully check each pre-filled answer before downloading.</div>
            </div>
            <div className="fa-banner-item">
              <div className="fa-banner-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
              <div className="fa-banner-title">Edit anything wrong</div>
              <div className="fa-banner-desc">Correct any AI mistakes directly in the form fields.</div>
            </div>
            <div className="fa-banner-item">
              <div className="fa-banner-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></div>
              <div className="fa-banner-title">Download your PDF</div>
              <div className="fa-banner-desc">Get a print-ready packet with all your details filled in.</div>
            </div>
            <div className="fa-banner-item">
              <div className="fa-banner-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
              <div className="fa-banner-title">Submit officially</div>
              <div className="fa-banner-desc">We never submit for you — always use the official agency channel.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TrustBadge({ icon, label }) {
  return <span className="fa-trust-badge"><span aria-hidden="true">{icon}</span> {label}</span>;
}

function Feature({ svg, title, desc }) {
  return (
    <div className="fa-feature">
      <div className="fa-feature-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: svg }} />
      </div>
      <div><div className="fa-feature-title">{title}</div><div className="fa-feature-desc">{desc}</div></div>
    </div>
  );
}

function CheckRow({ done, label }) {
  return (
    <div className="fa-check-row">
      <span className={`fa-check-icon${done ? " done" : ""}`}>{done ? "✓" : "○"}</span>
      <span className={done ? "" : "fa-check-pending"}>{label}</span>
    </div>
  );
}