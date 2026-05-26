import { useParams, useNavigate } from "react-router-dom";
import { getFormById, getCategoryById, getFormsByCategory } from "../data/formsData";

export default function FormDetailPage() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const form = getFormById(formId);

  if (!form) {
    return (
      <div className="cp-not-found">
        <h2>Form not found</h2>
        <button className="fa-cta-btn" onClick={() => navigate("/")}>← Back to home</button>
      </div>
    );
  }

  const category = getCategoryById(form.category);

  function handleFillWithAI() {
    // Navigate back to home with this form pre-selected
    navigate("/", { state: { prefillForm: form } });
  }

  return (
    <div className="fd-shell">
      {/* Nav */}
      <nav className="fa-nav">
        <div className="fa-brand">
          <div className="fa-brand-mark">F</div>
          <span className="fa-brand-name">FormAssist AI</span>
        </div>
        <button className="fa-nav-cta" onClick={() => navigate("/")}>← Back to home</button>
      </nav>

      <div className="fd-body">
        {/* Left — detail */}
        <div className="fd-left">
          <button className="fd-back" onClick={() => navigate(`/category/${form.category}`)}>
            ← {category?.label || "Back"}
          </button>

          <div className="fd-badge-row">
            {category && (
              <span className="fd-cat-badge" style={{ background: category.colorLight, color: category.color }}>
                {category.icon} {category.label}
              </span>
            )}
            {form.popular && <span className="fd-popular-badge">⭐ Popular</span>}
          </div>

          <h1 className="fd-title">{form.form_name}</h1>
          <p className="fd-lead">{form.description}</p>

          <div className="fd-cta-block">
            <button className="fd-fill-btn" onClick={handleFillWithAI}>
              Fill out form with AI →
            </button>
            <div className="fd-cta-bullets">
              <div className="fd-bullet">
                <span className="fd-bullet-icon">✓</span>
                AI automatically handles information lookup, data retrieval, formatting, and form filling.
              </div>
              <div className="fd-bullet">
                <span className="fd-bullet-icon">✓</span>
                It takes less than a minute to complete <strong>{form.short_name}</strong> using our AI form filling.
              </div>
              <div className="fd-bullet">
                <span className="fd-bullet-icon">✓</span>
                We never ask for your SSN, payment details, or government ID during pre-fill.
              </div>
            </div>
          </div>

          <h2 className="fd-section-title">About this form</h2>
          <p className="fd-about">{form.about}</p>

          <h2 className="fd-section-title">Form specifications</h2>
          <div className="fd-specs-table">
            <div className="fd-spec-row">
              <span className="fd-spec-key">Form name</span>
              <span className="fd-spec-val">{form.form_name}</span>
            </div>
            <div className="fd-spec-row">
              <span className="fd-spec-key">Issued by</span>
              <span className="fd-spec-val">{form.agency}</span>
            </div>
            {form.specs?.form_number && (
              <div className="fd-spec-row">
                <span className="fd-spec-key">Form number</span>
                <span className="fd-spec-val">{form.specs.form_number}</span>
              </div>
            )}
            {form.specs?.pages && (
              <div className="fd-spec-row">
                <span className="fd-spec-key">Pages</span>
                <span className="fd-spec-val">{form.specs.pages}</span>
              </div>
            )}
            {form.specs?.last_updated && (
              <div className="fd-spec-row">
                <span className="fd-spec-key">Last updated</span>
                <span className="fd-spec-val">{form.specs.last_updated}</span>
              </div>
            )}
            <div className="fd-spec-row">
              <span className="fd-spec-key">Category</span>
              <span className="fd-spec-val">{category?.label || form.category}</span>
            </div>
          </div>

          {form.fields && form.fields.length > 0 && (
            <>
              <h2 className="fd-section-title">Key fields</h2>
              <ul className="fd-fields-list">
                {form.fields.map((f, i) => (
                  <li key={i} className="fd-field-item">
                    <span className="fd-field-dot" />
                    {f}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Right — sticky preview card */}
        <div className="fd-right">
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
              <div className="fd-preview-row">
                <span className="fd-preview-key">Category</span>
                <span className="fd-preview-val">{category?.label}</span>
              </div>
              {form.specs?.pages && (
                <div className="fd-preview-row">
                  <span className="fd-preview-key">Pages</span>
                  <span className="fd-preview-val">{form.specs.pages}</span>
                </div>
              )}
              {form.specs?.last_updated && (
                <div className="fd-preview-row">
                  <span className="fd-preview-key">Updated</span>
                  <span className="fd-preview-val">{form.specs.last_updated}</span>
                </div>
              )}
              <div className="fd-preview-row">
                <span className="fd-preview-key">AI fill</span>
                <span className="fd-preview-val fd-val-green">Available ✓</span>
              </div>
            </div>

            <button className="fd-fill-btn fd-fill-btn-card" onClick={handleFillWithAI}>
              Fill out with AI →
            </button>
            <p className="fd-card-note">No SSN or payment required. Helper packet only.</p>
          </div>

          {/* Also in category */}
          <div className="fd-also-card">
            <div className="fd-also-title">More {category?.label}</div>
            {getRelatedForms(form).map((f) => (
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
    .filter((f) => f.form_id !== currentForm.form_id)
    .slice(0, 4);
}