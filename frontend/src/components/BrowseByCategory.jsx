import { useNavigate } from "react-router-dom";
import { CATEGORIES, getFormsByCategory } from "../data/formsData";

export default function BrowseByCategory() {
  const navigate = useNavigate();

  return (
    <section className="bbc-section">
      <div className="bbc-inner">
        <div className="bbc-header">
          <div className="fa-eyebrow" style={{ color: "#6b7a99" }}>Explore all form types</div>
          <h2 className="bbc-title">Browse by category</h2>
          <p className="bbc-subtitle">Select a category to see all available forms and get started with AI pre-fill.</p>
        </div>
        <div className="bbc-grid">
          {CATEGORIES.map((cat) => {
            const count = getFormsByCategory(cat.id).length;
            return (
              <button
                key={cat.id}
                className="bbc-card"
                onClick={() => navigate(`/category/${cat.id}`)}
                style={{
                  "--cat-color": cat.color,
                  "--cat-light": cat.colorLight,
                }}
              >
                <div className="bbc-card-icon">{cat.icon}</div>
                <div className="bbc-card-body">
                  <div className="bbc-card-label">{cat.label}</div>
                  <div className="bbc-card-count">{count} form{count !== 1 ? "s" : ""}</div>
                </div>
                <div className="bbc-card-arrow">→</div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}