import { useEffect, useState } from "react";
import { fetchJson } from "./api";

const palette = {
  bg: "#F2F1EF",
  primary: "#2C2C2A",
  accent: "#EF9F27",
  secondary: "#5F5E5A",
  card: "#FFFFFF",
  border: "#E0DED9",
  accentLight: "#FDF3E0",
};

const CATEGORIES = ["all", "devotional", "announcement", "teaching", "testimony"];
const TAGS = ["faith", "prayer", "community"];

const s = {
  root: { fontFamily: "'Georgia', serif", background: palette.bg, minHeight: "100vh", color: palette.primary },
  header: { background: palette.primary, padding: "48px 24px 36px", textAlign: "center", position: "relative", overflow: "hidden" },
  h1: { fontFamily: "'Georgia', serif", fontSize: "clamp(1.8rem,5vw,3rem)", color: "#fff", letterSpacing: "-0.5px", fontWeight: 700 },
  h1Span: { color: palette.accent },
  headerSub: { color: "rgba(255,255,255,0.5)", marginTop: 8, fontSize: "0.92rem", fontStyle: "italic" },
  rule: { width: 56, height: 3, background: palette.accent, margin: "16px auto 0", borderRadius: 2 },
  filterBar: { padding: "24px 24px 0", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", maxWidth: 1200, margin: "0 auto" },
  filterLabel: { fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: palette.secondary, marginRight: 4 },
  divider: { width: 1, height: 18, background: palette.border, margin: "0 4px" },
  grid: { maxWidth: 1200, margin: "24px auto 60px", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 24 },
  card: { background: palette.card, borderRadius: 4, overflow: "hidden", border: `1px solid ${palette.border}`, display: "flex", flexDirection: "column", cursor: "pointer", transition: "transform 0.2s,box-shadow 0.2s" },
  cardBody: { padding: "20px 22px 18px", flex: 1, display: "flex", flexDirection: "column" },
  catTag: { display: "inline-block", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: palette.accent, background: palette.accentLight, borderRadius: 3, padding: "3px 9px", marginBottom: 12, alignSelf: "flex-start" },
  cardTitle: { fontFamily: "'Georgia', serif", fontSize: "1.12rem", lineHeight: 1.35, color: palette.primary, marginBottom: 10, fontWeight: 700 },
  tagsRow: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: "auto", paddingTop: 14 },
  tagPill: { fontSize: "0.62rem", color: palette.secondary, background: palette.bg, border: `1px solid ${palette.border}`, borderRadius: 3, padding: "2px 7px" },
  metaDate: { fontSize: "0.75rem", color: palette.secondary, marginBottom: 14 },
  // Single
  singleWrap: { maxWidth: 760, margin: "0 auto", padding: "0 24px 80px" },
  backBtn: { display: "inline-flex", alignItems: "center", gap: 8, marginTop: 24, marginBottom: 0, background: "none", border: "none", color: palette.secondary, fontFamily: "'Georgia', serif", fontSize: "0.85rem", cursor: "pointer", padding: 0 },
  singleCat: { display: "inline-block", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: palette.accent, marginTop: 28, marginBottom: 8 },
  singleTitle: { fontFamily: "'Georgia', serif", fontSize: "clamp(1.6rem,4vw,2.3rem)", lineHeight: 1.25, color: palette.primary, marginBottom: 10, fontWeight: 700 },
  singleDate: { fontSize: "0.8rem", color: palette.secondary, marginBottom: 8, paddingBottom: 18, borderBottom: `1px solid ${palette.border}` },
  singleTags: { display: "flex", gap: 6, flexWrap: "wrap", padding: "14px 0 24px" },
  articleBody: { fontSize: "1rem", lineHeight: 1.85, color: palette.primary },
  relSection: { marginTop: 48 },
  relHeading: { fontFamily: "'Georgia', serif", fontSize: "1.2rem", marginBottom: 18, color: palette.primary, fontWeight: 700, display: "flex", alignItems: "center", gap: 12 },
  relGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 },
  relCard: { background: palette.card, border: `1px solid ${palette.border}`, borderRadius: 4, overflow: "hidden", cursor: "pointer", padding: 16 },
  relCat: { fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: palette.accent, marginBottom: 6 },
  relTitle: { fontFamily: "'Georgia', serif", fontSize: "0.88rem", lineHeight: 1.3, fontWeight: 700 },
  relDate: { fontSize: "0.7rem", color: palette.secondary, marginTop: 6 },
};

function FilterBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "7px 16px", border: `1.5px solid ${active ? palette.accent : palette.border}`,
      borderRadius: 100, background: active ? palette.accent : "transparent",
      color: active ? "#fff" : palette.secondary, fontFamily: "'Georgia', serif",
      fontSize: "0.8rem", cursor: "pointer", fontWeight: active ? 700 : 400,
      transition: "all 0.15s",
    }}>{label}</button>
  );
}

function PostCard({ post, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{ ...s.card, transform: hov ? "translateY(-4px)" : "none", boxShadow: hov ? "0 12px 36px rgba(44,44,42,0.13)" : "0 1px 4px rgba(44,44,42,0.05)" }}
      onClick={() => onClick(post)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={s.cardBody}>
        <span style={s.catTag}>{post.category}</span>
        <h2 style={s.cardTitle}>{post.title}</h2>
        <div style={s.metaDate}>{post.date}</div>
        {post.tags?.length > 0 && (
          <div style={s.tagsRow}>{post.tags.map(t => <span key={t} style={s.tagPill}>#{t}</span>)}</div>
        )}
      </div>
    </div>
  );
}

function SinglePost({ post, onBack, onRelClick, allPosts }) {
  const related = allPosts
    .filter(p => p.id !== post.id && (p.category === post.category || p.tags?.some(t => post.tags?.includes(t))))
    .slice(0, 3);

  return (
    <div style={s.singleWrap}>
      <button style={s.backBtn} onClick={onBack}>← Back to all posts</button>
      <div style={s.singleCat}>{post.category}</div>
      <h1 style={s.singleTitle}>{post.title}</h1>
      <div style={s.singleDate}>{post.date}</div>
      {post.tags?.length > 0 && (
        <div style={s.singleTags}>{post.tags.map(t => <span key={t} style={s.tagPill}>#{t}</span>)}</div>
      )}
      <div style={s.articleBody}>
        {(post.body || []).map((block, i) => (
          <p key={i} style={{ marginBottom: "1.4em" }}>{block.text}</p>
        ))}
      </div>
      {related.length > 0 && (
        <div style={s.relSection}>
          <h3 style={s.relHeading}>Related Posts <span style={{ flex: 1, height: 1, background: palette.border, display: "inline-block" }} /></h3>
          <div style={s.relGrid}>
            {related.map(r => (
              <div key={r.id} style={s.relCard} onClick={() => onRelClick(r)}>
                <div style={s.relCat}>{r.category}</div>
                <div style={s.relTitle}>{r.title}</div>
                <div style={s.relDate}>{r.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BlogDevotionals() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTag, setActiveTag] = useState(null);
  const [openPost, setOpenPost] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetchJson("/api/blog")
      .then((data) => {
        if (!mounted || !Array.isArray(data)) return;
        setPosts(data);
      })
      .catch(() => {
        if (mounted) setPosts([]);
      });
    return () => { mounted = false; };
  }, []);

  const filtered = posts.filter(p => {
    const catOk = activeFilter === "all" || p.category === activeFilter;
    const tagOk = !activeTag || p.tags?.includes(activeTag);
    return catOk && tagOk;
  });

  const handleFilterCat = (cat) => { setActiveFilter(cat); setActiveTag(null); };
  const handleFilterTag = (tag) => { setActiveTag(activeTag === tag ? null : tag); setActiveFilter("all"); };

  if (openPost) {
    return (
      <div style={s.root}>
        <div style={s.header}>
          <h1 style={s.h1}>Words & <span style={s.h1Span}>Wisdom</span></h1>
          <p style={s.headerSub}>Devotionals, teachings, and testimonies for the journey</p>
          <div style={s.rule} />
        </div>
        <SinglePost post={openPost} onBack={() => setOpenPost(null)} onRelClick={setOpenPost} allPosts={posts} />
      </div>
    );
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.h1}>Words & <span style={s.h1Span}>Wisdom</span></h1>
        <p style={s.headerSub}>Devotionals, teachings, and testimonies for the journey</p>
        <div style={s.rule} />
      </div>

      <div style={s.filterBar}>
        <span style={s.filterLabel}>Category:</span>
        {CATEGORIES.map(c => (
          <FilterBtn key={c} label={c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
            active={activeFilter === c && !activeTag} onClick={() => handleFilterCat(c)} />
        ))}
        <div style={s.divider} />
        <span style={s.filterLabel}>Tag:</span>
        {TAGS.map(t => (
          <FilterBtn key={t} label={`#${t}`} active={activeTag === t} onClick={() => handleFilterTag(t)} />
        ))}
      </div>

      <div style={s.grid}>
        {filtered.length === 0
          ? <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 20px", color: palette.secondary, fontStyle: "italic" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>🔍</div>
              No posts found for this filter.
            </div>
          : filtered.map(p => <PostCard key={p.id} post={p} onClick={setOpenPost} />)
        }
      </div>
    </div>
  );
}