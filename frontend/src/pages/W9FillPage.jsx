import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { W9_QUESTIONS } from "../data/w9Questions";
import "../App.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function W9FillPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  const visibleQuestions = W9_QUESTIONS.filter((q) => {
    if (!q.showIf) return true;
    return answers[q.showIf.field] === q.showIf.value;
  });

  const question = visibleQuestions[current];

  function updateAnswer(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setError("");
  }

  function next() {
    if (question.required && !String(answers[question.id] || "").trim()) {
      setError("Please answer this question before continuing.");
      return;
    }

    if (current < visibleQuestions.length - 1) {
      setCurrent(current + 1);
    }
  }

  function back() {
    if (current > 0) setCurrent(current - 1);
    else navigate("/");
  }

  async function generateW9() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/forms/w9/fill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) {
        throw new Error("Could not generate W-9 PDF.");
      }

      const data = await res.json();
      setDownloadUrl(`${API_BASE}${data.download_url}`);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const progress = Math.round(((current + 1) / visibleQuestions.length) * 100);

  return (
    <div className="w9-shell">
      <div className="w9-card">
        <button className="w9-back" onClick={back}>
          ← Back
        </button>

        <div className="w9-kicker">IRS Form W-9</div>
        <h1 className="w9-title">Guided W-9 Form Help</h1>
        <p className="w9-subtitle">
          Answer a few simple questions. We will prepare a reviewable W-9 draft and leave sensitive fields blank for you to complete manually.
        </p>

        <div className="w9-progress-track">
          <div className="w9-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {!downloadUrl ? (
          <div className="w9-question-box">
            <div className="w9-question-count">
              Question {current + 1} of {visibleQuestions.length}
            </div>

            <label className="w9-label">{question.label}</label>

            {question.helper && (
              <p className="w9-helper">{question.helper}</p>
            )}

            {question.type === "notice" ? (
              <div className="w9-notice">
                {question.helper}
              </div>
            ) : question.type === "select" ? (
              <select
                className="w9-input"
                value={answers[question.id] || ""}
                onChange={(e) => updateAnswer(question.id, e.target.value)}
              >
                <option value="">Select an option</option>
                {question.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="w9-input"
                type="text"
                value={answers[question.id] || ""}
                onChange={(e) => updateAnswer(question.id, e.target.value)}
                placeholder="Type your answer"
              />
            )}

            {error && <div className="w9-error">{error}</div>}

            <div className="w9-actions">
              <button className="w9-secondary" onClick={back}>
                Back
              </button>

              {current < visibleQuestions.length - 1 ? (
                <button className="w9-primary" onClick={next}>
                  Continue →
                </button>
              ) : (
                <button className="w9-primary" onClick={generateW9} disabled={loading}>
                  {loading ? "Preparing PDF..." : "Prepare W-9 PDF"}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="w9-download-box">
            <h2>Your W-9 draft is ready</h2>
            <p>
              Review the form carefully. Add your SSN/EIN, signature, and date manually before submitting it to the requester.
            </p>
            <a className="w9-primary w9-download-link" href={downloadUrl} target="_blank" rel="noreferrer">
              Download W-9 PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
}