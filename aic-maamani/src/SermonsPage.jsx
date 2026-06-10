import React, { useState, useMemo, useEffect, useRef } from "react";
import { fetchJson } from "./api";

const COPPER = "#EF9F27";
const CHARCOAL = "#2C2C2A";
const LIGHT_GRAY = "#F2F1EF";
const MID_GRAY = "#5F5E5A";
const COPPER_LIGHT = "#FDF3E3";
const COPPER_DARK = "#C97F10";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${LIGHT_GRAY}; font-family: 'DM Sans', sans-serif; color: ${CHARCOAL}; }
  input, select { font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${LIGHT_GRAY}; }
  ::-webkit-scrollbar-thumb { background: #C8C7C4; border-radius: 3px; }
`;

// ─── Breakpoint hook ──────────────────────────────────────────────────────────
function useBreakpoint() {
  const getBreakpoint = () => {
    const w = window.innerWidth;
    if (w < 480) return "xs";
    if (w < 768) return "sm";
    if (w < 1024) return "md";
    return "lg";
  };
  const [bp, setBp] = useState(() => (typeof window !== "undefined" ? getBreakpoint() : "lg"));
  useEffect(() => {
    const handler = () => setBp(getBreakpoint());
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  const isMobile = bp === "xs" || bp === "sm";
  const isTablet = bp === "md";
  const isDesktop = bp === "lg";
  return { bp, isMobile, isTablet, isDesktop };
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function PlayIcon({ size = 20, color = "white" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><polygon points="5,3 19,12 5,21" /></svg>;
}
function DownloadIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
}
function BookIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>;
}
function SearchIcon({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={MID_GRAY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
}

// ─── Sermon Notes Reader Modal ───────────────────────────────────────────────
function SermonNotesReader({ sermon, notesMap, onClose }) {
  const notes = notesMap[sermon.id];
  const scrollRef = useRef(null);
  const [readProgress, setReadProgress] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [activeSection, setActiveSection] = useState(0);
  const [showOutline, setShowOutline] = useState(false);
  const { isMobile, isTablet } = useBreakpoint();
  const collapseSidebar = isMobile || isTablet;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
    setReadProgress(Math.min(100, Math.round(pct)));
  };

  const dateStr = new Date(sermon.date).toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  if (!notes) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(44,44,42,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
        <div style={{ background: "white", borderRadius: 16, padding: isMobile ? 28 : 48, maxWidth: 400, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>Notes Coming Soon</h3>
          <p style={{ color: MID_GRAY, fontSize: 14, marginBottom: 24 }}>The notes for this sermon are being prepared.</p>
          <button onClick={onClose} style={{ background: CHARCOAL, color: "white", border: "none", borderRadius: 8, padding: "10px 24px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(20,20,18,0.75)", display: "flex", alignItems: "stretch", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0 }} onClick={onClose} />
      <div style={{ position: "relative", width: "100%", maxWidth: 780, background: "#FAFAF8", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.4)", zIndex: 1 }}>

        {/* Progress bar */}
        <div style={{ height: 3, background: "#EAE9E6", position: "absolute", top: 0, left: 0, right: 0, zIndex: 2 }}>
          <div style={{ height: "100%", width: `${readProgress}%`, background: COPPER, transition: "width 0.2s" }} />
        </div>

        {/* Header toolbar */}
        <div style={{ padding: isMobile ? "14px 16px 12px" : "20px 32px 16px", borderBottom: "1px solid #E8E7E4", display: "flex", alignItems: "center", gap: isMobile ? 8 : 16, background: "white", marginTop: 3, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: COPPER, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 3 }}>{sermon.scripture}</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 15 : 18, fontWeight: 600, color: CHARCOAL, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sermon.title}</h2>
            {!isMobile && <div style={{ fontSize: 12, color: MID_GRAY, marginTop: 2 }}>{sermon.speaker} · {dateStr}</div>}
          </div>

          {/* Outline toggle on mobile/tablet */}
          {collapseSidebar && (
            <button onClick={() => setShowOutline(!showOutline)} style={{ display: "flex", alignItems: "center", gap: 5, background: showOutline ? COPPER_LIGHT : "#F2F1EF", color: showOutline ? COPPER_DARK : MID_GRAY, border: "none", borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
              <BookIcon size={13} /> Outline
            </button>
          )}

          {/* Font size */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #E0DFDB", borderRadius: 8, padding: "4px 10px", flexShrink: 0 }}>
            <button onClick={() => setFontSize(f => Math.max(13, f - 1))} style={{ background: "none", border: "none", cursor: "pointer", color: MID_GRAY, fontSize: 16, lineHeight: 1, padding: "2px 4px" }}>A</button>
            <div style={{ width: 1, height: 16, background: "#E0DFDB" }} />
            <button onClick={() => setFontSize(f => Math.min(22, f + 1))} style={{ background: "none", border: "none", cursor: "pointer", color: CHARCOAL, fontSize: 20, lineHeight: 1, padding: "2px 4px" }}>A</button>
          </div>

          {/* Download — hide label on mobile */}
          <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 7, background: COPPER_LIGHT, color: COPPER_DARK, border: "none", borderRadius: 8, padding: "9px 12px", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
            <DownloadIcon size={14} /> {!isMobile && "Download PDF"}
          </button>

          {/* Close */}
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 8, background: "#F2F1EF", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: MID_GRAY, flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Collapsible outline on mobile */}
        {collapseSidebar && showOutline && (
          <div style={{ background: "#F7F6F4", borderBottom: "1px solid #E8E7E4", padding: "16px 0", maxHeight: 240, overflowY: "auto" }}>
            <div style={{ padding: "0 16px 10px", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9E9D99" }}>Outline</div>
            {notes.outline.map((item, i) => (
              <button key={i} onClick={() => { setActiveSection(i); setShowOutline(false); const el = document.getElementById(`section-${i}`); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 16px", background: activeSection === i ? COPPER_LIGHT : "transparent", border: "none", borderLeft: `3px solid ${activeSection === i ? COPPER : "transparent"}`, cursor: "pointer" }}>
                <div style={{ fontSize: 11, color: activeSection === i ? COPPER_DARK : COPPER, fontWeight: 600, marginBottom: 2 }}>{item.ref}</div>
                <div style={{ fontSize: 13, color: activeSection === i ? CHARCOAL : "#555553", lineHeight: 1.35, fontFamily: "'DM Sans', sans-serif" }}>{item.point}</div>
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>

          {/* Sidebar — only on desktop */}
          {!collapseSidebar && (
            <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid #E8E7E4", background: "#F7F6F4", overflowY: "auto", padding: "24px 0" }}>
              <div style={{ padding: "0 20px 12px", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9E9D99" }}>Outline</div>
              {notes.outline.map((item, i) => (
                <button key={i} onClick={() => { setActiveSection(i); const el = document.getElementById(`section-${i}`); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 20px", background: activeSection === i ? COPPER_LIGHT : "transparent", border: "none", borderLeft: `3px solid ${activeSection === i ? COPPER : "transparent"}`, cursor: "pointer", transition: "background 0.15s" }}>
                  <div style={{ fontSize: 11, color: activeSection === i ? COPPER_DARK : COPPER, fontWeight: 600, marginBottom: 2 }}>{item.ref}</div>
                  <div style={{ fontSize: 13, color: activeSection === i ? CHARCOAL : "#555553", lineHeight: 1.35, fontFamily: "'DM Sans', sans-serif" }}>{item.point}</div>
                </button>
              ))}
              <div style={{ margin: "20px 20px 12px", borderTop: "1px solid #E2E1DE" }} />
              <div style={{ padding: "0 20px 10px", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9E9D99" }}>Sections</div>
              {notes.sections.map((s, i) => (
                <button key={i} onClick={() => { const el = document.getElementById(`prose-${i}`); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "7px 20px", background: "transparent", border: "none", cursor: "pointer" }}>
                  <div style={{ fontSize: 12, color: MID_GRAY, fontFamily: "'DM Sans', sans-serif" }}>{s.heading}</div>
                </button>
              ))}
            </div>
          )}

          {/* Main reading area */}
          <div ref={scrollRef} onScroll={handleScroll} style={{ flex: 1, overflowY: "auto", padding: isMobile ? "24px 16px 40px" : "40px 48px 60px" }}>

            {/* Key Scriptures */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: COPPER, marginBottom: 16 }}>Key Scriptures</div>
              {notes.keyScriptures.map((ks, i) => (
                <div key={i} style={{ borderLeft: `3px solid ${COPPER}`, paddingLeft: 20, marginBottom: 16, background: COPPER_LIGHT, borderRadius: "0 8px 8px 0", padding: "14px 18px 14px 20px" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: fontSize, lineHeight: 1.7, color: CHARCOAL, marginBottom: 6 }}>"{ks.text}"</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: COPPER_DARK }}>— {ks.ref}</div>
                </div>
              ))}
            </div>

            {/* Outline */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: COPPER, marginBottom: 16 }}>Message Outline</div>
              {notes.outline.map((item, i) => (
                <div key={i} id={`section-${i}`} style={{ display: "flex", gap: 16, marginBottom: 14, padding: "14px 18px", background: "white", borderRadius: 10, border: "1px solid #EAE9E5" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: CHARCOAL, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0, marginTop: 2 }}>{i + 1}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL, marginBottom: 2 }}>{item.point} <span style={{ color: COPPER, fontWeight: 400 }}>· {item.ref}</span></div>
                    <div style={{ fontSize: 13, color: MID_GRAY, lineHeight: 1.5 }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sermon body sections */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: COPPER, marginBottom: 20 }}>Sermon Notes</div>
              {notes.sections.map((sec, i) => (
                <div key={i} id={`prose-${i}`} style={{ marginBottom: 28 }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: fontSize + 3, fontWeight: 600, color: CHARCOAL, marginBottom: 10, lineHeight: 1.3 }}>{sec.heading}</h3>
                  <p style={{ fontSize: fontSize, color: "#3A3A38", lineHeight: 1.85, fontFamily: "'DM Sans', sans-serif" }}>{sec.body}</p>
                  {i < notes.sections.length - 1 && <div style={{ marginTop: 24, borderBottom: "1px dashed #DEDCDA" }} />}
                </div>
              ))}
            </div>

            {/* Reflection Questions */}
            <div style={{ background: CHARCOAL, borderRadius: 12, padding: isMobile ? "20px 16px" : "28px 32px", marginBottom: 32 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: COPPER, marginBottom: 16 }}>Reflection Questions</div>
              {notes.reflectionQuestions.map((q, i) => (
                <div key={i} style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(239,159,39,0.2)", border: `1px solid ${COPPER}`, color: COPPER, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, flexShrink: 0, marginTop: 2 }}>{i + 1}</div>
                  <p style={{ fontSize: fontSize - 1, color: "rgba(255,255,255,0.85)", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>{q}</p>
                </div>
              ))}
            </div>

            {/* Closing Prayer */}
            <div style={{ borderLeft: `3px solid ${COPPER}`, paddingLeft: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: COPPER, marginBottom: 10 }}>Closing Prayer</div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: fontSize, color: MID_GRAY, lineHeight: 1.8 }}>{notes.prayer}</p>
            </div>

            {/* Read progress */}
            <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 4, background: "#EAE9E6", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${readProgress}%`, background: COPPER, borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 12, color: MID_GRAY, flexShrink: 0 }}>{readProgress}% read</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Audio Player ─────────────────────────────────────────────────────────────
// Safely parse a duration string like "45 min", "1h 20m", "1:20" into total minutes.
function parseDurationMinutes(duration) {
  if (!duration || duration === "—") return 0;
  const hm = duration.match(/(\d+)\s*h(?:r|ours?)?\s*(\d+)?\s*m?/i);
  if (hm) return parseInt(hm[1]) * 60 + parseInt(hm[2] || 0);
  const colons = duration.match(/^(\d+):(\d+)(?::\d+)?$/);
  if (colons) return parseInt(colons[1]) * 60 + parseInt(colons[2]);
  const mins = duration.match(/(\d+)\s*min/i);
  if (mins) return parseInt(mins[1]);
  const plain = parseInt(duration);
  return isNaN(plain) ? 0 : plain;
}

function AudioPlayer({ duration }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const totalMinutes = parseDurationMinutes(duration);
  return (
    <div style={{ background: CHARCOAL, borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
      <button onClick={() => setPlaying(!playing)} style={{ width: 44, height: 44, borderRadius: "50%", background: COPPER, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "transform 0.15s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
        {playing ? <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg> : <PlayIcon size={16} />}
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ height: 4, background: "#444440", borderRadius: 2, cursor: "pointer" }} onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setProgress(((e.clientX - r.left) / r.width) * 100); }}>
          <div style={{ height: "100%", width: `${progress}%`, background: COPPER, borderRadius: 2 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 12, color: "#888", fontFamily: "'DM Sans', sans-serif" }}>{Math.floor(progress / 100 * totalMinutes)} min</span>
          <span style={{ fontSize: 12, color: "#888", fontFamily: "'DM Sans', sans-serif" }}>{duration}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Video Embed ──────────────────────────────────────────────────────────────
function isVideoFile(url) { return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url || ""); }
function isAudioFile(url) { return /\.(mp3|wav|m4a|ogg|aac)(\?|$)/i.test(url || ""); }

function VideoEmbed({ url }) {
  const [loaded, setLoaded] = useState(false);
  if (isVideoFile(url)) {
    return <video controls autoPlay src={url} style={{ width: "100%", borderRadius: 10, background: "#1a1a1a" }} />;
  }
  return (
    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 10, overflow: "hidden", background: "#1a1a1a" }}>
      {!loaded && (
        <div onClick={() => setLoaded(true)} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#111" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: COPPER, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
            <PlayIcon size={24} />
          </div>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Tap to load video</span>
        </div>
      )}
      {loaded && <iframe title="Sermon player" src={url + "?autoplay=1"} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} frameBorder="0" allow="autoplay; fullscreen" allowFullScreen />}
    </div>
  );
}

// ─── Sermon Media ─────────────────────────────────────────────────────────────
function SermonMedia({ sermon }) {
  if (sermon.videoUrl) return <VideoEmbed url={sermon.videoUrl} />;
  if (sermon.audioUrl) {
    if (isAudioFile(sermon.audioUrl)) return <audio controls src={sermon.audioUrl} style={{ width: "100%" }} />;
    return <AudioPlayer duration={sermon.duration} />;
  }
  if (sermon.documentUrl) {
    return (
      <a href={sermon.documentUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: COPPER, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
        <DownloadIcon size={14} /> Download document
      </a>
    );
  }
  return <AudioPlayer duration={sermon.duration} />;
}

// ─── Featured Sermon ──────────────────────────────────────────────────────────
function FeaturedSermon({ sermon, seriesData, onReadNotes }) {
  const { isMobile, isTablet } = useBreakpoint();
  const stackLayout = isMobile || isTablet;

  if (!sermon) {
    return (
      <div style={{ background: CHARCOAL, borderRadius: 16, padding: "32px 24px", marginBottom: 40, color: "white", fontFamily: "'DM Sans', sans-serif" }}>
        Sermon data will appear here once it is connected.
      </div>
    );
  }

  return (
    <div style={{ background: CHARCOAL, borderRadius: 16, overflow: "hidden", display: "grid", gridTemplateColumns: stackLayout ? "1fr" : "1fr 1fr", gap: 0, marginBottom: 40 }}>
      <div style={{ position: "relative" }}>
        {sermon.thumbnail ? (
          <img src={sermon.thumbnail} alt={sermon.title} style={{ width: "100%", height: stackLayout ? 220 : "100%", objectFit: "cover", minHeight: stackLayout ? "unset" : 360, display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: stackLayout ? 220 : 360, background: "#3A3A38" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: stackLayout ? "linear-gradient(to bottom, transparent 40%, rgba(44,44,42,0.85))" : `linear-gradient(to right, transparent 60%, ${CHARCOAL})` }} />
        <div style={{ position: "absolute", top: 16, left: 16 }}>
          <span style={{ background: COPPER, color: CHARCOAL, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "5px 12px", borderRadius: 20 }}>Latest Sermon</span>
        </div>
      </div>
      <div style={{ padding: stackLayout ? "24px 20px 28px" : "40px 40px 36px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, color: COPPER, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
            {sermon.series ? seriesData.find(s => s.id === sermon.series)?.title : sermon.topic}
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 20 : 26, fontWeight: 600, color: "white", lineHeight: 1.3, marginBottom: 12 }}>{sermon.title}</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{sermon.speaker}</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
            <span style={{ fontSize: 13, color: COPPER }}>{sermon.scripture}</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{sermon.duration}</span>
          </div>
          <SermonMedia sermon={sermon} />
        </div>
        {sermon.hasNotes && (
          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            <button onClick={() => onReadNotes(sermon)} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: COPPER, color: CHARCOAL, border: "none", borderRadius: 8, padding: "10px 18px", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.opacity = "0.9"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
              <BookIcon size={15} /> Read Notes
            </button>
            {sermon.documentUrl ? (
              <a href={sermon.documentUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)", borderRadius: 8, padding: "10px 18px", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", textDecoration: "none" }} onMouseEnter={e => { e.currentTarget.style.borderColor = COPPER; e.currentTarget.style.color = COPPER; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}>
                <DownloadIcon size={15} /> Download document
              </a>
            ) : (
              <button disabled style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.35)", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "not-allowed" }}>
                <DownloadIcon size={15} /> No document
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sermon Card ──────────────────────────────────────────────────────────────
function SermonCard({ sermon, onReadNotes }) {
  const [hovered, setHovered] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const dateStr = new Date(sermon.date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ background: "white", borderRadius: 14, overflow: "hidden", border: `1px solid ${hovered ? "#D9C4A8" : "#E6E5E2"}`, transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s", transform: hovered ? "translateY(-3px)" : "none", boxShadow: hovered ? "0 8px 32px rgba(44,44,42,0.1)" : "none" }}>
      <div style={{ position: "relative", overflow: "hidden", height: 170, background: "#3A3A38" }}>
        {sermon.thumbnail && (
          <img
            src={sermon.thumbnail}
            alt={sermon.title}
            style={{ width: "100%", height: 170, objectFit: "cover", display: "block", transition: "transform 0.4s", transform: hovered ? "scale(1.04)" : "scale(1)" }}
            onError={e => { e.currentTarget.style.display = "none"; }}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(44,44,42,0.6), transparent)" }} />
        <div style={{ position: "absolute", bottom: 10, left: 12, right: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <span style={{ background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.9)", fontSize: 11, padding: "3px 9px", borderRadius: 12 }}>{sermon.duration}</span>
          {sermon.videoUrl && <span style={{ background: COPPER, color: CHARCOAL, fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 12 }}>VIDEO</span>}
        </div>
      </div>
      <div style={{ padding: "16px 18px 18px" }}>
        <div style={{ fontSize: 11, color: COPPER, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{sermon.scripture}</div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: CHARCOAL, lineHeight: 1.4, marginBottom: 8, minHeight: 44 }}>{sermon.title}</h3>
        <div style={{ fontSize: 12, color: MID_GRAY, marginBottom: 14 }}>{sermon.speaker} · {dateStr}</div>
        {showPlayer && <div style={{ marginBottom: 14 }}><SermonMedia sermon={sermon} /></div>}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowPlayer(!showPlayer)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: showPlayer ? COPPER : CHARCOAL, color: "white", border: "none", borderRadius: 8, padding: "9px 14px", cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", transition: "background 0.2s" }}>
            <PlayIcon size={13} /> {showPlayer ? "Playing" : "Listen"}
          </button>
          {sermon.hasNotes && (
            <button onClick={() => onReadNotes(sermon)} style={{ display: "flex", alignItems: "center", gap: 6, background: COPPER_LIGHT, color: COPPER_DARK, border: "none", borderRadius: 8, padding: "9px 14px", cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#FAE5C0"} onMouseLeave={e => e.currentTarget.style.background = COPPER_LIGHT} title="Read sermon notes">
              <BookIcon size={13} /> Read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Series Row ───────────────────────────────────────────────────────────────
function SeriesRow({ series, sermons, onReadNotes }) {
  const [open, setOpen] = useState(false);
  const { isMobile } = useBreakpoint();
  const seriesSermons = sermons.filter(s => s.series === series.id);

  return (
    <div style={{ background: "white", borderRadius: 14, overflow: "hidden", border: "1px solid #E6E5E2", marginBottom: 16 }}>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
        <img src={series.cover} alt={series.title} style={{ width: isMobile ? 64 : 88, height: isMobile ? 56 : 72, objectFit: "cover", flexShrink: 0 }} />
        <div style={{ flex: 1, padding: isMobile ? "10px 12px" : "14px 20px", minWidth: 0 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 14 : 16, fontWeight: 600, color: CHARCOAL, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{series.title}</div>
          {!isMobile && <div style={{ fontSize: 12, color: MID_GRAY }}>{series.description}</div>}
        </div>
        <div style={{ padding: isMobile ? "0 12px" : "0 20px", textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 600, color: COPPER, fontFamily: "'Playfair Display', serif" }}>{seriesSermons.length}</div>
          <div style={{ fontSize: 11, color: MID_GRAY }}>msgs</div>
        </div>
        <div style={{ padding: isMobile ? "0 12px" : "0 20px", color: MID_GRAY, flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
        </div>
      </div>
      {open && (
        <div style={{ borderTop: "1px solid #F0EFEB" }}>
          {seriesSermons.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 10 : 16, padding: isMobile ? "10px 14px" : "12px 20px", borderBottom: i < seriesSermons.length - 1 ? "1px solid #F5F4F2" : "none", background: i % 2 === 0 ? "white" : "#FAFAF9" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: COPPER_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: COPPER_DARK, flexShrink: 0, marginTop: isMobile ? 2 : 0 }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: CHARCOAL, marginBottom: 2 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: MID_GRAY, whiteSpace: isMobile ? "normal" : "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.speaker} · {s.scripture} · {s.duration}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0, flexDirection: isMobile ? "column" : "row" }}>
                <button style={{ display: "flex", alignItems: "center", gap: 6, background: CHARCOAL, color: "white", border: "none", borderRadius: 7, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
                  <PlayIcon size={12} /> Play
                </button>
                {s.hasNotes && (
                  <button onClick={() => onReadNotes(s)} style={{ display: "flex", alignItems: "center", gap: 6, background: COPPER_LIGHT, color: COPPER_DARK, border: "none", borderRadius: 7, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
                    <BookIcon size={12} /> Notes
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 6;

export default function SermonsPage() {
  const { isMobile, isTablet } = useBreakpoint();
  const px = isMobile ? "16px" : isTablet ? "28px" : "48px";

  const [seriesData, setSeriesData] = useState([]);
  const [sermonsData, setSermonsData] = useState([]);
  const [sermonNotesMap, setSermonNotesMap] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeries, setFilterSeries] = useState("all");
  const [filterSpeaker, setFilterSpeaker] = useState("all");
  const [filterTopic, setFilterTopic] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("archive");
  const [notesSermon, setNotesSermon] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [series, sermons] = await Promise.all([
          fetchJson("/api/sermons/series"),
          fetchJson("/api/sermons"),
        ]);
        if (!mounted) return;
        if (Array.isArray(series)) {
          setSeriesData(series.map(item => ({ id: item.id, title: item.title, cover: item.cover_url || "", count: item.count || 0, description: item.description || "" })));
        }
        if (Array.isArray(sermons)) {
          const mappedSermons = sermons.map(item => ({ id: item.id, title: item.title, speaker: item.speaker, date: item.date, duration: item.duration || "—", scripture: item.scripture || "", topic: item.topic || "", series: item.series_id || "", thumbnail: item.thumbnail || "", videoUrl: item.video_url || null, audioUrl: item.audio_url || null, documentUrl: item.document_url || null, hasNotes: Boolean(item.has_notes), featured: Boolean(item.featured) }));
          setSermonsData(mappedSermons);
          const notesEntries = await Promise.all(mappedSermons.filter(item => item.hasNotes).map(async item => {
            try {
              const notes = await fetchJson(`/api/sermons/${item.id}/notes`);
              return [item.id, { outline: notes.outline || [], keyScriptures: notes.key_scriptures || [], sections: notes.sections || [], reflectionQuestions: notes.reflection_questions || [], prayer: notes.prayer || "" }];
            } catch { return [item.id, null]; }
          }));
          const notesMap = {};
          notesEntries.forEach(([id, notes]) => { if (notes) notesMap[id] = notes; });
          setSermonNotesMap(notesMap);
        }
      } catch {
        if (!mounted) return;
        setSeriesData([]);
        setSermonsData([]);
        setSermonNotesMap({});
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const speakers = useMemo(() => [...new Set(sermonsData.map(s => s.speaker))], [sermonsData]);
  const topics = useMemo(() => [...new Set(sermonsData.map(s => s.topic))], [sermonsData]);
  const featured = useMemo(() => sermonsData.find(s => s.featured) || sermonsData[0] || null, [sermonsData]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return sermonsData.filter(s => {
      if (q && !s.title.toLowerCase().includes(q) && !s.speaker.toLowerCase().includes(q) && !s.scripture.toLowerCase().includes(q) && !s.topic.toLowerCase().includes(q)) return false;
      if (filterSeries !== "all" && s.series !== filterSeries) return false;
      if (filterSpeaker !== "all" && s.speaker !== filterSpeaker) return false;
      if (filterTopic !== "all" && s.topic !== filterTopic) return false;
      if (dateRange.from && s.date < dateRange.from) return false;
      if (dateRange.to && s.date > dateRange.to) return false;
      return true;
    });
  }, [searchQuery, filterSeries, filterSpeaker, filterTopic, dateRange, sermonsData]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const hasActiveFilters = searchQuery || filterSeries !== "all" || filterSpeaker !== "all" || filterTopic !== "all" || dateRange.from || dateRange.to;

  // Reset to page 1 whenever any filter changes
  useEffect(() => { setPage(1); }, [searchQuery, filterSeries, filterSpeaker, filterTopic, dateRange]);

  const selectStyle = {
    padding: "10px 14px",
    border: "1px solid #E0DFDb",
    borderRadius: 9,
    fontSize: 13,
    color: CHARCOAL,
    background: "white",
    cursor: "pointer",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235F5E5A' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    paddingRight: 32,
    width: "100%",
  };

  // Visible page numbers (show max 5 around current page)
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1);

  return (
    <>
      <style>{globalStyles}</style>
      {notesSermon && <SermonNotesReader sermon={notesSermon} notesMap={sermonNotesMap} onClose={() => setNotesSermon(null)} />}

      <div style={{ minHeight: "100vh", background: LIGHT_GRAY }}>
        {/* Header */}
        <div style={{ background: CHARCOAL, padding: isMobile ? "36px 16px 32px" : isTablet ? "44px 28px 40px" : "56px 48px 48px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ fontSize: 11, color: COPPER, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Sunday Messages</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 28 : isTablet ? 34 : 42, fontWeight: 700, color: "white", marginBottom: 14, lineHeight: 1.2 }}>Sermons &amp; Teaching</h1>
            <p style={{ fontSize: isMobile ? 14 : 15, color: "rgba(255,255,255,0.55)", maxWidth: 520, lineHeight: 1.7 }}>Every message preached from this pulpit — available to listen, watch, and read. Let the Word dwell in you richly.</p>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: `0 ${px} 80px` }}>

          {/* Search & Filter */}
          <div style={{ background: "white", borderRadius: 14, padding: isMobile ? "16px" : "24px 28px", margin: "24px 0 32px", border: "1px solid #E6E5E2" }}>

            {/* Search row */}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}><SearchIcon /></div>
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={isMobile ? "Search sermons…" : "Search by title, speaker, scripture, or topic…"} style={{ width: "100%", padding: "10px 14px 10px 42px", border: "1px solid #E0DFDb", borderRadius: 9, fontSize: 13, color: CHARCOAL, outline: "none", fontFamily: "'DM Sans', sans-serif" }} />
              </div>
              {/* Filter toggle on mobile */}
              {isMobile && (
                <button onClick={() => setShowFilters(!showFilters)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", border: `1px solid ${showFilters || hasActiveFilters ? COPPER : "#E0DFDb"}`, borderRadius: 9, background: showFilters || hasActiveFilters ? COPPER_LIGHT : "white", color: showFilters || hasActiveFilters ? COPPER_DARK : MID_GRAY, cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif", flexShrink: 0, whiteSpace: "nowrap" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></svg>
                  Filters{hasActiveFilters ? " •" : ""}
                </button>
              )}
            </div>

            {/* Filters — always visible on tablet+, collapsible on mobile */}
            {(!isMobile || showFilters) && (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
                <select value={filterSeries} onChange={e => setFilterSeries(e.target.value)} style={selectStyle}>
                  <option value="all">All Series</option>
                  {seriesData.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
                <select value={filterSpeaker} onChange={e => setFilterSpeaker(e.target.value)} style={selectStyle}>
                  <option value="all">All Speakers</option>
                  {speakers.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)} style={selectStyle}>
                  <option value="all">All Topics</option>
                  {topics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="date" value={dateRange.from} onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))} style={{ ...selectStyle, flex: 1, paddingRight: 14, backgroundImage: "none" }} />
                  <span style={{ fontSize: 12, color: MID_GRAY, flexShrink: 0 }}>to</span>
                  <input type="date" value={dateRange.to} onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))} style={{ ...selectStyle, flex: 1, paddingRight: 14, backgroundImage: "none" }} />
                </div>
                {hasActiveFilters && (
                  <button onClick={() => { setSearchQuery(""); setFilterSeries("all"); setFilterSpeaker("all"); setFilterTopic("all"); setDateRange({ from: "", to: "" }); setPage(1); }} style={{ fontSize: 12, color: MID_GRAY, background: "none", border: "1px solid #E0DFDb", borderRadius: 9, padding: "10px 14px", cursor: "pointer", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>Clear filters</button>
                )}
              </div>
            )}
          </div>

          <FeaturedSermon sermon={featured} seriesData={seriesData} onReadNotes={setNotesSermon} />

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 28, borderBottom: "2px solid #E6E5E2", overflowX: "auto" }}>
            {[["archive", "Sermon Archive"], ["series", "By Series"]].map(([id, label]) => (
              <button key={id} onClick={() => { setActiveTab(id); setPage(1); }} style={{ padding: isMobile ? "10px 16px" : "12px 24px", background: "none", border: "none", borderBottom: activeTab === id ? `2px solid ${COPPER}` : "2px solid transparent", marginBottom: -2, cursor: "pointer", fontSize: 14, fontWeight: 500, color: activeTab === id ? COPPER_DARK : MID_GRAY, fontFamily: "'DM Sans', sans-serif", transition: "color 0.15s", whiteSpace: "nowrap" }}>{label}</button>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", paddingBottom: 10, paddingRight: 4 }}>
              <span style={{ fontSize: 13, color: MID_GRAY, whiteSpace: "nowrap" }}>{filtered.length} message{filtered.length !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {activeTab === "archive" && (
            <>
              {paged.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: MID_GRAY }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
                  <div style={{ fontSize: 15 }}>No sermons match your search.</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(300px, 1fr))", gap: isMobile ? 16 : 24, marginBottom: 40 }}>
                  {paged.map(s => <SermonCard key={s.id} sermon={s} onReadNotes={setNotesSermon} />)}
                </div>
              )}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #E0DFDb", background: page === 1 ? "#F5F4F2" : "white", color: page === 1 ? "#C0BFBC" : CHARCOAL, cursor: page === 1 ? "default" : "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>←</button>
                  {pageNumbers.map((n, idx) => (
                    <React.Fragment key={n}>
                      {idx > 0 && pageNumbers[idx - 1] !== n - 1 && <span style={{ fontSize: 13, color: MID_GRAY, padding: "0 2px" }}>…</span>}
                      <button onClick={() => setPage(n)} style={{ width: 38, height: 38, borderRadius: 8, border: `1px solid ${n === page ? COPPER : "#E0DFDb"}`, background: n === page ? COPPER : "white", color: n === page ? "white" : CHARCOAL, cursor: "pointer", fontSize: 13, fontWeight: n === page ? 600 : 400, fontFamily: "'DM Sans', sans-serif" }}>{n}</button>
                    </React.Fragment>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #E0DFDb", background: page === totalPages ? "#F5F4F2" : "white", color: page === totalPages ? "#C0BFBC" : CHARCOAL, cursor: page === totalPages ? "default" : "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>→</button>
                </div>
              )}
            </>
          )}

          {activeTab === "series" && (
            <div>
              {seriesData.map(series => <SeriesRow key={series.id} series={series} sermons={sermonsData} onReadNotes={setNotesSermon} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}