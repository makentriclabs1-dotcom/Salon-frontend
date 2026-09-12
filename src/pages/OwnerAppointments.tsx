import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";

interface Client { id: string; firstName: string; lastName: string; clientNo: string; }
interface StaffMember { id: string; firstName: string; lastName: string; }
interface Service { id: string; name: string; durationMins: number; }
interface Appointment {
  id: string; appointmentNo: string; date: string; startTime: string; status: string;
  client: Client; staff: StaffMember; service: Service;
}

const STATUS_BADGE: Record<string, string> = {
  CONFIRMED: "badge-info", CHECKED_IN: "badge-warn", COMPLETED: "badge-success",
  CANCELLED: "badge-danger", NO_SHOW: "badge-danger", RESCHEDULED: "badge-warn",
};

export default function OwnerAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const [appts, cls, stf, svcs] = await Promise.all([
      apiRequest<Appointment[]>("/appointments"),
      apiRequest<Client[]>("/clients"),
      apiRequest<StaffMember[]>("/staff?activeOnly=true"),
      apiRequest<Service[]>("/services?activeOnly=true"),
    ]);
    setAppointments(appts); setClients(cls); setStaff(stf); setServices(svcs);
  }
  useEffect(() => { load(); }, []);

  async function cancel(id: string) {
    if (!confirm("Cancel this appointment?")) return;
    await apiRequest(`/appointments/${id}/status`, { method: "PATCH", body: { status: "CANCELLED" } });
    load();
  }

  async function exportCsv() {
    const token = localStorage.getItem("bookwise_token");
    const res = await fetch("/api/reports/appointments.csv", { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `appointments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="page-header">
        <h2>Appointments</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={exportCsv}>Export CSV</button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Book appointment</button>
        </div>
      </div>
      {appointments.length === 0 ? (
        <div className="empty-state">No appointments yet.</div>
      ) : (
        <table className="data-table">
          <thead><tr><th>#</th><th>Client</th><th>Staff</th><th>Service</th><th>Date</th><th>Time</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td>{a.appointmentNo}</td>
                <td>{a.client.firstName} {a.client.lastName}</td>
                <td>{a.staff.firstName} {a.staff.lastName}</td>
                <td>{a.service.name}</td>
                <td>{new Date(a.date).toLocaleDateString()}</td>
                <td>{a.startTime}</td>
                <td><span className={`badge ${STATUS_BADGE[a.status]}`}>{a.status.replace(/_/g, " ")}</span></td>
                <td>{a.status === "CONFIRMED" && <button className="btn btn-danger btn-sm" onClick={() => cancel(a.id)}>Cancel</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <BookModal clients={clients} staff={staff} services={services} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />
      )}
    </div>
  );
}

function BookModal({ clients, staff, services, onClose, onSaved }: {
  clients: Client[]; staff: StaffMember[]; services: Service[]; onClose: () => void; onSaved: () => void;
}) {
  const [clientId, setClientId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (staffId && serviceId && date) {
      apiRequest<{ slots: string[] }>(`/appointments/slots?staffId=${staffId}&serviceId=${serviceId}&date=${date}`)
        .then((r) => setSlots(r.slots)).catch(() => setSlots([]));
    } else { setSlots([]); }
    setStartTime("");
  }, [staffId, serviceId, date]);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      await apiRequest("/appointments", { method: "POST", body: { clientId, staffId, serviceId, date, startTime } });
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
        <h3>Book appointment</h3>
        <label className="field-label">Client</label>
        <select className="input" value={clientId} onChange={(e) => setClientId(e.target.value)}>
          <option value="">Select client</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.clientNo})</option>)}
        </select>
        <label className="field-label">Service</label>
        <select className="input" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
          <option value="">Select service</option>
          {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <label className="field-label">Staff</label>
        <select className="input" value={staffId} onChange={(e) => setStaffId(e.target.value)}>
          <option value="">Select staff</option>
          {staff.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
        </select>
        <label className="field-label">Date</label>
        <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        {staffId && serviceId && date && (
          <div style={{ marginBottom: 14 }}>
            <p className="helper-text">Available times</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {slots.length === 0 && <span className="helper-text">No slots available</span>}
              {slots.map((s) => <button key={s} className={`slot-btn ${startTime === s ? "selected" : ""}`} onClick={() => setStartTime(s)}>{s}</button>)}
            </div>
          </div>
        )}
        {error && <p className="notice notice-error">{error}</p>}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className="btn btn-primary" onClick={submit} disabled={saving || !clientId || !startTime}>{saving ? "Booking..." : "Book"}</button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
