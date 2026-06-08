import { useState, useEffect, useRef } from "react";

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
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
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

const NAV_LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "sermons", label: "Sermons" },
  { id: "events", label: "Events" },
  { id: "blog", label: "Blog" },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact Us" },
];

export default function ChurchHomepage({ showNav = true } = {}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{fonts}</style>
      <style>{globalStyle}</style>

      {/* ── NAV ── */}
      {showNav && (
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(44,44,42,0.96)" : "transparent",
        borderBottom: scrolled ? `1px solid rgba(239,159,39,0.18)` : "none",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        transition: "all 0.35s ease",
        padding: "0 2.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "68px"
      }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.45rem", color: WHITE, letterSpacing: "0.02em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: COPPER, fontSize: "1.1rem" }}>◈</span> AIC MAAMANI
        </div>
        <div style={{ display: "flex", gap: "2.2rem", alignItems: "center" }}>
          {NAV_LINKS.map(({ id, label }) => (
            <a key={id} href={`#${id}`} style={{
              fontFamily: "'DM Sans', sans-serif", fontWeight: 400, letterSpacing: "0.1em",
              fontSize: "0.78rem", textTransform: "uppercase", color: "rgba(255,255,255,0.7)",
              textDecoration: "none", transition: "color 0.2s"
            }}
              onMouseEnter={e => { e.target.style.color = COPPER; }}
              onMouseLeave={e => { e.target.style.color = "rgba(255,255,255,0.7)"; }}
            >{label}</a>
          ))}
          <a href="#contact" style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 500, letterSpacing: "0.12em",
            fontSize: "0.75rem", textTransform: "uppercase", color: CHARCOAL,
            background: COPPER, padding: "0.5rem 1.4rem",
            textDecoration: "none", transition: "background 0.2s"
          }}
            onMouseEnter={e => { e.target.style.background = "#d48e1f"; }}
            onMouseLeave={e => { e.target.style.background = COPPER; }}
          >Contact Us</a>
        </div>
      </nav>
      )}

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
              KITUI, KENYA · Est. 1998
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
            >▶ Watch a Sermon</a>
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
      <section style={{ background: LIGHT, padding: "6rem 2.5rem" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "220px 1fr", gap: "5rem", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
            <div style={{
              width: "160px", height: "190px",
              background: STONE,
              border: `2px solid ${COPPER}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "4.5rem", color: MID
            }}>◈</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.05rem", color: CHARCOAL }}>Rev. Daniel Mutinda</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: COPPER, marginTop: "0.3rem" }}>Senior Pastor</div>
            </div>
          </div>
          <div>
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
            <div style={{ marginTop: "1.5rem", fontFamily: "'DM Serif Display', serif", fontStyle: "italic", fontSize: "1.05rem", color: COPPER }}>— Rev. Daniel Mutinda</div>
          </div>
        </div>
      </section>

      {/* ── STATS COUNTERS ── */}
      <section style={{ background: CHARCOAL, padding: "5rem 2.5rem" }}>
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
      <section id="events" style={{ background: STONE, padding: "6rem 2.5rem" }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "1.25rem" }}>
            {[
              { month: "JUN", day: "15", title: "Youth Outreach Sunday", tag: "Youth", desc: "A morning dedicated to hearing from the next generation — music, testimony, and a message for the young at heart." },
              { month: "JUN", day: "22", title: "Prayer & Fasting Weekend", tag: "Prayer", desc: "48 hours of corporate seeking. Join us as we fast and press into God together across the city." },
              { month: "JUL", day: "04", title: "Community Picnic & Baptisms", tag: "Community", desc: "Celebrate with us in the park! Share a meal, bring family, and witness public declarations of faith." },
            ].map(({ month, day, title, tag, desc }) => (
              <div key={title} style={{
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
                    <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.2rem", fontWeight: 400, color: CHARCOAL, lineHeight: 1.25 }}>{title}</h3>
                  </div>
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.88rem", lineHeight: 1.75, color: MID }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LATEST SERMON ── */}
      <section id="sermons" style={{ background: DARK, padding: "6rem 2.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ marginBottom: "3rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.6rem" }}>
              <div style={{ width: "22px", height: "2px", background: COPPER }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", color: COPPER }}>This Week's Message</span>
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, color: WHITE }}>Latest Sermon</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3.5rem", alignItems: "center" }}>
            {/* video player mock */}
            <div style={{
              aspectRatio: "16/9", background: CHARCOAL,
              border: `1px solid rgba(239,159,39,0.2)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", cursor: "pointer", overflow: "hidden"
            }}>
              {/* grid overlay */}
              <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(rgba(239,159,39,0.03) 0px, rgba(239,159,39,0.03) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(239,159,39,0.03) 0px, rgba(239,159,39,0.03) 1px, transparent 1px, transparent 40px)` }} />
              <div style={{
                width: "64px", height: "64px",
                border: `1.5px solid ${COPPER}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: COPPER, fontSize: "1.6rem", position: "relative",
                transition: "background 0.2s"
              }}
                onMouseEnter={e => { e.currentTarget.style.background = `${COPPER}22`; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >▶</div>
              <div style={{ position: "absolute", bottom: "1rem", left: "1rem", right: "1rem" }}>
                <div style={{ height: "2px", background: "rgba(239,159,39,0.2)" }}>
                  <div style={{ height: "100%", width: "35%", background: COPPER }} />
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: MID, marginBottom: "0.75rem" }}>June 8, 2025 · Series: The Beatitudes</div>
              <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(1.6rem,3vw,2.3rem)", fontWeight: 400, color: WHITE, lineHeight: 1.2, marginBottom: "0.8rem" }}>
                Blessed Are the Hungry
              </h3>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic", color: COPPER, fontSize: "0.95rem", marginBottom: "1.25rem", lineHeight: 1.6 }}>
                Matthew 5:6 — "Blessed are those who hunger and thirst for righteousness, for they will be filled."
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.88rem", lineHeight: 1.8, color: "rgba(255,255,255,0.5)", marginBottom: "1.75rem" }}>
                In a world that promises satisfaction in so many wrong places, Pastor Samuel unpacks what it truly means to hunger for something deeper — and the extraordinary promise attached to that ache.
              </p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <a href="#sermons" style={{
                  background: COPPER, color: CHARCOAL, padding: "0.7rem 1.6rem",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                  letterSpacing: "0.12em", fontSize: "0.73rem", textTransform: "uppercase", textDecoration: "none"
                }}>Watch Now</a>
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
        </div>
      </section>

      {/* ── LATEST BLOG ── */}
      <section id="blog" style={{ background: LIGHT, padding: "6rem 2.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.65fr", gap: "5rem", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.6rem" }}>
              <div style={{ width: "22px", height: "2px", background: COPPER }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", color: COPPER }}>Devotional</span>
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, color: CHARCOAL, marginBottom: "1rem" }}>From the Blog</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.9rem", color: MID, lineHeight: 1.8, marginBottom: "1.5rem" }}>
              Weekly reflections, pastoral letters, and devotionals to nourish your faith between Sundays.
            </p>
            <a href="#blog" style={{
              fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.73rem",
              letterSpacing: "0.15em", textTransform: "uppercase", color: COPPER2,
              textDecoration: "none", borderBottom: `1px solid ${COPPER2}`, paddingBottom: "2px"
            }}>Read All Posts →</a>
          </div>
          <div style={{
            background: WHITE, border: `1px solid rgba(95,94,90,0.15)`,
            padding: "2.5rem",
            borderLeft: `4px solid ${COPPER}`
          }}>
            <span style={{ background: CHARCOAL, color: COPPER, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", padding: "4px 10px", display: "inline-block", marginBottom: "1.1rem" }}>Devotional</span>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.55rem", fontWeight: 400, color: CHARCOAL, lineHeight: 1.25, marginBottom: "0.75rem" }}>
              When Silence Feels Like God Has Left the Room
            </h3>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: MID, marginBottom: "1rem" }}>By Pastor Samuel · June 5, 2025 · 4 min read</div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.95rem", lineHeight: 1.85, color: MID }}>
              There are seasons when our prayers seem to bounce off the ceiling. When the Word feels dry and the presence of God, distant. This is not the end of your faith — it may be the beginning of a deeper one. The Psalmist knew this valley intimately…
            </p>
            <a href="#blog" style={{
              display: "inline-block", marginTop: "1.25rem",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.75rem",
              letterSpacing: "0.1em", color: COPPER, textDecoration: "none"
            }}>Continue reading →</a>
          </div>
        </div>
      </section>

      {/* ── FIND US ── */}
      <section id="find" style={{ background: CHARCOAL, padding: "6rem 2.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ marginBottom: "3.5rem", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginBottom: "0.6rem" }}>
              <div style={{ width: "22px", height: "2px", background: COPPER }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", color: COPPER }}>Come and Worship</span>
              <div style={{ width: "22px", height: "2px", background: COPPER }} />
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 400, color: WHITE }}>Find Us</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "4rem", alignItems: "start" }}>
            <div>
              {[
                { icon: "◎", title: "Phone", lines: ["+254 714086352"] },
                { icon: "◈", title: "Email", lines: ["danielmutinda320@gmail.com"] },
                { icon: "◷", title: "Service Times", lines: ["Sunday School: 8:00 AM - 9:30 AM", "Main Service: 10:30 AM - 1:30 PM",
                  "Youth Meeting: 3:00 PM - 4:30 PM ", "Wednesday Fellowship: 4:00 PM -  5:00 PM ", "Thursday: 3:00 PM - 5:00 PM - Praise and Worship Team",
                "Saturday: 6:00 AM - 7:00 AM - Morning Devotion"] },
              ].map(({ icon, title, lines }) => (
                <div key={title} style={{ display: "flex", gap: "1.1rem", marginBottom: "2rem", paddingBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "1.1rem", color: COPPER, flexShrink: 0, marginTop: "2px" }}>{icon}</div>
                  <div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "0.67rem", letterSpacing: "0.18em", textTransform: "uppercase", color: COPPER, marginBottom: "0.4rem" }}>{title}</div>
                    {lines.map(l => <div key={l} style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.9rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>{l}</div>)}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ width: "100%", aspectRatio: "4/3", border: `1px solid rgba(239,159,39,0.2)`, overflow: "hidden" }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8167!2d36.8108!3d-1.2933!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d22f42bf41%3A0x4865f21b5a98ed4!2sUpper%20Hill%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1686000000000"
                width="100%" height="100%" style={{ border: 0, filter: "grayscale(100%) contrast(1.1)" }}
                allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="AIC MAAMANI Church location"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: DARK, borderTop: `1px solid rgba(250, 249, 248, 0.87)`, padding: "3rem 2.5rem", textAlign: "center" }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.35rem", color: WHITE, marginBottom: "0.4rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          <span style={{ color: COPPER }}>◈</span> AIC MAAMANI
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.73rem", letterSpacing: "0.12em", color: "rgba(255, 255, 255, 0.93)", marginBottom: "1.75rem" }}>A Church for Every Soul · Kitui, Kenya</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "2.5rem", flexWrap: "wrap" }}>
          {NAV_LINKS.map(({ id, label }) => (
            <a key={id} href={`#${id}`} style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(249, 241, 241, 0.89)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => { e.target.style.color = COPPER; }}
              onMouseLeave={e => { e.target.style.color = "rgba(242, 236, 236, 0.96)"; }}
            >{label}</a>
          ))}
          <a
            href="#admin"
            aria-label="Admin panel"
            title="Admin panel"
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              border: "1px solid rgba(239,159,39,0.28)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(242, 236, 236, 0.96)",
              textDecoration: "none",
              transition: "all 0.2s",
              marginLeft: "0.25rem",
              fontSize: "0.82rem",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = COPPER;
              e.currentTarget.style.borderColor = COPPER;
              e.currentTarget.style.background = "rgba(239,159,39,0.08)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "rgba(242, 236, 236, 0.96)";
              e.currentTarget.style.borderColor = "rgba(239,159,39,0.28)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            ◈
          </a>
        </div>
        <div style={{ marginTop: "2rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "12px", letterSpacing: "0.1em", color: "rgba(231, 225, 225, 0.93)" }}>
          © 2025 AIC MAAMANI Church. Built with faith & care.
        </div>
      </footer>
    </>
  );
}
