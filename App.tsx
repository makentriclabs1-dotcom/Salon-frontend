import { Routes, Route, Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ClientBook from "./pages/ClientBook";
import ClientAppointments from "./pages/ClientAppointments";
import StaffDashboard from "./pages/StaffDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerServices from "./pages/OwnerServices";
import OwnerStaff from "./pages/OwnerStaff";
import OwnerClients from "./pages/OwnerClients";
import OwnerAppointments from "./pages/OwnerAppointments";
import OwnerSettings from "./pages/OwnerSettings";
import OwnerClosures from "./pages/OwnerClosures";

type Group = "owner" | "staff" | "client";

function groupForRole(role: string): Group {
  if (role === "OWNER") return "owner";
  if (role === "STAFF") return "staff";
  return "client";
}

function homeFor(group: Group): string {
  if (group === "owner") return "/owner/dashboard";
  if (group === "staff") return "/staff/dashboard";
  return "/book";
}

const ROLE_LABEL: Record<Group, string> = { owner: "Business Owner", staff: "Staff Member", client: "Client" };
const PORTAL_LABEL: Record<Group, string> = { owner: "Admin Console", staff: "Staff Portal", client: "Booking Account" };

// Minimal inline icon set so the nav has visual distinction without adding an icon library.
function Icon({ name }: { name: string }) {
  const common = { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "dashboard": return <svg {...common}><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>;
    case "calendar": return <svg {...common}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
    case "users": return <svg {...common}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case "staff": return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2" /><path d="M20 8l1.5 1.5L20 11" /></svg>;
    case "tag": return <svg {...common}><path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.24H4a1 1 0 0 0-1 1v5.59a2 2 0 0 0 .59 1.41l9.58 9.58a2 2 0 0 0 2.83 0l4.59-4.59a2 2 0 0 0 0-2.82Z" /><circle cx="7.5" cy="7.5" r="1.5" /></svg>;
    case "settings": return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>;
    case "book": return <svg {...common}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></svg>;
    case "list": return <svg {...common}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>;
    case "clock": return <svg {...common}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
    case "closed": return <svg {...common}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M9 16l6-6M9 10l6 6" /></svg>;
    default: return null;
  }
}

const NAV: Record<Group, { to: string; label: string; icon: string }[]> = {
  owner: [
    { to: "/owner/dashboard", label: "Dashboard", icon: "dashboard" },
    { to: "/owner/appointments", label: "Appointments", icon: "calendar" },
    { to: "/owner/clients", label: "Clients", icon: "users" },
    { to: "/owner/staff", label: "Staff", icon: "staff" },
    { to: "/owner/services", label: "Services", icon: "tag" },
    { to: "/owner/closures", label: "Closed Dates", icon: "closed" },
    { to: "/owner/settings", label: "Settings", icon: "settings" },
  ],
  staff: [{ to: "/staff/dashboard", label: "Today's Schedule", icon: "clock" }],
  client: [
    { to: "/book", label: "Book Appointment", icon: "book" },
    { to: "/my-appointments", label: "My Appointments", icon: "list" },
  ],
};

function Layout({ children, group }: { children: React.ReactNode; group: Group }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="app-shell">
      <nav className={`sidebar ${group}`}>
        <span className="sidebar-role-badge">{ROLE_LABEL[group]}</span>
        <div className="sidebar-brand">Bookwise</div>
        <div className="sidebar-identity">
          {PORTAL_LABEL[group]}
          <br />
          {user!.client ? `${user!.client.firstName} ${user!.client.lastName}` : user!.staff ? `${user!.staff.firstName} ${user!.staff.lastName}` : user!.email}
        </div>
        <div className="sidebar-nav">
          {NAV[group].map((item) => (
            <Link key={item.to} to={item.to} className={location.pathname === item.to ? "active-nav" : ""}>
              <Icon name={item.icon} />{item.label}
            </Link>
          ))}
        </div>
        <button className="sidebar-logout" onClick={() => { logout(); navigate("/login"); }}>Log out</button>
      </nav>
      <main className="main-content">
        <p className="portal-eyebrow">{PORTAL_LABEL[group]}</p>
        {children}
      </main>
    </div>
  );
}

function Protected({ children, allow }: { children: React.ReactNode; allow: Group }) {
  const { user, loading } = useAuth();
  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
  if (!user) return <Navigate to="/login" />;
  const group = groupForRole(user.role);
  if (group !== allow) return <Navigate to={homeFor(group)} />;
  return <Layout group={group}>{children}</Layout>;
}

function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
  if (user) return <Navigate to={homeFor(groupForRole(user.role))} />;
  return <Landing />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/book" element={<Protected allow="client"><ClientBook /></Protected>} />
      <Route path="/my-appointments" element={<Protected allow="client"><ClientAppointments /></Protected>} />

      <Route path="/staff/dashboard" element={<Protected allow="staff"><StaffDashboard /></Protected>} />

      <Route path="/owner/dashboard" element={<Protected allow="owner"><OwnerDashboard /></Protected>} />
      <Route path="/owner/appointments" element={<Protected allow="owner"><OwnerAppointments /></Protected>} />
      <Route path="/owner/clients" element={<Protected allow="owner"><OwnerClients /></Protected>} />
      <Route path="/owner/staff" element={<Protected allow="owner"><OwnerStaff /></Protected>} />
      <Route path="/owner/services" element={<Protected allow="owner"><OwnerServices /></Protected>} />
      <Route path="/owner/settings" element={<Protected allow="owner"><OwnerSettings /></Protected>} />
      <Route path="/owner/closures" element={<Protected allow="owner"><OwnerClosures /></Protected>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
