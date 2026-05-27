import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const CHIPS = [
  "Moving states", "Name change", "Lost document",
  "Benefits enrollment", "Vehicle transfer", "Address update",
  "Starting a business", "Passport renewal", "DACA renewal", "Medicare enrollment",
];

export default function SituationPage() {
  const navigate = useNavigate();
  const [situation, setSituation] = useState("");
  const [consent, setConsent]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  async function handleFind() {
    if (!situation.trim()) { setError("Please describe your situation first."); return; }
    if (!consent) { setError("Please check the consent box to continue."); return; }
    setError(""); setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/api/analyze-situation`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: "User", email: "", situation, consent }),
      });
      const data = await res.json();
      // Navigate to home with recs in state
      navigate("/", { state: { recommendations: data.recommended_forms || [], situation } });
    } catch (e) { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="sp-shell">
      <nav className="fa-nav">
        <div className="fa-brand">
          <div className="fa-brand-mark">F</div>
          <span className="fa-brand-name">FormAssist AI</span>
        </div>
        <button className="fa-nav-cta" onClick={() => navigate("/")}>← Back</button>
      </nav>

      <div className="sp-body">
        <div className="sp-left">
          {/* Photo card — LegalZoom guided tools style */}
          <div className="sp-photo-card">
            <div className="sp-photo-img">
              {/* Illustrative scene using CSS */}
              <div className="sp-photo-scene">
                <div className="sp-scene-desk">
                  <div className="sp-scene-monitor">
                    <div className="sp-screen-glow" />
                    <div className="sp-screen-lines">
                      <span/><span/><span/><span/><span/>
                    </div>
                  </div>
                  <div className="sp-scene-docs">
                    <div className="sp-doc sp-doc-1" />
                    <div className="sp-doc sp-doc-2" />
                    <div className="sp-doc sp-doc-3" />
                  </div>
                </div>
                <div className="sp-scene-badge">
                  <div className="sp-badge-inner">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                    <span>AI-Powered</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="sp-photo-body">
              <h3 className="sp-photo-title">Let AI find the right form</h3>
              <p className="sp-photo-sub">Describe your situation in plain English and we'll identify, pre-fill, and generate the correct government forms for you.</p>
              <ul className="sp-checklist">
                <li><span className="sp-check">✓</span><span><strong>No legal jargon</strong> — just describe what happened</span></li>
                <li><span className="sp-check">✓</span><span><strong>AI pre-fills</strong> every field from your description</span></li>
                <li><span className="sp-check">✓</span><span><strong>Download-ready PDF</strong> — review, sign, submit officially</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="sp-right">
          <div className="fa-eyebrow" style={{ color: "#6b7a99" }}>AI-powered</div>
          <h1 className="sp-title">Unsure which form to fill?</h1>
          <p className="sp-subtitle">Describe your situation and we'll find and pre-fill the right forms automatically.</p>

          <div className="sp-trust-row">
            <div className="sp-trust-badge"><span>🔒</span> No SSN required</div>
            <div className="sp-trust-badge"><span>🛡</span> Helper packet only</div>
            <div className="sp-trust-badge"><span>👁</span> No submission</div>
          </div>

          {error && <div className="fa-error">{error}</div>}

          <label className="fa-field-label" htmlFor="sp-situation" style={{ marginBottom: 8, display: "block" }}>
            Describe your situation
          </label>
          <textarea
            id="sp-situation"
            className="sp-textarea"
            rows={5}
            value={situation}
            onChange={e => setSituation(e.target.value)}
            placeholder="Example: I'm moving from California to Washington and need to update my address with USPS and transfer my vehicle title."
          />

          <div className="sp-chips">
            {CHIPS.map(chip => (
              <button key={chip} className="sp-chip"
                onClick={() => setSituation(s => s ? s + " " + chip.toLowerCase() : chip)}>
                {chip}
              </button>
            ))}
          </div>

          <div className="sp-consent-row">
            <input id="sp-consent" type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
            <label htmlFor="sp-consent" className="sp-consent-label">
              I agree that FormAssist AI may use my information to recommend forms and prepare helper packets.
              This app does not officially submit forms on my behalf.
            </label>
          </div>

          <button className="fa-cta-btn" onClick={handleFind} disabled={loading || !situation.trim()}>
            {loading ? "Finding your forms…" : "Find my forms →"}
          </button>
          <p className="sp-privacy">We never ask for SSN, payment cards, signatures, or government IDs.</p>
        </div>
      </div>
    </div>
  );
}