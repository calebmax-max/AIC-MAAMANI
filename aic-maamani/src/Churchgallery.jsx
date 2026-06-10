import { useEffect, useRef, useState, useCallback } from "react";
import { fetchJson } from "./api";

// MEDIA_BASE resolves uploaded file URLs to the backend server.
// API_BASE falls back to window.location.origin (the Vercel frontend) which
// cannot serve uploaded files — so we read the env var directly here.
const MEDIA_BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");

const PALETTE = {
  bg: "#F2F1EF",
  primary: "#2C2C2A",
  accent: "#EF9F27",
  secondary: "#5F5E5A",
  border: "#DDD9D4",
  surface: "#FFFFFF",
  surfaceMuted: "#E8E6E3",
};

// DEFAULT_ALBUMS removed — album options are derived from photos

function resolveGalleryUrl(src) {
  if (!src) return "";
  // Already an absolute URL or data URI — return as-is
  if (/^(?:https?:)?\/\//i.test(src) || src.startsWith("data:")) return src;
  // No backend configured — leave relative paths as-is
  if (!MEDIA_BASE) return src;
  // Prevent double-prefix
  if (src.startsWith(MEDIA_BASE)) return src;
  const path = src.startsWith("/") ? src : `/${src}`;
  return `${MEDIA_BASE}${path}`;
}


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
      <div style={{ position: "relative", minHeight: photo.h ? `${photo.h * 0.5}px` : "200px" }}>
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            e.currentTarget.style.visibility = "hidden";
            setLoaded(true);
          }}
          style={{
            width: "100%",
            display: "block",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />
        {!loaded && (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, #E8E6E3 25%, #D8D7D4 50%, #E8E6E3 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
          }} />
        )}
      </div>
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

  const photo = photos[index];
  if (!photo) { onClose(); return null; }

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
          onError={(e) => {
            e.currentTarget.style.visibility = "hidden";
          }}
          style={{
            maxWidth: "85vw", maxHeight: "78vh",
            minWidth: "200px", minHeight: "150px",
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
            key={video.videoUrl}
            controls
            autoPlay
            src={video.videoUrl}
            onError={() => setPlaying(false)}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
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
                <span style={{ fontSize: "24px", color: PALETTE.accent, marginLeft: "3px" }}>▶</span>
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
                <span style={{ fontSize: "22px", color: "#fff", marginLeft: "3px" }}>▶</span>
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

const PAGE_SIZE = 24;

export default function ChurchGallery() {
  const [activeTab, setActiveTab] = useState("photos");
  const [activeAlbum, setActiveAlbum] = useState("All");
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    let mounted = true;

    // Fetch photos and videos in parallel
    Promise.all([
      fetchJson("/api/gallery/photos").catch(() => null),
      fetchJson("/api/gallery/videos").catch(() => null),
    ]).then(([photoData, videoData]) => {
      if (!mounted) return;

      if (Array.isArray(photoData)) {
        setPhotos(
          photoData.map((photo) => {
            const source = photo.src || photo.url || photo.image_url || photo.photo_url || "";
            return {
              id: photo.id,
              album: photo.album || "",
              src: resolveGalleryUrl(source),
              alt: photo.alt || photo.caption || photo.title || "Gallery photo",
              h: photo.height || photo.h || 320,
            };
          })
        );
      }

      if (Array.isArray(videoData)) {
        setVideos(
          videoData.map((video) => ({
            id: video.id,
            title: video.title,
            videoUrl: video.video_url ? resolveGalleryUrl(video.video_url) : null,
            date: video.date || "",
          }))
        );
      }

      setLoadingGallery(false);
    }).catch(() => {
      if (mounted) setLoadingGallery(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const albumOptions = [
    "All",
    ...Array.from(new Set(photos.map((p) => p.album || "Other"))).filter((a) => a && a !== "All"),
  ];

  const filtered = activeAlbum === "All"
    ? photos
    : photos.filter((p) => p.album === activeAlbum);

  const visiblePhotos = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Close lightbox and reset pagination if album changes
  useEffect(() => {
    if (lightboxPhoto) setLightboxPhoto(null);
    setVisibleCount(PAGE_SIZE);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAlbum]);

  const openLightbox = (photo) => {
    setLightboxIndex(filtered.findIndex((p) => p.id === photo.id));
    setLightboxPhoto(photo);
  };

  const accentCount = albumOptions.reduce((acc, album) => {
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
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* Header */}
      <div style={{
        background: PALETTE.primary,
        padding: "clamp(24px, 5vw, 48px) clamp(20px, 5vw, 48px) clamp(24px, 4vw, 36px)",
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
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "clamp(20px, 4vw, 32px) clamp(16px, 5vw, 48px) clamp(24px, 5vw, 48px)" }}>
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
              {albumOptions.map((album) => {
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
              {loadingGallery
                ? "Loading gallery..."
                : `Showing ${visiblePhotos.length} of ${filtered.length} photo${filtered.length !== 1 ? "s" : ""}${activeAlbum !== "All" ? ` in "${activeAlbum}"` : ""}`}
            </p>

            {loadingGallery ? (
              <div style={{
                minHeight: "220px",
                borderRadius: "16px",
                background: "rgba(239,159,39,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: PALETTE.secondary,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
              }}>
                Loading gallery...
              </div>
            ) : (
              <>
                <MasonryGrid photos={visiblePhotos} onPhotoClick={openLightbox} />
                {hasMore && (
                  <div style={{ textAlign: "center", marginTop: "32px" }}>
                    <button
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "13px", fontWeight: 600,
                        padding: "10px 28px", borderRadius: "8px", cursor: "pointer",
                        border: `1.5px solid ${PALETTE.accent}`,
                        background: "transparent", color: PALETTE.accent,
                        transition: "all 0.18s",
                      }}
                    >
                      Load more ({filtered.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
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