import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useSettings } from "../context/AuthContext";

interface Service { id: string; name: string; description: string | null; durationMins: number; price: string; }
interface StaffMember { id: string; firstName: string; lastName: string; title: string | null; }

export default function Landing() {
  const settings = useSettings();
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  useEffect(() => {
    apiRequest<Service[]>("/services?activeOnly=true").then(setServices);
    apiRequest<StaffMember[]>("/staff?activeOnly=true").then(setStaff);
  }, []);

  if (!settings) return null;

  return (
    <div>
      <nav className="landing-nav">
        <strong style={{ fontFamily: "IBM Plex Serif, serif", fontSize: 18 }}>{settings.businessName}</strong>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link to="/login">Sign in</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Book Now</Link>
        </div>
      </nav>

      <div className="landing-hero" style={{ backgroundImage: `url(${settings.heroImageUrl})` }}>
        <div className="landing-hero-content">
          <h1>{settings.businessName}</h1>
          <p>{settings.tagline}</p>
          <Link to="/register" className="btn" style={{ background: "white", color: "var(--brand-primary)", padding: "12px 28px", fontSize: 15 }}>
            Book an appointment
          </Link>
        </div>
      </div>

      <div className="landing-section">
        <h2>Our services</h2>
        <p style={{ marginBottom: 20 }}>Browse what we offer and book online in a few clicks.</p>
        <div className="service-grid">
          {services.map((s) => (
            <div key={s.id} className="service-card">
              <h3>{s.name}</h3>
              {s.description && <p>{s.description}</p>}
              <p className="helper-text">{s.durationMins} min</p>
              <p style={{ fontWeight: 600, fontSize: 18, color: "var(--ink)" }}>{settings.currency} {Number(s.price).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="landing-section">
        <h2>Meet the team</h2>
        <div className="staff-grid">
          {staff.map((s) => (
            <div key={s.id} className="staff-card">
              <div className="staff-avatar">{s.firstName[0]}{s.lastName[0]}</div>
              <p style={{ fontWeight: 600, color: "var(--ink)", margin: 0 }}>{s.firstName} {s.lastName}</p>
              {s.title && <p className="helper-text">{s.title}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="landing-section" style={{ textAlign: "center", borderTop: "1px solid var(--border)" }}>
        <h2>Ready to book?</h2>
        <p>Create a free account and book your first appointment in under a minute.</p>
        <Link to="/register" className="btn btn-primary">Get started</Link>
        {settings.address && <p className="helper-text" style={{ marginTop: 32 }}>{settings.address} {settings.phone ? `· ${settings.phone}` : ""}</p>}
      </div>
    </div>
  );
}
