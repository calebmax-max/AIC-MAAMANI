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

const fallbackPosts = [
  {
    id: 1, category: "devotional", tags: ["faith", "prayer"],
    emoji: "🌅", heroBg: "#FDF3E0",
    title: "Finding Peace in the Morning Hour",
    excerpt: "There is something sacred about the stillness before the world awakes — a quiet invitation to draw near and listen.",
    author: "Pastor Grace Wanjiku", initials: "GW", date: "June 2, 2026", readTime: "4 min read",
    bioRole: "Lead Women's Pastor",
    bio: "Pastor Grace Wanjiku serves as the lead pastor of our women's ministry and has been with the congregation for 12 years. Her heart is for contemplative faith in a busy world.",
    body: [
      { type: "p", text: "The morning holds a particular kind of grace. Before the noise of the day rises and demands crowd our hearts, there is a window — brief but luminous — where the soul can breathe." },
      { type: "quote", text: '"Be still, and know that I am God." — Psalm 46:10' },
      { type: "p", text: "Many of us rush past this holy threshold, phone in hand before our feet touch the floor. But what might happen if we paused? What if the first voice we listened to was not the notification ping, but the quiet whisper of the Spirit?" },
      { type: "p", text: "Begin small. Five minutes of stillness. One verse. A single honest prayer. Watch how the whole day is reoriented when you anchor it in the morning hour." },
    ],
  },
  {
    id: 2, category: "teaching", tags: ["faith", "community"],
    emoji: "📖", heroBg: "#EAF0FB",
    title: "What the Sermon on the Mount Still Teaches Us",
    excerpt: "Two thousand years have passed, yet the Beatitudes speak with startling freshness to our fractured, hurried age.",
    author: "Elder David Kariuki", initials: "DK", date: "May 28, 2026", readTime: "7 min read",
    bioRole: "Elder & Bible Teacher",
    bio: "Elder David Kariuki has taught systematic theology in our midweek school of ministry for over a decade. He holds a Masters in Biblical Studies from Nairobi Evangelical Graduate School.",
    body: [
      { type: "p", text: "When Jesus ascended that hillside and opened his mouth, he delivered not a programme or a policy, but a portrait of what it means to be human under God's reign." },
      { type: "quote", text: '"Blessed are the poor in spirit, for theirs is the kingdom of heaven." — Matthew 5:3' },
      { type: "p", text: "The word \"blessed\" in Greek — makarios — carried the sense of a deep, settled joy; not the fizzy happiness of circumstance, but the weight-bearing contentment of knowing who you are and whose you are." },
      { type: "p", text: "In our pursuit of influence and comfort, we have largely reversed the Beatitudes. We prize the assertive over the meek, the loud over the mournful. Jesus inverts every metric — and therein lies his teaching's enduring power to disturb and to heal." },
    ],
  },
  {
    id: 3, category: "testimony", tags: ["faith", "prayer", "community"],
    emoji: "🕊️", heroBg: "#EEF5EE",
    title: "He Heard Me in the Valley",
    excerpt: "When my business collapsed and my marriage was strained, I discovered that God does his deepest work in the places we least expect.",
    author: "Samuel Odhiambo", initials: "SO", date: "May 22, 2026", readTime: "5 min read",
    bioRole: "Lay Leader, Men's Fellowship",
    bio: "Samuel Odhiambo is a business consultant and lay leader in our men's fellowship. He and his wife Janet are based in Westlands and have three children.",
    body: [
      { type: "p", text: "I will not dress this up: 2024 was the hardest year of my life. The business I had built over seven years closed in March. By June, my wife and I were barely speaking." },
      { type: "quote", text: '"Even though I walk through the darkest valley, I will fear no evil, for you are with me." — Psalm 23:4' },
      { type: "p", text: "A brother from this congregation showed up at my door with groceries and no agenda. My wife and I attended a couples retreat facilitated by the church. Slowly, grace came — not as a rescue from the valley, but as company inside it." },
      { type: "p", text: "Today I stand here not because the road became easy, but because I learned that Emmanuel — God with us — means exactly that." },
    ],
  },
  {
    id: 4, category: "announcement", tags: ["community"],
    emoji: "📣", heroBg: "#F5EEFA",
    title: "Youth Camp 2026 — Registration Now Open",
    excerpt: "Three days in the Aberdares, built around worship, community, and the question: Who am I in Christ?",
    author: "Youth Ministry Team", initials: "YM", date: "May 18, 2026", readTime: "2 min read",
    bioRole: "Youth Ministry",
    bio: "The Youth Ministry Team is led by Minister Ruth Achieng and a team of six volunteer coordinators passionate about equipping the next generation.",
    body: [
      { type: "p", text: "We are thrilled to announce that Youth Camp 2026 — themed Rooted — is officially open for registration!" },
      { type: "quote", text: '"So then, just as you received Christ Jesus as Lord, continue to live your lives in him, rooted and built up in him." — Colossians 2:6–7' },
      { type: "p", text: "This year's camp runs August 14–17 at Brackenhurst Conference Centre in Limuru. Spaces are limited to 120 young people aged 15–25. Registration closes July 30; a deposit of KSh 3,500 secures your place." },
    ],
  },
  {
    id: 5, category: "devotional", tags: ["prayer"],
    emoji: "🌿", heroBg: "#EAF5EF",
    title: "The Practice of Gratitude as Resistance",
    excerpt: "In a culture engineered to make us feel perpetually lacking, thanksgiving is a quietly radical act of trust.",
    author: "Deaconess Anne Muthoni", initials: "AM", date: "May 14, 2026", readTime: "3 min read",
    bioRole: "Deaconess & Prayer Leader",
    bio: "Deaconess Anne Muthoni leads our intercessory prayer team and facilitates a weekly ladies' Bible study. She is a trained counsellor and spiritual director.",
    body: [
      { type: "p", text: "The algorithm is designed to produce one feeling: not-enough. Not enough money, beauty, travel, status. The economy of comparison runs on dissatisfaction." },
      { type: "quote", text: '"Give thanks in all circumstances; for this is God\'s will for you in Christ Jesus." — 1 Thessalonians 5:18' },
      { type: "p", text: "Gratitude is an act of memory: recalling goodness already given, even when goodness feels absent now. It is also an act of trust: believing that the Giver has not forgotten us." },
      { type: "p", text: "Try this: before you open social media tomorrow morning, name three specific gifts — no matter how small. Notice what happens to your hour." },
    ],
  },
  {
    id: 6, category: "teaching", tags: ["faith", "community"],
    emoji: "🔥", heroBg: "#FDE8E8",
    title: "Understanding Spiritual Gifts in the Local Church",
    excerpt: "Every believer has been given something for the common good. The question is not whether you are gifted, but how you are stewarding your gift.",
    author: "Pastor Daniel Njoroge", initials: "DN", date: "May 6, 2026", readTime: "8 min read",
    bioRole: "Senior Pastor",
    bio: "Pastor Daniel Njoroge is the senior pastor and has shepherded this congregation for 19 years. He holds a DMin from Africa International University.",
    body: [
      { type: "p", text: "The New Testament is unambiguous: every member of the body of Christ has been given gifts by the Spirit — not as trophies, but as tools for service." },
      { type: "quote", text: '"Now to each one the manifestation of the Spirit is given for the common good." — 1 Corinthians 12:7' },
      { type: "p", text: "Yet in many congregations, 20% of the people do 80% of the work. Part of this imbalance stems from a misunderstanding of what gifts are for: they are given to distribute, not to distinguish." },
      { type: "p", text: "If you have not yet discovered your spiritual gifts, examine what energises rather than depletes you, ask those who know you what they see, and simply begin serving — gifts often reveal themselves in use." },
    ],
  },
];

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
  heroBox: { width: "100%", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.8rem" },
  cardBody: { padding: "20px 22px 18px", flex: 1, display: "flex", flexDirection: "column" },
  catTag: { display: "inline-block", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: palette.accent, background: palette.accentLight, borderRadius: 3, padding: "3px 9px", marginBottom: 12, alignSelf: "flex-start" },
  cardTitle: { fontFamily: "'Georgia', serif", fontSize: "1.12rem", lineHeight: 1.35, color: palette.primary, marginBottom: 10, fontWeight: 700 },
  cardExcerpt: { fontSize: "0.86rem", color: palette.secondary, lineHeight: 1.65, flex: 1, marginBottom: 14 },
  tagsRow: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 },
  tagPill: { fontSize: "0.62rem", color: palette.secondary, background: palette.bg, border: `1px solid ${palette.border}`, borderRadius: 3, padding: "2px 7px" },
  metaRow: { display: "flex", alignItems: "center", gap: 10, paddingTop: 14, borderTop: `1px solid ${palette.border}` },
  avatar: (size = 30) => ({ width: size, height: size, borderRadius: "50%", background: palette.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: size * 0.28, fontWeight: 700, flexShrink: 0 }),
  metaInfo: { display: "flex", flexDirection: "column", gap: 1 },
  metaAuthor: { color: palette.primary, fontWeight: 700, fontSize: "0.78rem" },
  metaDate: { fontSize: "0.7rem", color: palette.secondary },
  readTime: { marginLeft: "auto", fontSize: "0.7rem", color: palette.secondary, whiteSpace: "nowrap" },
  // Single
  singleWrap: { maxWidth: 760, margin: "0 auto", padding: "0 24px 80px" },
  backBtn: { display: "inline-flex", alignItems: "center", gap: 8, marginTop: 24, marginBottom: 0, background: "none", border: "none", color: palette.secondary, fontFamily: "'Georgia', serif", fontSize: "0.85rem", cursor: "pointer", padding: 0 },
  singleHero: { width: "100%", aspectRatio: "16/7", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5rem", marginTop: 20 },
  singleCat: { display: "inline-block", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: palette.accent, marginTop: 22, marginBottom: 10 },
  singleTitle: { fontFamily: "'Georgia', serif", fontSize: "clamp(1.6rem,4vw,2.3rem)", lineHeight: 1.25, color: palette.primary, marginBottom: 18, fontWeight: 700 },
  metaBar: { display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: `1px solid ${palette.border}`, borderBottom: `1px solid ${palette.border}`, marginBottom: 4 },
  shareStrip: { display: "flex", alignItems: "center", gap: 8, padding: "14px 0", borderBottom: `1px solid ${palette.border}`, marginBottom: 28, flexWrap: "wrap" },
  shareLabel: { fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: palette.secondary, marginRight: 4 },
  articleBody: { fontSize: "1rem", lineHeight: 1.85, color: palette.primary },
  blockquote: { borderLeft: `3px solid ${palette.accent}`, padding: "12px 20px", background: palette.accentLight, margin: "22px 0", fontStyle: "italic", fontSize: "1.05rem", borderRadius: "0 4px 4px 0" },
  bioBx: { marginTop: 44, padding: 24, background: palette.card, border: `1px solid ${palette.border}`, borderRadius: 4, display: "flex", gap: 18, alignItems: "flex-start" },
  bioAvatar: { width: 60, height: 60, borderRadius: "50%", background: palette.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Georgia', serif", fontSize: "1.3rem", flexShrink: 0 },
  bioName: { fontFamily: "'Georgia', serif", fontSize: "1.02rem", marginBottom: 3, fontWeight: 700 },
  bioRole: { fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: palette.accent, marginBottom: 10 },
  bioDesc: { fontSize: "0.85rem", color: palette.secondary, lineHeight: 1.6 },
  relSection: { marginTop: 48 },
  relHeading: { fontFamily: "'Georgia', serif", fontSize: "1.2rem", marginBottom: 18, color: palette.primary, fontWeight: 700, display: "flex", alignItems: "center", gap: 12 },
  relGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 },
  relCard: { background: palette.card, border: `1px solid ${palette.border}`, borderRadius: 4, overflow: "hidden", cursor: "pointer" },
  relImg: { width: "100%", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" },
  relBody: { padding: 14 },
  relCat: { fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: palette.accent, marginBottom: 6 },
  relTitle: { fontFamily: "'Georgia', serif", fontSize: "0.88rem", lineHeight: 1.3, fontWeight: 700 },
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

function ShareButtons({ post }) {
  const url = "https://yourchurch.org/blog/" + post.id;
  const text = encodeURIComponent(post.title);
  const enc = encodeURIComponent(url);
  const btns = [
    { label: "Facebook", color: "#1877F2", href: `https://facebook.com/sharer/sharer.php?u=${enc}` },
    { label: "WhatsApp", color: "#25D366", href: `https://wa.me/?text=${text}%20${enc}` },
    { label: "Twitter", color: "#1DA1F2", href: `https://twitter.com/intent/tweet?text=${text}&url=${enc}` },
  ];
  return (
    <div style={s.shareStrip}>
      <span style={s.shareLabel}>Share:</span>
      {btns.map(b => (
        <a key={b.label} href={b.href} target="_blank" rel="noreferrer" style={{
          display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px",
          borderRadius: 100, fontFamily: "'Georgia', serif", fontSize: "0.76rem", fontWeight: 700,
          border: `1.5px solid ${b.color}`, color: b.color, background: "transparent",
          cursor: "pointer", textDecoration: "none", transition: "all 0.15s",
        }}>{b.label}</a>
      ))}
    </div>
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
      <div style={{ ...s.heroBox, background: post.heroBg }}>{post.emoji}</div>
      <div style={s.cardBody}>
        <span style={s.catTag}>{post.category}</span>
        <h2 style={s.cardTitle}>{post.title}</h2>
        <p style={s.cardExcerpt}>{post.excerpt}</p>
        <div style={s.tagsRow}>{post.tags.map(t => <span key={t} style={s.tagPill}>#{t}</span>)}</div>
        <div style={s.metaRow}>
          <div style={s.avatar(30)}>{post.initials}</div>
          <div style={s.metaInfo}>
            <span style={s.metaAuthor}>{post.author}</span>
            <span style={s.metaDate}>{post.date}</span>
          </div>
          <span style={s.readTime}>⏱ {post.readTime}</span>
        </div>
      </div>
    </div>
  );
}

function SinglePost({ post, onBack, onRelClick, allPosts }) {
  const related = allPosts.filter(p => p.id !== post.id && (p.category === post.category || p.tags.some(t => post.tags.includes(t)))).slice(0, 3);
  return (
    <div style={s.singleWrap}>
      <button style={s.backBtn} onClick={onBack}>← Back to all posts</button>
      <div style={{ ...s.singleHero, background: post.heroBg }}>{post.emoji}</div>
      <div style={s.singleCat}>{post.category}</div>
      <h1 style={s.singleTitle}>{post.title}</h1>
      <div style={s.metaBar}>
        <div style={s.avatar(38)}>{post.initials}</div>
        <div style={s.metaInfo}>
          <span style={s.metaAuthor}>{post.author}</span>
          <span style={s.metaDate}>{post.date}</span>
        </div>
        <span style={{ ...s.readTime, marginLeft: "auto" }}>⏱ {post.readTime}</span>
      </div>
      <ShareButtons post={post} />
      <div style={s.articleBody}>
        {post.body.map((block, i) =>
          block.type === "quote"
            ? <blockquote key={i} style={s.blockquote}>{block.text}</blockquote>
            : <p key={i} style={{ marginBottom: "1.4em" }}>{block.text}</p>
        )}
      </div>
      <ShareButtons post={post} />
      <div style={s.bioBx}>
        <div style={s.bioAvatar}>{post.initials}</div>
        <div>
          <div style={s.bioName}>{post.author}</div>
          <div style={s.bioRole}>{post.bioRole}</div>
          <p style={s.bioDesc}>{post.bio}</p>
        </div>
      </div>
      {related.length > 0 && (
        <div style={s.relSection}>
          <h3 style={s.relHeading}>Related Posts <span style={{ flex: 1, height: 1, background: palette.border, display: "inline-block" }} /></h3>
          <div style={s.relGrid}>
            {related.map(r => (
              <div key={r.id} style={s.relCard} onClick={() => onRelClick(r)}>
                <div style={{ ...s.relImg, background: r.heroBg }}>{r.emoji}</div>
                <div style={s.relBody}>
                  <div style={s.relCat}>{r.category}</div>
                  <div style={s.relTitle}>{r.title}</div>
                </div>
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
  const [posts, setPosts] = useState(fallbackPosts);

  useEffect(() => {
    let mounted = true;
    fetchJson("/api/blog")
      .then((data) => {
        if (!mounted || !Array.isArray(data) || !data.length) return;
        setPosts(data);
      })
      .catch(() => {
        if (mounted) setPosts(fallbackPosts);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = posts.filter(p => {
    const catOk = activeFilter === "all" || p.category === activeFilter;
    const tagOk = !activeTag || p.tags.includes(activeTag);
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