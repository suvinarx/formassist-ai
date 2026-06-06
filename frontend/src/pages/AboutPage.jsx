import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSEO } from "../hooks/useSEO";

export default function AboutPage() {
  const navigate = useNavigate();

  useSEO({
    title: "About DocuLyft — A Central Hub for Common Forms",
    description:
      "DocuLyft is building a centralized repository of commonly used forms, helping people find, understand, prepare, and download forms in one place.",
    canonical: "/about",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Nav */}
      {/* Nav */}
<nav className="fa-topnav">
  <div
    className="fa-topnav-brand"
    onClick={() => navigate("/")}
    style={{ cursor: "pointer" }}
  >
    <div className="fa-brand-mark">F</div>
    <span className="fa-brand-name">DocuLyft</span>
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
          background: "linear-gradient(135deg, #0d1f3c 0%, #1a3460 100%)",
          padding: "72px 32px 64px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.45)",
            marginBottom: 14,
          }}
        >
          About DocuLyft
        </div>

        <h1
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "2.7rem",
            fontWeight: 400,
            color: "#fff",
            margin: "0 0 18px",
            lineHeight: 1.18,
          }}
        >
          One place for the forms people use every day
        </h1>

        <p
          style={{
            fontSize: 17,
            color: "rgba(255,255,255,0.72)",
            lineHeight: 1.7,
            maxWidth: 680,
            margin: "0 auto",
          }}
        >
          DocuLyft is building a centralized repository of commonly used forms —
          making it easier to find, understand, prepare, and download paperwork
          from one simple place.
        </p>
      </section>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "64px 24px 80px" }}>
        {/* Mission */}
        <section
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: "36px",
            marginBottom: 28,
          }}
        >
          <h2
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "1.8rem",
              fontWeight: 400,
              color: "#0d1f3c",
              margin: "0 0 14px",
            }}
          >
            Our mission
          </h2>

          <p
            style={{
              fontSize: 15,
              color: "#374151",
              lineHeight: 1.8,
              margin: "0 0 14px",
            }}
          >
            Forms are everywhere — government applications, school paperwork,
            rental forms, job documents, healthcare intake forms, tax forms,
            business forms, and more. The problem is that they are scattered
            across different websites, hard to search, and often confusing to
            complete.
          </p>

          <p
            style={{
              fontSize: 15,
              color: "#374151",
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            DocuLyft brings commonly used forms together in one place and uses AI
            to help users understand what they need, fill what they can, and
            review everything before downloading.
          </p>
        </section>

        {/* What DocuLyft helps with */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 18,
            marginBottom: 28,
          }}
        >
          <InfoCard
            title="Find forms faster"
            body="Search or browse commonly used forms from one central place instead of jumping across many websites."
          />

          <InfoCard
            title="Understand what to fill"
            body="Use plain language guidance to understand what information a form is asking for."
          />

          <InfoCard
            title="Prepare with AI"
            body="DocuLyft can help map your answers into form fields so you can review and complete paperwork faster."
          />

          <InfoCard
            title="Download and submit yourself"
            body="You stay in control. DocuLyft helps prepare forms, but you review, sign, and submit them yourself."
          />
        </section>

        {/* Categories */}
        <section
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: "36px",
            marginBottom: 28,
          }}
        >
          <h2
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "1.7rem",
              fontWeight: 400,
              color: "#0d1f3c",
              margin: "0 0 20px",
            }}
          >
            More than government forms
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "14px 24px",
            }}
          >
            {[
              "Government forms",
              "Tax forms",
              "Job and employment forms",
              "Rental and housing forms",
              "School and student forms",
              "Healthcare intake forms",
              "Business and vendor forms",
              "General administrative forms",
            ].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  fontSize: 14,
                  color: "#374151",
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#2dd4b0",
                    color: "#0d1f3c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  ✓
                </span>
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* Commitments */}
        <section
          style={{
            background: "#f3f4f6",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: "34px",
            marginBottom: 28,
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#0d1f3c",
              margin: "0 0 18px",
            }}
          >
            What we believe
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Commitment
              title="Forms should be easier to find"
              body="People should not have to search across dozens of websites just to find the right document."
            />

            <Commitment
              title="Users should stay in control"
              body="DocuLyft does not submit forms on behalf of users. Users review, sign, and submit forms themselves."
            />

            <Commitment
              title="The repository should stay current"
              body="Form versions are reviewed and updated regularly so users can access current materials."
            />

            <Commitment
              title="Privacy should be simple"
              body="DocuLyft uses secure TLS communication and does not store customer form information."
            />
          </div>
        </section>

        {/* Disclaimer */}
        <section
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: "30px 34px",
            marginBottom: 28,
          }}
        >
          <h2
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "#0d1f3c",
              margin: "0 0 10px",
            }}
          >
            Important note
          </h2>

          <p
            style={{
              fontSize: 14,
              color: "#6b7280",
              lineHeight: 1.75,
              margin: 0,
            }}
          >
            DocuLyft is a form preparation and discovery tool. We are not a
            government agency, law firm, tax advisor, or filing service. Users are
            responsible for reviewing their information and submitting forms
            through the appropriate official or business channel.
          </p>
        </section>

        {/* Contact */}
        <section
          style={{
            background: "#0d1f3c",
            borderRadius: 18,
            padding: "40px 32px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "1.7rem",
              fontWeight: 400,
              color: "#fff",
              margin: "0 0 10px",
            }}
          >
            Help us build the form library
          </h2>

          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.7,
              margin: "0 0 22px",
            }}
          >
            Have a form category you want added? Send us feedback.
          </p>

          <a
            href="mailto:support@doculyft.com"
            style={{
              display: "inline-block",
              background: "#e8612a",
              color: "#fff",
              borderRadius: 10,
              padding: "12px 28px",
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            support@doculyft.com
          </a>
        </section>
      </main>

      <footer
        style={{
          textAlign: "center",
          padding: "24px",
          fontSize: 12,
          color: "#9ca3af",
          borderTop: "1px solid #e5e7eb",
          background: "#fff",
        }}
      >
        © {new Date().getFullYear()} DocuLyft ·{" "}
        <button
          onClick={() => navigate("/privacy")}
          style={{
            background: "none",
            border: "none",
            color: "#6b7280",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          Privacy
        </button>{" "}
        ·{" "}
        <button
          onClick={() => navigate("/terms")}
          style={{
            background: "none",
            border: "none",
            color: "#6b7280",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          Terms
        </button>
      </footer>
    </div>
  );
}

function InfoCard({ title, body }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: "26px",
      }}
    >
      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#0d1f3c",
          margin: "0 0 8px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: 14,
          color: "#6b7280",
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function Commitment({ title, body }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#2dd4b0",
          color: "#0d1f3c",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 13,
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        ✓
      </span>

      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#0d1f3c",
            marginBottom: 4,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 13,
            color: "#6b7280",
            lineHeight: 1.65,
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );
}