import { useParams, useNavigate } from "react-router-dom";
import { getCategoryById, getFormsByCategory } from "../data/formsData";
import { useSEO, categorySchema } from "../hooks/useSEO";
import Logo from "../components/Logo";

export default function CategoryPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const category = getCategoryById(categoryId);

  // ── SEO ──────────────────────────────────────────────────────────────
  const catForms = category ? getFormsByCategory(category.id) : [];

  useSEO(
    category
      ? {
          title: `${category.label} Forms — Fill Online with AI`,
          description: `Fill ${category.label.toLowerCase()} forms online with AI. ${category.description} Free helper PDFs. | DocuLyft`,
          canonical: `/category/${category.id}`,
          schema: categorySchema(category, catForms),
        }
      : {}
  );

  const forms = getFormsByCategory(categoryId);

  if (!category) {
    return (
      <div className="cp-not-found">
        <h2>Category not found</h2>
        <button className="fa-cta-btn" onClick={() => navigate("/")}>
          ← Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="cp-shell">
      <div
        className="cp-hero"
        style={{
          "--cat-color": category.color,
          "--cat-light": category.colorLight,
        }}
      >
        <div className="cp-hero-inner">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <Logo light />

            <button className="cp-back" onClick={() => navigate("/")}>
              ← Back
            </button>
          </div>

          <div className="cp-hero-icon">{category.icon}</div>

          <h1 className="cp-hero-title">{category.label}</h1>

          <p className="cp-hero-desc">{category.description}</p>

          <div className="cp-hero-badge">
            {forms.length} form{forms.length !== 1 ? "s" : ""} available
          </div>
        </div>
      </div>

      <div className="cp-body">
        <div className="cp-body-inner">
          <h2 className="cp-list-title">All {category.label}</h2>

          {forms.length === 0 ? (
            <div className="cp-empty">
              No forms available in this category yet. Check back soon.
            </div>
          ) : (
            <div className="cp-form-list">
              {forms.map((form, i) => (
                <div key={form.form_id} className="cp-form-row">
                  <div className="cp-form-num">{i + 1}</div>

                  <div className="cp-form-info">
                    <div className="cp-form-name">{form.form_name}</div>

                    <div className="cp-form-meta">
                      <span className="cp-form-agency">{form.agency}</span>

                      {form.popular && (
                        <span className="cp-popular-badge">Popular</span>
                      )}
                    </div>

                    <div className="cp-form-desc">{form.description}</div>
                  </div>

                  <button
                    className="cp-form-btn"
                    onClick={() => navigate(`/form/${form.form_id}`)}
                  >
                    View form →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}