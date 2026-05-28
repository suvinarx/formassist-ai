import { useNavigate } from "react-router-dom";
import { CATEGORIES, FORMS } from "../data/formsData";

const CAT_BACK = {
  tax: {
    emoji: "📋",
    headline: "IRS tax forms",
    sub: "W-9, W-4, 1040, Schedule C and more",
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

// Only show non-hidden tax forms
function getVisible(categoryId) {
  return FORMS.filter((f) => f.category === categoryId && !f.hidden);
}

export default function BrowseByCategory() {
  const navigate = useNavigate();

  // Only keep the tax category
  const visibleCategories = CATEGORIES.filter(
    (cat) => cat.id === "tax" && getVisible(cat.id).length > 0
  );

  return (
    <section className="bbc-section">
      <div className="bbc-inner">
        <div className="bbc-header">
          <div
            className="fa-eyebrow"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Explore all form types
          </div>

          <h2 className="bbc-title">Browse by category</h2>

          <p className="bbc-subtitle">
            Select a category to see all available forms and get started with AI
            pre-fill.
          </p>
        </div>

        <div className="bbc-grid">
          {visibleCategories.map((cat) => {
            const count = getVisible(cat.id).length;
            const back = CAT_BACK[cat.id] || {};

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
                      {CAT_ICONS[cat.id]}
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
                    <div className="bbc-card-back-cta">Browse forms →</div>
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
