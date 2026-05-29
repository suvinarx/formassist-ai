import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { POPULAR_FORMS, CATEGORIES } from "../data/formsData";

export default function PopularForms() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Group popular forms by category
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const forms = POPULAR_FORMS.filter((f) => f.category === cat.id);
    if (forms.length) acc.push({ cat, forms });
    return acc;
  }, []);

  return (
    <section className="pf-section">
      <div className="pf-inner">
        <div className="pf-header">
          <div className="fa-eyebrow" style={{ color: "#6b7a99" }}>Most requested</div>
          <h2 className="pf-title">Popular forms</h2>
          <p className="pf-subtitle">Quick access to the forms people need most — click any to see the full detail page.</p>
        </div>

        <div className="pf-dropdown-wrap" ref={ref}>
          <button
            className={`pf-dropdown-trigger${open ? " open" : ""}`}
            onClick={() => setOpen((o) => !o)}
          >
            <span>Browse popular forms</span>
            <span className="pf-chevron">{open ? "▲" : "▼"}</span>
          </button>

          {open && (
            <div className="pf-dropdown-panel">
              {grouped.map(({ cat, forms }) => (
                <div key={cat.id} className="pf-group">
                  <div className="pf-group-label" style={{ color: cat.color }}>
                    <span>{cat.icon}</span> {cat.label}
                  </div>
                  {forms.map((form) => (
                    <button
                      key={form.form_id}
                      className="pf-form-link"
                      onClick={() => {
                        setOpen(false);
                        navigate(`/form/${form.form_id}`);
                      }}
                    >
                      <span className="pf-form-short">{form.short_name}</span>
                      <span className="pf-form-desc">{form.form_name.split(",").slice(1).join(",").trim() || form.form_name}</span>
                      <span className="pf-form-arrow">→</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}