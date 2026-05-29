import { useNavigate } from "react-router-dom";

export default function SecurityPage() {
  const navigate = useNavigate();

  return (
    <div className="sec-shell">

      {/* Nav */}
      <nav className="fa-topnav">
        <div className="fa-topnav-brand" onClick={() => navigate("/")} style={{ cursor:"pointer" }}>
          <div className="fa-brand-mark">F</div>
          <span className="fa-brand-name">FormAssist AI</span>
        </div>
        <div className="fa-topnav-right">
          <button className="fa-topnav-signin" onClick={() => navigate("/")}>← Back to home</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(rgba(10,22,48,0.82) 0%, rgba(10,22,48,0.7) 100%), url('https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1600&q=80') center/cover no-repeat",
        padding: "60px 64px 56px",
      }}>
        <div style={{ maxWidth:700, position:"relative", zIndex:1 }}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"rgba(255,255,255,0.45)", marginBottom:12 }}>Trust & Privacy</div>
          <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"2.6rem", fontWeight:400, color:"#fff", margin:"0 0 16px", lineHeight:1.15, letterSpacing:"-0.3px" }}>
            How FormAssist AI handles your information
          </h1>
          <p style={{ fontSize:16, color:"rgba(255,255,255,0.7)", lineHeight:1.65, margin:"0 0 28px", maxWidth:580 }}>
            We only ask for the information needed to fill your specific form — and we never store the sensitive parts. Here's exactly how it works.
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
            {["No SSN stored","No payment data","Official .gov forms only","You submit — not us"].map(b => (
              <span key={b} style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.85)" }}>{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* What we collect — honest table */}
      <section style={{ background:"#fff", padding:"64px 64px 56px" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"1.9rem", fontWeight:400, color:"#0d1f3c", margin:"0 0 10px" }}>Exactly what we collect — and what we don't</h2>
          <p style={{ fontSize:15, color:"#6b7280", lineHeight:1.65, margin:"0 0 36px" }}>
            FormAssist AI is a helper tool. We ask only the fields required for your specific form. You decide what to provide.
          </p>

          <div style={{ border:"1.5px solid #e5e7eb", borderRadius:14, overflow:"hidden" }}>
            {/* Header */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 100px 100px", background:"#0d1f3c", padding:"12px 20px", gap:8 }}>
              <span style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.07em" }}>Information type</span>
              <span style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.07em", textAlign:"center" }}>Collected</span>
              <span style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.07em", textAlign:"center" }}>Stored</span>
            </div>
            {[
              ["Your name, address, email",                            true,  "Optional — only if you enable 'Remember my answers'"],
              ["Date of birth, place of birth",                        true,  "Optional — only if you enable 'Remember my answers'"],
              ["Employment info, income figures",                      true,  "Optional — only if you enable 'Remember my answers'"],
              ["Social Security Number (SSN / ITIN)",                  false, "Never — we explicitly exclude this from saved data"],
              ["Alien Registration Number (A-Number)",                 false, "Never — we explicitly exclude this from saved data"],
              ["Passport or government ID numbers",                    false, "Never — we explicitly exclude this from saved data"],
              ["Payment card or bank account numbers",                 false, "Never — excluded from all fields and storage"],
              ["Handwritten signatures",                               false, "Never — you sign the physical form yourself"],
              ["Your uploaded documents (for AI extraction)",          true,  "Never — used only to extract data in-session, then discarded"],
              ["Account email (Firebase Auth)",                        true,  "Yes — required to maintain your account"],
              ["Generated PDF packets",                                true,  "Temporarily — deleted from server after download"],
            ].map(([label, collected, note], i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 100px 100px", padding:"14px 20px", borderTop:"1px solid #f3f4f6", background: i%2===0?"#fff":"#fafafa", gap:8, alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:500, color:"#0d1f3c", marginBottom:2 }}>{label}</div>
                  <div style={{ fontSize:12, color:"#9ca3af" }}>{note}</div>
                </div>
                <div style={{ textAlign:"center" }}>
                  {collected
                    ? <span style={{ fontSize:13, fontWeight:700, color:"#0d1f3c" }}>Yes</span>
                    : <span style={{ fontSize:13, fontWeight:700, color:"#dc2626" }}>No</span>}
                </div>
                <div style={{ textAlign:"center" }}>
                  {!collected || note.startsWith("Never")
                    ? <span style={{ fontSize:13, fontWeight:700, color:"#dc2626" }}>Never</span>
                    : note.includes("Optional")
                      ? <span style={{ fontSize:13, fontWeight:700, color:"#d97706" }}>Optional</span>
                      : <span style={{ fontSize:13, fontWeight:700, color:"#0d1f3c" }}>Yes</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works technically */}
      <section style={{ background:"#f9fafb", padding:"64px 64px 56px", borderTop:"1px solid #e5e7eb" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"1.9rem", fontWeight:400, color:"#0d1f3c", margin:"0 0 10px" }}>How the system actually works</h2>
          <p style={{ fontSize:15, color:"#6b7280", lineHeight:1.65, margin:"0 0 36px" }}>No black boxes. Here's the technical flow from your input to the downloaded PDF.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {[
              {
                n:"01", title:"You describe your situation or fill in a form",
                body:"You type your situation in plain English, or you navigate directly to a form and fill in the fields. We ask only the fields that form actually requires — nothing extra.",
                tag:null
              },
              {
                n:"02", title:"Claude AI extracts or maps your answers",
                body:"If you upload a document (passport, prior form, ID), Claude AI reads it and extracts relevant text. That document is never stored on our servers — it's processed in-memory during your session only. If you type answers manually, they go directly to the PDF filler.",
                tag:"Powered by Claude (Anthropic)"
              },
              {
                n:"03", title:"Your data is mapped to official .gov form fields",
                body:"We download the actual official PDF from the relevant agency (IRS, USCIS, SSA, etc.) and fill the AcroForm fields directly using your answers. We use the exact form you'd get from irs.gov or uscis.gov — not a template or approximation.",
                tag:"119 official .gov PDFs"
              },
              {
                n:"04", title:"You download the filled PDF",
                body:"The completed packet is stored temporarily on our server so you can download it. It's deleted automatically after download. We never email, submit, or transmit your PDF to any government agency.",
                tag:"You submit — not us"
              },
              {
                n:"05", title:"You review, sign, and submit officially",
                body:"Every packet includes a reminder to review all fields, add sensitive info (SSN, signatures) by hand, and submit only through the official agency channel — irs.gov, uscis.gov, usps.com, va.gov, etc. We are a preparation tool, not a filing service.",
                tag:null
              },
            ].map((s, i, arr) => (
              <div key={s.n} style={{ display:"grid", gridTemplateColumns:"72px 1fr", gap:0 }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <div style={{ width:44, height:44, borderRadius:"50%", background:"#0d1f3c", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, flexShrink:0 }}>{s.n}</div>
                  {i < arr.length-1 && <div style={{ width:2, flex:1, background:"#e5e7eb", margin:"4px 0" }} />}
                </div>
                <div style={{ paddingBottom: i < arr.length-1 ? 32 : 0, paddingTop:8, paddingLeft:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, flexWrap:"wrap" }}>
                    <h3 style={{ fontSize:16, fontWeight:700, color:"#0d1f3c", margin:0 }}>{s.title}</h3>
                    {s.tag && <span style={{ fontSize:11, fontWeight:700, background:"#e8edf7", color:"#1e3a6e", borderRadius:6, padding:"2px 9px" }}>{s.tag}</span>}
                  </div>
                  <p style={{ fontSize:14, color:"#6b7280", lineHeight:1.7, margin:0 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth & account */}
      <section style={{ background:"#fff", padding:"64px 64px 56px", borderTop:"1px solid #e5e7eb" }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:32 }}>
          <div style={{ background:"#f9fafb", border:"1.5px solid #e5e7eb", borderRadius:16, padding:"28px" }}>
            <div style={{ width:44, height:44, background:"#0d1f3c", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3 style={{ fontSize:16, fontWeight:700, color:"#0d1f3c", margin:"0 0 10px" }}>Account security — Firebase Auth</h3>
            <p style={{ fontSize:14, color:"#6b7280", lineHeight:1.7, margin:0 }}>
              Accounts are managed through Google Firebase Authentication. We never store your password — Firebase handles all credential management using industry-standard OAuth 2.0. Supports Sign in with Google with brute-force protection built in.
            </p>
          </div>
          <div style={{ background:"#f9fafb", border:"1.5px solid #e5e7eb", borderRadius:16, padding:"28px" }}>
            <div style={{ width:44, height:44, background:"#0d1f3c", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
            </div>
            <h3 style={{ fontSize:16, fontWeight:700, color:"#0d1f3c", margin:"0 0 10px" }}>Optional local data saving</h3>
            <p style={{ fontSize:14, color:"#6b7280", lineHeight:1.7, margin:0 }}>
              The "Remember my answers" toggle saves non-sensitive form data to your browser's local storage only — it never leaves your device. SSNs, alien numbers, passport numbers, and all other sensitive fields are explicitly excluded from this feature regardless of the setting.
            </p>
          </div>
          <div style={{ background:"#f9fafb", border:"1.5px solid #e5e7eb", borderRadius:16, padding:"28px" }}>
            <div style={{ width:44, height:44, background:"#0d1f3c", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h3 style={{ fontSize:16, fontWeight:700, color:"#0d1f3c", margin:"0 0 10px" }}>We are not a law or tax firm</h3>
            <p style={{ fontSize:14, color:"#6b7280", lineHeight:1.7, margin:0 }}>
              FormAssist AI prepares helper packets only. We do not provide legal advice, tax advice, or immigration advice. The forms we fill are for reference — you are responsible for reviewing every field, verifying accuracy, and submitting through official channels. When in doubt, consult a licensed professional.
            </p>
          </div>
          <div style={{ background:"#f9fafb", border:"1.5px solid #e5e7eb", borderRadius:16, padding:"28px" }}>
            <div style={{ width:44, height:44, background:"#0d1f3c", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </div>
            <h3 style={{ fontSize:16, fontWeight:700, color:"#0d1f3c", margin:"0 0 10px" }}>No third-party data sharing</h3>
            <p style={{ fontSize:14, color:"#6b7280", lineHeight:1.7, margin:0 }}>
              Your personal information is never sold, shared, or provided to advertisers, data brokers, or marketing platforms. The only third-party services we use are Firebase (auth), OpenAI/Anthropic (AI extraction during your session), and our hosting provider.
            </p>
          </div>
        </div>
      </section>

      {/* Official sources */}
      <section style={{ background:"#0d1f3c", padding:"56px 64px" }}>
        <div style={{ maxWidth:900, margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"1.8rem", fontWeight:400, color:"#fff", margin:"0 0 12px" }}>Forms sourced directly from official agencies</h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.55)", margin:"0 0 36px", lineHeight:1.65 }}>
            Every PDF we fill is downloaded from the original government source. We do not use third-party form providers or scanned copies.
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:12, justifyContent:"center", marginBottom:40 }}>
            {[
              ["IRS","irs.gov","Tax forms — W-9, 1040, W-4, schedules"],
              ["USCIS","uscis.gov","Immigration — I-765, I-485, N-400, I-130"],
              ["SSA","ssa.gov","Social Security — SS-5, SSA-44, disability"],
              ["State Dept.","travel.state.gov","Passport — DS-11, DS-82, DS-64"],
              ["VA","va.gov","Veterans — 21-526EZ, 22-1990, 21-4142"],
              ["CMS","cms.gov","Medicare — CMS-40B, CMS-L564"],
              ["USPS","usps.com","Moving — PS Form 3575"],
              ["Dept. of Labor","dol.gov","Employment — WH-380, WH-381, WH-382"],
            ].map(([agency, url, forms]) => (
              <div key={agency} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"16px 20px", textAlign:"left", minWidth:200 }}>
                <div style={{ fontSize:15, fontWeight:700, color:"#fff", marginBottom:2 }}>{agency}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginBottom:6 }}>{url}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.55)" }}>{forms}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/")}
            style={{ background:"#2dd4b0", color:"#0a1628", border:"none", borderRadius:10, padding:"14px 32px", fontSize:15, fontWeight:700, fontFamily:"inherit", cursor:"pointer" }}>
            Start filling a form →
          </button>
        </div>
      </section>

    </div>
  );
}