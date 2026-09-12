import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useToast } from "../context/ToastContext";

interface Closure { id: string; date: string; reason: string | null; }

export default function OwnerClosures() {
  const [closures, setClosures] = useState<Closure[]>([]);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  async function load() { setClosures(await apiRequest<Closure[]>("/closures")); }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!date) return;
    setSaving(true);
    try {
      await apiRequest("/closures", { method: "POST", body: { date, reason } });
      setDate(""); setReason("");
      showToast("Closed date added", "success");
      load();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this closed date? Clients will be able to book it again.")) return;
    await apiRequest(`/closures/${id}`, { method: "DELETE" });
    showToast("Closed date removed", "success");
    load();
  }

  return (
    <div>
      <div className="page-header"><h2>Closed dates</h2></div>
      <p className="helper-text" style={{ marginBottom: 18 }}>
        Dates you mark here block booking for <strong>every</strong> staff member — use this for public holidays or days the whole business is shut. For a single staff member's day off, use the "Time off" option on the Staff page instead.
      </p>

      <div className="card" style={{ marginBottom: 24, display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label className="field-label">Date</label>
          <input type="date" className="input" style={{ marginBottom: 0 }} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div style={{ flex: 2, minWidth: 200 }}>
          <label className="field-label">Reason (optional)</label>
          <input className="input" style={{ marginBottom: 0 }} placeholder="e.g. Public holiday" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={add} disabled={saving || !date}>Add closed date</button>
      </div>

      {closures.length === 0 ? (
        <div className="empty-state">No upcoming closed dates.</div>
      ) : (
        <table className="data-table">
          <thead><tr><th>Date</th><th>Reason</th><th></th></tr></thead>
          <tbody>
            {closures.map((c) => (
              <tr key={c.id}>
                <td>{new Date(c.date).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</td>
                <td>{c.reason || "—"}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => remove(c.id)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
