import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../api/client";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest("/auth/reset-password", { method: "POST", body: { token, newPassword } });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "This reset link may have expired");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="auth-shell">
        <div className="card">
          <h1>Invalid link</h1>
          <p>This reset link is missing its token. Please request a new one.</p>
          <p style={{ marginTop: 16 }}><Link to="/forgot-password">Request a new reset link</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="card">
        <h1>Set a new password</h1>
        {success ? (
          <p className="notice notice-success">Your password has been reset. Redirecting to sign in...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="field-label">New password</label>
            <input type="password" className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} required />
            <label className="field-label">Confirm new password</label>
            <input type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} required />
            {error && <p className="notice notice-error">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: "100%" }}>
              {submitting ? "Resetting..." : "Reset password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
