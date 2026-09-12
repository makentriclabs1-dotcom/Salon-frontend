import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useToast } from "../context/ToastContext";

interface StaffSchedule { weekday: number; startTime: string; endTime: string; }
interface TimeOff { id: string; date: string; reason: string | null; }
interface StaffMember { id: string; firstName: string; lastName: string; title: string | null; isActive: boolean; schedules: StaffSchedule[]; timeOff: TimeOff[]; }

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function OwnerStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [scheduleFor, setScheduleFor] = useState<StaffMember | null>(null);
  const [timeOffFor, setTimeOffFor] = useState<StaffMember | null>(null);
  const { showToast } = useToast();

  async function load() { setStaff(await apiRequest<StaffMember[]>("/staff")); }
  useEffect(() => { load(); }, []);

  async function deactivate(id: string) {
    if (!confirm("Deactivate this staff member?")) return;
    await apiRequest(`/staff/${id}`, { method: "DELETE" });
    showToast("Staff member deactivated", "success");
    load();
  }

  return (
    <div>
      <div className="page-header"><h2>Staff</h2><button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add staff member</button></div>
      <table className="data-table">
        <thead><tr><th>Name</th><th>Title</th><th>Working days</th><th>Upcoming time off</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {staff.map((s) => (
            <tr key={s.id}>
              <td>{s.firstName} {s.lastName}</td>
              <td>{s.title || "—"}</td>
              <td>{s.schedules.map((sc) => WEEKDAYS[sc.weekday]).join(", ") || "Not set"}</td>
              <td>{s.timeOff.length > 0 ? `${s.timeOff.length} day(s)` : "—"}</td>
              <td><span className={`badge ${s.isActive ? "badge-success" : "badge-neutral"}`}>{s.isActive ? "Active" : "Inactive"}</span></td>
              <td style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setScheduleFor(s)}>Schedule</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setTimeOffFor(s)}>Time off</button>
                {s.isActive && <button className="btn btn-danger btn-sm" onClick={() => deactivate(s.id)}>Deactivate</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && <StaffModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); showToast("Staff member added", "success"); }} />}
      {scheduleFor && <ScheduleModal staff={scheduleFor} onClose={() => setScheduleFor(null)} onSaved={() => { setScheduleFor(null); load(); showToast("Schedule updated", "success"); }} />}
      {timeOffFor && <TimeOffModal staff={timeOffFor} onClose={() => setTimeOffFor(null)} onChanged={load} />}
    </div>
  );
}

function StaffModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "", title: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      await apiRequest("/staff", { method: "POST", body: form });
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
        <h3>Add staff member</h3>
        <label className="field-label">First name</label>
        <input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        <label className="field-label">Last name</label>
        <input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        <label className="field-label">Title</label>
        <input className="input" placeholder="e.g. Senior Stylist" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <label className="field-label">Email (their login)</label>
        <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label className="field-label">Temporary password</label>
        <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={8} />
        {error && <p className="notice notice-error">{error}</p>}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function TimeOffModal({ staff, onClose, onChanged }: { staff: StaffMember; onClose: () => void; onChanged: () => void }) {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  async function add() {
    if (!date) return;
    setSaving(true);
    setError(null);
    try {
      await apiRequest(`/staff/${staff.id}/time-off`, { method: "POST", body: { date, reason } });
      setDate(""); setReason("");
      showToast("Time off added", "success");
      onChanged();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(timeOffId: string) {
    await apiRequest(`/staff/time-off/${timeOffId}`, { method: "DELETE" });
    showToast("Time off removed", "success");
    onChanged();
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{staff.firstName}'s time off</h3>
        <p className="helper-text">Blocks booking for this staff member on the specific dates below, on top of their normal weekly schedule.</p>

        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input type="date" className="input" style={{ marginBottom: 0 }} value={date} onChange={(e) => setDate(e.target.value)} />
          <input className="input" style={{ marginBottom: 0 }} placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        {error && <p className="notice notice-error">{error}</p>}
        <button className="btn btn-secondary btn-sm" onClick={add} disabled={saving || !date} style={{ marginBottom: 16 }}>Add date</button>

        {staff.timeOff.length === 0 ? (
          <p className="helper-text">No upcoming time off recorded.</p>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {staff.timeOff.map((t) => (
              <li key={t.id} style={{ marginBottom: 6 }}>
                {new Date(t.date).toLocaleDateString()} {t.reason && `— ${t.reason}`}{" "}
                <button className="btn btn-danger btn-sm" onClick={() => remove(t.id)} style={{ marginLeft: 8 }}>Remove</button>
              </li>
            ))}
          </ul>
        )}

        <div style={{ marginTop: 12 }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
function ScheduleModal({ staff, onClose, onSaved }: { staff: StaffMember; onClose: () => void; onSaved: () => void }) {
  const initial = WEEKDAYS.map((_, weekday) => {
    const existing = staff.schedules.find((s) => s.weekday === weekday);
    return { weekday, enabled: !!existing, startTime: existing?.startTime || "09:00", endTime: existing?.endTime || "17:00" };
  });
  const [rows, setRows] = useState(initial);
  const [saving, setSaving] = useState(false);

  function update(i: number, key: string, value: any) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));
  }

  async function submit() {
    setSaving(true);
    const schedules = rows.filter((r) => r.enabled).map((r) => ({ weekday: r.weekday, startTime: r.startTime, endTime: r.endTime }));
    await apiRequest(`/staff/${staff.id}/schedule`, { method: "PUT", body: { schedules } });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 420 }}>
        <h3>{staff.firstName}'s weekly schedule</h3>
        {rows.map((r, i) => (
          <div key={r.weekday} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <label style={{ width: 60, fontSize: 13 }}>
              <input type="checkbox" checked={r.enabled} onChange={(e) => update(i, "enabled", e.target.checked)} /> {WEEKDAYS[r.weekday]}
            </label>
            <input type="time" className="input" style={{ marginBottom: 0 }} value={r.startTime} disabled={!r.enabled} onChange={(e) => update(i, "startTime", e.target.value)} />
            <span>to</span>
            <input type="time" className="input" style={{ marginBottom: 0 }} value={r.endTime} disabled={!r.enabled} onChange={(e) => update(i, "endTime", e.target.value)} />
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>{saving ? "Saving..." : "Save schedule"}</button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
