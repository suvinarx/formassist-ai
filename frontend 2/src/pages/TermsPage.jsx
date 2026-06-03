import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSEO } from "../hooks/useSEO";

export default function TermsPage() {
  const navigate = useNavigate();

  useSEO({
    title:     "Terms of Service",
    description: "DocuLyft Terms of Service — acceptable use, disclaimers, and your rights when using our AI form-filling service.",
    canonical: "/terms",
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const UPDATED = "May 30, 2026";

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <nav style={{ background: "#0d1f3c", padding: "0 32px", height: 56, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={{ width: 28, height: 28, background: "#e8612a", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 14 }}>D</div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>DocuLyft</span>
        </div>
        <button onClick={() => navigate(-1)} style={{ marginLeft: "auto", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "5px 14px", fontSize: 13, cursor: "pointer" }}>← Back</button>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 80px" }}>
        <h1 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "2rem", fontWeight: 400, color: "#0d1f3c", marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 40 }}>Last updated: {UPDATED}</p>

        {[
          {
            title: "1. Acceptance of Terms",
            body: `By accessing or using DocuLyft ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.`,
          },
          {
            title: "2. What DocuLyft Does",
            body: `DocuLyft is an AI-assisted form preparation tool. It helps you prepare unofficial pre-filled packets for U.S. government forms. DocuLyft:\n• Does NOT submit any form to any government agency on your behalf.\n• Does NOT provide legal, tax, immigration, or financial advice.\n• Produces helper packets for reference only — you are responsible for verifying all information before official submission.\n• Is not affiliated with or endorsed by the IRS, USCIS, State Department, SSA, VA, USPS, or any other government agency.`,
          },
          {
            title: "3. Not Legal or Tax Advice",
            body: `DocuLyft is a technology tool, not a law firm, accounting firm, or immigration service. Nothing produced by DocuLyft constitutes legal, tax, or immigration advice. For legal or tax guidance, consult a licensed attorney, CPA, or accredited immigration representative.`,
          },
          {
            title: "4. Accuracy Disclaimer",
            body: `AI pre-fill is provided as a convenience. DocuLyft makes no warranty that pre-filled fields are accurate, complete, or appropriate for your specific situation. You must review every field before submitting any form to a government agency. Submitting incorrect information to a government agency may have legal consequences; DocuLyft is not liable for any such consequences.`,
          },
          {
            title: "5. Acceptable Use",
            body: `You agree not to:\n• Use DocuLyft to submit fraudulent, misleading, or false information to any agency.\n• Attempt to reverse-engineer, scrape, or abuse the Service.\n• Use DocuLyft on behalf of others without their explicit consent.\n• Use the Service for any unlawful purpose.`,
          },
          {
            title: "6. Account Responsibility",
            body: `If you create an account, you are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.`,
          },
          {
            title: "7. Intellectual Property",
            body: `The DocuLyft name, logo, interface, and software are owned by DocuLyft. Official government form PDFs displayed in the Service are in the public domain as U.S. government works.`,
          },
          {
            title: "8. Limitation of Liability",
            body: `To the maximum extent permitted by law, DocuLyft shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to errors in pre-filled form data, government rejection of submitted forms, or data loss.`,
          },
          {
            title: "9. Changes to Terms",
            body: `We may update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the updated Terms.`,
          },
          {
            title: "10. Contact",
            body: `Questions? Email us at support@doculyft.com.`,
          },
        ].map(({ title, body }) => (
          <section key={title} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0d1f3c", marginBottom: 10 }}>{title}</h2>
            <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.75 }}>
              {body.split("\n").map((line, i) => (
                <p key={i} style={{ marginBottom: line.startsWith("•") ? 4 : 10 }}>
                  {line.startsWith("•") ? (
                    <span><span style={{ color: "#0d1f3c", fontWeight: 600 }}>• </span>{line.slice(2)}</span>
                  ) : line}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer style={{ textAlign: "center", padding: "24px", fontSize: 12, color: "#9ca3af", borderTop: "1px solid #e5e7eb" }}>
        © {new Date().getFullYear()} DocuLyft · <button onClick={() => navigate("/terms")} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 12 }}>Terms</button> · <button onClick={() => navigate("/privacy")} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 12 }}>Privacy</button>
      </footer>
    </div>
  );
}