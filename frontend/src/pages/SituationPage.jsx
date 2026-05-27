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
      const res = await fetch(`${API_BASE}/api/analyze-situation`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: "User", email: "", situation, consent }),
      });
      const data = await res.json();
      navigate("/", { state: { recommendations: data.recommended_forms || [], situation } });
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight:"100vh", background:"#fff" }}>

      {/* Nav */}
      <nav className="fa-topnav">
        <div className="fa-topnav-brand" onClick={() => navigate("/")} style={{ cursor:"pointer" }}>
          <div className="fa-brand-mark">F</div>
          <span className="fa-brand-name">FormAssist AI</span>
        </div>
        <div className="fa-topnav-right">
          <button className="fa-topnav-signin" onClick={() => navigate("/")}>← Back</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(rgba(10,22,48,0.78) 0%, rgba(10,22,48,0.65) 100%), url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=80') center/cover no-repeat",
        padding: "56px 64px 52px",
        position: "relative",
      }}>
        <div style={{ maxWidth: 640, position:"relative", zIndex:1 }}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"rgba(255,255,255,0.45)", marginBottom:12 }}>AI-Powered Form Finder</div>
          <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"2.6rem", fontWeight:400, color:"#fff", margin:"0 0 14px", lineHeight:1.15, letterSpacing:"-0.3px" }}>
            Unsure which form to fill?
          </h1>
          <p style={{ fontSize:16, color:"rgba(255,255,255,0.7)", lineHeight:1.65, margin:"0 0 24px", maxWidth:520 }}>
            Describe your situation in plain English and we'll identify, pre-fill, and generate the correct government forms automatically.
          </p>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap", fontSize:12, color:"rgba(255,255,255,0.45)", fontWeight:500 }}>
            <span>No SSN required</span>
            <span>·</span>
            <span>Helper packet only</span>
            <span>·</span>
            <span>No submission on your behalf</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"48px 48px 80px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"start" }}>

        {/* Left — illustration card */}
        <div style={{ background:"#fff", border:"1.5px solid #e5e7eb", borderRadius:20, overflow:"hidden", boxShadow:"0 4px 24px rgba(13,31,60,0.08)" }}>
          <div style={{ height:260, background:"linear-gradient(145deg, #0d1f3c 0%, #1a3460 100%)", position:"relative", overflow:"hidden" }}>
            <img
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80"
              alt="Person at desk with forms"
              style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.45 }}
            />
            <div style={{ position:"absolute", bottom:16, right:20 }}>
              <div style={{ background:"rgba(255,255,255,0.12)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:22, padding:"6px 14px", fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.9)", display:"flex", alignItems:"center", gap:7 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                AI-Powered
              </div>
            </div>
          </div>
          <div style={{ padding:"24px 26px 26px" }}>
            <h3 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"1.3rem", fontWeight:400, color:"#0d1f3c", margin:"0 0 10px" }}>Let AI find the right form</h3>
            <p style={{ fontSize:13, color:"#6b7280", lineHeight:1.65, margin:"0 0 18px" }}>Describe your situation in plain English and we'll identify, pre-fill, and generate the correct government forms for you.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                ["No legal jargon", "— just describe what happened"],
                ["AI pre-fills", "every field from your description"],
                ["Download-ready PDF", "— review, sign, submit officially"],
              ].map(([bold, rest]) => (
                <div key={bold} style={{ display:"flex", alignItems:"flex-start", gap:10, fontSize:13, color:"#374151" }}>
                  <span style={{ color:"#2dd4b0", fontWeight:700, marginTop:1 }}>✓</span>
                  <span><strong style={{ color:"#0d1f3c" }}>{bold}</strong> {rest}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div>
          <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"1.8rem", fontWeight:400, color:"#0d1f3c", margin:"0 0 8px" }}>Describe your situation</h2>
          <p style={{ fontSize:14, color:"#6b7280", lineHeight:1.6, margin:"0 0 20px" }}>
            Tell us what you need help with. Be as specific as you like — we'll figure out the right forms.
          </p>

          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:18 }}>
            {[["No SSN required","#f0fdf4","#166534","#bbf7d0"],["Helper packet only","#eff6ff","#1e40af","#bfdbfe"],["No submission","#fafafa","#374151","#e5e7eb"]].map(([label,bg,color,border]) => (
              <span key={label} style={{ background:bg, color, border:`1.5px solid ${border}`, borderRadius:20, padding:"4px 13px", fontSize:12, fontWeight:600 }}>{label}</span>
            ))}
          </div>

          {error && <div className="fa-error" style={{ marginBottom:14 }}>{error}</div>}

          <label style={{ display:"block", fontSize:13, fontWeight:700, color:"#0d1f3c", marginBottom:8 }}>Your situation</label>
          <textarea
            style={{ width:"100%", border:"1.5px solid #d1d5db", borderRadius:12, padding:"13px 14px", fontSize:14, fontFamily:"inherit", color:"#0d1f3c", resize:"none", lineHeight:1.55, marginBottom:12, background:"#fff", boxSizing:"border-box" }}
            rows={5}
            value={situation}
            onChange={e => setSituation(e.target.value)}
            placeholder="Example: I'm moving from California to Washington and need to update my address with USPS and transfer my vehicle title."
            onFocus={e => e.target.style.borderColor="#0d1f3c"}
            onBlur={e => e.target.style.borderColor="#d1d5db"}
          />

          <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:18 }}>
            {CHIPS.map(chip => (
              <button key={chip}
                onClick={() => setSituation(s => s ? s + " " + chip.toLowerCase() : chip)}
                style={{ background:"#f9fafb", border:"1.5px solid #e5e7eb", borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:500, color:"#374151", cursor:"pointer", fontFamily:"inherit" }}>
                {chip}
              </button>
            ))}
          </div>

          <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"14px 16px", background:"#f9fafb", border:"1.5px solid #e5e7eb", borderRadius:10, marginBottom:18 }}>
            <input id="sp-consent" type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop:2, flexShrink:0 }} />
            <label htmlFor="sp-consent" style={{ fontSize:13, color:"#6b7280", lineHeight:1.55, cursor:"pointer" }}>
              I agree that FormAssist AI may use my information to recommend forms and prepare helper packets. This app does not officially submit forms on my behalf.
            </label>
          </div>

          <button
            onClick={handleFind}
            disabled={loading || !situation.trim()}
            style={{ width:"100%", background: loading||!situation.trim() ? "#9ca3af" : "#0d1f3c", color:"#fff", border:"none", borderRadius:12, padding:"15px", fontSize:16, fontWeight:700, fontFamily:"inherit", cursor: loading||!situation.trim() ? "not-allowed" : "pointer", transition:"background 0.13s" }}>
            {loading ? "Finding your forms…" : "Find my forms →"}
          </button>
          <p style={{ fontSize:11, color:"#9ca3af", textAlign:"center", marginTop:10 }}>We never ask for SSN, payment cards, signatures, or government IDs.</p>
        </div>
      </div>
    </div>
  );
}