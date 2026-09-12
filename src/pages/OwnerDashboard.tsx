import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useSettings } from "../context/AuthContext";

interface Appt {
  id: string; appointmentNo: string; startTime: string; status: string; date: string;
  client: { firstName: string; lastName: string }; staff: { firstName: string; lastName: string }; service: { name: string };
}
interface Dashboard {
  todaysAppointments: Appt[]; upcomingAppointments: Appt[];
  stats: { todaysCount: number; completedToday: number; cancelledToday: number; totalClients: number; revenueToday: number };
}

const STATUS_BADGE: Record<string, string> = {
  CONFIRMED: "badge-info", CHECKED_IN: "badge-warn", COMPLETED: "badge-success",
  CANCELLED: "badge-danger", NO_SHOW: "badge-danger", RESCHEDULED: "badge-warn",
};

export default function OwnerDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);
  const settings = useSettings();

  useEffect(() => { apiRequest<Dashboard>("/dashboard").then(setData); }, []);
  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <div className="page-header"><h2>Owner overview</h2></div>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-value">{data.stats.todaysCount}</div><div className="stat-label">Today's appointments</div></div>
        <div className="stat-card"><div className="stat-value">{data.stats.completedToday}</div><div className="stat-label">Completed today</div></div>
        <div className="stat-card"><div className="stat-value">{data.stats.totalClients}</div><div className="stat-label">Total clients</div></div>
        <div className="stat-card"><div className="stat-value">{settings?.currency} {data.stats.revenueToday.toFixed(2)}</div><div className="stat-label">Revenue today</div></div>
      </div>

      <h3>Today's appointments</h3>
      {data.todaysAppointments.length === 0 ? (
        <div className="empty-state">No appointments today.</div>
      ) : (
        <table className="data-table" style={{ marginBottom: 28 }}>
          <thead><tr><th>Time</th><th>Client</th><th>Staff</th><th>Service</th><th>Status</th></tr></thead>
          <tbody>
            {data.todaysAppointments.map((a) => (
              <tr key={a.id}>
                <td>{a.startTime}</td>
                <td>{a.client.firstName} {a.client.lastName}</td>
                <td>{a.staff.firstName} {a.staff.lastName}</td>
                <td>{a.service.name}</td>
                <td><span className={`badge ${STATUS_BADGE[a.status]}`}>{a.status.replace(/_/g, " ")}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Upcoming</h3>
      {data.upcomingAppointments.length === 0 ? (
        <div className="empty-state">Nothing upcoming.</div>
      ) : (
        <table className="data-table">
          <thead><tr><th>Date</th><th>Time</th><th>Client</th><th>Staff</th></tr></thead>
          <tbody>
            {data.upcomingAppointments.map((a) => (
              <tr key={a.id}>
                <td>{new Date(a.date).toLocaleDateString()}</td>
                <td>{a.startTime}</td>
                <td>{a.client.firstName} {a.client.lastName}</td>
                <td>{a.staff.firstName} {a.staff.lastName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
