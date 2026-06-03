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
  const [situation, setSituation]         = useState("");
  const [consent, setConsent]             = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [recommendations, setRecommendations] = useState(null); // null = not searched yet

  async function handleFind() {
    if (!situation.trim()) { setError("Please describe your situation first."); return; }
    if (!consent)          { setError("Please check the consent box to continue."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/analyze-situation`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: "User", email: "", situation, consent }),
      });
      if (!res.ok) throw new Error("Server error — is the backend running?");
      const data = await res.json();
      setRecommendations(data.recommended_forms || []);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectForm(form) {
    // Navigate to that form's fill page, passing the situation as prefill hint
    navigate(`/form/${form.form_id}/fill`, {
      state: { situation, prefillSituation: situation }
    });
  }

  const CONF_COLORS = {
    high:   { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
    medium: { bg: "#fffbeb", color: "#92400e", border: "#fcd34d" },
    low:    { bg: "#f9fafb", color: "#374151", border: "#e5e7eb" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>

      {/* Nav */}
      <nav className="fa-topnav">
        <div className="fa-topnav-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <div className="fa-brand-mark">F</div>
          <span className="fa-brand-name">DocuLyft</span>
        </div>
        <div className="fa-topnav-right">
          <button className="fa-topnav-signin" onClick={() => navigate("/")}>← Back</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(rgba(10,22,48,0.78) 0%, rgba(10,22,48,0.65) 100%), url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=80') center/cover no-repeat",
        padding: "56px 64px 52px",
      }}>
        <div style={{ maxWidth: 640, position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", marginBottom: 12 }}>AI-Powered Form Finder</div>
          <h1 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "2.6rem", fontWeight: 400, color: "#fff", margin: "0 0 14px", lineHeight: 1.15 }}>
            Unsure which form to fill?
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", lineHeight: 1.65, margin: "0 0 24px", maxWidth: 520 }}>
            Describe your situation in plain English and we'll identify the right government forms for you.
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 32px 80px" }}>

        {/* Input card */}
        <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 20, padding: "32px 36px", boxShadow: "0 4px 24px rgba(13,31,60,0.07)", marginBottom: 36 }}>
          <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "1.6rem", fontWeight: 400, color: "#0d1f3c", margin: "0 0 6px" }}>Describe your situation</h2>
          <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, margin: "0 0 18px" }}>
            Be as specific as you like — the more detail you give, the better the matches.
          </p>

          {/* Quick chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
            {CHIPS.map(chip => (
              <button key={chip}
                onClick={() => setSituation(s => s ? s + " " + chip.toLowerCase() : chip)}
                style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 500, color: "#374151", cursor: "pointer", fontFamily: "inherit" }}>
                {chip}
              </button>
            ))}
          </div>

          <textarea
            style={{ width: "100%", border: "1.5px solid #d1d5db", borderRadius: 12, padding: "13px 14px", fontSize: 14, fontFamily: "inherit", color: "#0d1f3c", resize: "none", lineHeight: 1.55, marginBottom: 16, background: "#fff", boxSizing: "border-box", outline: "none" }}
            rows={5}
            value={situation}
            onChange={e => { setSituation(e.target.value); setRecommendations(null); }}
            placeholder="Example: I'm moving from California to Washington and need to update my address with USPS and transfer my vehicle title."
            onFocus={e => e.target.style.borderColor = "#0d1f3c"}
            onBlur={e => e.target.style.borderColor = "#d1d5db"}
          />

          {/* Consent */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 10, marginBottom: 16 }}>
            <input id="sp-consent" type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: 2, flexShrink: 0 }} />
            <label htmlFor="sp-consent" style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.55, cursor: "pointer" }}>
              I agree that DocuLyft may use my information to recommend forms and prepare helper packets. This app does not officially submit forms on my behalf.
            </label>
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#991b1b", marginBottom: 14 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleFind}
            disabled={loading || !situation.trim()}
            style={{ width: "100%", background: loading || !situation.trim() ? "#9ca3af" : "#0d1f3c", color: "#fff", border: "none", borderRadius: 12, padding: "15px", fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: loading || !situation.trim() ? "not-allowed" : "pointer", transition: "background 0.13s" }}>
            {loading ? "Analyzing your situation…" : "Find my forms →"}
          </button>
          <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: 10 }}>We never ask for SSN, payment cards, signatures, or government IDs.</p>
        </div>

        {/* Results */}
        {recommendations !== null && (
          <div>
            <h3 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "1.4rem", fontWeight: 400, color: "#0d1f3c", margin: "0 0 6px" }}>
              {recommendations.length > 0
                ? `${recommendations.length} form${recommendations.length !== 1 ? "s" : ""} match your situation`
                : "No forms found"}
            </h3>
            <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 20px" }}>
              {recommendations.length > 0
                ? "Select a form to pre-fill it with your details."
                : "Try describing your situation with more detail, or browse forms by category."}
            </p>

            {recommendations.length === 0 && (
              <button
                onClick={() => navigate("/")}
                style={{ background: "#0d1f3c", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
                Browse all forms →
              </button>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {recommendations.map(form => {
                const conf = CONF_COLORS[form.confidence] || CONF_COLORS.low;
                return (
                  <div key={form.form_id} style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "22px 24px", boxShadow: "0 2px 12px rgba(13,31,60,0.05)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#0d1f3c" }}>{form.form_name}</span>
                        <span style={{ background: conf.bg, color: conf.color, border: `1px solid ${conf.border}`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
                          {form.confidence} match
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: "#6b7280", margin: 0, lineHeight: 1.5 }}>{form.reason}</p>
                    </div>
                    <button
                      onClick={() => handleSelectForm(form)}
                      style={{ background: "#0d1f3c", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                      Fill this form →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}