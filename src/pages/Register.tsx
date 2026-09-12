import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest, setToken } from "../api/client";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "", phone: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiRequest<{ token: string }>("/auth/register-client", { method: "POST", body: form });
      setToken(res.token);
      window.location.href = "/book";
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="card">
        <h1>Create your account</h1>
        <p style={{ marginBottom: 22 }}>Book appointments online, anytime</p>
        <form onSubmit={handleSubmit}>
          <label className="field-label">First name</label>
          <input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          <label className="field-label">Last name</label>
          <input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          <label className="field-label">Email</label>
          <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <label className="field-label">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <label className="field-label">Password</label>
          <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={8} required />
          {error && <p className="notice notice-error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: "100%" }}>
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p style={{ marginTop: 16, fontSize: 13.5 }}>Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
