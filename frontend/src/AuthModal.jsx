import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState("");

  function update(field, value) {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
    setFirebaseError("");
  }

  function validate() {
    const e = {};
    if (mode === "signup") {
      if (!form.first_name.trim()) e.first_name = "Required";
      if (!form.last_name.trim()) e.last_name = "Required";
    }
    if (!form.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Required";
    else if (form.password.length < 6) e.password = "At least 6 characters";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    setFirebaseError("");
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await updateProfile(cred.user, {
          displayName: `${form.first_name.trim()} ${form.last_name.trim()}`,
        });
      } else {
        await signInWithEmailAndPassword(auth, form.email, form.password);
      }
      onClose();
    } catch (err) {
      setFirebaseError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
  setLoading(true);
  setFirebaseError("");
  try {
    await signInWithRedirect(auth, googleProvider);
    // Don't call onClose() here — the page will redirect away
  } catch (err) {
    setFirebaseError(friendlyError(err.code));
    setLoading(false);
  }
}

  function friendlyError(code) {
    switch (code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential": return "Invalid email or password.";
      case "auth/email-already-in-use": return "An account with this email already exists.";
      case "auth/too-many-requests": return "Too many attempts. Please try again later.";
      case "auth/popup-closed-by-user": return "Google sign-in was cancelled.";
      default: return "Something went wrong. Please try again.";
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Mode toggle */}
        <div className="auth-toggle">
          <button
            className={`auth-toggle-btn ${mode === "signin" ? "active" : ""}`}
            onClick={() => { setMode("signin"); setErrors({}); setFirebaseError(""); }}
          >
            Sign in
          </button>
          <button
            className={`auth-toggle-btn ${mode === "signup" ? "active" : ""}`}
            onClick={() => { setMode("signup"); setErrors({}); setFirebaseError(""); }}
          >
            Create account
          </button>
        </div>

        <h2 className="modal-title">
          {mode === "signin" ? "Welcome back" : "Get started free"}
        </h2>
        <p className="modal-sub">
          {mode === "signin"
            ? "Sign in to access your saved forms and helper packets."
            : "No SSN, no payment info, no government ID required."}
        </p>

        {firebaseError && <div className="error" style={{ marginBottom: 0 }}>{firebaseError}</div>}

        {/* Google button */}
        <button className="google-btn" onClick={handleGoogle} disabled={loading}>
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="auth-divider"><span>or</span></div>

        {/* Name fields (signup only) */}
        {mode === "signup" && (
          <div className="name-row">
            <div className="field-group">
              <label htmlFor="au_first">First name</label>
              <input
                id="au_first"
                value={form.first_name}
                onChange={(e) => update("first_name", e.target.value)}
                placeholder="Jane"
                className={errors.first_name ? "input-error" : ""}
              />
              {errors.first_name && <span className="field-error">{errors.first_name}</span>}
            </div>
            <div className="field-group">
              <label htmlFor="au_last">Last name</label>
              <input
                id="au_last"
                value={form.last_name}
                onChange={(e) => update("last_name", e.target.value)}
                placeholder="Smith"
                className={errors.last_name ? "input-error" : ""}
              />
              {errors.last_name && <span className="field-error">{errors.last_name}</span>}
            </div>
          </div>
        )}

        <div className="field-group" style={{ marginTop: 14 }}>
          <label htmlFor="au_email">Email</label>
          <input
            id="au_email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="jane@example.com"
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="field-group" style={{ marginTop: 14 }}>
          <label htmlFor="au_password">Password</label>
          <input
            id="au_password"
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
            className={errors.password ? "input-error" : ""}
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <button className="modal-cta" onClick={handleSubmit} disabled={loading}>
          {loading ? "Please wait..." : mode === "signin" ? "Sign in →" : "Create account →"}
        </button>

        <p className="modal-privacy">
          {mode === "signin" ? (
            <>Don't have an account?{" "}
              <button className="nudge-link" onClick={() => setMode("signup")}>Sign up free</button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button className="nudge-link" onClick={() => setMode("signin")}>Sign in</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}
