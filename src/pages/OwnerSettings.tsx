import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";

export default function OwnerSettings() {
  const [form, setForm] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { apiRequest("/settings").then(setForm); }, []);

  async function save() {
    setSaving(true);
    setSaved(false);
    await apiRequest("/settings", { method: "PUT", body: form });
    setSaving(false);
    setSaved(true);
    setTimeout(() => window.location.reload(), 800); // reload so the new brand color applies everywhere
  }

  if (!form) return <p>Loading...</p>;

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h2>Business settings</h2>
      <p style={{ marginBottom: 18 }}>Only you (the owner) can see this page. This controls your business's name, branding color, and contact details shown to clients on the public site and in every portal.</p>

      <label className="field-label">Business name</label>
      <input className="input" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
      <label className="field-label">Tagline</label>
      <input className="input" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
      <label className="field-label">Hero background photo (URL)</label>
      <input className="input" value={form.heroImageUrl} onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })} />
      {form.heroImageUrl && (
        <div style={{ position: "relative", height: 120, borderRadius: 8, overflow: "hidden", marginBottom: 14 }}>
          <img src={form.heroImageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(22,30,46,0.55)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12 }}>
            Homepage preview
          </div>
        </div>
      )}
      <p className="helper-text" style={{ marginTop: -8 }}>
        Paste a link to a real photo of your salon/space. Free options: your own photo uploaded to{" "}
        <a href="https://imgur.com/upload" target="_blank" rel="noreferrer">imgur.com</a>, or a stock photo from{" "}
        <a href="https://unsplash.com" target="_blank" rel="noreferrer">unsplash.com</a> (right-click a photo → copy image address).
      </p>
      <label className="field-label">Brand color</label>
      <input type="color" className="input" style={{ height: 42, padding: 4 }} value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} />
      <label className="field-label">Address</label>
      <input className="input" value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      <label className="field-label">Phone</label>
      <input className="input" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <label className="field-label">Email</label>
      <input type="email" className="input" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <label className="field-label">Currency code</label>
      <input className="input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />

      {saved && <p className="notice notice-success">Saved!</p>}
      <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save settings"}</button>
    </div>
  );
}
