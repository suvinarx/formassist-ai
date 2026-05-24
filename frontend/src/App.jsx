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
      console.log("Lead validation failed:", lead);
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
        const errorText = await response.text();
        console.error("Analyze error:", errorText);
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
        const errorText = await response.text();
        console.error("Load form error:", errorText);
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
        const errorText = await response.text();
        console.error("AI fill error:", errorText);
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
        const errorText = await response.text();
        console.error("PDF error:", errorText);
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
    <div className="page">
      <div className="card">
        <div className="header">
          <div>
            <h1>FormAssist AI</h1>
            <p className="subtitle">
              Find the right form, fill safe fields, and create a print-ready
              helper packet.
            </p>
          </div>

          <div className="badge">Helper Only</div>
        </div>

        <div className="steps">
          <span className={step === "lead" ? "active" : ""}>1. Situation</span>
          <span className={step === "recommendations" ? "active" : ""}>
            2. Forms
          </span>
          <span className={step === "ai_fill" ? "active" : ""}>
            3. AI Fill
          </span>
          <span className={step === "review" ? "active" : ""}>4. Review</span>
          <span className={step === "done" ? "active" : ""}>5. PDF</span>
        </div>

        {error && <div className="error">{error}</div>}

        {step === "lead" && (
          <div>
            <h2>Tell us your situation</h2>
            <p className="muted">
              We’ll recommend possible forms or helper packets based on what you
              describe.
            </p>

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
              placeholder="Example: My name is Nitin Sahai and I am moving from CA to WA."
            />

            <div className="checkbox">
              <input
                id="consent"
                type="checkbox"
                checked={lead.consent}
                onChange={(e) => updateLead("consent", e.target.checked)}
              />
              <label htmlFor="consent" className="checkbox-label">
                I agree that FormAssist AI may use my information to recommend
                forms and prepare helper packets. I understand this app does not
                officially submit forms.
              </label>
            </div>

            <button onClick={analyzeSituation} disabled={loading}>
              {loading ? "Analyzing..." : "Find My Forms"}
            </button>
          </div>
        )}

        {step === "recommendations" && (
          <div>
            <h2>Recommended forms/actions</h2>
            <p className="muted">
              Select the form or helper packet you want to prepare.
            </p>

            {recommendations.length === 0 && (
              <div className="warning">
                No recommendation found. Try describing your situation with more
                details.
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
              anything. You will review, print, add sensitive details if needed,
              and submit through the official channel.
            </div>

            <label htmlFor="userDetails">Enter details in plain English</label>
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
              AI filled the safe fields it could understand. Please review and
              edit before generating the PDF.
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

            <button className="secondary" onClick={() => setStep("ai_fill")}>
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
              information or signature if needed, and submit through the official
              agency.
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
      </div>
    </div>
  );
}

function formatLabel(key) {
  return key
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default App;
