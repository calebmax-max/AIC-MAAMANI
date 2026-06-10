import { useState } from "react";
import { fetchJson } from "./api";

// ── Palette ────────────────────────────────────────────────
// #F2F1EF  light gray bg
// #2C2C2A  dark charcoal primary
// #EF9F27  warm copper accent
// #5F5E5A  mid gray secondary

// ── Validation helpers ─────────────────────────────────────
function validate(fields) {
  const errors = {};
  if (!fields.name?.trim()) errors.name = "Name is required";
  if (!fields.email?.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errors.email = "Enter a valid email";
  if (!fields.subject) errors.subject = "Please select a subject";
  if (!fields.message?.trim()) errors.message = "Message is required";
  else if (fields.message.trim().length < 20) errors.message = "Please write at least 20 characters";
  return errors;
}

// ── Sub-components ─────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: error ? "#C0392B" : "#5F5E5A" }}>
        {label}
      </label>
      {children}
      {error && <span style={{ fontSize: 12, color: "#C0392B", marginTop: -2 }}>{error}</span>}
    </div>
  );
}

const inputBase = (hasError) => ({
  padding: "12px 16px",
  borderRadius: 8,
  border: `1.5px solid ${hasError ? "#C0392B" : "#D8D7D4"}`,
  background: "#fff",
  fontSize: 14,
  color: "#2C2C2A",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
  width: "100%",
});

// ── Contact Form ───────────────────────────────────────────
function ContactForm() {
  const [fields, setFields] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error

  const set = (k) => (e) => setFields(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(fields);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStatus("sending");
    try {
      await fetchJson("/api/contact", {
        method: "POST",
        body: JSON.stringify(fields),
      });
      setStatus("success");
    } catch (error) {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>✉️</div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#2C2C2A", marginBottom: 10 }}>Message Received!</h3>
        <p style={{ color: "#5F5E5A", fontSize: 15, lineHeight: 1.7, maxWidth: 360, margin: "0 auto 24px" }}>
          Thank you for reaching out. Someone from our team will get back to you within 1–2 business days.
        </p>
        <button onClick={() => { setStatus("idle"); setFields({ name:"",email:"",phone:"",subject:"",message:"" }); }}
          style={{ padding: "10px 28px", background: "#EF9F27", color: "#2C2C2A", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
          Send Another
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="form-row">
        <Field label="Full Name *" error={errors.name}>
          <input value={fields.name} onChange={set("name")} placeholder="Your name"
            style={inputBase(errors.name)}
            onFocus={e => e.target.style.borderColor = "#EF9F27"}
            onBlur={e => e.target.style.borderColor = errors.name ? "#C0392B" : "#D8D7D4"} />
        </Field>
        <Field label="Email Address *" error={errors.email}>
          <input type="email" value={fields.email} onChange={set("email")} placeholder="you@example.com"
            style={inputBase(errors.email)}
            onFocus={e => e.target.style.borderColor = "#EF9F27"}
            onBlur={e => e.target.style.borderColor = errors.email ? "#C0392B" : "#D8D7D4"} />
        </Field>
      </div>
      <div className="form-row">
        <Field label="Phone (optional)" error={null}>
          <input value={fields.phone} onChange={set("phone")} placeholder="+254 700 000 000"
            style={inputBase(false)}
            onFocus={e => e.target.style.borderColor = "#EF9F27"}
            onBlur={e => e.target.style.borderColor = "#D8D7D4"} />
        </Field>
        <Field label="Subject *" error={errors.subject}>
          <select value={fields.subject} onChange={set("subject")}
            style={{ ...inputBase(errors.subject), appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%235F5E5A' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 36, color: fields.subject ? "#2C2C2A" : "#9E9D99" }}
            onFocus={e => e.target.style.borderColor = "#EF9F27"}
            onBlur={e => e.target.style.borderColor = errors.subject ? "#C0392B" : "#D8D7D4"}>
            <option value="" disabled>Select a subject…</option>
            <option value="general">General Enquiry</option>
            <option value="prayer-request">Prayer Request</option>
            <option value="pastoral-care">Pastoral Care</option>
            <option value="volunteering">Volunteering</option>
            <option value="events">Events & Programmes</option>
            <option value="media">Media</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>
      <Field label="Message *" error={errors.message}>
        <textarea value={fields.message} onChange={set("message")} rows={5}
          placeholder="Write your message here…"
          style={{ ...inputBase(errors.message), resize: "vertical", minHeight: 120 }}
          onFocus={e => e.target.style.borderColor = "#EF9F27"}
          onBlur={e => e.target.style.borderColor = errors.message ? "#C0392B" : "#D8D7D4"} />
      </Field>
      <button type="submit" className="submit-btn" disabled={status === "sending"} style={{
        padding: "14px 32px", background: status === "sending" ? "#D8D7D4" : "#EF9F27",
        color: "#2C2C2A", border: "none", borderRadius: 8, fontWeight: 800,
        fontSize: 15, cursor: status === "sending" ? "not-allowed" : "pointer",
        fontFamily: "inherit", letterSpacing: "0.02em", transition: "background 0.2s",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        {status === "sending" ? (
          <><span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid #2C2C2A", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Sending…</>
        ) : "Send Message →"}
      </button>
    </form>
  );
}

// ── Prayer Request Form ────────────────────────────────────
function PrayerForm() {
  const [name, setName] = useState("");
  const [request, setRequest] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!request.trim()) { setError("Please share your prayer request."); return; }
    setError("");
    await new Promise(r => setTimeout(r, 900));
    setSent(true);
  };

  if (sent) return (
    <div style={{ textAlign: "center", padding: "32px 16px" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🙏</div>
      <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#2C2C2A", marginBottom: 8 }}>We're praying with you</h4>
      <p style={{ color: "#5F5E5A", fontSize: 14, lineHeight: 1.7 }}>
        Your request has been received{isPrivate ? " and will be kept confidential" : ""}. Our prayer team will bring this before God.
      </p>
      <button onClick={() => { setSent(false); setName(""); setRequest(""); setIsPrivate(false); }}
        style={{ marginTop: 20, padding: "9px 24px", background: "transparent", color: "#EF9F27", border: "1.5px solid #EF9F27", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
        Submit Another
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5F5E5A", display: "block", marginBottom: 5 }}>
          Your Name (optional)
        </label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Anonymous"
          style={inputBase(false)}
          onFocus={e => e.target.style.borderColor = "#EF9F27"}
          onBlur={e => e.target.style.borderColor = "#D8D7D4"} />
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: error ? "#C0392B" : "#5F5E5A", display: "block", marginBottom: 5 }}>
          Prayer Request *
        </label>
        <textarea value={request} onChange={e => setRequest(e.target.value)} rows={5}
          placeholder="Share what's on your heart…"
          style={{ ...inputBase(!!error), resize: "vertical" }}
          onFocus={e => e.target.style.borderColor = "#EF9F27"}
          onBlur={e => e.target.style.borderColor = error ? "#C0392B" : "#D8D7D4"} />
        {error && <span style={{ fontSize: 12, color: "#C0392B", marginTop: 4, display: "block" }}>{error}</span>}
      </div>
      {/* Keep private toggle */}
      <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", padding: "12px 16px", background: isPrivate ? "#FFF8EC" : "#F8F7F5", borderRadius: 8, border: `1.5px solid ${isPrivate ? "#EF9F27" : "#E2E1DF"}`, transition: "all 0.2s" }}>
        <div onClick={() => setIsPrivate(p => !p)} style={{
          marginTop: 2, width: 20, height: 20, borderRadius: 5, flexShrink: 0,
          background: isPrivate ? "#EF9F27" : "#fff",
          border: `2px solid ${isPrivate ? "#EF9F27" : "#D8D7D4"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s",
        }}>
          {isPrivate && <span style={{ color: "#2C2C2A", fontSize: 12, lineHeight: 1, fontWeight: 900 }}>✓</span>}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A" }}>Keep this request private</div>
          <div style={{ fontSize: 12, color: "#5F5E5A", marginTop: 2, lineHeight: 1.5 }}>
            Only our pastoral team will see this. It won't be shared publicly or in group prayer.
          </div>
        </div>
      </label>
      <button type="submit" style={{
        padding: "12px 24px", background: "#2C2C2A", color: "#F2F1EF",
        border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14,
        cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.02em",
      }}>
        🙏 Submit Prayer Request
      </button>
    </form>
  );
}

// ── Social link data ───────────────────────────────────────
const SOCIALS = [
  {
    name: "Facebook",
    color: "#1877F2",
    href: "https://facebook.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>
    ),
  },
  {
    name: "YouTube",
    color: "#FF0000",
    href: "https://youtube.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    name: "Instagram",
    color: "#E4405F",
    href: "https://instagram.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    color: "#25D366",
    href: "https://wa.me/254700000000",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
      </svg>
    ),
  },
];

// ── Info card ──────────────────────────────────────────────
function InfoRow({ icon, label, value, sub }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#FFF3DC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#EF9F27", marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A", lineHeight: 1.5 }}>{value}</div>
        {sub && <div style={{ fontSize: 13, color: "#5F5E5A", marginTop: 2, lineHeight: 1.5 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function ContactPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F2F1EF", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#2C2C2A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease both; }
        textarea, input, select { font-family: inherit; }
        input::placeholder, textarea::placeholder { color: #B0AFAB; }

        /* ── Responsive grid ── */
        .split-layout {
          display: grid;
          grid-template-columns: 1fr min(380px, 100%);
          gap: 32px;
          align-items: start;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .contact-form .submit-btn {
          width: auto;
        }

        @media (max-width: 860px) {
          .split-layout {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr !important;
          }
          .contact-form .submit-btn {
            width: 100%;
          }

          /* Break out of the padded container — cards go edge-to-edge */
          .main-pad {
            padding-left: 0 !important;
            padding-right: 0 !important;
            padding-top: 0 !important;
          }

          /* Each column becomes a flat block */
          .split-layout {
            gap: 0 !important;
          }
          .split-layout > div {
            gap: 0 !important;
          }

          /* Each card becomes a full-width section */
          .card-pad {
            border-radius: 0 !important;
            box-shadow: none !important;
            border-left: none !important;
            border-right: none !important;
            padding: 28px 20px 24px !important;
            border-bottom: 6px solid #F2F1EF !important;
          }

          /* Map card: no radius on the outer wrapper either */
          .map-card {
            border-radius: 0 !important;
            box-shadow: none !important;
            border-bottom: 6px solid #F2F1EF !important;
          }
          .map-card .map-info-pad {
            padding: 24px 20px 18px !important;
          }
        }

        @media (max-width: 400px) {
          .card-pad { padding: 24px 16px 20px !important; }
          .hero-pad { padding: 40px 16px 36px !important; }
          .map-card .map-info-pad { padding: 20px 16px 14px !important; }
        }
      `}</style>

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="hero-pad" style={{ background: "#2C2C2A", padding: "56px 24px 52px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(239,159,39,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(239,159,39,0.04)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 960, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "#EF9F27", textTransform: "uppercase", marginBottom: 12, border: "1px solid rgba(239,159,39,0.35)", padding: "4px 12px", borderRadius: 20 }}>
            Get in Touch
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 800, color: "#F2F1EF", lineHeight: 1.1, marginBottom: 14 }}>
            We'd Love to<br />Hear From You
          </h1>
          <p style={{ color: "#9E9D99", fontSize: 16, maxWidth: 480, lineHeight: 1.7 }}>
            Whether you have a question, need prayer, or simply want to connect — our doors and hearts are open.
          </p>
        </div>
      </div>

      {/* ── Main content grid ─────────────────────────────── */}
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "48px max(16px, 4vw) 80px" }} className="main-pad">
        <div className="split-layout">

          {/* LEFT column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

            {/* Contact Form */}
            <div className="fade-up card-pad" style={{ background: "#fff", borderRadius: 16, padding: "32px 32px 28px", boxShadow: "0 2px 16px rgba(44,44,42,0.07)" }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#EF9F27", marginBottom: 6 }}>Contact Us</div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#2C2C2A" }}>Send a Message</h2>
              </div>
              <ContactForm />
            </div>

            {/* Map */}
            <div className="fade-up map-card" style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(44,44,42,0.07)" }}>
              <div className="map-info-pad" style={{ padding: "24px 28px 20px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#EF9F27", marginBottom: 6 }}>Find Us</div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#2C2C2A", marginBottom: 4 }}>Our Location</h2>
                <p style={{ fontSize: 14, color: "#5F5E5A" }}>AIC Maamani Church · Mombasa Road, Nairobi · Parking available on-site</p>
              </div>
              {/* Embedded Google Map — replace src with your actual embed URL */}
              <div style={{ height: 320, background: "#E8E7E5", position: "relative" }}>
                <iframe
                  title="Church Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.808!2d36.821!3d-1.292!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMTcnMzEuMiJTIDM2wrA0OScxNS42IkU!5e0!3m2!1sen!2ske!4v1234567890"
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                {/* Overlay card */}
                <div style={{
                  position: "absolute", bottom: 16, left: 16,
                  background: "#2C2C2A", borderRadius: 10, padding: "12px 16px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#F2F1EF", marginBottom: 2 }}>AIC Maamani</div>
                  <div style={{ fontSize: 12, color: "#9E9D99" }}>Mombasa Road, Nairobi, Kenya</div>
                  <a href="https://maps.google.com" target="_blank" rel="noreferrer"
                    style={{ display: "inline-block", marginTop: 8, fontSize: 11, fontWeight: 700, color: "#EF9F27", textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Get Directions →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Church Info */}
            <div className="fade-up card-pad" style={{ background: "#fff", borderRadius: 16, padding: "28px 28px 24px", boxShadow: "0 2px 16px rgba(44,44,42,0.07)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#EF9F27", marginBottom: 6 }}>Details</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#2C2C2A", marginBottom: 20 }}>Hours & Info</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <InfoRow icon="📍" label="Address" value="Mombasa Road, Nairobi" sub="AIC Maamani Church · Free on-site parking" />
                <div style={{ height: 1, background: "#F0EFED" }} />
                <InfoRow icon="🕐" label="Sunday Services" value="8:00 AM — Early Service" sub="10:00 AM — Main Service (English & Swahili)" />
                <div style={{ height: 1, background: "#F0EFED" }} />
                <InfoRow icon="🗓" label="Midweek" value="Wednesday 6:30 PM" sub="Bible Study & Prayer Night" />
                <div style={{ height: 1, background: "#F0EFED" }} />
                <InfoRow icon="🏢" label="Office Hours" value="Mon – Fri: 9:00 AM – 5:00 PM" sub="Closed public holidays" />
                <div style={{ height: 1, background: "#F0EFED" }} />
                <InfoRow icon="📞" label="Phone" value="+254 700 000 000" sub="Pastoral emergencies: +254 711 000 000" />
                <div style={{ height: 1, background: "#F0EFED" }} />
                <InfoRow icon="✉️" label="Email" value="info@aicmaamani.org" sub="Expect a reply within 1–2 business days" />
              </div>
            </div>

            {/* Social Links */}
            <div className="fade-up card-pad" style={{ background: "#2C2C2A", borderRadius: 16, padding: "24px 28px", boxShadow: "0 2px 16px rgba(44,44,42,0.12)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#EF9F27", marginBottom: 6 }}>Follow Along</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#F2F1EF", marginBottom: 18 }}>Find Us Online</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {SOCIALS.map(({ name, color, href, icon }) => (
                  <a key={name} href={href} target="_blank" rel="noreferrer" style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "11px 16px", borderRadius: 10,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    textDecoration: "none", transition: "all 0.18s",
                    color: "#F2F1EF",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff" }}>
                      {icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
                      <div style={{ fontSize: 11, color: "#9E9D99" }}>@aicmaamani</div>
                    </div>
                    <span style={{ marginLeft: "auto", color: "#5F5E5A", fontSize: 16 }}>→</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Prayer Request Form */}
            <div className="fade-up card-pad" style={{ background: "#fff", borderRadius: 16, padding: "28px 28px 24px", boxShadow: "0 2px 16px rgba(44,44,42,0.07)", border: "1.5px solid #F0EFED" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#EF9F27", marginBottom: 6 }}>Prayer</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#2C2C2A", marginBottom: 4 }}>Submit a Prayer Request</h2>
              <p style={{ fontSize: 13, color: "#5F5E5A", lineHeight: 1.6, marginBottom: 20 }}>
                Our prayer team intercedes every week. Share what's on your heart — you're not alone.
              </p>
              <PrayerForm />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}