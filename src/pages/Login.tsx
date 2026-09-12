import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="card">
        <h1>Sign in</h1>
        <p style={{ marginBottom: 22 }}>Welcome back</p>
        <form onSubmit={handleSubmit}>
          <label className="field-label">Email</label>
          <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label className="field-label">Password</label>
          <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <p style={{ marginTop: -8, marginBottom: 14, fontSize: 13 }}><Link to="/forgot-password">Forgot your password?</Link></p>
          {error && <p className="notice notice-error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: "100%" }}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p style={{ marginTop: 16, fontSize: 13.5 }}>New here? <Link to="/register">Create an account</Link></p>
        <p style={{ marginTop: 8 }}><Link to="/">&larr; Back to site</Link></p>
      </div>
    </div>
  );
}
