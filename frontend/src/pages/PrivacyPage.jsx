import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSEO } from "../hooks/useSEO";

export default function PrivacyPage() {
  const navigate = useNavigate();

  useSEO({
    title:     "Privacy Policy",
    description: "DocuLyft Privacy Policy — how we handle your data, what we collect, and your rights under GDPR and CCPA.",
    canonical: "/privacy",
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
        <h1 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: "2rem", fontWeight: 400, color: "#0d1f3c", marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 40 }}>Last updated: {UPDATED}</p>

        {[
          {
            title: "1. Who We Are",
            body: `DocuLyft ("DocuLyft," "we," "us," or "our") operates the website doculyft.com — an AI-assisted tool that helps users prepare unofficial pre-filled packets for U.S. government forms. We do not submit forms on your behalf, and we do not collect or store your Social Security Number, EIN, passport number, or financial account information.`,
          },
          {
            title: "2. What We Collect",
            body: `We may collect the following information when you use DocuLyft:\n\n• **Account data** (if you create an account): email address, display name.\n• **Form input data**: text you type into form fields (names, addresses, dates). We do not collect SSNs, government ID numbers, or payment details — these fields are intentionally excluded from our AI pre-fill and are not transmitted to our servers.\n• **Usage data**: pages visited, features used, error logs — collected in aggregate for service improvement.\n• **Authentication data**: if you use Google Sign-In via Firebase, Google's privacy policy applies to that authentication flow.`,
          },
          {
            title: "3. How We Use Your Data",
            body: `• To operate and improve DocuLyft.\n• To pre-fill form fields using our AI service (your input is sent to our backend AI service only for the duration of processing and is not stored after the response is returned).\n• To maintain your account if you choose to create one.\n• We do not sell your data. We do not share your data with third parties except as required to operate the service (e.g., Firebase for authentication, Vercel for hosting).`,
          },
          {
            title: "4. Data Retention",
            body: `• Form input data is processed in memory and is not persistently stored on our servers beyond the duration of your session.\n• Account data (email, display name) is retained until you delete your account.\n• Usage logs are retained for up to 90 days for debugging and security purposes.`,
          },
          {
            title: "5. Sensitive Information",
            body: `DocuLyft is designed to never request, transmit, or store your:\n• Social Security Number (SSN) or Individual Taxpayer Identification Number (ITIN)\n• Employer Identification Number (EIN)\n• Passport or government ID numbers\n• Bank account or routing numbers\n• Credit or debit card numbers\n• Alien registration numbers\n\nThese fields are marked sensitive in our interface and must be filled by you directly on the downloaded PDF before submission.`,
          },
          {
            title: "6. Cookies",
            body: `DocuLyft uses minimal cookies necessary for authentication and session management via Firebase. We do not use advertising or tracking cookies. You can disable cookies in your browser settings; some features (like staying signed in) may not work without them.`,
          },
          {
            title: "7. Your Rights (GDPR / CCPA)",
            body: `Depending on your location, you may have the right to:\n• Access the personal data we hold about you.\n• Request correction or deletion of your data.\n• Object to or restrict our processing of your data.\n• Data portability.\n• Withdraw consent at any time.\n\nTo exercise these rights, email us at privacy@doculyft.com. We will respond within 30 days.`,
          },
          {
            title: "8. Children's Privacy",
            body: `DocuLyft is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, contact us and we will delete it promptly.`,
          },
          {
            title: "9. Security",
            body: `We use HTTPS/TLS for all data transmission, Firebase Authentication for account security, and Vercel's secure infrastructure for hosting. See our Security page (/security) for more details.`,
          },
          {
            title: "10. Changes to This Policy",
            body: `We may update this Privacy Policy from time to time. We will post the updated date at the top of this page. Continued use of DocuLyft after changes constitutes acceptance of the updated policy.`,
          },
          {
            title: "11. Contact",
            body: `Questions about this Privacy Policy? Contact us at privacy@doculyft.com.`,
          },
        ].map(({ title, body }) => (
          <section key={title} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0d1f3c", marginBottom: 10 }}>{title}</h2>
            <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.75 }}>
              {body.split("\n").map((line, i) => (
                <p key={i} style={{ marginBottom: line.startsWith("•") ? 4 : 10 }}>
                  {line.startsWith("•") ? (
                    <span>
                      <span style={{ color: "#0d1f3c", fontWeight: 600 }}>• </span>
                      {line.slice(2).replace(/\*\*(.+?)\*\*/g, '$1')}
                    </span>
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