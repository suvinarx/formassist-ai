import { useState } from "react";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function App() {
  const [step, setStep] = useState("lead");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [lead, setLead] = useState({
    first_name: "",
    email: "",
    situation: "",
    consent: false,
  });

  const [recommendations, setRecommendations] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [userDetails, setUserDetails] = useState("");
  const [answers, setAnswers] = useState({});
  const [downloadUrl, setDownloadUrl] = useState("");

  function updateLead(field, value) {
    setLead((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function analyzeSituation() {
    setError("");

    const isValid =
      lead.first_name.trim() !== "" &&
      lead.email.trim() !== "" &&
      lead.situation.trim() !== "" &&
      lead.consent === true;

    if (!isValid) {
      setError("Please enter your first name, email, situation, and consent.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/analyze-situation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: lead.first_name.trim(),
          email: lead.email.trim(),
          situation: lead.situation.trim(),
          consent: lead.consent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze situation.");
      }

      const data = await response.json();
      setRecommendations(data.recommended_forms || []);
      setStep("recommendations");
    } catch (err) {
      setError(err.message || "Something went wrong while analyzing.");
    } finally {
      setLoading(false);
    }
  }

  async function chooseForm(form) {
    setError("");

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/forms/${form.form_id}`);

      if (!response.ok) {
        throw new Error("Failed to load selected form.");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setSelectedForm(data);
      setUserDetails("");
      setAnswers({});
      setStep("ai_fill");
    } catch (err) {
      setError(err.message || "Something went wrong while loading the form.");
    } finally {
      setLoading(false);
    }
  }

  async function aiFill() {
    setError("");

    if (!selectedForm) {
      setError("Please select a form first.");
      return;
    }

    if (!userDetails.trim()) {
      setError("Please enter the details you want AI to use.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/ai-fill`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          form_id: selectedForm.form_id,
          user_details: userDetails.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("AI fill failed.");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setAnswers(data.answers || {});
      setStep("review");
    } catch (err) {
      setError(err.message || "Something went wrong during AI fill.");
    } finally {
      setLoading(false);
    }
  }

  function updateAnswer(key, value) {
    setAnswers((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function generatePdf() {
    setError("");

    if (!selectedForm) {
      setError("No form selected.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/generate-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          form_id: selectedForm.form_id,
          answers,
        }),
      });

      if (!response.ok) {
        throw new Error("PDF generation failed.");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setDownloadUrl(`${API_BASE}${data.download_url}`);
      setStep("done");
    } catch (err) {
      setError(err.message || "Something went wrong while generating PDF.");
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setStep("lead");
    setLoading(false);
    setError("");
    setLead({
      first_name: "",
      email: "",
      situation: "",
      consent: false,
    });
    setRecommendations([]);
    setSelectedForm(null);
    setUserDetails("");
    setAnswers({});
    setDownloadUrl("");
  }

  return (
    <div className="app-shell">
      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>

      <nav className="nav">
        <div className="brand">
          <div className="brand-icon">F</div>
          <span>FormAssist AI</span>
        </div>

        <div className="nav-pill">Helper-only MVP</div>
      </nav>

      {step === "lead" && (
        <main className="landing">
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow">AI-powered form preparation</div>

              <h1>
                Find the right form without reading pages of confusing
                instructions.
              </h1>

              <p className="hero-subtitle">
                Describe your situation in plain English. FormAssist AI suggests
                relevant forms, fills safe fields, and creates a print-ready
                helper packet for review.
              </p>

              <div className="hero-actions">
                <a href="#start" className="primary-link">
                  Start now
                </a>
                <span className="small-note">
                  No official submission. You stay in control.
                </span>
              </div>

              <div className="feature-row">
                <div className="feature-card">
                  <span>01</span>
                  <strong>Explain situation</strong>
                  <p>Tell the app what you are trying to do.</p>
                </div>

                <div className="feature-card">
                  <span>02</span>
                  <strong>AI finds forms</strong>
                  <p>Get recommended forms and helper packets.</p>
                </div>

                <div className="feature-card">
                  <span>03</span>
                  <strong>Print and submit</strong>
                  <p>Review, print, add sensitive info, and submit.</p>
                </div>
              </div>
            </div>

            <section id="start" className="form-panel">
              <div className="panel-header">
                <div>
                  <h2>Start your helper packet</h2>
                  <p>
                    We’ll recommend possible forms based on what you describe.
                  </p>
                </div>
                <div className="secure-badge">Safe fields only</div>
              </div>

              <Progress step={step} />

              {error && <div className="error">{error}</div>}

              <label htmlFor="first_name">First name</label>
              <input
                id="first_name"
                value={lead.first_name}
                onChange={(e) => updateLead("first_name", e.target.value)}
                placeholder="Nitin"
              />

              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={lead.email}
                onChange={(e) => updateLead("email", e.target.value)}
                placeholder="nitin@example.com"
              />

              <label htmlFor="situation">Describe your situation</label>
              <textarea
                id="situation"
                rows="5"
                value={lead.situation}
                onChange={(e) => updateLead("situation", e.target.value)}
                placeholder="Example: My name is Nitin Sahai and I am moving from California to Washington."
              />

              <div className="checkbox">
                <input
                  id="consent"
                  type="checkbox"
                  checked={lead.consent}
                  onChange={(e) => updateLead("consent", e.target.checked)}
                />
                <label htmlFor="consent" className="checkbox-label">
                  I agree that FormAssist AI may use my information to
                  recommend forms and prepare helper packets. I understand this
                  app does not officially submit forms.
                </label>
              </div>

              <button onClick={analyzeSituation} disabled={loading}>
                {loading ? "Analyzing..." : "Find My Forms"}
              </button>

              <p className="privacy-note">
                We do not ask for SSN, payment card, signature, or government ID
                in this MVP.
              </p>
            </section>
          </section>
        </main>
      )}

      {step !== "lead" && (
        <main className="workflow-page">
          <section className="workflow-card">
            <div className="workflow-header">
              <div>
                <h1>FormAssist AI</h1>
                <p>
                  Find the right form, fill safe fields, and create a
                  print-ready helper packet.
                </p>
              </div>
              <div className="badge">Helper Only</div>
            </div>

            <Progress step={step} />

            {error && <div className="error">{error}</div>}

            {step === "recommendations" && (
              <div>
                <h2>Recommended forms/actions</h2>
                <p className="muted">
                  Select the form or helper packet you want to prepare.
                </p>

                {recommendations.length === 0 && (
                  <div className="warning">
                    No recommendation found. Try describing your situation with
                    more details.
                  </div>
                )}

                {recommendations.map((form) => (
                  <div className="recommendation" key={form.form_id}>
                    <div>
                      <h3>{form.form_name}</h3>
                      <p>{form.reason}</p>
                      <p>
                        <strong>Confidence:</strong> {form.confidence}
                      </p>
                    </div>

                    <button onClick={() => chooseForm(form)} disabled={loading}>
                      Select
                    </button>
                  </div>
                ))}

                <button className="secondary" onClick={() => setStep("lead")}>
                  Back
                </button>
              </div>
            )}

            {step === "ai_fill" && selectedForm && (
              <div>
                <h2>{selectedForm.form_name}</h2>
                <p className="muted">{selectedForm.description}</p>

                <div className="warning">
                  This is a helper packet only. It does not officially submit
                  anything. You will review, print, add sensitive details if
                  needed, and submit through the official channel.
                </div>

                <label htmlFor="userDetails">
                  Enter details in plain English
                </label>
                <textarea
                  id="userDetails"
                  rows="9"
                  value={userDetails}
                  onChange={(e) => setUserDetails(e.target.value)}
                  placeholder="Example: My name is Nitin Sahai. I am moving permanently as an individual from 123 Main St, San Jose, CA 95112 to 456 Pine Ave, Seattle, WA 98101. Mail forwarding should start June 15, 2026. My email is nitin@example.com and my phone is 425-555-1212."
                />

                <button onClick={aiFill} disabled={loading}>
                  {loading ? "Filling..." : "AI Fill Form"}
                </button>

                <button
                  className="secondary"
                  onClick={() => setStep("recommendations")}
                >
                  Back
                </button>
              </div>
            )}

            {step === "review" && selectedForm && (
              <div>
                <h2>Review and edit</h2>
                <p className="muted">
                  AI filled the safe fields it could understand. Please review
                  and edit before generating the PDF.
                </p>

                <div className="warning">
                  Sensitive information, signatures, payment, and identity
                  verification should be completed by the user directly with the
                  official agency.
                </div>

                <div className="answer-grid">
                  {Object.keys(answers).length === 0 && (
                    <div className="warning">
                      No fields were filled. Go back and provide more details.
                    </div>
                  )}

                  {Object.keys(answers).map((key) => (
                    <div className="field" key={key}>
                      <label htmlFor={key}>{formatLabel(key)}</label>
                      <input
                        id={key}
                        value={answers[key] || ""}
                        onChange={(e) => updateAnswer(key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <button onClick={generatePdf} disabled={loading}>
                  {loading ? "Generating..." : "Generate Print-Ready PDF"}
                </button>

                <button
                  className="secondary"
                  onClick={() => setStep("ai_fill")}
                >
                  Back
                </button>
              </div>
            )}

            {step === "done" && (
              <div>
                <h2>Your helper packet is ready</h2>

                <div className="success">
                  Your print-ready PDF has been generated.
                </div>

                <p>
                  Print this packet, review it carefully, add any sensitive
                  information or signature if needed, and submit through the
                  official agency.
                </p>

                <a
                  className="download"
                  href={downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download PDF
                </a>

                <br />

                <button className="secondary" onClick={restart}>
                  Start another form
                </button>
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
}

function Progress({ step }) {
  const steps = [
    ["lead", "1. Situation"],
    ["recommendations", "2. Forms"],
    ["ai_fill", "3. AI Fill"],
    ["review", "4. Review"],
    ["done", "5. PDF"],
  ];

  return (
    <div className="steps">
      {steps.map(([key, label]) => (
        <span key={key} className={step === key ? "active" : ""}>
          {label}
        </span>
      ))}
    </div>
  );
}

function formatLabel(key) {
  return key
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default App;
