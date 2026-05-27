import { useNavigate } from "react-router-dom";
import { CATEGORIES, getFormsByCategory } from "../data/formsData";

// Back-of-card imagery descriptions (emojis as visual shorthand — replaced by CSS art)
const CAT_BACK = {
  tax:         { emoji: "📋", headline: "50+ IRS forms", sub: "W-9, W-4, 1040, Schedule C and more", color: "#1a3458" },
  moving:      { emoji: "🏠", headline: "Move with ease", sub: "USPS address change, IRS 8822", color: "#1a5c3a" },
  immigration: { emoji: "🌐", headline: "20 USCIS forms", sub: "I-9, I-485, N-400, I-765 and more", color: "#5c1a1a" },
  healthcare:  { emoji: "⚕️", headline: "Medicare forms", sub: "CMS-40B, Part B enrollment and more", color: "#1a4a5c" },
  employment:  { emoji: "💼", headline: "FMLA & labor", sub: "WH-380, WH-381, WH-382 and more", color: "#3a1a5c" },
  vehicle:     { emoji: "🚗", headline: "DMV & titles", sub: "Vehicle transfer and registration", color: "#5c3a1a" },
  benefits:    { emoji: "🏛️", headline: "Social Security", sub: "SS-5, SSA-44, disability forms", color: "#1a5c5c" },
  veterans:    { emoji: "🎖️", headline: "VA benefits", sub: "21-526EZ, GI Bill, burial claims", color: "#2a4a1a" },
  legal:       { emoji: "⚖️", headline: "Legal forms", sub: "Court filings, appeals, declarations", color: "#4a4a1a" },
  passport:    { emoji: "🛂", headline: "5 passport forms", sub: "DS-11, DS-82, DS-64 and more", color: "#1a2e5c" },
};

const CAT_ICONS = {
  tax:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  moving:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  immigration: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  healthcare:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  employment:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  vehicle:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
  benefits:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
  veterans:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  legal:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  passport:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="2" width="18" height="20" rx="2"/><circle cx="12" cy="11" r="3"/><path d="M3 16h18"/></svg>,
};

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
            const back  = CAT_BACK[cat.id] || {};
            return (
              <div key={cat.id} className="bbc-flip-wrap">
                <div className="bbc-flip-inner" onClick={() => navigate(`/category/${cat.id}`)}>

                  {/* FRONT */}
                  <div className="bbc-card-front" style={{ "--cat-color": cat.color }}>
                    <div className="bbc-card-icon-wrap">{CAT_ICONS[cat.id]}</div>
                    <div className="bbc-card-label">{cat.label}</div>
                    <div className="bbc-card-count">{count} form{count !== 1 ? "s" : ""}</div>
                    <div className="bbc-card-arrow">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </div>
                  </div>

                  {/* BACK */}
                  <div className="bbc-card-back" style={{ "--cat-color": back.color || cat.color }}>
                    <div className="bbc-card-back-emoji">{back.emoji}</div>
                    <div className="bbc-card-back-headline">{back.headline}</div>
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