import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFormById, getCategoryById, getFormsByCategory } from "../data/formsData";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function FormDetailPage() {
  const { formId } = useParams();
  const navigate   = useNavigate();
  const form       = getFormById(formId);
  const [pdfError, setPdfError]   = useState(false);
  const [user, setUser]           = useState(undefined); // undefined = loading
  const [showSignIn, setShowSignIn] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u ?? null));
    return unsub;
  }, []);

  function requireAuth(action) {
    if (!user) { setShowSignIn(true); return false; }
    return true;
  }

  if (!form) return (
    <div className="cp-not-found">
      <h2>Form not found</h2>
      <button className="fa-cta-btn" onClick={() => navigate("/")}>← Back to home</button>
    </div>
  );

  const category = getCategoryById(form.category);
  const hasPdf   = !!form.pdf_path && !pdfError;

  return (
    <div className="fd-shell">

      {/* ── Sign-in prompt modal ── */}
      {showSignIn && (
        <div className="fd-signin-backdrop" onClick={() => setShowSignIn(false)}>
          <div className="fd-signin-modal" onClick={e => e.stopPropagation()}>
            <button className="fd-signin-close" onClick={() => setShowSignIn(false)}>✕</button>
            <div className="fd-signin-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#0d1f3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3 className="fd-signin-title">Sign in to continue</h3>
            <p className="fd-signin-sub">Create a free account to fill forms with AI, download official PDFs, and save your progress.</p>
            <div className="fd-signin-bullets">
              <div className="fd-signin-bullet"><span>✓</span> Fill any of 119 official government forms</div>
              <div className="fd-signin-bullet"><span>✓</span> AI pre-fills fields from your information</div>
              <div className="fd-signin-bullet"><span>✓</span> Download filled PDFs — no SSN required</div>
            </div>
            <button className="fd-signin-cta" onClick={() => { setShowSignIn(false); navigate("/?signin=1"); }}>
              Sign up free — takes 30 seconds →
            </button>
            <button className="fd-signin-secondary" onClick={() => { setShowSignIn(false); navigate("/?signin=1"); }}>
              Already have an account? Sign in
            </button>
          </div>
        </div>
      )}

      {/* ── Nav ── */}
      <nav className="fa-topnav">
        <div className="fa-topnav-brand" onClick={() => navigate("/")} style={{ cursor:"pointer" }}>
          <div className="fa-brand-mark">F</div>
          <span className="fa-brand-name">FormAssist AI</span>
        </div>
        <div className="fa-topnav-links">
          <button className="fa-topnav-link" onClick={() => navigate("/")}>Home</button>
          <button className="fa-topnav-link" onClick={() => navigate(`/category/${form.category}`)}>
            ← {category?.label || "Back"}
          </button>
        </div>
        <div className="fa-topnav-right">
          <button className="fa-topnav-signin" onClick={() => navigate("/")}>← Back to home</button>
        </div>
      </nav>

      {/* ── Hero banner ── */}
      <div className="fd-hero">
        <div className="fd-hero-overlay" />
        <div className="fd-hero-content">
          <div className="fd-hero-breadcrumb">
            <button onClick={() => navigate("/")} className="fd-crumb">Home</button>
            <span className="fd-crumb-sep">›</span>
            <button onClick={() => navigate(`/category/${form.category}`)} className="fd-crumb">{category?.label}</button>
            <span className="fd-crumb-sep">›</span>
            <span className="fd-crumb fd-crumb-active">{form.short_name}</span>
          </div>
          <div className="fd-hero-badges">
            {category && (
              <span className="fd-hero-badge" style={{ background: category.color }}>
                {category.icon} {category.label}
              </span>
            )}
            {form.popular && <span className="fd-hero-badge fd-hero-badge-gold">⭐ Popular</span>}
          </div>
          <h1 className="fd-hero-h1">{form.form_name}</h1>
          <p className="fd-hero-sub">{form.description}</p>
          <div className="fd-hero-actions">
            <button className="fd-hero-fill-btn" onClick={() => requireAuth() && navigate(`/form/${form.form_id}/fill`)}>
              Fill with AI →
            </button>
            {form.pdf_path && (
              <button className="fd-hero-dl-btn" onClick={() => { if (requireAuth()) window.open(form.pdf_path, "_blank"); }}>
                ⬇ Download blank PDF
              </button>
            )}
          </div>
          <div className="fd-hero-trust">
            <span>🔒 No SSN stored</span>
            <span>✓ Official .gov form</span>
            <span>🛡 Helper packet only</span>
          </div>
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="fd-body">

        {/* LEFT */}
        <div className="fd-left">

          {/* AI CTA block */}
          <div className="fd-cta-block">
            <button className="fd-fill-btn" onClick={() => requireAuth() && navigate(`/form/${form.form_id}/fill`)}>
              Fill out form with AI →
            </button>
            <div className="fd-cta-bullets">
              <div className="fd-bullet"><span className="fd-bullet-icon">✓</span>AI automatically handles data extraction, field mapping, and form filling.</div>
              <div className="fd-bullet"><span className="fd-bullet-icon">✓</span>Takes less than a minute to fill <strong>{form.short_name}</strong> with your information.</div>
              <div className="fd-bullet"><span className="fd-bullet-icon">✓</span>We never ask for your SSN, payment details, or government ID during pre-fill.</div>
            </div>
          </div>

          <h2 className="fd-section-title">About this form</h2>
          <p className="fd-about">{form.about}</p>

          <h2 className="fd-section-title">Form specifications</h2>
          <div className="fd-specs-table">
            <div className="fd-spec-row"><span className="fd-spec-key">Form name</span><span className="fd-spec-val">{form.form_name}</span></div>
            <div className="fd-spec-row"><span className="fd-spec-key">Issued by</span><span className="fd-spec-val">{form.agency}</span></div>
            {form.specs?.form_number && <div className="fd-spec-row"><span className="fd-spec-key">Form number</span><span className="fd-spec-val">{form.specs.form_number}</span></div>}
            {form.specs?.pages && <div className="fd-spec-row"><span className="fd-spec-key">Pages</span><span className="fd-spec-val">{form.specs.pages}</span></div>}
            {form.specs?.last_updated && <div className="fd-spec-row"><span className="fd-spec-key">Last updated</span><span className="fd-spec-val">{form.specs.last_updated}</span></div>}
            <div className="fd-spec-row"><span className="fd-spec-key">Category</span><span className="fd-spec-val">{category?.label || form.category}</span></div>
            <div className="fd-spec-row"><span className="fd-spec-key">AI fill</span><span className="fd-spec-val" style={{ color:"#1a9e6e", fontWeight:600 }}>Available ✓</span></div>
          </div>

          {form.fields && form.fields.length > 0 && (
            <>
              <h2 className="fd-section-title">Key fields</h2>
              <ul className="fd-fields-list">
                {form.fields.map((f, i) => (
                  <li key={i} className="fd-field-item"><span className="fd-field-dot" />{f}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* RIGHT */}
        <div className="fd-right">

          {/* Action card */}
          <div className="fd-preview-card">
            <div className="fd-preview-header">
              <div className="fd-preview-icon">{category?.icon || "📄"}</div>
              <div>
                <div className="fd-preview-form-num">{form.short_name}</div>
                <div className="fd-preview-agency">{form.agency}</div>
              </div>
            </div>
            <div className="fd-preview-title">{form.form_name}</div>
            <div className="fd-preview-divider" />
            <div className="fd-preview-highlights">
              <div className="fd-preview-row"><span className="fd-preview-key">Category</span><span className="fd-preview-val">{category?.label}</span></div>
              {form.specs?.pages && <div className="fd-preview-row"><span className="fd-preview-key">Pages</span><span className="fd-preview-val">{form.specs.pages}</span></div>}
              {form.specs?.last_updated && <div className="fd-preview-row"><span className="fd-preview-key">Updated</span><span className="fd-preview-val">{form.specs.last_updated}</span></div>}
              <div className="fd-preview-row"><span className="fd-preview-key">AI fill</span><span className="fd-preview-val fd-val-green">Available ✓</span></div>
            </div>
            <button className="fd-fill-btn fd-fill-btn-card" onClick={() => requireAuth() && navigate(`/form/${form.form_id}/fill`)}>
              Fill out with AI →
            </button>
            {form.pdf_path && (
              <button className="fd-download-official" onClick={() => { if (requireAuth()) window.open(form.pdf_path, "_blank"); }}>
                ⬇ Download official PDF
              </button>
            )}
            {form.official_url && (
              <a href={form.official_url} target="_blank" rel="noreferrer" className="fd-official-link">
                View on {form.agency} website ↗
              </a>
            )}
            <p className="fd-card-note">No SSN or payment required. Helper packet only.</p>
          </div>

          {/* PDF preview */}
          <div className="fd-pdf-panel">
            <div className="fd-pdf-panel-header">
              <span className="fd-pdf-panel-title">FORM PREVIEW</span>
              {hasPdf && (
                <button className="fd-pdf-open-link" style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}
                  onClick={() => { if (requireAuth()) window.open(form.pdf_path, "_blank"); }}>
                  Open full screen ↗
                </button>
              )}
              {!hasPdf && form.official_url && (
                <button className="fd-pdf-open-link" style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}
                  onClick={() => { if (requireAuth()) window.open(form.official_url, "_blank"); }}>
                  Get form ↗
                </button>
              )}
            </div>
            {!user && user !== undefined ? (
              /* Locked state for signed-out users */
              <div className="fd-pdf-locked">
                <div className="fd-pdf-locked-inner">
                  <div className="fd-pdf-locked-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#0d1f3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <div className="fd-pdf-locked-title">Sign in to preview</div>
                  <div className="fd-pdf-locked-sub">Create a free account to view and download the official form.</div>
                  <button className="fd-pdf-locked-btn" onClick={() => setShowSignIn(true)}>Sign up free →</button>
                </div>
              </div>
            ) : hasPdf ? (
              <div className="fd-pdf-embed-wrap">
                <iframe src={form.pdf_path} className="fd-pdf-embed" title={form.form_name} onError={() => setPdfError(true)} />
              </div>
            ) : (
              <div className="fd-pdf-fallback">
                <div className="fd-pdf-fallback-icon">📄</div>
                <div className="fd-pdf-fallback-name">{form.form_name}</div>
                <div className="fd-pdf-fallback-sub">This form is available directly from {form.agency}.</div>
                {form.official_url && (
                  <button className="fd-pdf-fallback-btn" style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}
                    onClick={() => { if (requireAuth()) window.open(form.official_url, "_blank"); }}>
                    Get official form ↗
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Related forms */}
          <div className="fd-also-card">
            <div className="fd-also-title">More {category?.label}</div>
            {getRelatedForms(form).map(f => (
              <button key={f.form_id} className="fd-also-link" onClick={() => navigate(`/form/${f.form_id}`)}>
                <span className="fd-also-short">{f.short_name}</span>
                <span className="fd-also-name">{f.form_name.split(",")[0]}</span>
                <span>→</span>
              </button>
            ))}
            <button className="fd-also-view-all" onClick={() => navigate(`/category/${form.category}`)}>
              View all {category?.label} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getRelatedForms(currentForm) {
  return getFormsByCategory(currentForm.category)
    .filter(f => f.form_id !== currentForm.form_id)
    .slice(0, 4);
}