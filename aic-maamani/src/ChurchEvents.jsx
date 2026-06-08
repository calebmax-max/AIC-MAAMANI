import { useEffect, useMemo, useState } from "react";
import { fetchJson } from "./api";

// ── Palette ────────────────────────────────────────────────────────────────
// #F2F1EF  light gray bg
// #2C2C2A  dark charcoal primary
// #EF9F27  warm copper accent
// #5F5E5A  mid gray secondary

// ── Seed data ──────────────────────────────────────────────────────────────
const fallbackEvents = [
  {
    id: 1,
    title: "Sunday Worship Service",
    category: "worship",
    date: "2026-06-14",
    time: "10:00 AM",
    end: "11:30 AM",
    location: "Main Sanctuary",
    online: false,
    description:
      "Join us for an uplifting morning of praise, prayer, and the Word. All are welcome — bring a friend.",
    spots: null,
  },
  {
    id: 2,
    title: "Youth Night: Unshakeable",
    category: "youth",
    date: "2026-06-16",
    time: "6:30 PM",
    end: "8:30 PM",
    location: "Youth Hall",
    online: false,
    description:
      "An energetic evening for teenagers — games, worship, and a message on building an unshakeable faith.",
    spots: 40,
  },
  {
    id: 3,
    title: "Community Outreach: Food Drive",
    category: "outreach",
    date: "2026-06-17",
    time: "8:00 AM",
    end: "12:00 PM",
    location: "Church Parking Lot",
    online: false,
    description:
      "Help us collect and distribute non-perishable goods to families in need across the city.",
    spots: 20,
  },
  {
    id: 4,
    title: "Men's Small Group",
    category: "small-groups",
    date: "2026-06-18",
    time: "7:00 PM",
    end: "8:30 PM",
    location: "Online (Zoom)",
    online: true,
    description:
      "A bi-weekly deep-dive into the book of James. New members welcome — link sent on registration.",
    spots: 15,
  },
  {
    id: 5,
    title: "Prayer & Fasting Morning",
    category: "worship",
    date: "2026-06-21",
    time: "7:00 AM",
    end: "9:00 AM",
    location: "Chapel Room B",
    online: false,
    description:
      "Dedicated corporate prayer across the ministries of our church. Come prepared to intercede.",
    spots: null,
  },
  {
    id: 6,
    title: "Women's Bible Study",
    category: "small-groups",
    date: "2026-06-19",
    time: "10:00 AM",
    end: "11:30 AM",
    location: "Fellowship Hall",
    online: false,
    description:
      "Continuing our series through Ruth — exploring themes of loyalty, redemption, and grace.",
    spots: 30,
  },
  {
    id: 7,
    title: "Sunday Worship Service",
    category: "worship",
    date: "2026-06-21",
    time: "10:00 AM",
    end: "11:30 AM",
    location: "Main Sanctuary",
    online: false,
    description:
      "Our weekly gathering to worship, hear the Word, and connect as a church family.",
    spots: null,
  },
  {
    id: 8,
    title: "Neighbourhood Cleanup Drive",
    category: "outreach",
    date: "2026-06-22",
    time: "9:00 AM",
    end: "1:00 PM",
    location: "Eastside Park Entrance",
    online: false,
    description:
      "Gloves, bags, and snacks provided. Let's love our neighbours with our hands and feet.",
    spots: 50,
  },
  {
    id: 9,
    title: "Youth Leadership Workshop",
    category: "youth",
    date: "2026-06-25",
    time: "4:00 PM",
    end: "6:00 PM",
    location: "Online (Google Meet)",
    online: true,
    description:
      "Equipping the next generation of servant-leaders. Open to ages 15–25.",
    spots: 25,
  },
  {
    id: 10,
    title: "Newcomers Welcome Lunch",
    category: "outreach",
    date: "2026-06-28",
    time: "12:00 PM",
    end: "2:00 PM",
    location: "Fellowship Hall",
    online: false,
    description:
      "A warm, relaxed meal to help newcomers meet our pastoral team and find their place here.",
    spots: 35,
  },
];

const CATEGORIES = [
  { id: "all", label: "All Events" },
  { id: "worship", label: "Worship" },
  { id: "youth", label: "Youth" },
  { id: "outreach", label: "Outreach" },
  { id: "small-groups", label: "Small Groups" },
];

const CAT_COLORS = {
  worship: "#EF9F27",
  youth: "#5F9EA0",
  outreach: "#8B7355",
  "small-groups": "#7A8B6F",
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// ── Helpers ────────────────────────────────────────────────────────────────
function parseDate(str) { return new Date(str + "T00:00:00"); }
function formatDisplay(str) {
  const d = parseDate(str);
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
function getDayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
function daysInMonth(year, month) { return new Date(year, month+1, 0).getDate(); }
function firstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }

// ── Sub-components ─────────────────────────────────────────────────────────
function CategoryBadge({ cat }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      background: CAT_COLORS[cat] || "#5F5E5A",
      color: "#fff",
    }}>
      {cat.replace("-", " ")}
    </span>
  );
}

function RSVPModal({ event, onClose }) {
  const [step, setStep] = useState("form"); // form | reminder | done
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [remind, setRemind] = useState(false);
  const [remEmail, setRemEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) return;
    setStep("sending");
    fetchJson(`/api/events/${event.id}/register`, {
      method: "POST",
      body: JSON.stringify({ name, email, phone: "" }),
    })
      .then(() => setStep("done"))
      .catch(() => setStep("done"));
  };

  const overlayStyle = {
    position: "fixed", inset: 0,
    background: "rgba(44,44,42,0.72)",
    zIndex: 1000,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 16,
    backdropFilter: "blur(3px)",
  };
  const modalStyle = {
    background: "#F2F1EF",
    borderRadius: 16,
    width: "100%", maxWidth: 480,
    boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
    overflow: "hidden",
    animation: "slideUp 0.25s ease",
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        {/* Header bar */}
        <div style={{ background: "#2C2C2A", padding: "20px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ color: "#EF9F27", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform:"uppercase", marginBottom: 4 }}>RSVP / Register</div>
            <div style={{ color: "#F2F1EF", fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>{event.title}</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#5F5E5A", cursor:"pointer", fontSize:22, lineHeight:1, padding:4 }}>✕</button>
        </div>

        <div style={{ padding: "24px 24px 28px" }}>
          {step === "done" ? (
            <div style={{ textAlign:"center", padding: "16px 0 8px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div style={{ fontFamily:"'Playfair Display', serif", fontSize: 22, color:"#2C2C2A", marginBottom: 8 }}>You're registered!</div>
              <div style={{ color:"#5F5E5A", fontSize: 14, lineHeight: 1.6 }}>
                We'll see you on <strong>{formatDisplay(event.date)}</strong> at <strong>{event.time}</strong>.
                {remind && remEmail && <> A reminder will be sent to <strong>{remEmail}</strong>.</>}
              </div>
              <button onClick={onClose} style={btnPrimary}>Done</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display:"grid", gap: 14 }}>
                <label style={labelStyle}>
                  Full Name
                  <input required value={name} onChange={e=>setName(e.target.value)}
                    placeholder="Your name" style={inputStyle} />
                </label>
                <label style={labelStyle}>
                  Email Address
                  <input required type="email" value={email} onChange={e=>setEmail(e.target.value)}
                    placeholder="you@example.com" style={inputStyle} />
                </label>

                {/* Remind Me toggle */}
                <div style={{ background:"#fff", border:"1px solid #E2E1DF", borderRadius:10, padding:"14px 16px" }}>
                  <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", marginBottom: remind ? 12 : 0 }}>
                    <div onClick={() => setRemind(r=>!r)} style={{
                      width:38, height:22, borderRadius:11,
                      background: remind ? "#EF9F27" : "#D0CECC",
                      position:"relative", transition:"background 0.2s", cursor:"pointer", flexShrink:0
                    }}>
                      <div style={{
                        position:"absolute", top:3, left: remind ? 19 : 3,
                        width:16, height:16, borderRadius:"50%",
                        background:"#fff", transition:"left 0.2s",
                        boxShadow:"0 1px 4px rgba(0,0,0,0.18)"
                      }} />
                    </div>
                    <span style={{ fontSize:14, color:"#2C2C2A", fontWeight:500 }}>Remind me before this event</span>
                  </label>
                  {remind && (
                    <input type="email" value={remEmail || email} onChange={e=>setRemEmail(e.target.value)}
                      placeholder="Reminder email address" style={{ ...inputStyle, marginTop: 0 }} />
                  )}
                </div>

                <button type="submit" style={btnPrimary}>Confirm Registration →</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display:"flex", flexDirection:"column", gap:5, fontSize:13, fontWeight:600, color:"#2C2C2A", letterSpacing:"0.02em" };
const inputStyle = { padding:"10px 14px", borderRadius:8, border:"1.5px solid #D8D7D4", background:"#fff", fontSize:14, color:"#2C2C2A", outline:"none", fontFamily:"inherit", marginTop:2 };
const btnPrimary = { marginTop:8, padding:"13px 24px", background:"#EF9F27", color:"#2C2C2A", border:"none", borderRadius:10, fontWeight:800, fontSize:15, cursor:"pointer", width:"100%", letterSpacing:"0.02em", fontFamily:"inherit" };

// ── Event Card ─────────────────────────────────────────────────────────────
function EventCard({ event, onRSVP }) {
  const d = parseDate(event.date);
  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 2px 12px rgba(44,44,42,0.07)",
      display:"flex",
      transition:"transform 0.18s, box-shadow 0.18s",
    }}
    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 32px rgba(44,44,42,0.13)";}}
    onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 2px 12px rgba(44,44,42,0.07)";}}>
      {/* Date column */}
      <div style={{
        minWidth:64, background:"#2C2C2A", color:"#F2F1EF",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        padding:"16px 8px",
      }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", color:"#EF9F27", textTransform:"uppercase" }}>{MONTHS[d.getMonth()]}</div>
        <div style={{ fontSize:32, fontWeight:800, lineHeight:1, fontFamily:"'Playfair Display', serif" }}>{d.getDate()}</div>
        <div style={{ fontSize:11, color:"#9E9D99", marginTop:2 }}>{DAYS[d.getDay()]}</div>
      </div>

      {/* Content */}
      <div style={{ flex:1, padding:"16px 20px", display:"flex", flexDirection:"column", gap:6 }}>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <CategoryBadge cat={event.category} />
          {event.online && (
            <span style={{ fontSize:11, color:"#5F5E5A", background:"#F2F1EF", border:"1px solid #E2E1DF", borderRadius:20, padding:"2px 8px", fontWeight:600 }}>
              🌐 Online
            </span>
          )}
        </div>
        <div style={{ fontFamily:"'Playfair Display', serif", fontSize:17, fontWeight:700, color:"#2C2C2A", lineHeight:1.3 }}>{event.title}</div>
        <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
          <span style={{ fontSize:12, color:"#5F5E5A" }}>🕐 {event.time} – {event.end}</span>
          <span style={{ fontSize:12, color:"#5F5E5A" }}>📍 {event.location}</span>
          {event.spots && <span style={{ fontSize:12, color:"#5F5E5A" }}>👥 {event.spots} spots</span>}
        </div>
        <div style={{ fontSize:13, color:"#7A7975", lineHeight:1.6, marginTop:2 }}>{event.description}</div>
        <div style={{ marginTop:"auto", paddingTop:10 }}>
          <button onClick={() => onRSVP(event)} style={{
            padding:"8px 20px", background:"#EF9F27", color:"#2C2C2A",
            border:"none", borderRadius:8, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit"
          }}>
            RSVP / Register →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Calendar View ──────────────────────────────────────────────────────────
function CalendarView({ events, onRSVP }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(null);

  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach(ev => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [events]);

  const days = daysInMonth(viewYear, viewMonth);
  const firstDay = firstDayOfMonth(viewYear, viewMonth);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  const selectedKey = selected ? `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(selected).padStart(2,"0")}` : null;
  const selectedEvents = selectedKey ? (eventsByDay[selectedKey] || []) : [];

  const prevMonth = () => { if (viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); };
  const nextMonth = () => { if (viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:20 }}>
      {/* Calendar grid */}
      <div style={{ background:"#fff", borderRadius:16, padding:"20px 20px 16px", boxShadow:"0 2px 12px rgba(44,44,42,0.07)" }}>
        {/* Nav */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <button onClick={prevMonth} style={navBtn}>‹</button>
          <span style={{ fontFamily:"'Playfair Display', serif", fontSize:19, fontWeight:700, color:"#2C2C2A" }}>
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button onClick={nextMonth} style={navBtn}>›</button>
        </div>
        {/* Day headers */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:4 }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign:"center", fontSize:11, fontWeight:700, color:"#5F5E5A", letterSpacing:"0.06em", padding:"4px 0" }}>{d}</div>
          ))}
        </div>
        {/* Cells */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />;
            const key = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const hasEvents = !!eventsByDay[key];
            const isToday = getDayKey(today) === key;
            const isSel = selected === day;
            return (
              <button key={key} onClick={() => setSelected(day === selected ? null : day)} style={{
                background: isSel ? "#2C2C2A" : isToday ? "#FFF3DC" : "transparent",
                border: isSel ? "2px solid #EF9F27" : isToday ? "1.5px solid #EF9F27" : "1.5px solid transparent",
                borderRadius: 8, cursor: hasEvents ? "pointer" : "default",
                padding: "6px 2px 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                fontFamily:"inherit",
              }}>
                <span style={{ fontSize:14, fontWeight:600, color: isSel ? "#F2F1EF" : "#2C2C2A" }}>{day}</span>
                {hasEvents && (
                  <div style={{ display:"flex", gap:2, flexWrap:"wrap", justifyContent:"center" }}>
                    {(eventsByDay[key] || []).slice(0,3).map((ev,ii) => (
                      <div key={ii} style={{ width:6, height:6, borderRadius:"50%", background: isSel ? "#EF9F27" : (CAT_COLORS[ev.category] || "#5F5E5A") }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day events */}
      {selected && (
        <div>
          <div style={{ fontFamily:"'Playfair Display', serif", fontSize:16, fontWeight:700, color:"#2C2C2A", marginBottom:12 }}>
            {selectedEvents.length
              ? `${selectedEvents.length} event${selectedEvents.length>1?"s":""} on ${MONTHS[viewMonth]} ${selected}`
              : `No events on ${MONTHS[viewMonth]} ${selected}`}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {selectedEvents.map(ev => <EventCard key={ev.id} event={ev} onRSVP={onRSVP} />)}
          </div>
        </div>
      )}
    </div>
  );
}

const navBtn = {
  background:"#F2F1EF", border:"1.5px solid #E2E1DF",
  borderRadius:8, width:36, height:36, cursor:"pointer",
  fontSize:20, color:"#2C2C2A", display:"flex", alignItems:"center", justifyContent:"center",
  fontFamily:"inherit", lineHeight:1, padding:0,
};

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ChurchEvents() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState("list"); // list | calendar
  const [rsvpEvent, setRsvpEvent] = useState(null);
  const [events, setEvents] = useState(fallbackEvents);

  useEffect(() => {
    let mounted = true;
    fetchJson("/api/events")
      .then((data) => {
        if (!mounted || !Array.isArray(data) || !data.length) return;
        setEvents(
          data.map((event) => ({
            id: event.id,
            title: event.title,
            category: event.category,
            date: event.date,
            time: event.time,
            end: event.end_time || event.end || "",
            location: event.location,
            online: Boolean(event.online),
            description: event.description || "",
            spots: event.spots,
          }))
        );
      })
      .catch(() => {
        if (mounted) setEvents(fallbackEvents);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() =>
    events
      .filter(ev => activeCategory === "all" || ev.category === activeCategory)
      .sort((a,b) => a.date.localeCompare(b.date)),
    [activeCategory, events]);

  return (
    <div style={{
      minHeight:"100vh",
      background:"#F2F1EF",
      fontFamily:"'DM Sans', 'Segoe UI', sans-serif",
      color:"#2C2C2A",
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin:0; padding:0; }
        button:focus-visible { outline: 2px solid #EF9F27; outline-offset:2px; }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity:0; }
          to   { transform: translateY(0);    opacity:1; }
        }
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .event-appear { animation: fadeIn 0.3s ease both; }
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{
        background:"#2C2C2A",
        padding:"56px 24px 48px",
        position:"relative", overflow:"hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position:"absolute", top:-60, right:-60, width:260, height:260, borderRadius:"50%", background:"rgba(239,159,39,0.07)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-80, left:-40, width:200, height:200, borderRadius:"50%", background:"rgba(239,159,39,0.05)", pointerEvents:"none" }} />
        <div style={{ maxWidth:960, margin:"0 auto", position:"relative" }}>
          <div style={{ display:"inline-block", fontSize:11, fontWeight:700, letterSpacing:"0.14em", color:"#EF9F27", textTransform:"uppercase", marginBottom:12, border:"1px solid rgba(239,159,39,0.35)", padding:"4px 12px", borderRadius:20 }}>
            Community Life
          </div>
          <h1 style={{
            fontFamily:"'Playfair Display', serif",
            fontSize:"clamp(32px, 6vw, 52px)",
            fontWeight:800, color:"#F2F1EF", lineHeight:1.1, marginBottom:14,
          }}>
            Upcoming Events
          </h1>
          <p style={{ color:"#9E9D99", fontSize:16, maxWidth:520, lineHeight:1.7 }}>
            From Sunday worship to weekday small groups — find where you belong and join us.
          </p>
        </div>
      </div>

      {/* ── Controls ─────────────────────────────────────────────────────── */}
      <div style={{ background:"#fff", borderBottom:"1px solid #E8E7E5", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:960, margin:"0 auto", padding:"0 24px", display:"flex", flexWrap:"wrap", gap:0, justifyContent:"space-between", alignItems:"center" }}>
          {/* Category filters */}
          <div style={{ display:"flex", gap:0, overflowX:"auto", padding:"12px 0" }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
                padding:"7px 16px", borderRadius:8, border:"none",
                background: activeCategory===cat.id ? "#2C2C2A" : "transparent",
                color: activeCategory===cat.id ? "#F2F1EF" : "#5F5E5A",
                fontWeight: activeCategory===cat.id ? 700 : 500,
                fontSize:13, cursor:"pointer", fontFamily:"inherit",
                whiteSpace:"nowrap", transition:"all 0.15s",
              }}>
                {cat.label}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div style={{ display:"flex", gap:4, background:"#F2F1EF", borderRadius:10, padding:4, border:"1px solid #E2E1DF" }}>
            {[{id:"list",icon:"⊞",label:"List"},{id:"calendar",icon:"📅",label:"Calendar"}].map(v => (
              <button key={v.id} onClick={() => setViewMode(v.id)} style={{
                padding:"6px 14px", borderRadius:7, border:"none",
                background: viewMode===v.id ? "#2C2C2A" : "transparent",
                color: viewMode===v.id ? "#F2F1EF" : "#5F5E5A",
                fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit",
                display:"flex", alignItems:"center", gap:5,
              }}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div style={{ maxWidth:960, margin:"0 auto", padding:"32px 24px 80px" }}>
        {/* Results count */}
        <div style={{ fontSize:13, color:"#5F5E5A", marginBottom:20, fontWeight:500 }}>
          {filtered.length} event{filtered.length!==1?"s":""}{activeCategory!=="all"?` in ${CATEGORIES.find(c=>c.id===activeCategory)?.label}`:""}
        </div>

        {viewMode === "list" ? (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {filtered.length === 0
              ? <div style={{ textAlign:"center", padding:"64px 24px", color:"#9E9D99", fontSize:15 }}>No events found in this category.</div>
              : filtered.map((ev, i) => (
                  <div key={ev.id} className="event-appear" style={{ animationDelay:`${i*0.05}s` }}>
                    <EventCard event={ev} onRSVP={setRsvpEvent} />
                  </div>
                ))
            }
          </div>
        ) : (
          <CalendarView events={filtered} onRSVP={setRsvpEvent} />
        )}
      </div>

      {/* ── RSVP Modal ───────────────────────────────────────────────────── */}
      {rsvpEvent && <RSVPModal event={rsvpEvent} onClose={() => setRsvpEvent(null)} />}
    </div>
  );
}
