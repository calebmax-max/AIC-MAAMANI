import { useState, useEffect, useRef } from "react";
import { fetchJson } from "./api";
import { usePastorImage } from "./pastorImage";

const COPPER  = "#EF9F27";
const COPPER2 = "#BA7517";
const CHARCOAL = "#2C2C2A";
const MID     = "#5F5E5A";
const LIGHT   = "#F2F1EF";
const WHITE   = "#FFFFFF";
const STONE   = "#E8E6E1";
const DARK    = "#1A1918";
const fonts = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
`;

const globalStyle = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; background: ${LIGHT}; color: ${CHARCOAL}; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: ${LIGHT}; }
  ::-webkit-scrollbar-thumb { background: ${MID}; border-radius: 3px; }
`;

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    let rafId = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) {
        rafId = requestAnimationFrame(step);
      }
    };
    rafId = requestAnimationFrame(step);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [start, target, duration]);
  return count;
}

function AnimatedCounter({ target, label, suffix = "" }) {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const count = useCountUp(target, 2200, started);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2.8rem,5.5vw,4.5rem)", fontWeight: 400, color: COPPER, lineHeight: 1 }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, letterSpacing: "0.2em", fontSize: "0.72rem", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginTop: "0.6rem" }}>
        {label}
      </div>
    </div>
  );
}

export default function ChurchHomepage({ showNav = true } = {}) {
  const [blogPosts, setBlogPosts] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [latestSermon, setLatestSermon] = useState(null);
  const { pastorImageSrc } = usePastorImage();

  useEffect(() => {
    let mounted = true;
    fetchJson("/api/blog")
      .then((data) => {
        if (!mounted || !Array.isArray(data)) return;
        // Sort by date descending and take the 2 most recent
        const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
        setBlogPosts(sorted.slice(0, 2));
      })
      .catch(() => { if (mounted) setBlogPosts([]); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchJson("/api/events?upcoming=true&limit=3")
      .then((data) => {
        if (!mounted || !Array.isArray(data)) return;
        setUpcomingEvents(data.slice(0, 3));
      })
      .catch(() => {
        if (mounted) setUpcomingEvents([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchJson("/api/sermons?limit=1")
      .then((data) => {
        if (!mounted || !Array.isArray(data)) return;
        setLatestSermon(data[0] || null);
      })
      .catch(() => {
        if (mounted) setLatestSermon(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <style>{fonts}</style>
      <style>{globalStyle}</style>



      {/* ── HERO ── */}
      <section id="home" style={{
        minHeight: "100vh",
        background: CHARCOAL,
        position: "relative", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        overflow: "hidden", padding: "0 1.5rem"
      }}>
        {/* geometric grid lines */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          {[15, 35, 65, 85].map(p => (
            <div key={p} style={{ position: "absolute", left: `${p}%`, top: 0, bottom: 0, width: "1px", background: "rgba(239,159,39,0.04)" }} />
          ))}
          {[20, 50, 80].map(p => (
            <div key={p} style={{ position: "absolute", top: `${p}%`, left: 0, right: 0, height: "1px", background: "rgba(239,159,39,0.04)" }} />
          ))}
          {/* large copper square accent */}
          <div style={{
            position: "absolute", right: "-80px", top: "50%", transform: "translateY(-50%) rotate(15deg)",
            width: "500px", height: "500px",
            border: "1px solid rgba(239,159,39,0.08)"
          }} />
          <div style={{
            position: "absolute", right: "40px", top: "50%", transform: "translateY(-50%) rotate(15deg)",
            width: "340px", height: "340px",
            border: "1px solid rgba(239,159,39,0.12)"
          }} />
        </div>

        <div style={{ position: "relative", textAlign: "center", maxWidth: "860px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.75rem",
            background: "rgba(239,159,39,0.1)", border: "1px solid rgba(239,159,39,0.25)",
            padding: "0.4rem 1.1rem", marginBottom: "2rem"
          }}>
            <span style={{ display: "inline-block", width: "6px", height: "6px", background: COPPER, borderRadius: "50%" }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, letterSpacing: "0.2em", fontSize: "0.68rem", textTransform: "uppercase", color: COPPER }}>
              KITUI, KENYA · Est. 1994
            </span>
          </div>

          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(3.8rem,10vw,8rem)",
            fontWeight: 400, lineHeight: 0.95,
            color: WHITE, letterSpacing: "-0.01em",
            marginBottom: "0.1em"
          }}>
            Come<br /><em style={{ color: COPPER, fontStyle: "italic" }}>as you are.</em>
          </h1>

          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
            fontSize: "clamp(1rem,2vw,1.2rem)",
            color: "rgba(255,255,255,0.5)", marginTop: "1.75rem", marginBottom: "2.5rem",
            lineHeight: 1.7, maxWidth: "480px", margin: "1.75rem auto 2.5rem",
            letterSpacing: "0.01em"
          }}>
            A community rooted in grace, truth, and belonging — where every soul finds a home.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#events" style={{
              background: COPPER, color: CHARCOAL, padding: "0.9rem 2rem",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              letterSpacing: "0.13em", fontSize: "0.75rem", textTransform: "uppercase",
              textDecoration: "none", transition: "all 0.2s"
            }}
              onMouseEnter={e => { e.target.style.background = "#d48e1f"; }}
              onMouseLeave={e => { e.target.style.background = COPPER; }}
            >Join Us Sunday</a>
            <a href="#sermons" style={{
              border: `1px solid rgba(255,255,255,0.2)`, color: "rgba(255,255,255,0.75)",
              padding: "0.9rem 2rem",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
              letterSpacing: "0.13em", fontSize: "0.75rem", textTransform: "uppercase",
              textDecoration: "none", transition: "all 0.2s", background: "transparent"
            }}
              onMouseEnter={e => { e.target.style.borderColor = COPPER; e.target.style.color = COPPER; }}
              onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; e.target.style.color = "rgba(255,255,255,0.75)"; }}
            >View a Sermon</a>
          </div>
        </div>

        <div style={{
          position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
          animation: "bob 2s infinite"
        }}>
          <span style={{ fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Scroll</span>
          <div style={{ width: "1px", height: "36px", background: `linear-gradient(to bottom, ${COPPER}99, transparent)` }} />
        </div>
        <style>{`@keyframes bob { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(7px)} }`}</style>
      </section>

      {/* ── SERVICE TIMES BAR ── */}
      <section id="services" style={{
        background: COPPER, padding: "1rem 2.5rem",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexWrap: "wrap", gap: "3rem"
      }}>
        {[
          { icon: "◷", label: "Sunday Service", detail: "10:30 AM - 1:30 PM" },
          { icon: "◈", label: "Wednesday Fellowship", detail: "4:00 PM - 5:00 PM" },
          { icon: "⊕", label: "Location", detail: "KITUI, KENYA" },
        ].map(({ icon, label, detail }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <span style={{ fontSize: "1.3rem", color: CHARCOAL, opacity: 0.6 }}>{icon}</span>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: CHARCOAL, opacity: 0.65 }}>{label}</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1rem", fontWeight: 400, color: CHARCOAL }}>{detail}</div>
            </div>
          </div>
        ))}
      </section>

      {/* ── WELCOME MESSAGE ── */}
      <style>{`
        @media (max-width: 640px) {
          .pastor-grid { display: flex !important; flex-direction: column !important; gap: 1.75rem !important; }
          .pastor-image-col { order: 2 !important; align-self: center !important; }
          .pastor-heading-col { order: 1 !important; }
          .pastor-body-col { order: 3 !important; }
          .split-layout { grid-template-columns: 1fr !important; }
          .find-layout { grid-template-columns: 1fr !important; }
          .map-frame { height: 260px !important; }
          .sermon-layout { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 641px) {
          .pastor-body-col { display: none !important; }
          .pastor-desktop-text { display: flex !important; }
        }
        @media (max-width: 640px) {
          .pastor-desktop-text { display: none !important; }
          .pastor-body-col { display: block !important; }
        }
      `}</style>
      <section style={{ background: LIGHT, padding: "var(--section-v, 5rem) var(--section-h, 2.5rem)" }}>
        <div
          className="pastor-grid"
          style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "min(220px, 100%) 1fr", gap: "clamp(2rem, 5vw, 5rem)", alignItems: "center" }}
        >
          {/* MOBILE ONLY: Heading first (order 1) */}
          <div className="pastor-heading-col" style={{ display: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ width: "28px", height: "2px", background: COPPER }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", color: COPPER }}>A Word from the Pastor</span>
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(1.7rem,3.2vw,2.6rem)", fontWeight: 400, color: CHARCOAL, lineHeight: 1.2 }}>
              You are not too broken,<br />too lost, or too late.
            </h2>
          </div>

          {/* Image column (order 2 on mobile) */}
          <div className="pastor-image-col" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
            <img
              src={pastorImageSrc}
              alt="Pr. Daniel Mutinda"
              style={{
                width: "160px",
                height: "190px",
                objectFit: "cover",
                border: `2px solid ${COPPER}`,
                background: STONE,
                display: "block",
              }}
            />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.05rem", color: CHARCOAL }}>Pr. Daniel Mutinda</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: COPPER, marginTop: "0.3rem" }}>Senior Pastor</div>
            </div>
          </div>

          {/* DESKTOP ONLY: Full text column */}
          <div className="pastor-desktop-text" style={{ display: "none", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ width: "28px", height: "2px", background: COPPER }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", color: COPPER }}>A Word from the Pastor</span>
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(1.7rem,3.2vw,2.6rem)", fontWeight: 400, color: CHARCOAL, lineHeight: 1.2, marginBottom: "1.5rem" }}>
              You are not too broken,<br />too lost, or too late.
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "1rem", lineHeight: 1.85, color: MID, marginBottom: "1rem" }}>
              AIC MAAMANI was founded on a single conviction: that the love of God meets people exactly where they are. Whether you're stepping inside a church for the first time or returning after years away — this is a place of radical welcome, honest community, and life-transforming faith.
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "1rem", lineHeight: 1.85, color: MID }}>
             Come tired. Come curious. Just come.
            </p>
            <div style={{ marginTop: "1.5rem", fontFamily: "'DM Serif Display', serif", fontStyle: "italic", fontSize: "1.05rem", color: COPPER }}>— Pr. Daniel Mutinda</div>
          </div>

          {/* MOBILE ONLY: Body text last (order 3) */}
          <div className="pastor-body-col" style={{ display: "none" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "1rem", lineHeight: 1.85, color: MID, marginBottom: "1rem" }}>
              AIC MAAMANI was founded on a single conviction: that the love of God meets people exactly where they are. Whether you're stepping inside a church for the first time or returning after years away — this is a place of radical welcome, honest community, and life-transforming faith.
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "1rem", lineHeight: 1.85, color: MID }}>
             Come tired. Come curious. Just come.
            </p>
            <div style={{ marginTop: "1.5rem", fontFamily: "'DM Serif Display', serif", fontStyle: "italic", fontSize: "1.05rem", color: COPPER }}>— Pr. Daniel Mutinda</div>
          </div>
        </div>
      </section>

      {/* ── STATS COUNTERS ── */}
      <section style={{ background: CHARCOAL, padding: "var(--section-v, 5rem) var(--section-h, 2.5rem)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "3rem" }}>
          {[
            { target: 170, label: "Members", suffix: "+" },
            { target: 26,   label: "Years of Ministry", suffix: "" },
            { target: 14,   label: "Active Ministries", suffix: "" },
            { target: 50,   label: "Youths involved", suffix: "" },
          ].map(({ target, label, suffix }) => (
            <AnimatedCounter key={label} target={target} label={label} suffix={suffix} />
          ))}
        </div>
      </section>

      {/* ── UPCOMING EVENTS ── */}
      <section id="events" style={{ background: STONE, padding: "var(--section-v, 5rem) var(--section-h, 2.5rem)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.6rem" }}>
                <div style={{ width: "22px", height: "2px", background: COPPER }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", color: COPPER }}>What's On</span>
              </div>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, color: CHARCOAL }}>Upcoming Events</h2>
            </div>
            <a href="#events" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.73rem", letterSpacing: "0.15em", textTransform: "uppercase", color: COPPER2, textDecoration: "none", borderBottom: `1px solid ${COPPER2}`, paddingBottom: "2px" }}>See All Events →</a>
          </div>
          {upcomingEvents.length === 0 ? (
            <div style={{ background: WHITE, border: `1px solid rgba(95,94,90,0.15)`, padding: "1.5rem", color: MID, fontFamily: "'DM Sans', sans-serif" }}>
              No upcoming events right now.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "1.25rem" }}>
              {upcomingEvents.map((event) => {
                const eventDate = new Date(`${event.date}T00:00:00`);
                const month = eventDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
                const day = String(eventDate.getDate()).padStart(2, "0");
                const tag = event.category || "Event";
                return (
                  <div key={event.id} style={{
                    background: WHITE,
                    border: `1px solid rgba(95,94,90,0.15)`,
                    padding: "1.75rem",
                    transition: "transform 0.25s, border-color 0.25s",
                    cursor: "pointer"
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = COPPER; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(95,94,90,0.15)"; }}
                  >
                    <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start", marginBottom: "1rem" }}>
                      <div style={{ background: CHARCOAL, color: WHITE, padding: "0.55rem 0.9rem", textAlign: "center", flexShrink: 0, minWidth: "58px" }}>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: COPPER }}>{month}</div>
                        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2rem", fontWeight: 400, lineHeight: 1 }}>{day}</div>
                      </div>
                      <div>
                        <span style={{ background: STONE, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MID, padding: "2px 8px", display: "inline-block", marginBottom: "0.4rem" }}>{tag}</span>
                        <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.2rem", fontWeight: 400, color: CHARCOAL, lineHeight: 1.25 }}>{event.title}</h3>
                      </div>
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase", color: MID, marginBottom: "0.55rem" }}>
                      {event.time || "Time TBA"} {event.end_time ? `• ${event.end_time}` : ""}
                    </div>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.88rem", lineHeight: 1.75, color: MID }}>
                      {event.description || event.location || "Join us for this church gathering."}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── LATEST SERMON ── */}
      <section id="sermons" style={{ background: DARK, padding: "var(--section-v, 5rem) var(--section-h, 2.5rem)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ marginBottom: "3rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.6rem" }}>
              <div style={{ width: "22px", height: "2px", background: COPPER }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", color: COPPER }}>This Week's Message</span>
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, color: WHITE }}>Latest Sermon</h2>
          </div>
          {latestSermon ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(2rem, 4vw, 3.5rem)", alignItems: "center" }} className="sermon-layout">
              <div style={{
                aspectRatio: "16/9",
                background: CHARCOAL,
                border: `1px solid rgba(239,159,39,0.2)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}>
                {latestSermon.thumbnail ? (
                  <img
                    src={latestSermon.thumbnail}
                    alt={latestSermon.title}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : null}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(44,44,42,0.92), rgba(26,25,24,0.78))" }} />
                <div style={{
                  width: "64px",
                  height: "64px",
                  border: `1.5px solid ${COPPER}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: COPPER,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  position: "relative",
                }}>
                  View
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: MID, marginBottom: "0.75rem" }}>
                  {latestSermon.date} {latestSermon.series_id ? `· Series: ${latestSermon.series_id}` : ""}
                </div>
                <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(1.6rem,3vw,2.3rem)", fontWeight: 400, color: WHITE, lineHeight: 1.2, marginBottom: "0.8rem" }}>
                  {latestSermon.title}
                </h3>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic", color: COPPER, fontSize: "0.95rem", marginBottom: "1.25rem", lineHeight: 1.6 }}>
                  {latestSermon.scripture || latestSermon.topic || "Recent sermon from the pulpit"}
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.88rem", lineHeight: 1.8, color: "rgba(255,255,255,0.5)", marginBottom: "1.75rem" }}>
                  {latestSermon.topic || latestSermon.duration
                    ? `${latestSermon.topic ? `${latestSermon.topic}. ` : ""}${latestSermon.duration ? `Duration: ${latestSermon.duration}.` : ""}`
                    : "Tap through to view the most recent message."}
                </p>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <a href="#sermons" style={{
                    background: COPPER, color: CHARCOAL, padding: "0.7rem 1.6rem",
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                    letterSpacing: "0.12em", fontSize: "0.73rem", textTransform: "uppercase", textDecoration: "none"
                  }}>View Sermon</a>
                  <a href="#sermons" style={{
                    border: `1px solid rgba(255,255,255,0.2)`, color: "rgba(255,255,255,0.6)",
                    padding: "0.7rem 1.6rem",
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
                    letterSpacing: "0.12em", fontSize: "0.73rem", textTransform: "uppercase", textDecoration: "none",
                    transition: "all 0.2s"
                  }}
                    onMouseEnter={e => { e.target.style.borderColor = COPPER; e.target.style.color = COPPER; }}
                    onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; e.target.style.color = "rgba(255,255,255,0.6)"; }}
                  >All Sermons</a>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif" }}>
              No sermons have been uploaded yet.
            </div>
          )}
        </div>
      </section>

      {/* ── LATEST BLOG ── */}
      <section id="blog" style={{ background: LIGHT, padding: "var(--section-v, 5rem) var(--section-h, 2.5rem)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          {/* Section header */}
          <div style={{ marginBottom: "2.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.6rem" }}>
              <div style={{ width: "22px", height: "2px", background: COPPER }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", color: COPPER }}>Devotional</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, color: CHARCOAL }}>From the Blog</h2>
              <a href="#blog" style={{
                fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.73rem",
                letterSpacing: "0.15em", textTransform: "uppercase", color: COPPER2,
                textDecoration: "none", borderBottom: `1px solid ${COPPER2}`, paddingBottom: "2px"
              }}>Read All Posts →</a>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.9rem", color: MID, lineHeight: 1.8, marginTop: "0.75rem" }}>
              Weekly reflections, pastoral letters, and devotionals to nourish your faith between Sundays.
            </p>
          </div>

          {/* Two most recent blog cards — live from /api/blog */}
          <div className="split-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {blogPosts.length === 0 ? (
              <div style={{ gridColumn: "1/-1", padding: "2rem 0", color: MID, fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem", fontStyle: "italic" }}>
                No posts yet — check back soon.
              </div>
            ) : blogPosts.map((post) => {
              // Build a short excerpt from the first body paragraph if no excerpt field
              const excerpt = post.excerpt
                || (Array.isArray(post.body) && post.body[0]?.text
                    ? post.body[0].text.slice(0, 180) + (post.body[0].text.length > 180 ? "…" : "")
                    : "");
              // Build meta line
              const meta = [post.author && `By ${post.author}`, post.date].filter(Boolean).join(" · ");

              return (
                <div key={post.id} style={{
                  background: WHITE, border: `1px solid rgba(95,94,90,0.15)`,
                  padding: "2.5rem",
                  borderLeft: `4px solid ${COPPER}`
                }}>
                  {post.category && (
                    <span style={{ background: CHARCOAL, color: COPPER, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", padding: "4px 10px", display: "inline-block", marginBottom: "1.1rem" }}>
                      {post.category}
                    </span>
                  )}
                  <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.45rem", fontWeight: 400, color: CHARCOAL, lineHeight: 1.25, marginBottom: "0.75rem" }}>
                    {post.title}
                  </h3>
                  {meta && (
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: MID, marginBottom: "1rem" }}>
                      {meta}
                    </div>
                  )}
                  {excerpt && (
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.92rem", lineHeight: 1.85, color: MID }}>
                      {excerpt}
                    </p>
                  )}
                  <a href="#blog" style={{
                    display: "inline-block", marginTop: "1.25rem",
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.75rem",
                    letterSpacing: "0.1em", color: COPPER, textDecoration: "none"
                  }}>Continue reading →</a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FIND US ── */}
      <section id="find" style={{ background: CHARCOAL, padding: "var(--section-v, 5rem) var(--section-h, 2.5rem)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ marginBottom: "3rem", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginBottom: "0.6rem" }}>
              <div style={{ width: "22px", height: "2px", background: COPPER }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", color: COPPER }}>Come and Worship</span>
              <div style={{ width: "22px", height: "2px", background: COPPER }} />
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, color: WHITE }}>Find Us</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            {[
              { icon: "◎", title: "Phone", lines: ["+254 714086352"] },
              { icon: "◈", title: "Email", lines: ["danielmutinda320@gmail.com"] },
              { icon: "◷", title: "Service Times", lines: ["Sunday School: 8:00 AM - 9:30 AM", "Main Service: 10:30 AM - 1:30 PM", "Youth Meeting: 3:00 PM - 4:30 PM", "Wednesday Fellowship: 4:00 PM - 5:00 PM"] },
            ].map(({ icon, title, lines }) => (
              <div key={title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(239,159,39,0.12)", padding: "1.35rem" }}>
                <div style={{ fontSize: "1.1rem", color: COPPER, marginBottom: "0.75rem" }}>{icon}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.67rem", letterSpacing: "0.18em", textTransform: "uppercase", color: COPPER, marginBottom: "0.6rem" }}>{title}</div>
                {lines.map((line) => (
                  <div key={line} style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
                    {line}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
