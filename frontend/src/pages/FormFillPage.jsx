import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFormById, getCategoryById } from "../data/formsData";

const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const SENSITIVE = ["ssn","social_security","tax_id","signature","passport_number","license_number","alien_number","routing","account_number"];
const isSensitive = (id) => SENSITIVE.some(s => id.toLowerCase().includes(s));

export default function FormFillPage() {
  const { formId } = useParams();
  const navigate   = useNavigate();
  const form       = getFormById(formId);
  const category   = form ? getCategoryById(form.category) : null;

  const [step, setStep]           = useState("fill");   // fill | done
  const [entryMode, setEntryMode] = useState(null);     // null | upload | manual
  const [answers, setAnswers]     = useState({});
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError]         = useState("");
  const [saveData, setSaveData]   = useState(false);
  const [pdfUrl, setPdfUrl]       = useState("");
  const [pdfMethod, setPdfMethod] = useState("");
  const [emailAddr, setEmailAddr] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [dragOver, setDragOver]   = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileRef = useRef();

  // Load questions from backend
  useEffect(() => {
    fetch(`${API}/api/forms/${formId}`)
      .then(r => r.json())
      .then(d => {
        if (d.questions?.length) setQuestions(d.questions);
        else setQuestions(buildGeneric(form?.fields || []));
      })
      .catch(() => setQuestions(buildGeneric(form?.fields || [])));
  }, [formId]);

  // Restore saved non-sensitive data
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`fa_${formId}`);
      if (saved) setAnswers(JSON.parse(saved));
    } catch {}
  }, [formId]);

  function buildGeneric(fields) {
    return fields.map((label, i) => ({
      id: label.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + i,
      label, type: label.toLowerCase().includes("date") ? "date" : "text", required: false,
    }));
  }

  function set(id, val) { setAnswers(p => ({ ...p, [id]: val })); }

  const filled = questions ? Object.values(answers).filter(v => v && String(v).trim()).length : 0;
  const total  = questions?.length || 0;
  const pct    = total ? Math.round(filled / total * 100) : 0;

  // ── Extract from uploaded file ──────────────────────────────────────────
  async function handleExtract() {
    if (!uploadedFile) { setError("Please upload a file first."); return; }
    setError(""); setLoading(true); setLoadingMsg("Reading your document with AI…");
    try {
      const text = await uploadedFile.text().catch(async () => {
        // Binary file — just use filename + size as hint
        return `File: ${uploadedFile.name} (${uploadedFile.size} bytes)`;
      });
      const res = await fetch(`${API}/api/ai-fill`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_id: formId, user_details: text }),
      });
      const data = await res.json();
      if (data.error && !data.answers) throw new Error(data.error);
      setAnswers(data.answers || {});
      setEntryMode("manual");
    } catch(e) { setError(e.message); }
    finally { setLoading(false); setLoadingMsg(""); }
  }

  // ── Generate PDF ────────────────────────────────────────────────────────
  async function handleGenerate() {
    if (!questions) return;
    setError(""); setLoading(true);
    setLoadingMsg("Filling your form and generating PDF…");
    try {
      if (saveData) {
        const safe = Object.fromEntries(Object.entries(answers).filter(([k]) => !isSensitive(k)));
        localStorage.setItem(`fa_${formId}`, JSON.stringify(safe));
      }
      const res = await fetch(`${API}/api/generate-pdf`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_id: formId, form_name: form.form_name, agency: form.agency, answers, questions }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPdfUrl(`${API}${data.download_url}`);
      setPdfMethod(data.method || "");
      setStep("done");
    } catch(e) { setError(e.message); }
    finally { setLoading(false); setLoadingMsg(""); }
  }

  function handleEmail() {
    if (!emailAddr.trim()) { setError("Enter your email address."); return; }
    window.location.href = `mailto:${emailAddr}?subject=Your FormAssist AI packet — ${form?.short_name}&body=Your pre-filled ${form?.short_name} packet is ready. Download it here:%0A${pdfUrl}%0A%0AReview all fields before submitting officially.`;
    setEmailSent(true);
  }

  if (!form) return (
    <div className="cp-not-found"><h2>Form not found</h2>
      <button className="fa-cta-btn" onClick={() => navigate("/")}>← Home</button></div>
  );

  return (
    <div className="ff-shell">
      {/* Loading overlay */}
      {loading && (
        <div className="fa-overlay">
          <div className="fa-overlay-card">
            <div className="fa-spinner" />
            <p style={{ marginTop: 14, color: "var(--ink-soft)", fontSize: 14 }}>{loadingMsg}</p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="fa-nav">
        <div className="fa-brand">
          <div className="fa-brand-mark">F</div>
          <span className="fa-brand-name">FormAssist AI</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {step === "fill" && entryMode === "manual" && questions && (
            <div className="ff-nav-fill-stat">
              <div className="ff-fill-bar-track" style={{ width:100 }}>
                <div className="ff-fill-bar" style={{ width:`${pct}%` }} />
              </div>
              <span style={{ color:"rgba(255,255,255,0.7)", fontSize:12 }}>{filled}/{total}</span>
            </div>
          )}
          <button className="fa-nav-cta" onClick={() => navigate(`/form/${formId}`)}>← Back</button>
        </div>
      </nav>

      {/* ══ STEP: FILL ══════════════════════════════════════════════════════ */}
      {step === "fill" && (
        <div className="ff-split-screen">

          {/* LEFT: fields panel */}
          <div className="ff-split-left">

            {/* Mode chooser */}
            {!entryMode && (
              <div style={{ padding: "28px 24px" }}>
                <div className="fa-eyebrow" style={{ color: category?.color, marginBottom: 6 }}>{category?.label}</div>
                <h1 className="ff-title">{form.form_name}</h1>
                <p className="ff-subtitle" style={{ marginBottom: 24 }}>How would you like to provide your information?</p>
                {error && <div className="fa-error">{error}</div>}
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <button className="ff-mode-card" onClick={() => setEntryMode("upload")}>
                    <div className="ff-mode-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </div>
                    <div>
                      <h3>Upload a document</h3>
                      <p>Drop any file — prior form, passport, ID, notes. AI reads it and pre-fills all the fields for you.</p>
                      <div className="ff-mode-badge">AI extraction</div>
                    </div>
                  </button>
                  <button className="ff-mode-card" onClick={() => setEntryMode("manual")}>
                    <div className="ff-mode-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </div>
                    <div>
                      <h3>Fill it out manually</h3>
                      <p>Enter your details directly. The official form is shown on the right for reference.</p>
                      <div className="ff-mode-badge ff-mode-badge-manual">Manual entry</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Upload mode */}
            {entryMode === "upload" && (
              <div style={{ padding:"24px", display:"flex", flexDirection:"column", gap:16, flex:1 }}>
                <button className="ff-back-link" onClick={() => { setEntryMode(null); setError(""); }}>← Change method</button>
                <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"1.3rem", fontWeight:400, color:"var(--navy)", margin:0 }}>Upload your document</h2>
                <p className="ff-subtitle" style={{ margin:0 }}>AI will extract your information and pre-fill the form. Review everything after.</p>
                {error && <div className="fa-error">{error}</div>}
                <div
                  className={`ff-drop-zone${dragOver?" drag-over":""}${uploadedFile?" has-file":""}`}
                  onDragOver={e=>{e.preventDefault();setDragOver(true)}}
                  onDragLeave={()=>setDragOver(false)}
                  onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)setUploadedFile(f)}}
                  onClick={()=>fileRef.current.click()}
                >
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg" style={{display:"none"}}
                    onChange={e=>e.target.files[0]&&setUploadedFile(e.target.files[0])}/>
                  {uploadedFile ? (<>
                    <div style={{fontSize:36}}>📄</div>
                    <div className="ff-drop-filename">{uploadedFile.name}</div>
                    <div className="ff-drop-filesize">{(uploadedFile.size/1024).toFixed(1)} KB · Click to change</div>
                  </>) : (<>
                    <div className="ff-drop-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
                    <div className="ff-drop-label">Drop file here or <span>click to browse</span></div>
                    <div className="ff-drop-types">PDF, DOC, TXT, PNG, JPG</div>
                  </>)}
                </div>
                <div className="ff-upload-privacy">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Your document is used only for extraction and is not stored.
                </div>
                <button className="fa-cta-btn" onClick={handleExtract} disabled={!uploadedFile||loading}>
                  Extract with AI →
                </button>
              </div>
            )}

            {/* Manual entry form */}
            {entryMode === "manual" && (
              <>
                <div className="ff-split-left-header">
                  <button className="ff-back-link" onClick={() => { setEntryMode(null); setError(""); }}>← Change method</button>
                  {questions && (
                    <div className="ff-fill-stat-small">
                      <div className="ff-fill-bar-track"><div className="ff-fill-bar" style={{width:`${pct}%`}}/></div>
                      <span>{filled}/{total} filled</span>
                    </div>
                  )}
                </div>

                <div className="ff-split-form-title">
                  <div className="fa-eyebrow" style={{color:category?.color,marginBottom:4}}>{category?.label}</div>
                  <div style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:"1.1rem",fontWeight:400,color:"var(--navy)"}}>{form.short_name}</div>
                </div>

                {error && <div className="fa-error" style={{margin:"0 18px 4px"}}>{error}</div>}

                {questions && (
                  <div className="ff-fields-scroll">
                    {questions.map(q => {
                      // Handle conditional show_if
                      if (q.show_if) {
                        const depVal = answers[q.show_if.field] || "";
                        if (depVal !== q.show_if.value) return null;
                      }
                      // Handle note fields (instructions, not inputs)
                      if (q.is_note) {
                        return (
                          <div key={q.id} className="ff-field-note">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            {q.label}
                          </div>
                        );
                      }
                      const val    = answers[q.id] || "";
                      const filled = !!(val && String(val).trim());
                      const sens   = isSensitive(q.id);
                      return (
                        <div key={q.id} className={`ff-field-row${filled?" filled":""}`}>
                          <label className="ff-field-label-inline" htmlFor={`ff_${q.id}`}>
                            {q.label}
                            {q.required && <span className="ff-required"> *</span>}
                            {sens && <span className="ff-sensitive-tag" title="Never saved">🔒</span>}
                          </label>
                          {q.type === "single_choice" ? (
                            <select id={`ff_${q.id}`} value={val} onChange={e=>set(q.id,e.target.value)}
                              className={`ff-input-inline${filled?" filled":""}`}>
                              <option value="">— select —</option>
                              {q.options?.map(o=><option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : (
                            <input id={`ff_${q.id}`}
                              type={q.type==="date"?"date":q.type==="email"?"email":"text"}
                              value={val} onChange={e=>set(q.id,e.target.value)}
                              placeholder={`Enter ${q.label.toLowerCase()}`}
                              className={`ff-input-inline${filled?" filled":""}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Save toggle + Generate button */}
                <div className="ff-split-bottom">
                  <div className="ff-save-row">
                    <label className="ff-save-toggle">
                      <input type="checkbox" checked={saveData} onChange={e=>setSaveData(e.target.checked)}/>
                      <span className="ff-save-slider"/>
                    </label>
                    <div>
                      <span className="ff-save-label">Remember my answers</span>
                      <span className="ff-save-sub"> — SSNs & sensitive fields never saved</span>
                    </div>
                  </div>
                  {error && <div className="fa-error" style={{marginTop:8}}>{error}</div>}
                  <button className="fa-cta-btn" onClick={handleGenerate} disabled={loading} style={{marginTop:14}}>
                    {loading ? "Generating…" : "Generate filled PDF →"}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* RIGHT: official form reference (static) */}
          <div className="ff-split-right">
            <div className="ff-pdf-viewer-header">
              <span className="ff-pdf-viewer-title">📄 Official form reference</span>
              {form.pdf_path && (
                <a href={form.pdf_path} target="_blank" rel="noreferrer" className="ff-pdf-open">
                  Download blank form ↗
                </a>
              )}
            </div>
            {form.pdf_path ? (
              <object
                data={form.pdf_path}
                type="application/pdf"
                style={{ flex:1, width:"100%", border:"none", display:"block" }}
              >
                <div className="ff-pdf-no-form">
                  <div style={{fontSize:36,marginBottom:12}}>📋</div>
                  <div style={{fontWeight:600,color:"rgba(255,255,255,0.8)",marginBottom:8}}>
                    {form.form_name}
                  </div>
                  <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:20}}>
                    Fill in your details on the left, then click Generate to download your filled PDF.
                  </div>
                  <a href={form.pdf_path} target="_blank" rel="noreferrer"
                    style={{color:"#7dd9ab",fontSize:13,fontWeight:600}}>
                    Download blank form to fill manually ↗
                  </a>
                </div>
              </object>
            ) : (
              <div className="ff-pdf-no-form">
                <div style={{fontSize:36,marginBottom:12}}>📋</div>
                <div style={{fontWeight:600,color:"rgba(255,255,255,0.8)",marginBottom:8}}>{form.form_name}</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,0.5)"}}>
                  Fill your details on the left and click Generate.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ STEP: DONE ══════════════════════════════════════════════════════ */}
      {step === "done" && (
        <div className="ff-body">
          <div className="ff-done-badge">✓ Your packet is ready</div>
          <h1 className="ff-title" style={{marginTop:12}}>{form.form_name}</h1>
          <p className="ff-subtitle">
            {pdfMethod === "overlay" || pdfMethod === "acroform"
              ? "Your data has been filled directly into the official form. Review before submitting."
              : "Your data packet includes the official form + your filled-in information. Review before submitting."}
          </p>

          {/* Download */}
          <div className="ff-deliver-grid" style={{marginTop:28}}>
            <a href={pdfUrl} download={`${form.short_name}_FormAssist.pdf`} className="ff-deliver-card" style={{textDecoration:"none"}}>
              <div className="ff-deliver-icon" style={{background:"#edfaf3"}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#1a6641" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </div>
              <h3>Download PDF</h3>
              <p>Save to your device. Print and submit at any time.</p>
            </a>

            <div className="ff-deliver-card">
              <div className="ff-deliver-icon" style={{background:"#eef4ff"}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#1a2e5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <h3>Email to myself</h3>
              {emailSent ? (
                <div style={{color:"#1a6641",fontWeight:600,fontSize:13}}>✓ Email drafted — check your mail app!</div>
              ) : (
                <>
                  <div className="ff-email-row" style={{marginTop:6}}>
                    <input type="email" className="ff-input" placeholder="you@example.com"
                      value={emailAddr} onChange={e=>setEmailAddr(e.target.value)}
                      style={{flex:1,padding:"8px 10px",fontSize:13}}/>
                    <button className="fa-cta-btn" style={{width:"auto",margin:0,padding:"0 16px",height:38,fontSize:13}}
                      onClick={handleEmail}>Send →</button>
                  </div>
                  <p style={{fontSize:11,color:"var(--ink-muted)",marginTop:6}}>Your email is not stored.</p>
                </>
              )}
            </div>
          </div>

          {/* View + Edit links */}
          <div className="ff-deliver-also" style={{marginTop:20}}>
            <a href={pdfUrl} target="_blank" rel="noreferrer" className="ff-preview-again">View in browser ↗</a>
            <span style={{color:"var(--ink-muted)",margin:"0 12px"}}>·</span>
            <button className="ff-preview-again" onClick={() => { setStep("fill"); setEntryMode("manual"); setPdfUrl(""); }}>
              ← Edit answers
            </button>
            <span style={{color:"var(--ink-muted)",margin:"0 12px"}}>·</span>
            <button className="ff-preview-again" onClick={() => navigate(`/category/${form.category}`)}>
              Fill another form
            </button>
          </div>

          {/* Reminder */}
          <div className="ff-reminder" style={{marginTop:24}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div><strong>Before submitting:</strong> Add any sensitive fields (SSN, signatures, payment info) by hand. Submit only through <strong>{form.agency}'s official channel</strong>.</div>
          </div>
        </div>
      )}
    </div>
  );
}