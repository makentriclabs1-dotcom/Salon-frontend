import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";

interface Service { id: string; name: string; durationMins: number; price: string; }
interface StaffMember { id: string; firstName: string; lastName: string; title: string | null; }

export default function ClientBook() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [noSlotsReason, setNoSlotsReason] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiRequest<Service[]>("/services?activeOnly=true").then(setServices);
    apiRequest<StaffMember[]>("/staff?activeOnly=true").then(setStaff);
  }, []);

  useEffect(() => {
    if (staffId && serviceId && date) {
      apiRequest<{ slots: string[]; reason?: string }>(`/appointments/slots?staffId=${staffId}&serviceId=${serviceId}&date=${date}`)
        .then((r) => { setSlots(r.slots); setNoSlotsReason(r.reason || null); })
        .catch(() => { setSlots([]); setNoSlotsReason(null); });
    } else {
      setSlots([]);
      setNoSlotsReason(null);
    }
    setStartTime("");
  }, [staffId, serviceId, date]);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const appt = await apiRequest<{ appointmentNo: string }>("/appointments", {
        method: "POST", body: { staffId, serviceId, date, startTime },
      });
      setSuccess(`Booked! Reference ${appt.appointmentNo}.`);
      setTimeout(() => navigate("/my-appointments"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h2>Book an appointment</h2>
      <p style={{ marginBottom: 18 }}>Pick a service, then who you'd like, then a time.</p>

      <label className="field-label">Service</label>
      <select className="input" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
        <option value="">Select a service</option>
        {services.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.durationMins} min)</option>)}
      </select>

      <label className="field-label">Staff member</label>
      <select className="input" value={staffId} onChange={(e) => setStaffId(e.target.value)}>
        <option value="">Select staff</option>
        {staff.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}{s.title ? ` — ${s.title}` : ""}</option>)}
      </select>

      <label className="field-label">Date</label>
      <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />

      {staffId && serviceId && date && (
        <div style={{ marginBottom: 14 }}>
          <p className="helper-text">Available times</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {slots.length === 0 && <span className="helper-text">{noSlotsReason || "No slots available — try another date."}</span>}
            {slots.map((s) => (
              <button key={s} className={`slot-btn ${startTime === s ? "selected" : ""}`} onClick={() => setStartTime(s)}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="notice notice-error">{error}</p>}
      {success && <p className="notice notice-success">{success}</p>}

      <button className="btn btn-primary" onClick={submit} disabled={submitting || !startTime}>
        {submitting ? "Booking..." : "Confirm booking"}
      </button>
    </div>
  );
}
