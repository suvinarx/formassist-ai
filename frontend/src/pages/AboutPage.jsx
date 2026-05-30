import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSEO } from "../hooks/useSEO";

export default function AboutPage() {
  const navigate = useNavigate();

  useSEO({
    title:     "About DocuLyft — AI Government Form Filler",
    description: "Learn about DocuLyft — who we are, our mission to make government paperwork accessible, and how we keep your data safe.",
    canonical: "/about",
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>

      {/* Nav */}
      <nav style={{ background: "#0d1f3c", padding: "0 32px", height: 56, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={{ width: 28, height: 28, background: "#e8612a", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 14 }}>D</div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>DocuLyft</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={() => navigate("/")} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "5px 14px", fontSize: 13, cursor: "pointer" }}>← Home</button>
          <a href="mailto:support@doculyft.com" style={{ background: "#e8612a", border: "none", color: "#fff", borderRadius: 8, padding: "5px 14px", fontSize: 13, cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center" }}>Contact us</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0d1f3c 0%, #1a3460 100%)", padding: "64px 32px 56px", textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>About DocuLyft</div>
        <h1 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "2.6rem", fontWeight: 400, color: "#fff", margin: "0 0 18px", lineHeight: 1.2 }}>
          Government forms shouldn't<br />require a law degree
        </h1>
        <p style={{ fontSize: 17, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 28px" }}>
          DocuLyft was built to make U.S. government paperwork accessible to everyone — not just those who can afford legal help.
        </p>
        <a href="mailto:support@doculyft.com" style={{ display: "inline-block", background: "#e8612a", color: "#fff", borderRadius: 10, padding: "12px 28px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
          Get in touch →
        </a>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "56px 24px 80px" }}>

        {/* Mission */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "1.6rem", fontWeight: 400, color: "#0d1f3c", marginBottom: 16 }}>Our mission</h2>
          <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.8, marginBottom: 14 }}>
            Every year, millions of Americans struggle with government forms — tax filings, immigration applications, passport renewals, benefits enrollments. The instructions are dense, the stakes are high, and a single mistake can mean weeks of delays or costly rejections.
          </p>
          <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.8, marginBottom: 14 }}>
            DocuLyft uses AI to close that gap. You describe your situation in plain English; our AI reads it, finds the right form, and pre-fills every field it can. You review, add sensitive information by hand, and download a print-ready PDF. Then you submit it yourself — through the official agency channel.
          </p>
          <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.8 }}>
            We never submit forms on your behalf. We never store your SSN, payment details, or government ID numbers. Our job is to do the tedious part so you can focus on what matters.
          </p>
        </section>

        {/* What we cover */}
        <section style={{ marginBottom: 56, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "32px 36px" }}>
          <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "1.4rem", fontWeight: 400, color: "#0d1f3c", marginBottom: 20 }}>What DocuLyft covers</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 32px" }}>
            {[
              ["IRS / Tax", "W-9, W-4, W-2, Form 1040, 1099-NEC, Schedule A & C, and more"],
              ["USCIS / Immigration", "I-9, I-130, I-485, I-765, N-400, I-864, I-90"],
              ["State Department", "DS-11 Passport Application, DS-64 Lost Passport"],
              ["Veterans Affairs", "VA 21-526EZ, VA 22-1990, VA 21-4142"],
              ["Social Security", "SSA-44 Medicare income appeal"],
              ["USPS / Moving", "PS Form 3575 Change of Address"],
              ["Employment / FMLA", "WH-380-E, WH-381 leave forms"],
              ["And more", "28 active forms, growing regularly"],
            ].map(([cat, desc]) => (
              <div key={cat} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "#2dd4b0", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0d1f3c" }}>{cat}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Our commitments */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "1.4rem", fontWeight: 400, color: "#0d1f3c", marginBottom: 20 }}>Our commitments to you</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              ["🔒", "We never store your SSN, EIN, or government ID", "Sensitive fields are explicitly excluded from our AI pipeline. You add them by hand on the downloaded PDF."],
              ["📋", "We never submit forms on your behalf", "DocuLyft produces a helper packet only. You review, sign, and submit through the official government channel."],
              ["🆓", "Always free to use", "Pre-filling and downloading your form PDF costs nothing. No credit card, no subscription."],
              ["🏛️", "Forms sourced directly from official .gov sources", "Every PDF comes from IRS.gov, USCIS.gov, State.gov, SSA.gov, VA.gov, or USPS.com — never third-party copies."],
              ["🔐", "Your data is encrypted in transit and at rest", "We use HTTPS/TLS for all connections and industry-standard encryption for any stored account data."],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ display: "flex", gap: 16, padding: "20px 24px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12 }}>
                <div style={{ fontSize: 24, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0d1f3c", marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section style={{ background: "#0d1f3c", borderRadius: 16, padding: "36px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "1.4rem", fontWeight: 400, color: "#fff", marginBottom: 10 }}>Questions or feedback?</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", marginBottom: 20, lineHeight: 1.6 }}>
            We read every message and typically respond within 24 hours.
          </p>
          <a href="mailto:support@doculyft.com" style={{ display: "inline-block", background: "#e8612a", color: "#fff", borderRadius: 10, padding: "12px 28px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
            support@doculyft.com
          </a>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 14 }}>
            Not affiliated with IRS, USCIS, SSA, State Department, VA, USPS, or any U.S. government agency.
          </p>
        </section>

      </div>

      <footer style={{ textAlign: "center", padding: "24px", fontSize: 12, color: "#9ca3af", borderTop: "1px solid #e5e7eb" }}>
        © {new Date().getFullYear()} DocuLyft ·{" "}
        <button onClick={() => navigate("/privacy")} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 12 }}>Privacy</button>{" · "}
        <button onClick={() => navigate("/terms")} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 12 }}>Terms</button>
      </footer>
    </div>
  );
}