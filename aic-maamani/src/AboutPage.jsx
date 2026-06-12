import { useState, useEffect, useRef } from "react";
import { fetchJson } from "./api";
import { usePastorImage } from "./pastorImage";

// ── Slate & Copper palette ──────────────────────────────
const C = {
  copper:   "#EF9F27",
  copper2:  "#BA7517",
  charcoal: "#2C2C2A",
  mid:      "#5F5E5A",
  light:    "#F2F1EF",
  stone:    "#E8E6E1",
  white:    "#FFFFFF",
  dark:     "#1A1918",
};



// ── Resolve backend-relative photo URLs ────────────────
const _API_BASE = (process.env.REACT_APP_API_BASE_URL || window.location.origin).replace(/\/$/, "");
function resolveTeamPhoto(src) {
  if (!src) return "";
  if (/^(?:https?:)?\/\//i.test(src) || src.startsWith("data:")) return src;
  return `${_API_BASE}${src}`;
}

// ── Shared helpers ──────────────────────────────────────
function resolveUrl(src) {
  if (!src) return "";
  if (/^(?:https?:)?\/\//i.test(src) || src.startsWith("data:")) return src;
  const base = (process.env.REACT_APP_API_BASE_URL || window.location.origin).replace(/\/$/, "");
  return `${base}${src}`;
}

const fonts = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');`;

const globalStyle = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; background: ${C.light}; color: ${C.charcoal}; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: ${C.mid}; border-radius: 3px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes lineGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }

  /* ── MOBILE RESPONSIVE ── */
  @media (max-width: 640px) {

    /* Nav */
    .about-nav { padding: 0 1.25rem !important; }
    .nav-links { display: none !important; }
    .hamburger-btn { display: inline-flex !important; }

    /* Timeline: hide spine, stack rows cleanly */
    .timeline-row { display: flex !important; flex-direction: column !important; padding-bottom: 1.75rem !important; margin-bottom: 0 !important; }
    .timeline-year-col { text-align: left !important; padding-right: 0 !important; padding-bottom: 0.3rem !important; }
    .timeline-dot { display: none !important; }
    .timeline-spine { display: none !important; }

    /* Vision & Mission: stack */
    .grid-2 { grid-template-columns: 1fr !important; }
    .values-grid { grid-template-columns: 1fr !important; }

    /* Meet the Pastor: photo first, bio second */
    .about-hero-grid { display: flex !important; flex-direction: column !important; gap: 2rem !important; }
    .pastor-photo-col { order: 1 !important; }
    .pastor-bio-col { order: 2 !important; }

    /* Leadership team: left-align description */
    .leadership-desc { text-align: left !important; max-width: 100% !important; }

    /* Accordion: less indent */
    .accordion-body { padding-left: 1rem !important; }
  }
`;

// ── Reusable section label ──────────────────────────────
function SectionLabel({ text, light = false }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"0.65rem" }}>
      <div style={{ width:"22px", height:"2px", background: C.copper }} />
      <span style={{
        fontFamily:"'DM Sans', sans-serif", fontWeight:400,
        fontSize:"0.68rem", letterSpacing:"0.22em", textTransform:"uppercase",
        color: C.copper
      }}>{text}</span>
    </div>
  );
}

// ── InView hook ─────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ── NAV ─────────────────────────────────────────────────
const NAV_LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About Us" },
  { id: "sermons", label: "Sermons" },
  { id: "events", label: "Events" },
  { id: "blog", label: "Blog" },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact Us" },
];
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [menuOpen]);
  return (
    <>
    <nav ref={navRef} className="about-nav" style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100, minHeight:"68px",
      background: scrolled ? "rgba(44,44,42,0.96)" : C.charcoal,
      borderBottom: scrolled ? `1px solid rgba(239,159,39,0.18)` : "none",
      backdropFilter: scrolled ? "blur(14px)" : "none",
      transition:"all 0.35s", padding:"0 2.5rem",
      display:"flex", alignItems:"center", justifyContent:"space-between"
    }}>
      <a href="#home" style={{ fontFamily:"'DM Serif Display', serif", fontSize:"1.4rem", color:C.white, textDecoration:"none", display:"flex", alignItems:"center", gap:"0.5rem" }}>
        <span style={{ color: C.copper }}>◈</span> AIC MAAMANI
      </a>

      {/* Hamburger — shown on mobile via CSS */}
      <button
        type="button"
        onClick={() => setMenuOpen(o => !o)}
        className="hamburger-btn"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        style={{
          fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
          letterSpacing: "0.14em", fontSize: "0.85rem", textTransform: "uppercase",
          color: menuOpen ? C.copper : "#fff",
          background: menuOpen ? "rgba(239,159,39,0.1)" : "rgba(255,255,255,0.08)",
          border: menuOpen ? `1px solid ${C.copper}` : "1px solid rgba(255,255,255,0.18)",
          borderRadius: 999, padding: "0.55rem 1rem", cursor: "pointer",
          display: "none", alignItems: "center", gap: "0.4rem", transition: "all 0.2s",
        }}
      >
        <span>{menuOpen ? "✕" : "☰"}</span>
        <span>{menuOpen ? "CLOSE" : "MENU"}</span>
      </button>

      {/* Desktop nav links */}
      <div className="nav-inner nav-links" style={{ display:"flex", gap:"2.2rem", alignItems:"center", flexWrap:"wrap", justifyContent:"flex-end" }}>
        {NAV_LINKS.map(({ id, label }) => (
          <a key={id} className="nav-link" href={`#${id}`} style={{
            fontFamily:"'DM Sans', sans-serif", fontWeight: id === "about" ? 500 : 400,
            letterSpacing:"0.1em", fontSize:"0.78rem", textTransform:"uppercase",
            color: id === "about" ? C.copper : "rgba(255,255,255,0.7)",
            textDecoration:"none", transition:"color 0.2s", whiteSpace:"nowrap"
          }}
            onMouseEnter={e => { e.currentTarget.style.color = C.copper; }}
            onMouseLeave={e => { e.currentTarget.style.color = id === "about" ? C.copper : "rgba(255,255,255,0.7)"; }}
          >{label}</a>
        ))}
        <a className="nav-cta" href="#contact" style={{
          background: C.copper, color: C.charcoal, padding:"0.5rem 1.4rem",
          fontFamily:"'DM Sans', sans-serif", fontWeight:500, letterSpacing:"0.12em",
          fontSize:"0.75rem", textTransform:"uppercase", textDecoration:"none", whiteSpace:"nowrap"
        }}>Contact Us</a>
      </div>
    </nav>

    {/* Mobile dropdown */}
    {menuOpen && (
      <div
        onClick={() => setMenuOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99,
          background: "rgba(26,25,24,0.45)",
          backdropFilter: "blur(3px)",
        }}
      >
      <div style={{
        position:"absolute", top:"68px", left:0, right:0,
        background:"rgba(26,25,24,0.98)", backdropFilter:"blur(14px)",
        borderBottom:`1px solid rgba(239,159,39,0.18)`,
        padding:"1.25rem 1.25rem 1.5rem",
        display:"flex", flexDirection:"column", gap:"0.1rem",
      }}>
        {NAV_LINKS.map(({ id, label }) => (
          <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} style={{
            fontFamily:"'DM Sans', sans-serif", fontWeight: id === "about" ? 500 : 400,
            letterSpacing:"0.12em", fontSize:"0.88rem", textTransform:"uppercase",
            color: id === "about" ? C.copper : "rgba(255,255,255,0.78)",
            textDecoration:"none", padding:"1rem 0",
            borderBottom:"1px solid rgba(255,255,255,0.06)", transition:"color 0.2s",
            display:"block",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = C.copper; }}
            onMouseLeave={e => { e.currentTarget.style.color = id === "about" ? C.copper : "rgba(255,255,255,0.75)"; }}
          >{label}</a>
        ))}
        <a href="#contact" onClick={() => setMenuOpen(false)} style={{
          display:"inline-flex", marginTop:"1.25rem", alignSelf:"flex-start",
          background: C.copper, color: C.charcoal, padding:"0.75rem 1.75rem",
          fontFamily:"'DM Sans', sans-serif", fontWeight:500, letterSpacing:"0.12em",
          fontSize:"0.75rem", textTransform:"uppercase", textDecoration:"none",
        }}>Contact Us</a>
      </div>
      </div>
    )}
    </>
  );
}

// ── HERO / PAGE HEADER ───────────────────────────────────
function PageHero() {
  return (
    <section style={{
      background: C.dark, minHeight:"55vh",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"8rem 2.5rem 5rem", textAlign:"center", position:"relative", overflow:"hidden"
    }}>
      {/* subtle grid */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        {[20,40,60,80].map(p => <div key={p} style={{ position:"absolute", left:`${p}%`, top:0, bottom:0, width:"1px", background:"rgba(239,159,39,0.04)" }} />)}
      </div>
      <div style={{ position:"relative", animation:"fadeUp 0.8s ease both" }}>
        <SectionLabel text="Our Story" />
        <h1 style={{ fontFamily:"'DM Serif Display', serif", fontSize:"clamp(3rem,8vw,6rem)", fontWeight:400, color:C.white, lineHeight:0.95, marginBottom:"1.25rem" }}>
          About<br /><em style={{ color: C.copper, fontStyle:"italic" }}>AIC MAAMANI</em>
        </h1>
        <p style={{ fontFamily:"'DM Sans', sans-serif", fontWeight:300, fontSize:"1.05rem", color:"rgba(255,255,255,0.5)", maxWidth:"520px", lineHeight:1.75 }}>
          A church planted in faith, grown through grace — serving Nairobi and the nations since 1998.
        </p>
      </div>
    </section>
  );
}



// ── VISION & MISSION ─────────────────────────────────────
const VALUES = [
  { icon:"◎", label:"Rooted in Scripture", body:"Every decision, sermon, and ministry is anchored in the living Word of God — our ultimate authority." },
  { icon:"◈", label:"Radical Hospitality", body:"No one is a stranger here. We actively create space for the seeker, the wanderer, and the tired." },
  { icon:"◷", label:"Spirit-Led Worship", body:"We pursue encounters with the living God — in song, prayer, silence, and the ordinary rhythms of life." },
  { icon:"⊕", label:"City Transformation", body:"We believe the gospel changes neighbourhoods, systems, and societies — not just individual souls." },
];

function VisionMission() {
  const [ref, visible] = useInView(0.1);
  return (
    <section style={{ background: C.charcoal, padding:"var(--section-v, 5rem) var(--section-h, 2.5rem)" }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        <div className="grid-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"clamp(2rem,5vw,5rem)", alignItems:"start" }}>
          {/* left: big statement */}
          <div>
            <SectionLabel text="Vision & Mission" />
            <h2 style={{ fontFamily:"'DM Serif Display', serif", fontSize:"clamp(2rem,4vw,3.2rem)", color:C.white, lineHeight:1.1, marginBottom:"2rem" }}>
              To make disciples<br />who <em style={{ color: C.copper, fontStyle:"italic" }}>transform</em><br />the city.
            </h2>
            <div style={{ borderLeft:`3px solid ${C.copper}`, paddingLeft:"1.5rem", marginBottom:"1.5rem" }}>
              <p style={{ fontFamily:"'DM Sans', sans-serif", fontWeight:300, fontSize:"1rem", lineHeight:1.85, color:"rgba(255,255,255,0.6)" }}>
                <strong style={{ color:C.copper, fontWeight:500 }}>Our Vision</strong><br />
                To be a Christ-centered, SPirit-filled, life-giving church that leads people to Jesus, builds mature disciples, transforms families, serves the community, and bring hope to the world.
              </p>
            </div>
            <div style={{ borderLeft:`3px solid rgba(239,159,39,0.35)`, paddingLeft:"1.5rem" }}>
              <p style={{ fontFamily:"'DM Sans', sans-serif", fontWeight:300, fontSize:"1rem", lineHeight:1.85, color:"rgba(255,255,255,0.6)" }}>
                <strong style={{ color:C.white, fontWeight:500 }}>Our Mission</strong><br />
                To raise passionate followers of Jesus, empower believers through the Holy Spirit, and bring hope, healing, and transformation to our generation.
              </p>
            </div>
          </div>
          {/* right: values grid */}
          <div ref={ref} className="values-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.25rem" }}>
            {VALUES.map((v, i) => (
              <div key={v.label} style={{
                background:"rgba(255,255,255,0.04)", border:`1px solid rgba(239,159,39,0.12)`,
                padding:"1.5rem",
                opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)",
                transition:`opacity 0.45s ${i*0.1}s, transform 0.45s ${i*0.1}s`,
                cursor:"default",
                transition2:"border-color 0.2s"
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(239,159,39,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(239,159,39,0.12)"; }}
              >
                <div style={{ fontSize:"1.3rem", color: C.copper, marginBottom:"0.75rem" }}>{v.icon}</div>
                <h4 style={{ fontFamily:"'DM Serif Display', serif", fontSize:"1rem", color:C.white, marginBottom:"0.5rem" }}>{v.label}</h4>
                <p style={{ fontFamily:"'DM Sans', sans-serif", fontWeight:300, fontSize:"0.82rem", lineHeight:1.75, color:"rgba(255,255,255,0.45)" }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── WHAT WE BELIEVE — Accordion ──────────────────────────
const BELIEFS = [
  { title:"The Holy Scripture", body:"We believe the Bible — 66 books of the Old and New Testaments — is the fully inspired, inerrant Word of God, the supreme authority for faith and life.", ref:"2 Timothy 3:16–17" },
  { title:"The Trinity", body:"We believe in one God, eternally existing in three Persons: Father, Son, and Holy Spirit — co-equal, co-eternal, and co-essential in nature.", ref:"Matthew 28:19; John 1:1" },
  { title:"Salvation by Grace", body:"We believe that all humanity is fallen in sin and that salvation is a free gift of God's grace received through faith in Jesus Christ alone — not by works.", ref:"Ephesians 2:8–9" },
  { title:"The Resurrection", body:"We believe in the bodily resurrection of Jesus Christ from the dead, his ascension into heaven, and his coming again in glory to judge the living and the dead.", ref:"1 Corinthians 15:3–4" },
  { title:"Baptism", body:"We practice baptism by immersion as a public declaration of faith in Christ — an outward sign of an inward transformation, following the example of Jesus.", ref:"Romans 6:3–4" },
  { title:"The Holy Spirit", body:"We believe in the present ministry of the Holy Spirit who indwells every believer, empowers us for witness, and produces the fruit of Christlike character.", ref:"Acts 1:8; Galatians 5:22–23" },
  { title:"The Church", body:"We believe the local church is the primary expression of Christ's body on earth — called to gather, worship, disciple, and send.", ref:"Ephesians 4:11–13" },
];

function Accordion() {
  const [open, setOpen] = useState(0);
  return (
    <section style={{ background: C.stone, padding:"6rem 2.5rem" }}>
      <div style={{ maxWidth:"860px", margin:"0 auto" }}>
        <SectionLabel text="Theology" />
        <h2 style={{ fontFamily:"'DM Serif Display', serif", fontSize:"clamp(2rem,4vw,3rem)", color: C.charcoal, marginBottom:"3rem" }}>
          What We Believe
        </h2>
        <div style={{ borderTop:`1px solid rgba(95,94,90,0.25)` }}>
          {BELIEFS.map((b, i) => {
            const isOpen = open === i;
            return (
              <div key={b.title} style={{ borderBottom:`1px solid rgba(95,94,90,0.25)` }}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  style={{
                    width:"100%", padding:"1.4rem 0",
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    background:"transparent", border:"none", cursor:"pointer", textAlign:"left"
                  }}
                >
                  <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
                    <span style={{
                      fontFamily:"'DM Sans', sans-serif", fontWeight:400, fontSize:"0.65rem",
                      letterSpacing:"0.14em", color: isOpen ? C.copper : C.mid,
                      minWidth:"20px"
                    }}>0{i+1}</span>
                    <span style={{ fontFamily:"'DM Serif Display', serif", fontSize:"1.15rem", color: isOpen ? C.copper : C.charcoal, transition:"color 0.2s" }}>
                      {b.title}
                    </span>
                  </div>
                  <span style={{ fontSize:"1.2rem", color: C.copper, transition:"transform 0.3s", transform: isOpen ? "rotate(45deg)" : "rotate(0deg)", display:"inline-block" }}>+</span>
                </button>
                <div style={{
                  overflow:"hidden",
                  maxHeight: isOpen ? "200px" : "0",
                  transition:"max-height 0.4s ease",
                }}>
                  <div className="accordion-body" style={{ padding:"0 0 1.5rem 2.5rem" }}>
                    <p style={{ fontFamily:"'DM Sans', sans-serif", fontWeight:300, fontSize:"0.95rem", lineHeight:1.85, color: C.mid, marginBottom:"0.5rem" }}>{b.body}</p>
                    <span style={{ fontFamily:"'DM Serif Display', serif", fontStyle:"italic", fontSize:"0.85rem", color: C.copper }}>{b.ref}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── MEET THE PASTOR ──────────────────────────────────────
function MeetPastor() {
  const { pastorImageSrc } = usePastorImage();

  return (
    <section style={{ background: C.light, padding:"var(--section-v, 5rem) var(--section-h, 2.5rem)" }}>
      <div className="about-hero-grid" style={{ maxWidth:"1100px", margin:"0 auto", display:"grid", gridTemplateColumns:"min(340px, 100%) 1fr", gap:"clamp(2rem,5vw,5rem)", alignItems:"start" }}>
        {/* photo placeholder */}
        <div className="pastor-photo-col">
          <img
            src={pastorImageSrc}
            alt="Pr. Daniel Mutinda"
            onError={e => { e.currentTarget.src = "https://placehold.co/360x460/F2F1EF/2C2C2A?text=Add+Pastor+Photo"; }}
            style={{
              width:"100%",
              aspectRatio:"3/4",
              objectFit:"cover",
              objectPosition:"center 15%",
              border:`2px solid ${C.copper}`,
              display:"block",
              background:C.stone
              }}
            />
          {/* name plate */}
          <div style={{ marginTop:"1.25rem", paddingLeft:"0.25rem" }}>
            <div style={{ fontFamily:"'DM Serif Display', serif", fontSize:"1.3rem", color: C.charcoal }}>Pr. Daniel Mutinda</div>
            <div style={{ fontFamily:"'DM Sans', sans-serif", fontSize:"0.68rem", letterSpacing:"0.18em", textTransform:"uppercase", color: C.copper, marginTop:"0.3rem" }}>Senior Pastor · Lead Elder</div>
          </div>
        </div>
        {/* bio */}
        <div className="pastor-bio-col">
          <SectionLabel text="Meet the Pastor" />
          <h2 style={{ fontFamily:"'DM Serif Display', serif", fontSize:"clamp(1.8rem,3.5vw,2.8rem)", color: C.charcoal, lineHeight:1.15, marginBottom:"1.75rem" }}>
            A shepherd with<br />a heart for the city.
          </h2>
          {/* pull quote */}
          <blockquote style={{
            borderLeft:`4px solid ${C.copper}`, paddingLeft:"1.5rem",
            marginBottom:"2rem"
          }}>
            <p style={{ fontFamily:"'DM Serif Display', serif", fontStyle:"italic", fontSize:"1.2rem", color: C.charcoal, lineHeight:1.6 }}>
              "The church exists for those who aren't yet in it. Everything we do should make it easier for someone far from God to take one step closer."
            </p>
          </blockquote>
          <p style={{ fontFamily:"'DM Sans', sans-serif", fontWeight:300, fontSize:"0.95rem", lineHeight:1.9, color: C.mid, marginBottom:"1rem" }}>
           
          </p>
          <p style={{ fontFamily:"'DM Sans', sans-serif", fontWeight:300, fontSize:"0.95rem", lineHeight:1.9, color: C.mid, marginBottom:"2rem" }}>
            Under his leadership, AIC MAAMANI has grown into a vibrant, multigenerational congregation committed to sound doctrine, active service, and reaching the unreached in Kitui and beyond. Pastor Daniel is known for his accessible teaching style, pastoral accessibility, and deep commitment to equipping every believer for ministry — not just the ordained few.
          </p>
          {/* credentials row */}
          <div style={{ display:"flex", gap:"2rem", flexWrap:"wrap" }}>
            {["Mulango Bible College","8+ Years in Ministry","Senior Pastor · AIC MAAMANI"].map(t => (
              <div key={t} style={{ padding:"0.55rem 1rem", border:`1px solid rgba(95,94,90,0.25)` }}>
                <span style={{ fontFamily:"'DM Sans', sans-serif", fontWeight:400, fontSize:"0.73rem", color: C.mid }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TeamCard({ member, delay }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.white,
        border:`1px solid ${hovered ? C.copper : "rgba(95,94,90,0.18)"}`,
        overflow:"hidden", cursor:"default",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition:"transform 0.3s, border-color 0.25s",
        animationDelay:`${delay}s`
      }}
    >
      {/* avatar area */}
      <div style={{
        height: member.photo ? "300px" : "0px",
        background: hovered ? C.charcoal : C.stone,
        display: member.photo ? "flex" : "none",
        alignItems:"center", justifyContent:"center",
        transition:"background 0.3s", position:"relative",
        overflow:"hidden",
      }}>
        {member.photo && (
          <img
            src={resolveTeamPhoto(member.photo)}
            alt={member.name}
            style={{
              width:"100%",
              height:"100%",
              objectFit:"cover",
              objectPosition:"center 15%",
              display:"block",
            }}
          />
        )}
        {/* dept badge slides in on hover */}
        <div style={{
          position:"absolute", bottom:"12px", left:"50%", transform:"translateX(-50%)",
          opacity: hovered ? 1 : 0, transition:"opacity 0.3s",
          background: C.copper, padding:"3px 12px",
        }}>
          <span style={{ fontFamily:"'DM Sans', sans-serif", fontWeight:500, fontSize:"0.6rem", letterSpacing:"0.15em", textTransform:"uppercase", color: C.charcoal }}>{member.dept}</span>
        </div>
      </div>
      {/* dept badge for no-photo cards shown in info area */}
      {!member.photo && (
        <div style={{ padding:"0.65rem 1.25rem 0", display:"flex" }}>
          <span style={{ fontFamily:"'DM Sans', sans-serif", fontWeight:500, fontSize:"0.6rem", letterSpacing:"0.15em", textTransform:"uppercase", color: C.charcoal, background: C.copper, padding:"3px 12px" }}>{member.dept}</span>
        </div>
      )}
      {/* info */}
      <div style={{ padding:"1.25rem" }}>
        <h4 style={{ fontFamily:"'DM Serif Display', serif", fontSize:"1.05rem", color: C.charcoal, marginBottom:"0.3rem" }}>{member.name}</h4>
        <p style={{ fontFamily:"'DM Sans', sans-serif", fontWeight:300, fontSize:"0.78rem", letterSpacing:"0.05em", color: C.mid }}>{member.role}</p>
      </div>
    </div>
  );
}

function LeadershipTeam() {
  const [ref, visible] = useInView(0.1);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetchJson("/api/about/team")
      .then((data) => {
        if (!mounted || !Array.isArray(data)) return;
        setTeam(
          data.map((member, index) => ({
            name: member.name,
            role: member.role || "",
            dept: member.role || "Ministry",
            photo: member.photo || "",
            initials:
              member.name
                ?.split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase() || "TM",
            accent: index % 2 === 0 ? "#EF9F27" : "#5F5E5A",
          }))
        );
      })
      .catch(() => {
        if (mounted) setTeam([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section style={{ background: C.stone, padding:"var(--section-v, 5rem) var(--section-h, 2.5rem)" }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:"3rem", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <SectionLabel text="The Team" />
            <h2 style={{ fontFamily:"'DM Serif Display', serif", fontSize:"clamp(2rem,4vw,3rem)", color: C.charcoal }}>Leadership Team</h2>
          </div>
          <p className="leadership-desc" style={{ fontFamily:"'DM Sans', sans-serif", fontWeight:300, fontSize:"0.88rem", color: C.mid, maxWidth:"320px", lineHeight:1.7, textAlign:"right" }}>
            Our elders and ministry leads are men and women who serve with humility, integrity, and love.
          </p>
        </div>
        <div ref={ref} style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(270px, 1fr))", gap:"1.25rem" }}>
          {team.length === 0 ? (
            <div style={{ gridColumn:"1 / -1", textAlign:"center", padding:"48px 20px", color:C.mid, fontFamily:"'DM Sans', sans-serif" }}>
              Leadership data will appear here once it is connected.
            </div>
          ) : (
            team.map((m, i) => (
              <div key={m.name} style={{
                opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
                transition:`opacity 0.45s ${i * 0.08}s, transform 0.45s ${i * 0.08}s`
              }}>
                <TeamCard member={m} delay={i * 0.08} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

// ── ROOT ─────────────────────────────────────────────────
export default function AboutPage({ showNav = true } = {}) {
  return (
    <>
      <style>{fonts}</style>
      <style>{globalStyle}</style>
      {showNav && <Nav />}
      <PageHero />
      <VisionMission />
      <Accordion />
      <MeetPastor />
      <LeadershipTeam />
    </>
  );
}