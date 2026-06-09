import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

export default function SecurityPage() {
  const navigate = useNavigate();

  return (
    <div className="sec-shell">
      {/* Nav */}
      {/* Nav */}
<nav className="fa-topnav">
  <div
    className="fa-topnav-brand"
    onClick={() => navigate("/")}
    style={{ cursor: "pointer" }}
  >
     <Logo light />
  </div>

  <div className="fa-topnav-links">
    <button className="fa-topnav-link" onClick={() => navigate("/")}>
      Home
    </button>

    <div className="fa-menu-dropdown">
      <button className="fa-topnav-link">
        Browse forms <span className="fa-menu-chevron">▾</span>
      </button>

      <div className="fa-menu-dropdown-panel">
        {[
          "Tax Forms",
          "Immigration",
          "Passport & Travel",
          "Benefits & Social",
          "Healthcare",
          "Employment",
          "Veterans",
          "Moving & Address",
          "Motor Vehicle",
          "Legal",
        ].map((label, i) => {
          const ids = [
            "tax",
            "immigration",
            "passport",
            "benefits",
            "healthcare",
            "employment",
            "veterans",
            "moving",
            "vehicle",
            "legal",
          ];

          return (
            <button
              key={label}
              className="fa-menu-dd-item"
              onClick={() => navigate(`/category/${ids[i]}`)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>

    <button className="fa-topnav-link" onClick={() => navigate("/security")}>
      Security
    </button>

    <button className="fa-topnav-link" onClick={() => navigate("/about")}>
      About
    </button>

    <a
      className="fa-topnav-link"
      href="mailto:support@doculyft.com"
      style={{ textDecoration: "none" }}
    >
      Contact
    </a>
  </div>

  <div className="fa-topnav-right">
    <button className="fa-topnav-signin" onClick={() => navigate("/")}>
      Get started
    </button>
  </div>
</nav>

      {/* Hero */}
      <section
        style={{
          background:
            "linear-gradient(rgba(10,22,48,0.86), rgba(10,22,48,0.78)), url('https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1600&q=80') center/cover no-repeat",
          padding: "80px 64px 72px",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.5)",
              marginBottom: 14,
            }}
          >
            Security & Privacy
          </div>

          <h1
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "2.8rem",
              fontWeight: 400,
              color: "#fff",
              margin: "0 0 18px",
              lineHeight: 1.15,
              letterSpacing: "-0.3px",
            }}
          >
            Simple, secure form assistance
          </h1>

          <p
            style={{
              fontSize: 17,
              color: "rgba(255,255,255,0.72)",
              lineHeight: 1.7,
              margin: "0 auto",
              maxWidth: 660,
            }}
          >
            DocuLyft helps users prepare forms safely. We use secure communication,
            do not store customer information, keep form versions updated regularly,
            and never submit forms on behalf of users.
          </p>
        </div>
      </section>

      {/* Core statements */}
      <section style={{ background: "#fff", padding: "72px 64px" }}>
        <div
          style={{
            maxWidth: 980,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 22,
          }}
        >
          <InfoCard
            title="Secure TLS communication"
            body="DocuLyft uses secure TLS communication to protect data while it is transmitted between your browser and our service."
            icon="lock"
          />

          <InfoCard
            title="No customer information stored"
            body="We do not store customer form information. Any details you enter are used only to help prepare your form during your session."
            icon="shield"
          />

          <InfoCard
            title="Forms updated regularly"
            body="We review and update supported form versions on a regular basis so users can work with current form materials."
            icon="refresh"
          />

          <InfoCard
            title="You submit your own forms"
            body="DocuLyft does not submit any form on behalf of users. You review, download, sign if required, and submit through the official channel yourself."
            icon="user"
          />
        </div>
      </section>

      {/* Short explanation */}
      <section
        style={{
          background: "#f9fafb",
          padding: "64px 64px",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "2rem",
              fontWeight: 400,
              color: "#0d1f3c",
              margin: "0 0 14px",
            }}
          >
            We prepare helper packets only
          </h2>

          <p
            style={{
              fontSize: 15,
              color: "#6b7280",
              lineHeight: 1.75,
              margin: "0 auto 28px",
              maxWidth: 720,
            }}
          >
            DocuLyft is not a filing service and is not affiliated with any
            government agency. Our role is to help users prepare and review forms.
            The final responsibility for reviewing, signing, and submitting forms
            remains with the user.
          </p>

          <button
            onClick={() => navigate("/")}
            style={{
              background: "#2dd4b0",
              color: "#0a1628",
              border: "none",
              borderRadius: 10,
              padding: "14px 30px",
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Back to DocuLyft →
          </button>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ title, body, icon }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1.5px solid #e5e7eb",
        borderRadius: 18,
        padding: "28px",
        boxShadow: "0 18px 45px rgba(13, 31, 60, 0.06)",
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 14,
          background: "#0d1f3c",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 18,
        }}
      >
        <Icon type={icon} />
      </div>

      <h3
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: "#0d1f3c",
          margin: "0 0 10px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: 14,
          color: "#6b7280",
          lineHeight: 1.7,
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function Icon({ type }) {
  const common = {
    fill: "none",
    stroke: "#fff",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    width: 23,
    height: 23,
    viewBox: "0 0 24 24",
  };

  if (type === "lock") {
    return (
      <svg {...common}>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    );
  }

  if (type === "shield") {
    return (
      <svg {...common}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    );
  }

  if (type === "refresh") {
    return (
      <svg {...common}>
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
        <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}