import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";

interface Appt {
  id: string; appointmentNo: string; startTime: string; status: string;
  client: { firstName: string; lastName: string; phone: string }; service: { name: string };
}
interface Dashboard {
  todaysAppointments: Appt[];
  stats: { todaysCount: number; completedToday: number; cancelledToday: number };
}

const NEXT: Record<string, string> = { CONFIRMED: "CHECKED_IN", CHECKED_IN: "COMPLETED" };
const STATUS_BADGE: Record<string, string> = {
  CONFIRMED: "badge-info", CHECKED_IN: "badge-warn", COMPLETED: "badge-success",
  CANCELLED: "badge-danger", NO_SHOW: "badge-danger", RESCHEDULED: "badge-warn",
};

export default function StaffDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);

  async function load() { setData(await apiRequest<Dashboard>("/dashboard")); }
  useEffect(() => { load(); }, []);

  async function advance(id: string, status: string) {
    await apiRequest(`/appointments/${id}/status`, { method: "PATCH", body: { status } });
    load();
  }

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <div className="page-header"><h2>Today's schedule</h2></div>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-value">{data.stats.todaysCount}</div><div className="stat-label">Today's appointments</div></div>
        <div className="stat-card"><div className="stat-value">{data.stats.completedToday}</div><div className="stat-label">Completed</div></div>
        <div className="stat-card"><div className="stat-value">{data.stats.cancelledToday}</div><div className="stat-label">Cancelled</div></div>
      </div>

      {data.todaysAppointments.length === 0 ? (
        <div className="empty-state">No appointments today.</div>
      ) : (
        <table className="data-table">
          <thead><tr><th>Time</th><th>Client</th><th>Service</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {data.todaysAppointments.map((a) => (
              <tr key={a.id}>
                <td>{a.startTime}</td>
                <td>{a.client.firstName} {a.client.lastName} <span className="helper-text">({a.client.phone})</span></td>
                <td>{a.service.name}</td>
                <td><span className={`badge ${STATUS_BADGE[a.status]}`}>{a.status.replace(/_/g, " ")}</span></td>
                <td style={{ display: "flex", gap: 6 }}>
                  {NEXT[a.status] && (
                    <button className="btn btn-secondary btn-sm" onClick={() => advance(a.id, NEXT[a.status])}>
                      Mark {NEXT[a.status].replace(/_/g, " ").toLowerCase()}
                    </button>
                  )}
                  {a.status === "CONFIRMED" && <button className="btn btn-danger btn-sm" onClick={() => advance(a.id, "NO_SHOW")}>No-show</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
