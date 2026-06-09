import { useState, useEffect, useRef } from "react";
import { fetchJson } from "./api";

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

// ── Shared helpers ──────────────────────────────────────
const fonts = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');`;

const globalStyle = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; background: ${C.light}; color: ${C.charcoal}; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: ${C.mid}; border-radius: 3px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes lineGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
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
  { id: "about", label: "About" },
  { id: "sermons", label: "Sermons" },
  { id: "events", label: "Events" },
  { id: "blog", label: "Blog" },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact Us" },
];
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav className="about-nav" style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100, minHeight:"68px",
      background: scrolled ? "rgba(44,44,42,0.96)" : C.charcoal,
      borderBottom: scrolled ? `1px solid rgba(239,159,39,0.18)` : "none",
      backdropFilter: scrolled ? "blur(14px)" : "none",
      transition:"all 0.35s", padding:"0 2.5rem",
      display:"flex", alignItems:"center", justifyContent:"space-between"
    }}>
      <a href="#home" style={{ fontFamily:"'DM Serif Display', serif", fontSize:"1.4rem", color:C.white, textDecoration:"none", display:"flex", alignItems:"center", gap:"0.5rem" }}>
        <span style={{ color: C.copper }}>◈</span> Grace Covenant
      </a>
      <button
        type="button"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
          letterSpacing: "0.14em",
          fontSize: "0.85rem",
          textTransform: "uppercase",
          color: "#fff",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 999,
          padding: "0.55rem 1rem",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        <span>☰</span>
        <span>MENU</span>
      </button>
      <div className="nav-inner nav-links" style={{ display:"flex", gap:"2.2rem", alignItems:"center", flexWrap:"wrap", justifyContent:"flex-end" }}>
        {NAV_LINKS.map(({ id, label }) => (
          <a key={id} className="nav-link" href={`#${id}`} style={{
            fontFamily:"'DM Sans', sans-serif", fontWeight: label === "About" ? 500 : 400,
            letterSpacing:"0.1em", fontSize:"0.78rem", textTransform:"uppercase",
            color: label === "About" ? C.copper : "rgba(255,255,255,0.7)",
            textDecoration:"none", transition:"color 0.2s", whiteSpace:"nowrap"
          }}
            onMouseEnter={e => { e.currentTarget.style.color = C.copper; }}
            onMouseLeave={e => { e.currentTarget.style.color = label === "About" ? C.copper : "rgba(255,255,255,0.7)"; }}
          >{label}</a>
        ))}
        <a className="nav-cta" href="#contact" style={{
          background: C.copper, color: C.charcoal, padding:"0.5rem 1.4rem",
          fontFamily:"'DM Sans', sans-serif", fontWeight:500, letterSpacing:"0.12em",
          fontSize:"0.75rem", textTransform:"uppercase", textDecoration:"none", whiteSpace:"nowrap"
        }}>Contact Us</a>
      </div>
    </nav>
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
          About<br /><em style={{ color: C.copper, fontStyle:"italic" }}>Grace Covenant</em>
        </h1>
        <p style={{ fontFamily:"'DM Sans', sans-serif", fontWeight:300, fontSize:"1.05rem", color:"rgba(255,255,255,0.5)", maxWidth:"520px", lineHeight:1.75 }}>
          A church planted in faith, grown through grace — serving Nairobi and the nations since 1998.
        </p>
      </div>
    </section>
  );
}

// ── OUR STORY + TIMELINE ─────────────────────────────────
const TIMELINE = [
  { year:"1998", title:"The Beginning", body:"Rev. Samuel Waweru and 14 founding members gather in a living room in Westlands to pray, study Scripture, and believe God for something bigger." },
  { year:"2002", title:"First Building", body:"After four years in rented halls, the congregation moves into its first permanent home on Ngong Road — a 200-seat space that fills up within months." },
  { year:"2007", title:"Planting Missions", body:"Grace Covenant sends its first missionary family to South Sudan, beginning a cross-cultural outreach ministry now active in 12 nations." },
  { year:"2013", title:"Upper Hill Campus", body:"The current 1,400-seat sanctuary in Upper Hill is consecrated, becoming a landmark of faith in Nairobi's heart." },
  { year:"2019", title:"City & Online", body:"Live-streamed services launch and reach 40+ countries. A second campus opens in Rongai to serve the growing south Nairobi community." },
  { year:"2024", title:"Today", body:"With over 2,400 members, 14 active ministries, and a heart for the city, Grace Covenant continues to grow — one life at a time." },
];

function Timeline() {
  const [ref, visible] = useInView(0.1);
  return (
    <section style={{ background: C.light, padding:"6rem 2.5rem" }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        <div style={{ marginBottom:"4rem" }}>
          <SectionLabel text="Our History" />
          <h2 style={{ fontFamily:"'DM Serif Display', serif", fontSize:"clamp(2rem,4vw,3rem)", color: C.charcoal }}>
            How We Got Here
          </h2>
        </div>
        <div ref={ref} style={{ position:"relative" }}>
          {/* vertical spine */}
          <div style={{ position:"absolute", left:"118px", top:0, bottom:0, width:"1px", background:`rgba(95,94,90,0.2)` }} />
          {TIMELINE.map((item, i) => (
            <div key={item.year} className="timeline-row" style={{
              opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
              transition:`opacity 0.5s ${i * 0.1}s, transform 0.5s ${i * 0.1}s`
            }}>
              {/* year col */}
              <div style={{ textAlign:"right", paddingRight:"1.5rem", paddingTop:"4px", position:"relative" }}>
                <span style={{ fontFamily:"'DM Serif Display', serif", fontSize:"1.5rem", color: item.year === "2024" ? C.copper : C.mid, fontWeight:400 }}>{item.year}</span>
                {/* dot on spine */}
                <div style={{
                  position:"absolute", right:"-6px", top:"10px",
                  width:"11px", height:"11px", borderRadius:"50%",
                  background: item.year === "2024" ? C.copper : C.stone,
                  border: `2px solid ${item.year === "2024" ? C.copper : C.mid}`,
                  zIndex:1
                }} />
              </div>
              {/* content col */}
              <div style={{ paddingBottom:"0.5rem" }}>
                <h3 style={{ fontFamily:"'DM Serif Display', serif", fontSize:"1.2rem", color: C.charcoal, marginBottom:"0.4rem" }}>{item.title}</h3>
                <p style={{ fontFamily:"'DM Sans', sans-serif", fontWeight:300, fontSize:"0.9rem", lineHeight:1.8, color: C.mid }}>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
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
    <section style={{ background: C.charcoal, padding:"6rem 2.5rem" }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        <div className="grid-stack" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5rem", alignItems:"start" }}>
          {/* left: big statement */}
          <div>
            <SectionLabel text="Vision & Mission" />
            <h2 style={{ fontFamily:"'DM Serif Display', serif", fontSize:"clamp(2rem,4vw,3.2rem)", color:C.white, lineHeight:1.1, marginBottom:"2rem" }}>
              To make disciples<br />who <em style={{ color: C.copper, fontStyle:"italic" }}>transform</em><br />the city.
            </h2>
            <div style={{ borderLeft:`3px solid ${C.copper}`, paddingLeft:"1.5rem", marginBottom:"1.5rem" }}>
              <p style={{ fontFamily:"'DM Sans', sans-serif", fontWeight:300, fontSize:"1rem", lineHeight:1.85, color:"rgba(255,255,255,0.6)" }}>
                <strong style={{ color:C.copper, fontWeight:500 }}>Our Vision</strong><br />
                A Nairobi — and a world — shaped by the grace, justice, and love of Jesus Christ.
              </p>
            </div>
            <div style={{ borderLeft:`3px solid rgba(239,159,39,0.35)`, paddingLeft:"1.5rem" }}>
              <p style={{ fontFamily:"'DM Sans', sans-serif", fontWeight:300, fontSize:"1rem", lineHeight:1.85, color:"rgba(255,255,255,0.6)" }}>
                <strong style={{ color:C.white, fontWeight:500 }}>Our Mission</strong><br />
                To gather, grow, and send people who follow Jesus wholeheartedly — in every neighbourhood, vocation, and season of life.
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
                  <div style={{ padding:"0 0 1.5rem 2.5rem" }}>
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
  return (
    <section style={{ background: C.light, padding:"6rem 2.5rem" }}>
      <div className="hero-grid" style={{ maxWidth:"1100px", margin:"0 auto", display:"grid", gridTemplateColumns:"340px 1fr", gap:"5rem", alignItems:"start" }}>
        {/* photo placeholder */}
        <div>
          <div style={{
            width:"100%", aspectRatio:"3/4",
            background: C.stone,
            border:`2px solid ${C.copper}`,
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            gap:"0.5rem"
          }}>
            <div style={{ fontSize:"4rem", color: C.mid, opacity:0.4 }}>◈</div>
            <span style={{ fontFamily:"'DM Sans', sans-serif", fontSize:"0.7rem", letterSpacing:"0.15em", textTransform:"uppercase", color: C.mid, opacity:0.5 }}>Photo</span>
          </div>
          {/* name plate */}
          <div style={{ marginTop:"1.25rem", paddingLeft:"0.25rem" }}>
            <div style={{ fontFamily:"'DM Serif Display', serif", fontSize:"1.3rem", color: C.charcoal }}>Rev. Samuel Waweru</div>
            <div style={{ fontFamily:"'DM Sans', sans-serif", fontSize:"0.68rem", letterSpacing:"0.18em", textTransform:"uppercase", color: C.copper, marginTop:"0.3rem" }}>Senior Pastor · Lead Elder</div>
          </div>
        </div>
        {/* bio */}
        <div>
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
            Samuel Waweru was born in Nyeri and came to faith at the age of 19 while studying at the University of Nairobi. He went on to earn a Bachelor of Theology from Pan Africa Christian University and a Master of Divinity from Wheaton College, Illinois.
          </p>
          <p style={{ fontFamily:"'DM Sans', sans-serif", fontWeight:300, fontSize:"0.95rem", lineHeight:1.9, color: C.mid, marginBottom:"1rem" }}>
            After serving as an associate pastor in Mombasa for five years, he returned to Nairobi with a mandate to plant a church that would be a home for the spiritually hungry and the socially marginalized alike. Grace Covenant was that church.
          </p>
          <p style={{ fontFamily:"'DM Sans', sans-serif", fontWeight:300, fontSize:"0.95rem", lineHeight:1.9, color: C.mid, marginBottom:"2rem" }}>
            He is married to Grace (the church jokes that the name was prophetic), and they have three children: Caleb, Naomi, and Ruth. He is an avid reader, an occasional long-distance runner, and a devoted fan of Kenyan coffee.
          </p>
          {/* credentials row */}
          <div style={{ display:"flex", gap:"2rem", flexWrap:"wrap" }}>
            {["B.Th · Pan Africa Christian University","M.Div · Wheaton College, IL","26 Years in Ministry"].map(t => (
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

// ── LEADERSHIP TEAM ──────────────────────────────────────
const fallbackTeam = [
  { name:"Dr. Joyce Kamau", role:"Associate Pastor", dept:"Pastoral Care", initials:"JK", accent: "#EF9F27" },
  { name:"Elder Peter Ndirangu", role:"Elder & Treasurer", dept:"Governance", initials:"PN", accent: "#5F5E5A" },
  { name:"Pastor Ruth Akinyi", role:"Women's Ministry", dept:"Ministry", initials:"RA", accent: "#EF9F27" },
  { name:"Deacon Tom Mwangi", role:"Worship Director", dept:"Creative Arts", initials:"TM", accent: "#5F5E5A" },
  { name:"Sister Faith Ouma", role:"Children's Church", dept:"Next Gen", initials:"FO", accent: "#EF9F27" },
  { name:"Elder David Wekesa", role:"Outreach Elder", dept:"Missions", initials:"DW", accent: "#5F5E5A" },
];

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
        height:"180px", background: hovered ? C.charcoal : C.stone,
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"background 0.3s", position:"relative"
      }}>
        <div style={{
          width:"80px", height:"80px", borderRadius:"50%",
          background: hovered ? `${member.accent}22` : C.light,
          border:`2px solid ${member.accent}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"'DM Serif Display', serif", fontSize:"1.5rem",
          color: member.accent, transition:"all 0.3s"
        }}>{member.initials}</div>
        {/* dept badge slides in on hover */}
        <div style={{
          position:"absolute", bottom:"12px", left:"50%", transform:"translateX(-50%)",
          opacity: hovered ? 1 : 0, transition:"opacity 0.3s",
          background: C.copper, padding:"3px 12px",
        }}>
          <span style={{ fontFamily:"'DM Sans', sans-serif", fontWeight:500, fontSize:"0.6rem", letterSpacing:"0.15em", textTransform:"uppercase", color: C.charcoal }}>{member.dept}</span>
        </div>
      </div>
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
  const [team, setTeam] = useState(fallbackTeam);

  useEffect(() => {
    let mounted = true;
    fetchJson("/api/about/team")
      .then((data) => {
        if (!mounted || !Array.isArray(data) || !data.length) return;
        setTeam(
          data.map((member, index) => ({
            name: member.name,
            role: member.role || "",
            dept: member.role || "Ministry",
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
        if (mounted) setTeam(fallbackTeam);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section style={{ background: C.stone, padding:"6rem 2.5rem" }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:"3rem", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <SectionLabel text="The Team" />
            <h2 style={{ fontFamily:"'DM Serif Display', serif", fontSize:"clamp(2rem,4vw,3rem)", color: C.charcoal }}>Leadership Team</h2>
          </div>
          <p style={{ fontFamily:"'DM Sans', sans-serif", fontWeight:300, fontSize:"0.88rem", color: C.mid, maxWidth:"320px", lineHeight:1.7, textAlign:"right" }}>
            Our elders, deacons, and ministry leads are men and women who serve with humility, integrity, and love.
          </p>
        </div>
        <div ref={ref} style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(270px, 1fr))", gap:"1.25rem" }}>
          {team.map((m, i) => (
            <div key={m.name} style={{
              opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
              transition:`opacity 0.45s ${i * 0.08}s, transform 0.45s ${i * 0.08}s`
            }}>
              <TeamCard member={m} delay={i * 0.08} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FOOTER ───────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: C.dark, borderTop:`1px solid rgba(239,159,39,0.12)`, padding:"3rem 2.5rem", textAlign:"center" }}>
      <div style={{ fontFamily:"'DM Serif Display', serif", fontSize:"1.35rem", color:C.white, marginBottom:"0.4rem", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem" }}>
        <span style={{ color: C.copper }}>◈</span> Grace Covenant
      </div>
      <p style={{ fontFamily:"'DM Sans', sans-serif", fontWeight:300, fontSize:"0.73rem", letterSpacing:"0.12em", color:"rgba(255,255,255,0.3)", marginBottom:"1.75rem" }}>
        A Church for Every Soul · Upper Hill, Nairobi
      </p>
      <div style={{ display:"flex", justifyContent:"center", gap:"2.5rem", flexWrap:"wrap" }}>
        {NAV_LINKS.map(({ id, label }) => (
          <a key={id} href={`#${id}`} style={{
            fontFamily:"'DM Sans', sans-serif", fontWeight:400, fontSize:"0.7rem",
            letterSpacing:"0.14em", textTransform:"uppercase",
            color:"rgba(255,255,255,0.35)", textDecoration:"none", transition:"color 0.2s"
          }}
            onMouseEnter={e => { e.target.style.color = C.copper; }}
            onMouseLeave={e => { e.target.style.color = "rgba(255,255,255,0.35)"; }}
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
            color: "rgba(255,255,255,0.35)",
            textDecoration: "none",
            transition: "all 0.2s",
            marginLeft: "0.25rem",
            fontSize: "0.82rem",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = C.copper;
            e.currentTarget.style.borderColor = C.copper;
            e.currentTarget.style.background = "rgba(239,159,39,0.08)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = "rgba(255,255,255,0.35)";
            e.currentTarget.style.borderColor = "rgba(239,159,39,0.28)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          ◈
        </a>
      </div>
      <div style={{ marginTop:"2rem", fontFamily:"'DM Sans', sans-serif", fontWeight:300, fontSize:"0.63rem", letterSpacing:"0.1em", color:"rgba(255,255,255,0.18)" }}>
        © 2025 Grace Covenant Church. Built with faith & care.
      </div>
    </footer>
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
      <Timeline />
      <VisionMission />
      <Accordion />
      <MeetPastor />
      <LeadershipTeam />
      <Footer />
    </>
  );
}
