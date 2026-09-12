import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useSettings } from "../context/AuthContext";

interface Service { id: string; name: string; description: string | null; durationMins: number; price: string; isActive: boolean; }

export default function OwnerServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const settings = useSettings();

  async function load() { setServices(await apiRequest<Service[]>("/services")); }
  useEffect(() => { load(); }, []);

  async function deactivate(id: string) {
    if (!confirm("Remove this service from the booking list?")) return;
    await apiRequest(`/services/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="page-header"><h2>Services</h2><button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add service</button></div>
      <table className="data-table">
        <thead><tr><th>Name</th><th>Duration</th><th>Price</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.durationMins} min</td>
              <td>{settings?.currency} {Number(s.price).toFixed(2)}</td>
              <td><span className={`badge ${s.isActive ? "badge-success" : "badge-neutral"}`}>{s.isActive ? "Active" : "Inactive"}</span></td>
              <td>{s.isActive && <button className="btn btn-danger btn-sm" onClick={() => deactivate(s.id)}>Remove</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && <ServiceModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function ServiceModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: "", description: "", durationMins: 30, price: 0 });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      await apiRequest("/services", { method: "POST", body: form });
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
        <h3>Add service</h3>
        <label className="field-label">Name</label>
        <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <label className="field-label">Description</label>
        <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <label className="field-label">Duration (minutes)</label>
        <input type="number" className="input" value={form.durationMins} onChange={(e) => setForm({ ...form, durationMins: Number(e.target.value) })} />
        <label className="field-label">Price</label>
        <input type="number" step="0.01" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        {error && <p className="notice notice-error">{error}</p>}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className="btn btn-primary" onClick={submit} disabled={saving || !form.name}>{saving ? "Saving..." : "Save"}</button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
