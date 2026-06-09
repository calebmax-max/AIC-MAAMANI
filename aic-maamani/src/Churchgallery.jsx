import { useEffect, useRef, useState, useCallback } from "react";
import { fetchJson } from "./api";

const PALETTE = {
  bg: "#F2F1EF",
  primary: "#2C2C2A",
  accent: "#EF9F27",
  secondary: "#5F5E5A",
  accentLight: "#FAF0DC",
  accentMid: "#F5C97A",
  border: "#DDD9D4",
  surface: "#FFFFFF",
  surfaceMuted: "#E8E6E3",
};

const ALBUMS = ["All", "Worship", "Youth", "Outreach 2024", "Community", "Missions"];

function mockPhoto(w, h, bg, label, icon) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>
    <rect width='${w}' height='${h}' fill='${bg}'/>
    <text x='50%' y='46%' font-family='Georgia,serif' font-size='32' fill='white' opacity='0.6' text-anchor='middle' dominant-baseline='middle'>${icon}</text>
    <text x='50%' y='62%' font-family='Georgia,serif' font-size='13' fill='white' opacity='0.5' text-anchor='middle' dominant-baseline='middle'>${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const PHOTO_STYLES = [
  { bg: "%234A3728", icon: "✝", label: "Sunday worship service" },
  { bg: "%23285A3E", icon: "☀", label: "Youth group gathering" },
  { bg: "%23A0531A", icon: "🤝", label: "Community outreach" },
  { bg: "%232C4A5A", icon: "🏠", label: "Church community" },
  { bg: "%234A3728", icon: "♪", label: "Choir performance" },
  { bg: "%23284A38", icon: "✈", label: "Mission trip abroad" },
  { bg: "%23285A3E", icon: "✝", label: "Youth worship night" },
  { bg: "%235A4228", icon: "🍽", label: "Potluck Sunday" },
  { bg: "%23A0531A", icon: "📦", label: "Food bank volunteers" },
  { bg: "%234A3728", icon: "★", label: "Christmas Eve service" },
  { bg: "%23284A38", icon: "🔨", label: "Building project" },
  { bg: "%232C4A5A", icon: "👶", label: "Children's ministry" },
  { bg: "%23285A3E", icon: "⛺", label: "Youth camp retreat" },
  { bg: "%23A0531A", icon: "🌿", label: "Neighborhood cleanup" },
  { bg: "%234A3728", icon: "🌅", label: "Easter sunrise service" },
];

const HEIGHTS = [320, 240, 380, 260, 300, 280, 350, 220, 290, 340, 260, 310, 270, 230, 360];

const PHOTO_ALBUMS = ["Worship","Youth","Outreach 2024","Community","Worship","Missions","Youth","Community","Outreach 2024","Worship","Missions","Community","Youth","Outreach 2024","Worship"];

const fallbackPhotos = PHOTO_STYLES.map((s, i) => ({
  id: i + 1,
  album: PHOTO_ALBUMS[i],
  src: mockPhoto(400, HEIGHTS[i], s.bg, s.label, s.icon),
  alt: s.label,
  h: HEIGHTS[i],
}));

const fallbackVideos = [
  { id: 1, title: "Sunday Message — Walking in Faith", videoUrl: null, date: "June 2, 2024" },
  { id: 2, title: "Youth Night Highlights — Spring 2024", videoUrl: null, date: "May 18, 2024" },
  { id: 3, title: "Outreach 2024 — Community Impact Reel", videoUrl: null, date: "April 30, 2024" },
  { id: 4, title: "Christmas Cantata 2023", videoUrl: null, date: "December 24, 2023" },
];

function MasonryGrid({ photos, onPhotoClick }) {
  const [columns, setColumns] = useState(3);
  const containerRef = useRef(null);

  useEffect(() => {
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setColumns(w < 480 ? 1 : w < 720 ? 2 : 3);
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const cols = Array.from({ length: columns }, () => []);
  photos.forEach((photo, i) => cols[i % columns].push(photo));

  return (
    <div ref={containerRef} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
      {cols.map((col, ci) => (
        <div key={ci} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
          {col.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} onClick={() => onPhotoClick(photo)} />
          ))}
        </div>
      ))}
    </div>
  );
}

function PhotoCard({ photo, onClick }) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: "10px",
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        background: PALETTE.surfaceMuted,
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? `0 12px 32px rgba(44,44,42,0.18)` : "0 2px 8px rgba(44,44,42,0.07)",
      }}
    >
      <img
        src={photo.src}
        alt={photo.alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{
          width: "100%",
          display: "block",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      />
      {!loaded && (
        <div style={{ height: photo.h * 0.5, background: PALETTE.surfaceMuted }} />
      )}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(to top, rgba(44,44,42,0.65) 0%, transparent 55%)`,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.25s ease",
        display: "flex", alignItems: "flex-end", padding: "14px",
      }}>
        <div>
          <span style={{
            display: "inline-block", fontSize: "10px", fontWeight: 600,
            letterSpacing: "0.08em", textTransform: "uppercase",
            color: PALETTE.accent, background: "rgba(0,0,0,0.35)",
            padding: "3px 8px", borderRadius: "4px", marginBottom: "4px",
          }}>{photo.album}</span>
          <p style={{ margin: 0, fontSize: "13px", color: "#fff", lineHeight: 1.3 }}>{photo.alt}</p>
        </div>
      </div>
    </div>
  );
}

function Lightbox({ photos, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const photo = photos[index];

  const prev = useCallback(() => setIndex((i) => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % photos.length), [photos.length]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(20,20,18,0.93)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>

      <button onClick={(e) => { e.stopPropagation(); prev(); }} style={navBtnStyle("left")}>‹</button>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "85vw", maxHeight: "85vh", position: "relative" }}
      >
        <img
          src={photo.src}
          alt={photo.alt}
          style={{
            maxWidth: "85vw", maxHeight: "78vh",
            borderRadius: "10px", display: "block",
            objectFit: "contain",
          }}
        />
        <div style={{
          marginTop: "14px", display: "flex",
          justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <span style={{
              fontSize: "11px", fontWeight: 600, letterSpacing: "0.07em",
              textTransform: "uppercase", color: PALETTE.accent,
            }}>{photo.album}</span>
            <p style={{ margin: "3px 0 0", color: "#ccc", fontSize: "14px" }}>{photo.alt}</p>
          </div>
          <span style={{ color: PALETTE.secondary, fontSize: "13px" }}>
            {index + 1} / {photos.length}
          </span>
        </div>
      </div>

      <button onClick={(e) => { e.stopPropagation(); next(); }} style={navBtnStyle("right")}>›</button>

      <button
        onClick={onClose}
        style={{
          position: "fixed", top: "20px", right: "24px",
          background: "rgba(255,255,255,0.1)", border: "none",
          color: "#fff", fontSize: "22px", cursor: "pointer",
          width: "40px", height: "40px", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          lineHeight: 1,
        }}
      >✕</button>

      <div style={{
        position: "fixed", bottom: "20px", left: "50%",
        transform: "translateX(-50%)", display: "flex", gap: "6px",
      }}>
        {photos.map((_, i) => (
          <div
            key={i}
            onClick={(e) => { e.stopPropagation(); setIndex(i); }}
            style={{
              width: i === index ? "20px" : "6px", height: "6px",
              borderRadius: "3px", cursor: "pointer",
              background: i === index ? PALETTE.accent : "rgba(255,255,255,0.35)",
              transition: "all 0.25s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function navBtnStyle(side) {
  return {
    position: "fixed", [side]: "20px", top: "50%", transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
    color: "#fff", fontSize: "32px", cursor: "pointer",
    width: "48px", height: "64px", borderRadius: "8px",
    display: "flex", alignItems: "center", justifyContent: "center",
    lineHeight: 1, transition: "background 0.2s",
  };
}

function VideoCard({ video }) {
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const hasLocalVideo = Boolean(video.videoUrl);

  return (
    <div
      style={{
        borderRadius: "10px", overflow: "hidden",
        background: PALETTE.surface,
        border: `1px solid ${PALETTE.border}`,
        transition: "transform 0.2s, box-shadow 0.2s",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? "0 10px 28px rgba(44,44,42,0.14)" : "0 2px 8px rgba(44,44,42,0.06)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ position: "relative", paddingBottom: "56.25%", background: "#000" }}>
        {playing && hasLocalVideo ? (
          <video
            controls
            autoPlay
            src={video.videoUrl}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <>
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(135deg, rgba(44,44,42,0.98), rgba(95,94,90,0.88))",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "20px", textAlign: "center",
            }}>
              <div style={{
                width: "66px", height: "66px", borderRadius: "50%",
                background: "rgba(239,159,39,0.16)",
                border: "1px solid rgba(239,159,39,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "14px",
              }}>
                <span style={{ fontSize: "24px", color: PALETTE.accent, marginLeft: "3px" }}>Play</span>
              </div>
              <p style={{ margin: 0, color: "#fff", fontSize: "15px", fontWeight: 600, lineHeight: 1.4 }}>{video.title}</p>
              <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.55)", fontSize: "12px", fontFamily: "'DM Sans',sans-serif" }}>
                {hasLocalVideo ? "Tap to play" : "Uploaded video coming soon"}
              </p>
            </div>
            <div
              style={{
                position: "absolute", inset: 0,
                background: "rgba(44,44,42,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: hasLocalVideo ? "pointer" : "default",
              }}
              onClick={hasLocalVideo ? () => setPlaying(true) : undefined}
            >
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%",
                background: PALETTE.accent,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "transform 0.2s",
                transform: hovered && hasLocalVideo ? "scale(1.1)" : "scale(1)",
              }}>
                <span style={{ fontSize: "22px", color: "#fff", marginLeft: "3px" }}>Play</span>
              </div>
            </div>
          </>
        )}
      </div>
      <div style={{ padding: "14px 16px" }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: "14px", color: PALETTE.primary, lineHeight: 1.4 }}>{video.title}</p>
        <p style={{ margin: "5px 0 0", fontSize: "12px", color: PALETTE.secondary }}>{video.date}</p>
      </div>
    </div>
  );
}

export default function ChurchGallery() {
  const [activeTab, setActiveTab] = useState("photos");
  const [activeAlbum, setActiveAlbum] = useState("All");
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [photos, setPhotos] = useState(fallbackPhotos);
  const [videos, setVideos] = useState(fallbackVideos);

  useEffect(() => {
    let mounted = true;

    fetchJson("/api/gallery/photos")
      .then((data) => {
        if (!mounted || !Array.isArray(data) || !data.length) return;
        setPhotos(
          data.map((photo) => ({
            id: photo.id,
            album: photo.album || "Worship",
            src: photo.src,
            alt: photo.alt || "Gallery photo",
            h: photo.height || 320,
          }))
        );
      })
      .catch(() => {
        if (mounted) setPhotos(fallbackPhotos);
      });

    fetchJson("/api/gallery/videos")
      .then((data) => {
        if (!mounted || !Array.isArray(data) || !data.length) return;
        setVideos(
          data.map((video) => ({
            id: video.id,
            title: video.title,
            videoUrl: video.video_url || null,
            date: video.date || "",
          }))
        );
      })
      .catch(() => {
        if (mounted) setVideos(fallbackVideos);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = activeAlbum === "All"
    ? photos
    : photos.filter((p) => p.album === activeAlbum);

  const openLightbox = (photo) => {
    setLightboxIndex(filtered.findIndex((p) => p.id === photo.id));
    setLightboxPhoto(photo);
  };

  const accentCount = ALBUMS.reduce((acc, album) => {
    acc[album] = album === "All" ? photos.length : photos.filter((p) => p.album === album).length;
    return acc;
  }, {});

  return (
    <div style={{
      fontFamily: "'Crimson Pro', 'Georgia', serif",
      background: PALETTE.bg,
      minHeight: "100vh",
      padding: "0",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: PALETTE.primary,
        padding: "48px 48px 36px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-40px", right: "-40px",
          width: "240px", height: "240px", borderRadius: "50%",
          background: PALETTE.accent, opacity: 0.07,
        }} />
        <div style={{
          position: "absolute", bottom: "-60px", left: "30%",
          width: "180px", height: "180px", borderRadius: "50%",
          background: PALETTE.accent, opacity: 0.05,
        }} />
        <p style={{
          margin: "0 0 6px", fontFamily: "'DM Sans', sans-serif",
          fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase",
          color: PALETTE.accent, fontWeight: 600,
        }}>Our Story in Pictures</p>
        <h1 style={{
          margin: "0 0 10px", fontSize: "42px", fontWeight: 600,
          color: "#F2F1EF", lineHeight: 1.1, letterSpacing: "-0.02em",
        }}>Church Gallery</h1>
        <p style={{ margin: 0, color: "rgba(242,241,239,0.55)", fontFamily: "'DM Sans',sans-serif", fontSize: "15px" }}>
          Moments of faith, community, and service
        </p>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: "4px", marginTop: "28px" }}>
          {[
            { key: "photos", label: "Photos", icon: "🖼" },
            { key: "videos", label: "Videos", icon: "▶" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px", fontWeight: 600,
                padding: "8px 20px", borderRadius: "6px", cursor: "pointer",
                border: "none", transition: "all 0.2s",
                background: activeTab === tab.key ? PALETTE.accent : "rgba(255,255,255,0.08)",
                color: activeTab === tab.key ? PALETTE.primary : "rgba(242,241,239,0.7)",
                letterSpacing: "0.03em",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "32px 48px 48px" }}>
        {activeTab === "photos" && (
          <>
            {/* Album filter */}
            <div style={{
              display: "flex", gap: "8px", flexWrap: "wrap",
              marginBottom: "28px", alignItems: "center",
            }}>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase",
                color: PALETTE.secondary, fontWeight: 600, marginRight: "4px",
              }}>Album</span>
              {ALBUMS.map((album) => {
                const isActive = activeAlbum === album;
                return (
                  <button
                    key={album}
                    onClick={() => setActiveAlbum(album)}
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "12px", fontWeight: isActive ? 600 : 500,
                      padding: "6px 14px", borderRadius: "20px", cursor: "pointer",
                      border: `1.5px solid ${isActive ? PALETTE.accent : PALETTE.border}`,
                      background: isActive ? PALETTE.accent : PALETTE.surface,
                      color: isActive ? PALETTE.primary : PALETTE.secondary,
                      transition: "all 0.18s",
                      display: "flex", alignItems: "center", gap: "5px",
                    }}
                  >
                    {album}
                    <span style={{
                      fontSize: "10px", fontWeight: 700,
                      background: isActive ? "rgba(44,44,42,0.15)" : PALETTE.surfaceMuted,
                      color: isActive ? PALETTE.primary : PALETTE.secondary,
                      padding: "1px 6px", borderRadius: "10px",
                    }}>{accentCount[album]}</span>
                  </button>
                );
              })}
            </div>

            {/* Count */}
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "12px", color: PALETTE.secondary,
              margin: "0 0 20px",
            }}>
              Showing {filtered.length} photo{filtered.length !== 1 ? "s" : ""}
              {activeAlbum !== "All" ? ` in "${activeAlbum}"` : ""}
            </p>

            <MasonryGrid photos={filtered} onPhotoClick={openLightbox} />
          </>
        )}

        {activeTab === "videos" && (
          <>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "12px", color: PALETTE.secondary,
              margin: "0 0 24px",
            }}>
              {videos.length} videos
            </p>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}>
              {videos.map((v) => <VideoCard key={v.id} video={v} />)}
            </div>
          </>
        )}
      </div>

      {lightboxPhoto && (
        <Lightbox
          photos={filtered}
          startIndex={lightboxIndex}
          onClose={() => setLightboxPhoto(null)}
        />
      )}
    </div>
  );
}