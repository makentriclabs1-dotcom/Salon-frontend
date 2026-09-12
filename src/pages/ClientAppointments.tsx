import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";

interface Appointment {
  id: string; appointmentNo: string; date: string; startTime: string; status: string;
  staff: { firstName: string; lastName: string }; service: { name: string; price: string };
}

const STATUS_BADGE: Record<string, string> = {
  CONFIRMED: "badge-info", CHECKED_IN: "badge-warn", COMPLETED: "badge-success",
  CANCELLED: "badge-danger", NO_SHOW: "badge-danger", RESCHEDULED: "badge-warn",
};

export default function ClientAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() { setAppointments(await apiRequest<Appointment[]>("/appointments")); }
  useEffect(() => { load(); }, []);

  async function cancel(id: string) {
    if (!confirm("Cancel this appointment?")) return;
    setError(null);
    try {
      await apiRequest(`/appointments/${id}/status`, { method: "PATCH", body: { status: "CANCELLED" } });
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="page-header"><h2>My appointments</h2></div>
      {error && <p className="notice notice-error">{error}</p>}
      {appointments.length === 0 ? (
        <div className="empty-state">You have no appointments yet.</div>
      ) : (
        <table className="data-table">
          <thead><tr><th>#</th><th>Service</th><th>With</th><th>Date</th><th>Time</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td>{a.appointmentNo}</td>
                <td>{a.service.name}</td>
                <td>{a.staff.firstName} {a.staff.lastName}</td>
                <td>{new Date(a.date).toLocaleDateString()}</td>
                <td>{a.startTime}</td>
                <td><span className={`badge ${STATUS_BADGE[a.status] || "badge-neutral"}`}>{a.status.replace(/_/g, " ")}</span></td>
                <td>{a.status === "CONFIRMED" && <button className="btn btn-danger btn-sm" onClick={() => cancel(a.id)}>Cancel</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
