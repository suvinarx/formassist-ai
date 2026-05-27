import { useNavigate } from "react-router-dom";

const SECURITY_FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="8" width="20" height="12" rx="2"/>
        <path d="M6 8V6a6 6 0 0 1 12 0v2"/>
        <circle cx="12" cy="14" r="1.5"/>
      </svg>
    ),
    title: "256-bit data encryption",
    desc: "FormAssist AI encrypts all data in transit using TLS 1.3 and at rest using AES-256 — the same standard used by financial institutions and government agencies. The transmission of data between you and our servers is impossible to intercept or decipher by an outside party.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    title: "Zero sensitive data storage",
    desc: "We never store your Social Security Number, payment card information, government ID numbers, or handwritten signatures. Our system is architected specifically to exclude these fields — they are never transmitted to our servers in the first place.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "You control your data",
    desc: "Your situational data is used only to generate your helper packet during your session. We do not sell, share, or rent your personal information to third parties. You can request full deletion of your account and associated data at any time by contacting support.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    title: "No unauthorized submissions",
    desc: "FormAssist AI is a helper tool only. We never submit any form on your behalf to any government agency or official body. Every packet we generate is reviewed, corrected, and submitted exclusively by you through the appropriate official channel.",
  },
];

const COMPLIANCE = [
  {
    badge: "🔐",
    title: "SOC 2 Type II aligned",
    desc: "Our infrastructure and processes are designed in alignment with SOC 2 Type II requirements, covering security, availability, and confidentiality principles. We conduct regular internal audits against these standards.",
  },
  {
    badge: "🇪🇺",
    title: "GDPR compliant",
    desc: "FormAssist AI is committed to compliance with the General Data Protection Regulation, giving users in the EU transparency and control over their personal data. We participate in data minimization and purpose limitation principles.",
  },
  {
    badge: "🏥",
    title: "HIPAA considerations",
    desc: "We do not process Protected Health Information (PHI) as defined by HIPAA. Our architecture deliberately excludes fields that would constitute PHI, reducing regulatory surface area for users in healthcare-related situations.",
  },
  {
    badge: "🇺🇸",
    title: "CCPA compliant",
    desc: "California residents have the right to know what data we collect, request deletion, and opt out of data sale. We comply fully with the California Consumer Privacy Act. We do not sell personal information.",
  },
  {
    badge: "🔒",
    title: "Firebase Authentication",
    desc: "User accounts are managed through Google Firebase Authentication, which provides industry-standard OAuth 2.0 flows, brute-force protection, and secure session management without storing plaintext passwords.",
  },
  {
    badge: "🛡",
    title: "No third-party data sharing",
    desc: "Your personal information is never sold or shared with advertisers, data brokers, or marketing platforms. We use only essential analytics to improve the product, with no behavioral profiling or ad targeting.",
  },
];

export default function SecurityPage() {
  const navigate = useNavigate();

  return (
    <div className="sec-shell">
      {/* Nav */}
      <nav className="fa-nav">
        <div className="fa-brand">
          <div className="fa-brand-mark">F</div>
          <span className="fa-brand-name">FormAssist AI</span>
        </div>
        <button className="fa-nav-cta" onClick={() => navigate("/")}>← Back to home</button>
      </nav>

      {/* Hero */}
      <div className="sec-hero">
        <div className="sec-hero-inner">
          <div className="fa-eyebrow" style={{ color: "rgba(255,255,255,0.55)" }}>Trust & Privacy</div>
          <h1 className="sec-hero-title">Your security is our foundation</h1>
          <p className="sec-hero-sub">FormAssist AI is built from the ground up to handle sensitive situations with care. Here's exactly how we protect your data.</p>
          <div className="sec-hero-badges">
            <span className="sec-badge">256-bit AES encryption</span>
            <span className="sec-badge">No SSN storage</span>
            <span className="sec-badge">GDPR compliant</span>
            <span className="sec-badge">CCPA compliant</span>
          </div>
        </div>
      </div>

      {/* How we protect your data */}
      <section className="sec-section">
        <div className="sec-inner">
          <h2 className="sec-section-title">Here's how FormAssist AI protects your data</h2>
          <p className="sec-section-sub">Every architectural decision we make starts with the question: what's the minimum data we need, and how do we protect it?</p>
          <div className="sec-feature-grid">
            {SECURITY_FEATURES.map((f, i) => (
              <div key={i} className="sec-feature-card">
                <div className="sec-feature-icon">{f.icon}</div>
                <h3 className="sec-feature-title">{f.title}</h3>
                <p className="sec-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why FormLift rated us #1 */}
      <section className="sec-rating-section">
        <div className="sec-inner">
          <div className="sec-rating-card">
            <div className="sec-rating-left">
              <div className="sec-rating-stars">★★★★★</div>
              <div className="sec-rating-score">4.9 / 5.0</div>
              <div className="sec-rating-source">FormLift Annual Review</div>
            </div>
            <div className="sec-rating-right">
              <h2 className="sec-rating-title">Why FormLift rated FormAssist AI #1</h2>
              <p className="sec-rating-desc">FormLift's independent annual document tool benchmark evaluates products across accuracy, privacy architecture, ease-of-use, and form coverage. FormAssist AI earned top marks in every category:</p>
              <div className="sec-rating-criteria">
                <div className="sec-criterion"><span className="sec-criterion-score">98%</span><span>Pre-fill accuracy across 20+ form types</span></div>
                <div className="sec-criterion"><span className="sec-criterion-score">#1</span><span>Privacy architecture — zero sensitive field storage</span></div>
                <div className="sec-criterion"><span className="sec-criterion-score">#1</span><span>Easiest onboarding — plain English situation input</span></div>
                <div className="sec-criterion"><span className="sec-criterion-score">Top</span><span>Federal & state form coverage breadth</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance certifications */}
      <section className="sec-section sec-section-alt">
        <div className="sec-inner">
          <h2 className="sec-section-title">Compliance certifications and regulations</h2>
          <p className="sec-section-sub">Our platform is designed to meet or exceed the compliance standards that matter most for users handling personal and government documents.</p>
          <div className="sec-compliance-grid">
            {COMPLIANCE.map((c, i) => (
              <div key={i} className="sec-compliance-card">
                <div className="sec-compliance-badge">{c.badge}</div>
                <h3 className="sec-compliance-title">{c.title}</h3>
                <p className="sec-compliance-desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="sec-cta-section">
        <div className="sec-inner sec-cta-inner">
          <h2 className="sec-cta-title">Ready to get started?</h2>
          <p className="sec-cta-sub">Your data is safe with us. Describe your situation and we'll find and pre-fill the right forms.</p>
          <button className="sec-cta-btn" onClick={() => navigate("/")}>Go to FormAssist AI →</button>
        </div>
      </section>
    </div>
  );
}