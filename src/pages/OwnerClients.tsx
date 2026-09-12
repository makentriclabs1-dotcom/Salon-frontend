import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";

interface Client { id: string; clientNo: string; firstName: string; lastName: string; phone: string; email: string | null; }

export default function OwnerClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function load() { setClients(await apiRequest<Client[]>(`/clients?search=${encodeURIComponent(search)}`)); }
  useEffect(() => { load(); }, [search]);

  return (
    <div>
      <div className="page-header"><h2>Clients</h2><button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add client</button></div>
      <input className="input" placeholder="Search by name, ID, or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
      {clients.length === 0 ? (
        <div className="empty-state">No clients found.</div>
      ) : (
        <table className="data-table">
          <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Email</th></tr></thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id}><td>{c.clientNo}</td><td>{c.firstName} {c.lastName}</td><td>{c.phone}</td><td>{c.email || "—"}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && <ClientModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function ClientModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      await apiRequest("/clients", { method: "POST", body: form });
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Add client</h3>
        <label className="field-label">First name</label>
        <input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        <label className="field-label">Last name</label>
        <input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        <label className="field-label">Phone</label>
        <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <label className="field-label">Email (optional)</label>
        <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {error && <p className="notice notice-error">{error}</p>}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
