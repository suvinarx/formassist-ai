import { useNavigate } from "react-router-dom";
import { CATEGORIES, FORMS } from "../data/formsData";

const CAT_BACK = {
  tax: {
    emoji: "📋",
    headline: "IRS tax forms",
    sub: "W-9 Request for Taxpayer Identification Number",
    color: "#1a3458",
  },
};

const CAT_ICONS = {
  tax: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  ),
};

function isW9Form(form) {
  const searchableText = [
    form.id,
    form.title,
    form.name,
    form.label,
    form.formNumber,
    form.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  return searchableText.includes("w9");
}

// Only show W-9 form
function getVisible(categoryId) {
  return FORMS.filter(
    (form) =>
      form.category === categoryId &&
      !form.hidden &&
      isW9Form(form)
  );
}

export default function BrowseByCategory() {
  const navigate = useNavigate();

  const visibleCategories = CATEGORIES.filter(
    (cat) => getVisible(cat.id).length > 0
  );

  return (
    <section className="bbc-section">
      <div className="bbc-inner">
        <div className="bbc-header">
          <div
            className="fa-eyebrow"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Explore form
          </div>

          <h2 className="bbc-title">Browse by category</h2>

          <p className="bbc-subtitle">
            Select the W-9 form and get started with AI pre-fill.
          </p>
        </div>

        <div className="bbc-grid">
          {visibleCategories.map((cat) => {
            const count = getVisible(cat.id).length;
            const back = CAT_BACK[cat.id] || {
              emoji: "📄",
              headline: cat.label,
              sub: "W-9 form",
              color: cat.color,
            };

            return (
              <div key={cat.id} className="bbc-flip-wrap">
                <div
                  className="bbc-flip-inner"
                  onClick={() => navigate(`/category/${cat.id}`)}
                >
                  <div
                    className="bbc-card-front"
                    style={{ "--cat-color": cat.color }}
                  >
                    <div className="bbc-card-icon-wrap">
                      {CAT_ICONS[cat.id] || CAT_ICONS.tax}
                    </div>

                    <div className="bbc-card-label">{cat.label}</div>

                    <div className="bbc-card-count">
                      {count} form{count !== 1 ? "s" : ""}
                    </div>

                    <div className="bbc-card-arrow">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        width="16"
                        height="16"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </div>
                  </div>

                  <div
                    className="bbc-card-back"
                    style={{ "--cat-color": back.color || cat.color }}
                  >
                    <div className="bbc-card-back-emoji">{back.emoji}</div>

                    <div className="bbc-card-back-headline">
                      {back.headline}
                    </div>

                    <div className="bbc-card-back-sub">{back.sub}</div>

                    <div className="bbc-card-back-cta">
                      Browse W-9 form →
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
