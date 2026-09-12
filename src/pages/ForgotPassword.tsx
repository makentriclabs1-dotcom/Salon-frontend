import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiRequest("/auth/forgot-password", { method: "POST", body: { email } });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="card">
        <h1>Reset your password</h1>
        {submitted ? (
          <>
            <p style={{ marginBottom: 8 }}>If an account exists for <strong>{email}</strong>, we've sent a reset link to that email.</p>
            <p className="helper-text">Check your inbox (and spam folder). The link expires in 1 hour.</p>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ marginBottom: 18 }}>Enter your email and we'll send you a link to reset your password.</p>
            <label className="field-label">Email</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {error && <p className="notice notice-error">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: "100%" }}>
              {submitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}
        <p style={{ marginTop: 16, fontSize: 13.5 }}><Link to="/login">&larr; Back to sign in</Link></p>
      </div>
    </div>
  );
}
