import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFormById, getCategoryById } from "../data/formsData";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// Fields that should never be saved
const SENSITIVE = ["ssn","social_security","tax_id","payment","card","bank","routing","signature","passport_number","license_number","ein","tin","alien_number"];
const isSensitive = (id) => SENSITIVE.some(s => id.toLowerCase().includes(s));

// ── Coordinate map: which field maps to where on the PDF (% of page) ─────────
// These are used for the live canvas overlay
const FIELD_COORDS = {
  w9: [
    { id: "full_legal_name",        page: 1, x: 0.07, y: 0.140, w: 0.55, h: 0.022 },
    { id: "business_name",          page: 1, x: 0.07, y: 0.175, w: 0.55, h: 0.022 },
    { id: "federal_tax_classification", page: 1, x: 0.07, y: 0.220, w: 0.04, h: 0.020 },
    { id: "address",                page: 1, x: 0.07, y: 0.290, w: 0.40, h: 0.022 },
    { id: "city_state_zip",         page: 1, x: 0.07, y: 0.322, w: 0.40, h: 0.022 },
    { id: "tin_ssn",                page: 1, x: 0.58, y: 0.376, w: 0.35, h: 0.030 },
    { id: "tin_ein",                page: 1, x: 0.58, y: 0.415, w: 0.35, h: 0.030 },
  ],
  usps_change_of_address_helper: [
    { id: "moving_party_type",      page: 1, x: 0.07, y: 0.170, w: 0.28, h: 0.025 },
    { id: "move_duration",          page: 1, x: 0.47, y: 0.170, w: 0.22, h: 0.025 },
    { id: "forwarding_start_date",  page: 1, x: 0.07, y: 0.225, w: 0.20, h: 0.025 },
    { id: "forwarding_end_date",    page: 1, x: 0.47, y: 0.225, w: 0.20, h: 0.025 },
    { id: "first_name",             page: 1, x: 0.07, y: 0.290, w: 0.28, h: 0.025 },
    { id: "last_name",              page: 1, x: 0.47, y: 0.290, w: 0.28, h: 0.025 },
    { id: "old_street",             page: 1, x: 0.07, y: 0.380, w: 0.56, h: 0.025 },
    { id: "old_city",               page: 1, x: 0.07, y: 0.415, w: 0.25, h: 0.025 },
    { id: "old_state",              page: 1, x: 0.44, y: 0.415, w: 0.08, h: 0.025 },
    { id: "old_zip",                page: 1, x: 0.58, y: 0.415, w: 0.12, h: 0.025 },
    { id: "new_street",             page: 1, x: 0.07, y: 0.490, w: 0.56, h: 0.025 },
    { id: "new_city",               page: 1, x: 0.07, y: 0.525, w: 0.25, h: 0.025 },
    { id: "new_state",              page: 1, x: 0.44, y: 0.525, w: 0.08, h: 0.025 },
    { id: "new_zip",                page: 1, x: 0.58, y: 0.525, w: 0.12, h: 0.025 },
  ],
  i9: [
    { id: "last_name",              page: 1, x: 0.07, y: 0.136, w: 0.23, h: 0.022 },
    { id: "first_name",             page: 1, x: 0.33, y: 0.136, w: 0.20, h: 0.022 },
    { id: "middle_initial",         page: 1, x: 0.56, y: 0.136, w: 0.05, h: 0.022 },
    { id: "address",                page: 1, x: 0.07, y: 0.180, w: 0.38, h: 0.022 },
    { id: "apt_number",             page: 1, x: 0.50, y: 0.180, w: 0.10, h: 0.022 },
    { id: "city",                   page: 1, x: 0.65, y: 0.180, w: 0.20, h: 0.022 },
    { id: "state",                  page: 1, x: 0.07, y: 0.215, w: 0.07, h: 0.022 },
    { id: "zip",                    page: 1, x: 0.18, y: 0.215, w: 0.11, h: 0.022 },
    { id: "date_of_birth",          page: 1, x: 0.33, y: 0.215, w: 0.17, h: 0.022 },
    { id: "ssn",                    page: 1, x: 0.55, y: 0.215, w: 0.20, h: 0.022 },
    { id: "email",                  page: 1, x: 0.07, y: 0.255, w: 0.33, h: 0.022 },
    { id: "phone",                  page: 1, x: 0.44, y: 0.255, w: 0.22, h: 0.022 },
  ],
  ds11: [
    { id: "last_name",              page: 1, x: 0.07, y: 0.148, w: 0.30, h: 0.022 },
    { id: "first_name",             page: 1, x: 0.40, y: 0.148, w: 0.28, h: 0.022 },
    { id: "middle_name",            page: 1, x: 0.07, y: 0.185, w: 0.30, h: 0.022 },
    { id: "date_of_birth",          page: 1, x: 0.07, y: 0.222, w: 0.20, h: 0.022 },
    { id: "sex",                    page: 1, x: 0.35, y: 0.222, w: 0.08, h: 0.022 },
    { id: "place_of_birth",         page: 1, x: 0.48, y: 0.222, w: 0.30, h: 0.022 },
    { id: "ssn",                    page: 1, x: 0.07, y: 0.258, w: 0.20, h: 0.022 },
    { id: "address",                page: 1, x: 0.07, y: 0.295, w: 0.45, h: 0.022 },
    { id: "city",                   page: 1, x: 0.07, y: 0.332, w: 0.22, h: 0.022 },
    { id: "state",                  page: 1, x: 0.35, y: 0.332, w: 0.08, h: 0.022 },
    { id: "zip",                    page: 1, x: 0.48, y: 0.332, w: 0.10, h: 0.022 },
    { id: "email",                  page: 1, x: 0.07, y: 0.368, w: 0.28, h: 0.022 },
    { id: "phone",                  page: 1, x: 0.40, y: 0.368, w: 0.20, h: 0.022 },
  ],
};

export default function FormFillPage() {
  const { formId } = useParams();
  const navigate   = useNavigate();
  const form       = getFormById(formId);
  const category   = form ? getCategoryById(form.category) : null;

  const [step, setStep]           = useState("entry");   // entry | deliver
  const [entryMode, setEntryMode] = useState(null);      // null | upload | manual
  const [answers, setAnswers]     = useState({});
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError]         = useState("");
  const [activeField, setActiveField] = useState(null);

  // Upload
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragOver, setDragOver]         = useState(false);
  const fileRef = useRef();

  // Delivery
  const [pdfUrl, setPdfUrl]       = useState("");
  const [saveData, setSaveData]   = useState(false);
  const [emailAddr, setEmailAddr] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState(null);

  // PDF viewer
  const [pdfPages, setPdfPages]     = useState([]);  // array of {canvas, width, height}
  const [currentPage, setCurrentPage] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(false);
  const canvasRef   = useRef();
  const overlayRef  = useRef();
  const pdfDocRef   = useRef(null);
  const coords      = FIELD_COORDS[formId] || [];

  // Load form questions from backend
  useEffect(() => {
    fetch(`${API_BASE}/api/forms/${formId}`)
      .then(r => r.json())
      .then(d => setQuestions(d.questions || buildGeneric(form?.fields || [])))
      .catch(() => setQuestions(buildGeneric(form?.fields || [])));
  }, [formId]);

  // Load the official PDF via pdf.js for display
  useEffect(() => {
    if (!form?.pdf_path) return;
    loadPdfJs(form.pdf_path);
  }, [form?.pdf_path]);

  // Redraw overlay whenever answers or currentPage changes
  useEffect(() => {
    drawOverlay();
  }, [answers, currentPage, pdfPages, activeField]);

  function buildGeneric(fields) {
    return fields.map((label, i) => ({
      id: label.toLowerCase().replace(/[^a-z0-9]/g,"_") + "_" + i,
      label, type: label.toLowerCase().includes("date") ? "date" : "text", required: false,
    }));
  }

  // ── Load PDF with pdf.js ────────────────────────────────────────────────
  async function loadPdfJs(pdfPath) {
    if (pdfLoading) return;
    setPdfLoading(true);
    try {
      // Dynamically load pdf.js from CDN
      if (!window.pdfjsLib) {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }

      const url = pdfPath.startsWith("http") ? pdfPath : `${window.location.origin}${pdfPath}`;
      const loadingTask = window.pdfjsLib.getDocument(url);
      const pdfDoc = await loadingTask.promise;
      pdfDocRef.current = pdfDoc;

      // Render all pages to off-screen canvases
      const pages = [];
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1.6 });
        const canvas = document.createElement("canvas");
        canvas.width  = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;
        pages.push({ canvas, width: viewport.width, height: viewport.height, pageNum: i });
      }
      setPdfPages(pages);
    } catch (e) {
      console.error("PDF load error:", e);
    } finally {
      setPdfLoading(false);
    }
  }

  function loadScript(src) {
    return new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
      const s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  // ── Draw PDF page + answer overlay on canvas ────────────────────────────
  function drawOverlay() {
    if (!canvasRef.current || !pdfPages[currentPage]) return;
    const { canvas: srcCanvas, width, height } = pdfPages[currentPage];
    const pageNum = currentPage + 1;

    // Main canvas: copy rendered PDF
    const c = canvasRef.current;
    c.width  = width;
    c.height = height;
    const ctx = c.getContext("2d");
    ctx.drawImage(srcCanvas, 0, 0);

    // Overlay canvas: draw field highlights + text
    const oc = overlayRef.current;
    if (!oc) return;
    oc.width  = width;
    oc.height = height;
    const octx = oc.getContext("2d");
    octx.clearRect(0, 0, width, height);

    // Draw each field that has a value or is active
    coords
      .filter(f => f.page === pageNum)
      .forEach(f => {
        const val   = answers[f.id] || "";
        const isAct = activeField === f.id;
        const fx = f.x * width;
        const fy = f.y * height;
        const fw = f.w * width;
        const fh = f.h * height;

        if (isAct) {
          // Blue highlight for active field
          octx.fillStyle = "rgba(26, 52, 88, 0.08)";
          octx.fillRect(fx, fy, fw, fh);
          octx.strokeStyle = "#1a3458";
          octx.lineWidth = 1.5;
          octx.strokeRect(fx, fy, fw, fh);
        } else if (val) {
          // Light green tint for filled fields
          octx.fillStyle = "rgba(134, 239, 172, 0.15)";
          octx.fillRect(fx, fy, fw, fh);
        }

        if (val) {
          // Draw the value text
          const fontSize = Math.round(fh * 0.58);
          octx.font      = `${fontSize}px Helvetica, Arial, sans-serif`;
          octx.fillStyle = "#0d1f3c";
          octx.textBaseline = "middle";
          // Clip text to field width
          let text = String(val);
          while (octx.measureText(text).width > fw - 4 && text.length > 1) text = text.slice(0, -1);
          octx.fillText(text, fx + 3, fy + fh / 2);
        }
      });
  }

  // ── Answer management ───────────────────────────────────────────────────
  function updateAnswer(id, val) {
    setAnswers(p => ({ ...p, [id]: val }));
    setPdfUrl("");
  }

  // ── AI extract from uploaded file ───────────────────────────────────────
  async function handleExtract() {
    if (!uploadedFile) { setError("Please upload a file first."); return; }
    setError("");
    setLoading(true); setLoadingMsg("AI is reading your document…");
    try {
      const text = await uploadedFile.text();
      const res  = await fetch(`${API_BASE}/api/ai-fill`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_id: formId, user_details: text }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnswers(data.answers || {});
      setEntryMode("manual");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); setLoadingMsg(""); }
  }

  // ── Generate final PDF ──────────────────────────────────────────────────
  async function generatePdf() {
    if (!questions) return;
    setError("");
    setLoading(true); setLoadingMsg("Generating your filled packet…");
    try {
      if (saveData) {
        const safe = Object.fromEntries(Object.entries(answers).filter(([k]) => !isSensitive(k)));
        localStorage.setItem(`fa_form_${formId}`, JSON.stringify(safe));
      }
      const res  = await fetch(`${API_BASE}/api/generate-pdf`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_id: formId, form_name: form.form_name, agency: form.agency, answers, questions }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const filename = data.download_url.split("/api/download/")[1];
      setPdfUrl(`${API_BASE}/api/download/${filename}`);
      setStep("deliver");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); setLoadingMsg(""); }
  }

  // ── Email ───────────────────────────────────────────────────────────────
  function handleEmail() {
    if (!emailAddr.trim()) { setError("Please enter your email."); return; }
    window.location.href = `mailto:${emailAddr}?subject=Your FormAssist AI packet — ${form?.short_name}&body=Your pre-filled form packet is ready. Download it here: ${pdfUrl}%0A%0APlease review all fields before submitting officially.`;
    setEmailSent(true);
  }

  function filledCount() { return questions ? Object.values(answers).filter(v => v && String(v).trim()).length : 0; }
  function totalCount()  { return questions ? questions.length : 0; }
  function fillPct()     { return totalCount() ? Math.round(filledCount() / totalCount() * 100) : 0; }

  const hasPdf     = !!form?.pdf_path;
  const pdfReady   = pdfPages.length > 0;

  if (!form) return (
    <div className="cp-not-found">
      <h2>Form not found</h2>
      <button className="fa-cta-btn" onClick={() => navigate("/")}>← Back</button>
    </div>
  );

  return (
    <div className="ff-shell">
      {loading && (
        <div className="fa-overlay">
          <div className="fa-overlay-card">
            <div className="fa-spinner" />
            <p>{loadingMsg}</p>
          </div>
        </div>
      )}

      <nav className="fa-nav">
        <div className="fa-brand">
          <div className="fa-brand-mark">F</div>
          <span className="fa-brand-name">FormAssist AI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {step === "entry" && entryMode === "manual" && (
            <div className="ff-nav-fill-stat">
              <div className="ff-fill-bar-track" style={{ width: 120 }}>
                <div className="ff-fill-bar" style={{ width: `${fillPct()}%` }} />
              </div>
              <span>{filledCount()}/{totalCount()} fields</span>
            </div>
          )}
          <button className="fa-nav-cta" onClick={() => navigate(`/form/${formId}`)}>← Back</button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════
          STEP: ENTRY
         ══════════════════════════════════════════════════════════════════ */}
      {step === "entry" && (
        <>
          {/* Mode chooser */}
          {!entryMode && (
            <div className="ff-body">
              <div className="ff-header" style={{ borderBottom: "none" }}>
                <div>
                  <div className="fa-eyebrow" style={{ color: category?.color }}>{category?.label}</div>
                  <h1 className="ff-title">{form.form_name}</h1>
                  <p className="ff-subtitle">How would you like to provide your information?</p>
                </div>
              </div>
              {error && <div className="fa-error">{error}</div>}
              <div className="ff-mode-grid">
                <button className="ff-mode-card" onClick={() => setEntryMode("upload")}>
                  <div className="ff-mode-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  <h3>Upload a document</h3>
                  <p>Drop any file — prior form, passport scan, ID, or notes. AI reads it and pre-fills the form fields automatically.</p>
                  <div className="ff-mode-badge">AI-powered extraction</div>
                </button>
                <button className="ff-mode-card" onClick={() => setEntryMode("manual")}>
                  <div className="ff-mode-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                  </div>
                  <h3>Fill alongside the form</h3>
                  <p>Enter your data in the fields on the left — the official form on the right updates live as you type each answer.</p>
                  <div className="ff-mode-badge ff-mode-badge-manual">Live form preview</div>
                </button>
              </div>
            </div>
          )}

          {/* Upload mode */}
          {entryMode === "upload" && (
            <div className="ff-body">
              <button className="ff-back-link" onClick={() => setEntryMode(null)}>← Change method</button>
              <h2 className="ff-title" style={{ fontSize: "1.4rem", marginTop: 16 }}>Upload your document</h2>
              <p className="ff-subtitle">We'll extract your information and pre-fill the form. You can review and edit everything after.</p>
              {error && <div className="fa-error">{error}</div>}

              {/* Show the official form PDF alongside the upload for reference */}
              <div className="ff-upload-split">
                <div className="ff-upload-left">
                  <div
                    className={`ff-drop-zone${dragOver ? " drag-over" : ""}${uploadedFile ? " has-file" : ""}`}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setUploadedFile(f); }}
                    onClick={() => fileRef.current.click()}
                  >
                    <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg" style={{ display: "none" }}
                      onChange={e => e.target.files[0] && setUploadedFile(e.target.files[0])} />
                    {uploadedFile ? (
                      <>
                        <div style={{ fontSize: 36 }}>📄</div>
                        <div className="ff-drop-filename">{uploadedFile.name}</div>
                        <div className="ff-drop-filesize">{(uploadedFile.size/1024).toFixed(1)} KB · Click to change</div>
                      </>
                    ) : (
                      <>
                        <div className="ff-drop-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
                        <div className="ff-drop-label">Drop your file here, or <span>click to browse</span></div>
                        <div className="ff-drop-types">PDF, DOC, TXT, PNG, JPG accepted</div>
                      </>
                    )}
                  </div>
                  <div className="ff-upload-privacy">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Your document is only used to extract information for this form and is not stored.
                  </div>
                  <button className="fa-cta-btn" onClick={handleExtract} disabled={!uploadedFile || loading}>
                    Extract with AI →
                  </button>
                </div>

                {/* Official form reference */}
                {hasPdf && (
                  <div className="ff-upload-right">
                    <div className="ff-pdf-ref-label">Official form reference</div>
                    {pdfReady ? (
                      <div className="ff-pdf-ref-wrap">
                        <canvas ref={canvasRef} className="ff-pdf-canvas" />
                        <canvas ref={overlayRef} className="ff-pdf-overlay-canvas" />
                        {pdfPages.length > 1 && (
                          <div className="ff-pdf-page-nav">
                            <button onClick={() => setCurrentPage(p => Math.max(0, p-1))} disabled={currentPage === 0}>‹</button>
                            <span>Page {currentPage+1} of {pdfPages.length}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(pdfPages.length-1, p+1))} disabled={currentPage === pdfPages.length-1}>›</button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="ff-pdf-loading">
                        <div className="fa-spinner" />
                        <span>Loading official form…</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Manual fill — split screen with live PDF */}
          {entryMode === "manual" && (
            <div className="ff-split-screen">
              {/* LEFT: fields */}
              <div className="ff-split-left">
                <div className="ff-split-left-header">
                  <button className="ff-back-link" onClick={() => setEntryMode(null)}>← Change method</button>
                  <div className="ff-fill-stat-small">
                    <div className="ff-fill-bar-track">
                      <div className="ff-fill-bar" style={{ width: `${fillPct()}%` }} />
                    </div>
                    <span>{filledCount()} of {totalCount()} filled</span>
                  </div>
                </div>

                <div className="ff-split-form-title">
                  <div className="fa-eyebrow" style={{ color: category?.color, marginBottom: 4 }}>{category?.label}</div>
                  <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"1.2rem", fontWeight:400, color:"var(--navy)", marginBottom: 4 }}>{form.short_name}</div>
                </div>

                {error && <div className="fa-error" style={{ margin: "0 0 12px" }}>{error}</div>}

                {questions && (
                  <div className="ff-fields-scroll">
                    {questions.map(q => {
                      const filled    = !!(answers[q.id] && String(answers[q.id]).trim());
                      const hasCoord  = coords.some(c => c.id === q.id);
                      const isActive  = activeField === q.id;
                      return (
                        <div
                          key={q.id}
                          className={`ff-field-row${filled ? " filled" : ""}${isActive ? " active" : ""}`}
                          onClick={() => setActiveField(q.id)}
                        >
                          <label className="ff-field-label-inline" htmlFor={`ff_${q.id}`}>
                            {q.label}
                            {q.required && <span className="ff-required"> *</span>}
                            {isSensitive(q.id) && <span className="ff-sensitive-tag">🔒</span>}
                            {hasCoord && <span className="ff-mapped-tag" title="This field maps to a location on the official form">📍</span>}
                          </label>
                          {q.type === "single_choice" ? (
                            <select
                              id={`ff_${q.id}`}
                              value={answers[q.id] || ""}
                              onChange={e => updateAnswer(q.id, e.target.value)}
                              onFocus={() => setActiveField(q.id)}
                              onBlur={() => setActiveField(null)}
                              className={`ff-input-inline${filled ? " filled" : ""}`}
                            >
                              <option value="">— select —</option>
                              {q.options?.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : (
                            <input
                              id={`ff_${q.id}`}
                              type={q.type === "date" ? "date" : q.type === "email" ? "email" : "text"}
                              value={answers[q.id] || ""}
                              onChange={e => updateAnswer(q.id, e.target.value)}
                              onFocus={() => setActiveField(q.id)}
                              onBlur={() => setActiveField(null)}
                              placeholder={`Enter ${q.label.toLowerCase()}`}
                              className={`ff-input-inline${filled ? " filled" : ""}`}
                              autoComplete="off"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Save + Generate */}
                <div className="ff-split-bottom">
                  <div className="ff-save-row">
                    <label className="ff-save-toggle">
                      <input type="checkbox" checked={saveData} onChange={e => setSaveData(e.target.checked)} />
                      <span className="ff-save-slider" />
                    </label>
                    <div>
                      <span className="ff-save-label">Save non-sensitive data</span>
                      <span className="ff-save-sub"> — SSNs, passport numbers & signatures are never stored</span>
                    </div>
                  </div>
                  {error && <div className="fa-error">{error}</div>}
                  <button className="fa-cta-btn" onClick={generatePdf} disabled={loading} style={{ marginTop: 12 }}>
                    {loading ? "Generating…" : "Generate & download my packet →"}
                  </button>
                </div>
              </div>

              {/* RIGHT: live PDF viewer */}
              <div className="ff-split-right">
                <div className="ff-pdf-viewer-header">
                  <span className="ff-pdf-viewer-title">📄 Official form — updates as you fill</span>
                  {form.pdf_path && (
                    <a href={form.pdf_path} target="_blank" rel="noreferrer" className="ff-pdf-open">
                      Full screen ↗
                    </a>
                  )}
                </div>

                {!hasPdf && (
                  <div className="ff-pdf-no-form">
                    <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                    <div style={{ fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>No official PDF available</div>
                    <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>Fill in the fields on the left. Your data will be included in the generated packet.</div>
                  </div>
                )}

                {hasPdf && !pdfReady && (
                  <div className="ff-pdf-loading">
                    <div className="fa-spinner" />
                    <span>Loading official form…</span>
                  </div>
                )}

                {hasPdf && pdfReady && (
                  <div className="ff-pdf-canvas-wrap">
                    <div className="ff-pdf-canvas-inner" style={{ position: "relative", display: "inline-block" }}>
                      <canvas ref={canvasRef} className="ff-pdf-canvas" />
                      <canvas
                        ref={overlayRef}
                        className="ff-pdf-overlay-canvas"
                        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
                      />
                    </div>
                    {pdfPages.length > 1 && (
                      <div className="ff-pdf-page-nav">
                        <button onClick={() => setCurrentPage(p => Math.max(0, p-1))} disabled={currentPage === 0}>‹ Prev</button>
                        <span>Page {currentPage+1} of {pdfPages.length}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(pdfPages.length-1, p+1))} disabled={currentPage === pdfPages.length-1}>Next ›</button>
                      </div>
                    )}

                    {/* Legend */}
                    <div className="ff-pdf-legend">
                      <span className="ff-legend-item"><span className="ff-legend-dot" style={{ background: "rgba(134,239,172,0.5)" }} />Filled</span>
                      <span className="ff-legend-item"><span className="ff-legend-dot" style={{ background: "rgba(26,52,88,0.15)", border: "1.5px solid #1a3458" }} />Active field</span>
                      <span className="ff-legend-note">📍 = field mapped to this form · other fields appear in your data packet</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          STEP: DELIVER
         ══════════════════════════════════════════════════════════════════ */}
      {step === "deliver" && (
        <div className="ff-body">
          <div className="ff-done-badge">✓ Your packet is ready</div>
          <h1 className="ff-title" style={{ marginTop: 10 }}>Download or email your packet</h1>
          <p className="ff-subtitle">Review the packet before submitting it officially to {form.agency}.</p>

          {error && <div className="fa-error">{error}</div>}

          <div className="ff-deliver-grid">
            <div className={`ff-deliver-card${deliveryMode === "download" ? " selected" : ""}`} onClick={() => setDeliveryMode("download")}>
              <div className="ff-deliver-icon" style={{ background: "#edfaf3" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#1a6641" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </div>
              <h3>Download PDF</h3>
              <p>Save to your device. Print and submit at any time.</p>
            </div>
            <div className={`ff-deliver-card${deliveryMode === "email" ? " selected" : ""}`} onClick={() => setDeliveryMode("email")}>
              <div className="ff-deliver-icon" style={{ background: "#eef4ff" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#1a2e5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <h3>Send to email</h3>
              <p>Get the download link sent to your inbox.</p>
            </div>
          </div>

          {deliveryMode === "download" && (
            <div className="ff-deliver-action">
              <a href={pdfUrl} download={`${form.short_name}_FormAssist.pdf`} className="ff-download-big">
                ⬇ Download {form.short_name} packet
              </a>
              <a href={pdfUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "var(--navy-light)", marginTop: 8 }}>
                View in browser instead ↗
              </a>
            </div>
          )}

          {deliveryMode === "email" && (
            <div className="ff-deliver-action">
              {emailSent ? (
                <div className="ff-email-sent">
                  <div style={{ fontSize: 28 }}>✓</div>
                  <div className="ff-email-sent-title">Email drafted!</div>
                  <div className="ff-email-sent-sub">Your mail app opened. Send it and check your inbox.</div>
                </div>
              ) : (
                <>
                  <div className="ff-email-row">
                    <input type="email" className="ff-input" placeholder="you@example.com"
                      value={emailAddr} onChange={e => setEmailAddr(e.target.value)} style={{ flex: 1 }} />
                    <button className="fa-cta-btn" style={{ width:"auto", margin:0, padding:"0 22px", height:44 }} onClick={handleEmail}>
                      Send →
                    </button>
                  </div>
                  <p className="ff-deliver-note">We open your mail app with the link. Your email is not stored.</p>
                </>
              )}
            </div>
          )}

          {deliveryMode && (
            <div className="ff-deliver-also">
              <button className="ff-preview-again" onClick={() => { setStep("entry"); setEntryMode("manual"); }}>← Edit answers</button>
              <span style={{ color: "var(--ink-muted)", margin: "0 12px" }}>·</span>
              <button className="ff-preview-again" onClick={() => navigate(`/category/${form.category}`)}>Fill another form</button>
            </div>
          )}

          <div className="ff-reminder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <strong>Remember:</strong> Review every field, add any sensitive info by hand, sign where required, and submit through <strong>{form.agency}'s official channel</strong>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}