import { useState, useEffect, useRef, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import AuthModal from "./AuthModal";
import BrowseByCategory from "./components/BrowseByCategory.jsx";
import PopularForms from "./components/PopularForms";
import CategoryPage from "./pages/CategoryPage";
import FormDetailPage from "./pages/FormDetailPage.jsx";
import SecurityPage from "./pages/SecurityPage.jsx";
import FormFillPage from "./pages/FormFillPage.jsx";
import SituationPage from "./pages/SituationPage.jsx";
import { FORMS as FORMS_FLAT } from "./data/formsData";

function HowItWorks() {
  const [activeCard, setActiveCard] = useState(0);
  const [fading, setFading] = useState(false);

  const TRUST_CARDS = [
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
      tag: "Security",
      title: "Bank-grade security",
      desc: "All data is encrypted in transit and at rest using 256-bit AES encryption. We never store your SSN, payment details, or signatures — not even temporarily.",
      link: { label: "Learn more about security →", href: "/security" },
      accent: "#3d6aff",
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
      tag: "Accuracy",
      title: "98% pre-fill accuracy",
      desc: "Powered by Claude AI, FormAssist extracts your details with industry-leading precision. FormLift independently rated our tool #1 for document accuracy across all form types.",
      accent: "#1a9e6e",
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
      tag: "Control",
      title: "You stay in control",
      desc: "We never submit anything on your behalf. Every form is reviewed, edited, and submitted by you — through official government and agency channels only.",
      accent: "#e07c1a",
    },
    {
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
      tag: "Recognition",
      title: "FormLift's #1 rated tool",
      desc: "FormLift's annual document tool review scored FormAssist AI top marks for accuracy, privacy, ease-of-use, and breadth of supported federal and state form types.",
      accent: "#a855f7",
    },
  ];

  const STEPS = [
    { num: "01", title: "Describe your situation", desc: "Type what you need in plain English — no legal jargon. Or browse 119 official forms directly by category." },
    { num: "02", title: "AI fills the form", desc: "Our AI reads your description, finds the right form, and pre-fills every field it can from your details." },
    { num: "03", title: "Review every field", desc: "Check the pre-filled form side-by-side. Edit anything the AI got wrong. Add sensitive info like SSN by hand." },
    { num: "04", title: "Download & submit officially", desc: "Download your packet as a PDF. Sign where required and submit through the official agency channel — we never submit for you." },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActiveCard(c => (c + 1) % TRUST_CARDS.length);
        setFading(false);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const card = TRUST_CARDS[activeCard];

  return (
    <section className="hiw-section">
      <div className="hiw-inner">

        {/* LEFT — steps */}
        <div className="hiw-left">
          <div className="fa-eyebrow" style={{ color: "rgba(255,255,255,0.4)" }}>How it works</div>
          <h2 className="hiw-title">Simple steps to your filled form</h2>
          <p className="hiw-subtitle">We make navigating government paperwork easier, faster, and more accurate.</p>

          <div className="hiw-steps">
            {STEPS.map((s) => (
              <div key={s.num} className="hiw-step">
                <div className="hiw-step-num">{s.num}</div>
                <div className="hiw-step-body">
                  <div className="hiw-step-title">{s.title}</div>
                  <div className="hiw-step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — rotating trust card */}
        <div className="hiw-right">
          <div className="hiw-card-wrap">
            <div className={`hiw-card${fading ? " fading" : ""}`} style={{ "--card-accent": card.accent }}>
              <div className="hiw-card-tag">{card.tag}</div>
              <div className="hiw-card-icon">{card.icon}</div>
              <h3 className="hiw-card-title">{card.title}</h3>
              <p className="hiw-card-desc">{card.desc}</p>
              {card.link && <a href={card.link.href} className="hiw-card-link">{card.link.label}</a>}
            </div>
            {/* Dots */}
            <div className="hiw-dots">
              {TRUST_CARDS.map((_, i) => (
                <button key={i} className={`hiw-dot${i === activeCard ? " active" : ""}`}
                  onClick={() => { setFading(true); setTimeout(() => { setActiveCard(i); setFading(false); }, 300); }} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const SITUATION_CHIPS = [
  "Moving states", "Name change", "Lost document",
  "Benefits enrollment", "Vehicle transfer", "Address update",
];

const FAQS = [
  { q: "Does FormAssist AI officially submit forms on my behalf?", a: "No. FormAssist AI prepares a helper packet — a pre-filled PDF you can review, complete, and submit yourself through the appropriate official channels. We never submit anything on your behalf." },
  { q: "What information do you collect?", a: "We only collect the situational details you type in, your name, and your email address for account purposes. We never ask for your Social Security Number, payment card details, government ID, or signature." },
  { q: "How accurate is the AI pre-fill?", a: "The AI extracts information directly from your situation description and is highly accurate for standard details like names, addresses, and dates. Always review every field before submitting the official form." },
  { q: "Can I use this for any type of form?", a: "FormAssist AI currently supports common government and administrative forms across categories like address changes, vehicle transfers, name changes, and benefits enrollment. More form types are added regularly." },
  { q: "Is my data secure?", a: "Yes. Your data is encrypted in transit and at rest. We do not sell or share your personal information with third parties, and you can request deletion of your data at any time." },
  { q: "Do I need an account to use FormAssist AI?", a: "You need a free account to generate form packets. This allows us to securely associate your information with your session and provide a better experience across multiple forms." },
];

function MainApp({ user, setShowAuth, getFirstName, handleSignOut }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-open auth modal if redirected from a gated action
  useEffect(() => {
    if (location.search.includes("signin=1")) {
      setShowAuth(true);
      navigate("/", { replace: true });
    }
  }, [location.search]);

  const [step, setStep]           = useState("lead");
  const [loading, setLoading]     = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError]         = useState("");
  const [situation, setSituation] = useState("");
  const [consent, setConsent]     = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [answers, setAnswers]     = useState({});
  const [downloadUrl, setDownloadUrl] = useState("");
  const [pdfReady, setPdfReady]   = useState(false);
  const [openFaq, setOpenFaq]     = useState(null);
  const [pianoHover, setPianoHover] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Resize state
  const [rightWidth, setRightWidth] = useState(620);
  const isDragging  = useRef(false);
  const startX      = useRef(0);
  const startW      = useRef(0);
  const MIN_W = 400;
  const MAX_W = 900;

  const onHandleMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.clientX;
    startW.current = rightWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [rightWidth]);

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current) return;
      const delta = startX.current - e.clientX; // drag left → panel grows
      setRightWidth(Math.min(MAX_W, Math.max(MIN_W, startW.current + delta)));
    };
    const onUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

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

  // ── Panel contents by step ──────────────────────────────────────────────
  const leftPanel = step === "lead" ? (
    <div className="fa-hero-placeholder" />
  ) : step === "recommendations" ? (
    <>
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
    </>
  ) : selectedForm ? (
    <>
      <div className="fa-eyebrow">{selectedForm.agency} · {selectedForm.description}</div>
      <h1 className="fa-h1" style={{ fontSize: "1.4rem" }}>{selectedForm.form_name} — pre-filled by AI</h1>
      <div className="fa-fill-bar-row">
        <div className="fa-fill-track"><div className="fa-fill-fill" style={{ width: `${fillPercent()}%` }} /></div>
        <span className="fa-fill-label"><strong>{filledCount()}</strong> of <strong>{totalCount()}</strong> fields pre-filled by AI</span>
      </div>
      <div className="fa-warning">Review every field. Edit anything the AI got wrong. Add sensitive info (SSN, signature) by hand before submitting.</div>
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
    </>
  ) : null;

  const rightPanel = step === "lead" ? (
    <div className="fa-tile-pair">
      {/* Tile 1 — navigate to /find-form */}
      <div className="fa-tile" onClick={() => navigate("/find-form")} style={{ cursor: "pointer" }}>
        <div className="fa-tile-img fa-tile-img-1">
          <img
            src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80"
            alt="Tax forms and documents"
            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
          />
          <div className="fa-tile-img-badge" style={{ position:"absolute", bottom:12, left:12 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/></svg>
            AI-Powered
          </div>
        </div>
        <div className="fa-tile-body">
          <h3 className="fa-tile-title">Unsure which form to fill?</h3>
          <p className="fa-tile-desc">Describe your situation and we'll identify, pre-fill, and generate the right forms automatically.</p>
          <ul className="fa-tile-checks">
            <li><span>✓</span><span><strong>AI finds the right form</strong> from your description</span></li>
            <li><span>✓</span><span><strong>Fields pre-filled</strong> automatically</span></li>
            <li><span>✓</span><span><strong>Download-ready PDF</strong> — review, sign, submit</span></li>
          </ul>
          <div className="fa-tile-cta">Let AI find my form →</div>
        </div>
      </div>

      {/* Tile 2 — scroll to browse section */}
      <div className="fa-tile" onClick={() => document.querySelector(".bbc-section")?.scrollIntoView({ behavior: "smooth" })} style={{ cursor: "pointer" }}>
        <div className="fa-tile-img fa-tile-img-2">
          <img
            src="https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=800&q=80"
            alt="Passport with stamps"
            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
          />
          <div className="fa-tile-img-badge fa-tile-img-badge-2" style={{ position:"absolute", bottom:12, left:12 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            119 forms
          </div>
        </div>
        <div className="fa-tile-body">
          <h3 className="fa-tile-title">Know which form you need?</h3>
          <p className="fa-tile-desc">Browse all 119 official forms by category — tax, immigration, passport, veterans, and more.</p>
          <ul className="fa-tile-checks">
            <li><span>✓</span><span><strong>10 categories</strong> of federal forms</span></li>
            <li><span>✓</span><span><strong>119 official forms</strong> from .gov sources</span></li>
            <li><span>✓</span><span><strong>Fill with AI</strong> or download blank</span></li>
          </ul>
          <div className="fa-tile-cta">Browse all forms →</div>
        </div>
      </div>
    </div>
  ) : step === "recommendations" ? (
    <>
      <div className="fa-panel-title">Your situation summary</div>
      <p className="fa-panel-sub">The AI extracted these key details from your description.</p>
      <div className="fa-summary-box">
        <div className="fa-summary-label">Your situation</div>
        <div className="fa-summary-text">{situation}</div>
      </div>
      <div className="fa-panel-note">Not seeing the right form?{" "}<button className="fa-inline-link" onClick={() => setStep("lead")}>Edit your situation</button></div>
      <button className="fa-secondary-btn" onClick={() => setStep("lead")}>← Back</button>
    </>
  ) : (
    <>
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
        <p className="fa-reminder-text">This is a helper packet only. Submit through official channels. We never store your SSN, payment info, or signatures.</p>
      </div>
    </>
  );

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

      {/* ── Top nav ── */}
      <nav className="fa-topnav">
        <div className="fa-topnav-brand">
          <div className="fa-brand-mark">F</div>
          <span className="fa-brand-name">FormAssist AI</span>
        </div>
        <div className="fa-topnav-links">
          <button className="fa-topnav-link" onClick={() => navigate("/")}>Home</button>
          <div className="fa-menu-dropdown">
            <button className="fa-topnav-link">Browse forms <span className="fa-menu-chevron">▾</span></button>
            <div className="fa-menu-dropdown-panel">
              {["Tax Forms","Immigration","Passport & Travel","Benefits & Social","Healthcare","Employment","Veterans","Moving & Address","Motor Vehicle","Legal"].map((label, i) => {
                const ids = ["tax","immigration","passport","benefits","healthcare","employment","veterans","moving","vehicle","legal"];
                return <button key={i} className="fa-menu-dd-item" onClick={() => navigate(`/category/${ids[i]}`)}>{label}</button>;
              })}
            </div>
          </div>
          <button className="fa-topnav-link" onClick={() => navigate("/security")}>Security</button>
          <button className="fa-topnav-link" onClick={() => document.querySelector(".hiw-section")?.scrollIntoView({ behavior: "smooth" })}>How it works</button>
        </div>
        <div className="fa-topnav-right">
          {user ? (
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              {user.photoURL
                ? <img src={user.photoURL} className="fa-avatar-img" alt="" style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover" }} />
                : <div className="fa-avatar" style={{ width:32, height:32, fontSize:13 }}>{getFirstName(user)?.[0] ?? "U"}</div>}
              <span style={{ color:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:500 }}>{getFirstName(user)}</span>
              <button className="fa-topnav-signin" onClick={handleSignOut} style={{ background:"rgba(255,255,255,0.1)" }}>Sign out</button>
            </div>
          ) : (
            <button className="fa-topnav-signin" onClick={() => setShowAuth(true)}>Sign up — it's free</button>
          )}
        </div>
      </nav>

      {/* ── Full-bleed photo hero (lead step only) ── */}
      {step === "lead" && (
        <div className="fa-hero-fullbleed">
          <div className="fa-hero-overlay" />
          <div className="fa-hero-content">
            <h1 className="fa-hero-h1">Fill Any Form<br /><span className="fa-hero-accent">in Minutes</span></h1>
            <p className="fa-hero-p">Our AI asks simple questions and fills tax forms, passport applications, and government documents — from official .gov PDFs.</p>
            <div className="fa-hero-search-wrap">
              <input
                className="fa-hero-search"
                placeholder="Search for a form — W-9, I-485, DS-11, 1040…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    const match = FORMS_FLAT.find(f =>
                      f.short_name.toLowerCase().includes(q) ||
                      f.form_id.toLowerCase().includes(q) ||
                      f.form_name.toLowerCase().includes(q)
                    );
                    if (match) navigate(`/form/${match.form_id}`);
                    else setSearchResults(FORMS_FLAT.filter(f =>
                      f.short_name.toLowerCase().includes(q) ||
                      f.form_id.toLowerCase().includes(q) ||
                      f.form_name.toLowerCase().includes(q)
                    ).slice(0, 6));
                  }
                }}
              />
              <button className="fa-hero-search-btn" onClick={() => {
                const q = searchQuery.toLowerCase();
                if (!q.trim()) return;
                setSearchResults(FORMS_FLAT.filter(f =>
                  f.short_name.toLowerCase().includes(q) ||
                  f.form_id.toLowerCase().includes(q) ||
                  f.form_name.toLowerCase().includes(q)
                ).slice(0, 6));
              }}>Search</button>
              {searchResults.length > 0 && (
                <div className="fa-hero-search-results">
                  {searchResults.map(f => (
                    <button key={f.form_id} className="fa-hero-search-result"
                      onClick={() => { navigate(`/form/${f.form_id}`); setSearchResults([]); setSearchQuery(""); }}>
                      <span className="fa-search-result-short">{f.short_name}</span>
                      <span className="fa-search-result-name">{f.form_name.split(",")[0]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="fa-hero-btns">
              <button className="fa-hero-btn-primary" onClick={() => document.querySelector(".fa-tile-pair")?.scrollIntoView({ behavior: "smooth" })}>
                Get Started →
              </button>
              <button className="fa-hero-btn-secondary" onClick={() => document.querySelector(".hiw-section")?.scrollIntoView({ behavior: "smooth" })}>
                Learn More
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Non-lead steps use the right panel ── */}
      {step !== "lead" && (
        <div className="fa-split-container">
          <div className="fa-left">{leftPanel}</div>
          <div className="fa-drag-handle" onMouseDown={onHandleMouseDown} title="Drag to resize">
            <div className="fa-drag-grip"><span /><span /><span /><span /><span /></div>
          </div>
          <div className="fa-right" style={{ width: rightWidth, minWidth: rightWidth, maxWidth: rightWidth }}>
            {rightPanel}
          </div>
        </div>
      )}

      {/* ── Tile pair shown on lead step below hero ── */}
      {step === "lead" && (
        <div className="fa-tile-section">
          {rightPanel}
        </div>
      )}

      {/* ── Full-width sections below — completely unaffected by resize ── */}
      {step === "lead" && (
        <>
          <BrowseByCategory />

          {/* ── How it works + rotating trust cards ── */}
          <HowItWorks />

          <PopularForms />
          <section className="fa-faq-section">
            <div className="fa-faq-inner">
              <div className="fa-faq-header">
                <div className="fa-eyebrow" style={{ color: "#8899bb" }}>Common questions</div>
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

      {/* ── Footer ── */}
      {step === "lead" && (
        <footer className="fa-footer">
          <div className="fa-footer-inner">
            <div className="fa-footer-top">
              <div className="fa-footer-brand">
                <div className="fa-footer-logo">
                  <div className="fa-brand-mark" style={{ width: 32, height: 32, fontSize: 14 }}>F</div>
                  <span className="fa-brand-name" style={{ color: "#fff" }}>FormAssist AI</span>
                </div>
                <p className="fa-footer-tagline">Official government forms, pre-filled by AI. Review, sign, and submit through official channels.</p>
                <div className="fa-footer-source">Forms sourced from IRS · USCIS · SSA · State Dept. · VA · CMS · USPS</div>
              </div>
              <div className="fa-footer-cols">
                <div className="fa-footer-col">
                  <div className="fa-footer-col-title">Forms</div>
                  {["tax","immigration","passport","benefits","healthcare","veterans","employment","moving"].map((cat, i) => (
                    <button key={cat} className="fa-footer-link" onClick={() => navigate(`/category/${cat}`)}>
                      {["Tax Forms","Immigration","Passport & Travel","Benefits & Social","Healthcare","Veterans","Employment","Moving & Address"][i]}
                    </button>
                  ))}
                </div>
                <div className="fa-footer-col">
                  <div className="fa-footer-col-title">Company</div>
                  <button className="fa-footer-link" onClick={() => navigate("/security")}>Security & Privacy</button>
                  <button className="fa-footer-link" onClick={() => document.querySelector(".hiw-section")?.scrollIntoView({ behavior: "smooth" })}>How it works</button>
                  <button className="fa-footer-link" onClick={() => navigate("/find-form")}>AI Form Finder</button>
                </div>
                <div className="fa-footer-col">
                  <div className="fa-footer-col-title">Legal</div>
                  <span className="fa-footer-text">FormAssist AI is not affiliated with any government agency. We prepare helper packets only — you submit through official channels.</span>
                  <span className="fa-footer-text" style={{ marginTop: 10, display: "block" }}>We never store SSNs, payment data, or government ID numbers.</span>
                </div>
              </div>
            </div>
            <div className="fa-footer-bottom">
              <span>© 2026 FormAssist AI. All rights reserved.</span>
              <span>Not affiliated with IRS, USCIS, SSA, or any U.S. government agency.</span>
            </div>
          </div>
        </footer>
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

      <Routes>
        <Route path="/" element={<MainApp user={user} setShowAuth={setShowAuth} handleSignOut={handleSignOut} getFirstName={getFirstName} getInitials={getInitials} />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/form/:formId" element={<FormDetailPage />} />
        <Route path="/form/:formId/fill" element={<FormFillPage />} />
        <Route path="/find-form" element={<SituationPage />} />
        <Route path="/security" element={<SecurityPage />} />
      </Routes>
    </div>
  );
}

// ── Small components ──────────────────────────────────────────────────────────

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