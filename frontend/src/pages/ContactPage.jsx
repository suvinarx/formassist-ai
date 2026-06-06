import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useSEO } from "../hooks/useSEO";

export default function ContactPage() {
  const navigate = useNavigate();

  useSEO({
    title: "Contact DocuLyft — Feedback and Form Requests",
    description:
      "Contact DocuLyft with questions, feedback, or requests for new form categories and AI form agents.",
    canonical: "/contact",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  function update(field, value) {
    setForm((p) => ({ ...p, [field]: value }));

    if (errors[field]) {
      setErrors((p) => ({ ...p, [field]: "" }));
    }

    if (errors.submit) {
      setErrors((p) => ({ ...p, submit: "" }));
    }
  }

  function validate() {
    const e = {};

    if (!form.name.trim()) {
      e.name = "Name is required.";
    }

    if (!form.email.trim()) {
      e.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Enter a valid email.";
    }

    if (!form.message.trim()) {
      e.message = "Message is required.";
    } else if (form.message.trim().length < 10) {
      e.message = "Please enter at least 10 characters.";
    }

    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setSuccess(false);

    try {
      const currentUser = auth.currentUser;

      await addDoc(collection(db, "contact_messages"), {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        message: form.message.trim(),
        page: window.location.pathname,
        userId: currentUser?.uid || null,
        userEmail: currentUser?.email || null,
        status: "new",
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setForm({
        name: "",
        email: "",
        message: "",
      });
      setErrors({});
    } catch (err) {
      console.error("Failed to save contact message:", err);

      setErrors({
        submit: "Unable to submit your message right now. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
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

          <button className="fa-topnav-link" onClick={() => navigate("/contact")}>
            Contact
          </button>
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
          padding: "72px 32px 62px",
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
          Contact DocuLyft
        </div>

        <h1
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "2.7rem",
            fontWeight: 400,
            color: "#fff",
            margin: "0 0 18px",
            lineHeight: 1.16,
          }}
        >
          Questions, feedback, or form requests?
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
          Tell us what form category, workflow, or AI form agent you want
          DocuLyft to support next.
        </p>
      </section>

      {/* Contact form / Success */}
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px 80px" }}>
        <section
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: "34px",
            boxShadow: "0 18px 45px rgba(13,31,60,0.06)",
          }}
        >
          {errors.submit && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                borderRadius: 12,
                padding: "12px 14px",
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 18,
              }}
            >
              {errors.submit}
            </div>
          )}

          {success ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 24px",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "#ecfdf5",
                  color: "#065f46",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  fontWeight: 800,
                  margin: "0 auto 18px",
                }}
              >
                ✓
              </div>

              <h2
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "2rem",
                  fontWeight: 400,
                  color: "#0d1f3c",
                  margin: "0 0 10px",
                }}
              >
                Thank you for contacting DocuLyft.
              </h2>

              <p
                style={{
                  fontSize: 15,
                  color: "#6b7280",
                  lineHeight: 1.7,
                  margin: "0 auto 26px",
                  maxWidth: 460,
                }}
              >
                We have received your message and will review it shortly.
              </p>

              <button
                type="button"
                onClick={() => navigate("/")}
                style={{
                  background: "#e8612a",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 24px",
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Back to home
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 18 }}>
                <label htmlFor="contact_name" style={labelStyle}>
                  Name
                </label>

                <input
                  id="contact_name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Your name"
                  style={inputStyle(Boolean(errors.name))}
                />

                {errors.name && <FieldError>{errors.name}</FieldError>}
              </div>

              <div style={{ marginBottom: 18 }}>
                <label htmlFor="contact_email" style={labelStyle}>
                  Email
                </label>

                <input
                  id="contact_email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle(Boolean(errors.email))}
                />

                {errors.email && <FieldError>{errors.email}</FieldError>}
              </div>

              <div style={{ marginBottom: 22 }}>
                <label htmlFor="contact_message" style={labelStyle}>
                  Message
                </label>

                <textarea
                  id="contact_message"
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="Tell us what you need..."
                  rows={6}
                  style={{
                    ...inputStyle(Boolean(errors.message)),
                    resize: "vertical",
                    minHeight: 140,
                    lineHeight: 1.6,
                  }}
                />

                {errors.message && <FieldError>{errors.message}</FieldError>}
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  width: "100%",
                  background: saving ? "#9ca3af" : "#e8612a",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px 22px",
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Submitting..." : "Submit message"}
              </button>
            </form>
          )}

          {!success && (
            <p
              style={{
                fontSize: 12,
                color: "#9ca3af",
                lineHeight: 1.6,
                margin: "18px 0 0",
                textAlign: "center",
              }}
            >
              {/* You can also email us at{" "}
              <a href="mailto:support@doculyft.com" style={{ color: "#0d1f3c" }}>
                support@doculyft.com
              </a> */}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: "#0d1f3c",
  marginBottom: 7,
};

function FieldError({ children }) {
  return (
    <div
      style={{
        fontSize: 12,
        color: "#dc2626",
        marginTop: 6,
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}

function inputStyle(hasError) {
  return {
    width: "100%",
    boxSizing: "border-box",
    border: hasError ? "1.5px solid #dc2626" : "1.5px solid #e5e7eb",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 14,
    color: "#0d1f3c",
    outline: "none",
    fontFamily: "inherit",
    background: "#fff",
  };
}