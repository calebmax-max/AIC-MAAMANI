import { useState, useMemo, useEffect, useRef } from "react";
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

// Sample rich sermon notes content keyed by sermon id
const fallbackSermonNotes = {
  1: {
    outline: [
      { ref: "John 1:1–3", point: "The Pre-Existent Word", sub: "Jesus existed before creation, as the agent of all things." },
      { ref: "John 1:4–5", point: "Light and Darkness", sub: "The contrast between divine light and the darkness that cannot overcome it." },
      { ref: "John 1:14–18", point: "The Word Became Flesh", sub: "The incarnation — God dwelling among us in tangible human form." },
    ],
    keyScriptures: [
      { ref: "John 1:1", text: "In the beginning was the Word, and the Word was with God, and the Word was God." },
      { ref: "John 1:14", text: "The Word became flesh and made his dwelling among us. We have seen his glory, the glory of the one and only Son, who came from the Father, full of grace and truth." },
    ],
    sections: [
      {
        heading: "Introduction",
        body: "John's Gospel opens not with a birth narrative, but with a breathtaking theological declaration that echoes Genesis. Where Genesis begins 'In the beginning God created,' John begins 'In the beginning was the Word.' Before anything existed, the Word already was.",
      },
      {
        heading: "Who Is the Word?",
        body: "The Greek term 'Logos' carried enormous weight in both Jewish and Greek thought. For the Greek philosopher, logos was the rational principle ordering the universe. For the Jewish reader, it recalled the spoken Word by which God created the heavens. John takes both audiences by the hand and says: this Word is a Person — and you can know Him.",
      },
      {
        heading: "Three Truths About the Word",
        body: "First, He is eternal: 'In the beginning was the Word' — the imperfect 'was' implies continuous pre-existence, not origin. Second, He is relational: 'the Word was with God' — face to face, in intimate communion. Third, He is divine: 'the Word was God' — not a lesser deity, but sharing the very nature of God.",
      },
      {
        heading: "The Stunning Descent",
        body: "Verse 14 is the hinge of the prologue. The eternal, omnipotent, infinite Word took on flesh — the Greek word is 'sarx,' the fragile, mortal stuff of human experience. He pitched His tent among us. This is the miracle of the incarnation: the Creator entering His creation, not as a visitor, but as one of us.",
      },
      {
        heading: "Application",
        body: "Because the Word became flesh, we know that God is not distant or indifferent. He is the God who draws near. Every question you bring, every wound you carry — He has experienced the weight of human life and can meet you in it. Rest in the scandalous nearness of God.",
      },
    ],
    reflectionQuestions: [
      "What does it mean to you personally that Jesus is described as both 'with God' and 'God'?",
      "How does the incarnation — God becoming flesh — change how you approach God in prayer?",
      "Where in your life do you need to experience the light of Christ pushing back darkness?",
    ],
    prayer: "Lord Jesus, Word made flesh — thank You for not staying in heaven. Thank You for entering our mess, our limitations, our sorrow. Open our eyes to see Your glory in the ordinary fabric of life. Amen.",
  },
  2: {
    outline: [
      { ref: "John 1:35–37", point: "The Transfer of Disciples", sub: "John the Baptist points two of his disciples to Jesus." },
      { ref: "John 1:38–39", point: "The First Invitation", sub: "'Come and see' — the simplest and most profound invitation in the Gospels." },
      { ref: "John 1:40–51", point: "A Chain of Witness", sub: "Andrew tells Peter, Philip tells Nathanael — discipleship spreads person to person." },
    ],
    keyScriptures: [
      { ref: "John 1:39", text: "'Come,' he replied, 'and you will see.' So they went and saw where he was staying, and they spent that day with him." },
      { ref: "John 1:46", text: "'Nazareth! Can anything good come from there?' Nathanael asked. 'Come and see,' said Philip." },
    ],
    sections: [
      {
        heading: "Introduction",
        body: "In this passage we see how Jesus gathers His first followers — not through a recruitment campaign, but through a simple, personal invitation: 'Come and see.' No pressure. No pitch. Just an open door.",
      },
      {
        heading: "The Question Jesus Asked",
        body: "When two disciples begin to follow Him, Jesus turns and asks: 'What do you want?' It is the most searching question in all of Scripture. What are you really after? What hunger drives you? Jesus always deals with the deep question beneath the surface question.",
      },
      {
        heading: "Come and See",
        body: "Their answer was a question: 'Where are you staying?' And His reply was not an address or a theology — it was an invitation into relationship. 'Come, and you will see.' The Christian life begins not with mastery of doctrine, but with proximity to Jesus. Everything flows from simply being with Him.",
      },
      {
        heading: "The Chain of Witness",
        body: "Andrew immediately finds his brother Simon and says, 'We have found the Messiah.' Philip finds Nathanael. Notice the pattern: encounter Jesus → tell someone close to you. Evangelism in John's Gospel is not a program; it is the natural overflow of discovery. You cannot keep this to yourself.",
      },
    ],
    reflectionQuestions: [
      "If Jesus asked you today, 'What do you want?' — what would your honest answer be?",
      "Who is your 'Andrew' — the person who first pointed you toward Jesus?",
      "Who is your 'Nathanael' — someone in your life you could invite to 'come and see'?",
    ],
    prayer: "Jesus, You still ask 'What do you want?' Teach us to want You above all else. Make us people who naturally and joyfully bring others into Your presence. Amen.",
  },
  4: {
    outline: [
      { ref: "Psalm 121:1–2", point: "Looking Up", sub: "The pilgrim lifts their eyes to the hills — but help comes from the Maker of the hills." },
      { ref: "Psalm 121:3–4", point: "The Unwearied Keeper", sub: "God neither slumbers nor sleeps — constant, vigilant, attentive." },
      { ref: "Psalm 121:5–8", point: "Coverage From All Sides", sub: "The Lord guards your going out and your coming in, now and forever." },
    ],
    keyScriptures: [
      { ref: "Psalm 121:1–2", text: "I lift up my eyes to the mountains — where does my help come from? My help comes from the Lord, the Maker of heaven and earth." },
      { ref: "Psalm 121:7–8", text: "The Lord will keep you from all harm — he will watch over your life; the Lord will watch over your coming and going both now and forevermore." },
    ],
    sections: [
      {
        heading: "A Song for the Road",
        body: "Psalm 121 is a song of ascent — one of fifteen psalms sung by pilgrims making the long upward journey to Jerusalem for the feasts. The road was dangerous: bandits, heat, treacherous mountain paths. The pilgrim needed more than courage; they needed a protector.",
      },
      {
        heading: "The Right Direction",
        body: "The opening verse is sometimes misread as the hills being the source of help. But the question corrects us: help does not come from the hills themselves — it comes from the God who made them. Our instinct is to look to human strength, systems, or resources. The psalm trains our gaze upward — past the mountains to the Maker.",
      },
      {
        heading: "A God Who Does Not Sleep",
        body: "Verses 3–4 are striking: 'He who watches over you will not slumber; indeed, he who watches over Israel will neither slumber nor sleep.' The pagan gods of the ancient world were notoriously absent — sleeping, on a journey, or distracted. The Lord is none of these. There is never a moment when His attention lapses.",
      },
    ],
    reflectionQuestions: [
      "What 'mountains' are you currently looking at for help instead of looking to God?",
      "How does it change your anxiety to know that God neither sleeps nor slumbers?",
      "What aspect of 'going out and coming in' (work, relationships, decisions) do you need to entrust to God today?",
    ],
    prayer: "Maker of heaven and earth — we lift our eyes to You. In a world that offers a thousand substitutes for Your presence, keep our gaze fixed upward. Guard our going and our coming. Amen.",
  },
  5: {
    outline: [
      { ref: "James 2:14–17", point: "The Useless Faith", sub: "A faith that does nothing for the suffering neighbor is a dead faith." },
      { ref: "James 2:18–20", point: "The Challenge", sub: "Even demons believe — intellectual assent alone is not saving faith." },
      { ref: "James 2:21–26", point: "Abraham and Rahab", sub: "Two very different people, both justified by works that flowed from genuine faith." },
    ],
    keyScriptures: [
      { ref: "James 2:17", text: "In the same way, faith by itself, if it is not accompanied by action, is dead." },
      { ref: "James 2:26", text: "As the body without the spirit is dead, so faith without deeds is dead." },
    ],
    sections: [
      {
        heading: "Introduction",
        body: "James is not contradicting Paul's teaching on justification by faith — he is confronting a counterfeit version of faith that has no transforming power. The issue is not faith versus works; it is living faith versus dead faith.",
      },
      {
        heading: "The Test Case",
        body: "James presents a concrete scenario: a brother or sister without food or clothing. You say 'Go in peace, be warm and well-fed' — but you do nothing. What good is that? The words ring hollow. James says the same is true of a faith that produces no deeds: it is a beautiful-sounding nothing.",
      },
      {
        heading: "Deeper Than Belief",
        body: "The demons believe that God is one — and they shudder. Intellectual assent to theological facts is not saving faith. Saving faith is a trust and reliance upon Christ that necessarily reshapes the direction of a life.",
      },
      {
        heading: "Two Witnesses",
        body: "Abraham offered Isaac — not to earn justification, but because his faith in God's promise was so real that obedience was the natural expression of it. Rahab hid the spies — a pagan woman whose tiny act of faith in Israel's God was counted as righteousness. Works are faith in motion.",
      },
    ],
    reflectionQuestions: [
      "Is there an area of your life where you hold a correct belief but it has not yet shaped your behavior?",
      "Think of someone in genuine need around you — what would 'faith in action' look like this week?",
      "How would you describe the difference between earning salvation and faith that naturally produces good works?",
    ],
    prayer: "Father, forgive us for a faith that stays safely in our heads. Give us the courage to let our trust in You spill into costly, visible love for the people around us. Amen.",
  },
  7: {
    outline: [
      { ref: "Psalm 122:1", point: "The Joy of the Invitation", sub: "David rejoiced when invited to go up to God's house." },
      { ref: "Psalm 122:2–5", point: "The City of God", sub: "Jerusalem as the gathering point of the tribes and the seat of judgment." },
      { ref: "Psalm 122:6–9", point: "The Prayers of the Pilgrim", sub: "Praying for the peace of Jerusalem — and for all who love it." },
    ],
    keyScriptures: [
      { ref: "Psalm 122:1", text: "I rejoiced with those who said to me, 'Let us go to the house of the Lord.'" },
      { ref: "Psalm 122:6", text: "Pray for the peace of Jerusalem: 'May those who love you be secure.'" },
    ],
    sections: [
      {
        heading: "Introduction",
        body: "Of all the songs of ascent, Psalm 122 is perhaps the most joyful. The journey is over. The city is in view. And David's response is not relief — it is praise. The destination produced delight.",
      },
      {
        heading: "The Joy of Gathering",
        body: "The psalm opens with a communal invitation: 'Let us go.' Faith is not a solo expedition. We are summoned together, and we travel together. The community of pilgrims is itself part of the gift. One of the marks of a living faith is that corporate worship feels like arrival, not obligation.",
      },
      {
        heading: "Praying for the City",
        body: "The psalm closes with a charge to pray for Jerusalem's peace — shalom. Not just security from enemies, but wholeness, flourishing, the thriving of all who dwell within her gates. The pilgrim's love for the city is expressed in intercession. This is the pattern for how we should love our own communities.",
      },
    ],
    reflectionQuestions: [
      "When did you last feel genuine joy at the prospect of gathering with God's people? What made it feel that way?",
      "What city, neighborhood, or community has God placed you in — and are you praying for its shalom?",
      "What would it look like for your church to be a place of 'binding together' for your city?",
    ],
    prayer: "Lord, restore to us the joy of Your house. Make us people who run toward gathering, not away from it. And give us hearts that pray and work for the peace of the places You have planted us. Amen.",
  },
  8: {
    outline: [
      { ref: "Isaiah 7:14", point: "The Sign Given to Ahaz", sub: "A virgin will conceive and bear a son — Immanuel, God with us." },
      { ref: "Matthew 1:22–23", point: "The Fulfillment", sub: "Matthew sees Isaiah's word fulfilled in the birth of Jesus." },
      { ref: "Revelation 21:3", point: "The Final Advent", sub: "The dwelling of God is with man — the ultimate Immanuel moment." },
    ],
    keyScriptures: [
      { ref: "Isaiah 7:14", text: "Therefore the Lord himself will give you a sign: The virgin will conceive and give birth to a son, and will call him Immanuel." },
      { ref: "Matthew 1:23", text: "'The virgin will conceive and give birth to a son, and they will call him Immanuel' (which means 'God with us')." },
    ],
    sections: [
      {
        heading: "Introduction",
        body: "Advent is the season of waiting. The word itself means 'coming.' And the whole of the Old Testament is one long, aching anticipation of the God who promised to come. Isaiah 7:14 is one of the most luminous points in that waiting.",
      },
      {
        heading: "The Name That Changes Everything",
        body: "Immanuel. God with us. Not God above us, observing from a safe distance. Not God against us, tallying our failures. God with us — present, near, involved. The name is a theology compressed into two syllables.",
      },
      {
        heading: "Advent Is for the Weary",
        body: "King Ahaz was facing national catastrophe. The sign was given not to the triumphant but to the terrified. Advent is not a season for those who have it together — it is for those who know they do not. The coming of Immanuel is precisely for the dark places.",
      },
      {
        heading: "Still Coming",
        body: "Advent teaches us to hold two things at once: Christ has come — the incarnation is history. And Christ is coming — the final advent, when the dwelling of God will be with man permanently (Rev 21:3). We live in the overlap, celebrating what God has done and leaning into what He will do.",
      },
    ],
    reflectionQuestions: [
      "Where in your life do you most need the reality of 'God with us' this Advent season?",
      "How does knowing that the sign was given to a frightened king change how you receive this promise?",
      "How do you hold together celebrating Christ's first coming while still longing for His return?",
    ],
    prayer: "Come, Lord Jesus. Come into the frightened places. Come into the waiting. You are Immanuel — God with us — and we need You now as much as Israel ever did. Amen.",
  },
  9: {
    outline: [
      { ref: "John 1:9", point: "The True Light", sub: "Jesus is the light that gives light to every person." },
      { ref: "John 1:10–11", point: "The Rejection", sub: "He came to His own, and His own did not receive Him." },
      { ref: "John 1:12–14", point: "The Welcome", sub: "All who receive Him are given the right to become children of God." },
    ],
    keyScriptures: [
      { ref: "John 1:9", text: "The true light that gives light to everyone was coming into the world." },
      { ref: "John 1:12", text: "Yet to all who did receive him, to those who believed in his name, he gave the right to become children of God." },
    ],
    sections: [
      {
        heading: "Introduction",
        body: "We return to John's prologue in the second week of Advent to consider one of its most painful verses: 'He came to His own, and His own did not receive Him.' The incarnation is a story of love — but also of rejection. And somehow, both truths are necessary for the full picture.",
      },
      {
        heading: "The Light That Cannot Be Owned",
        body: "Jesus is called 'the true light' — the authentic, original source of all illumination. Every candle we light this Advent season is a shadow of the real thing. And this light came into the world not to hide in a corner, but to give light to every person.",
      },
      {
        heading: "The Tragedy of Rejection",
        body: "Israel was the keeper of the promises, the custodians of the covenants. And yet when the Promise arrived, they did not recognize Him. John records this not to shame Israel but to name a pattern as old as humanity: we resist the light because it exposes us.",
      },
      {
        heading: "The Extraordinary Welcome",
        body: "But then — verse 12. To all who received Him. The door is open. The invitation is universal. And to those who do receive Him, who trust in His name, He gives the most extravagant gift imaginable: the right to be called children of God. Not servants. Not subjects. Children.",
      },
    ],
    reflectionQuestions: [
      "Is there any area of your life where you have been 'not receiving' Jesus — keeping Him at the door?",
      "What does it mean to you to be called a child of God, not just a follower or a believer?",
      "How does the contrast between rejection and welcome in this passage shape how you treat 'outsiders'?",
    ],
    prayer: "True Light — thank You for coming into the world even knowing how many would turn away. Thank You that Your welcome was and is unconditional. Help us receive You fully, in every room of our lives. Amen.",
  },
};

const fallbackSeriesData = [
  { id: "john", title: "The Book of John", cover: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=400&q=80", count: 12, description: "A journey through the Gospel of John" },
  { id: "psalms", title: "Songs of Ascent", cover: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80", count: 8, description: "Psalms 120–134 for the pilgrim soul" },
  { id: "faith", title: "Faith That Works", cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", count: 6, description: "The epistle of James unpacked" },
  { id: "advent", title: "Advent 2024", cover: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400&q=80", count: 4, description: "Waiting, hoping, expecting" },
];

const fallbackSermonsData = [
  { id: 1, title: "In the Beginning Was the Word", speaker: "Pastor David Kimani", date: "2025-06-01", duration: "42 min", scripture: "John 1:1–18", topic: "Christology", series: "john", thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", hasNotes: true, featured: true },
  { id: 2, title: "Come and See", speaker: "Pastor David Kimani", date: "2025-05-25", duration: "38 min", scripture: "John 1:35–51", topic: "Discipleship", series: "john", thumbnail: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=600&q=80", videoUrl: null, hasNotes: true },
  { id: 3, title: "Water Into Wine", speaker: "Pastor Grace Mwangi", date: "2025-05-18", duration: "45 min", scripture: "John 2:1–12", topic: "Miracles", series: "john", thumbnail: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=600&q=80", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", hasNotes: false },
  { id: 4, title: "I Will Lift My Eyes", speaker: "Pastor Grace Mwangi", date: "2025-05-11", duration: "35 min", scripture: "Psalm 121", topic: "Worship", series: "psalms", thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", videoUrl: null, hasNotes: true },
  { id: 5, title: "Faith Without Works Is Dead", speaker: "Dr. Samuel Ochieng", date: "2025-05-04", duration: "50 min", scripture: "James 2:14–26", topic: "Faith", series: "faith", thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", hasNotes: true },
  { id: 6, title: "Taming the Tongue", speaker: "Dr. Samuel Ochieng", date: "2025-04-27", duration: "44 min", scripture: "James 3:1–12", topic: "Character", series: "faith", thumbnail: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&q=80", videoUrl: null, hasNotes: false },
  { id: 7, title: "A Pilgrim's Song", speaker: "Pastor David Kimani", date: "2025-04-20", duration: "40 min", scripture: "Psalm 122", topic: "Worship", series: "psalms", thumbnail: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&q=80", videoUrl: null, hasNotes: true },
  { id: 8, title: "O Come, O Come Emmanuel", speaker: "Pastor Grace Mwangi", date: "2024-12-01", duration: "37 min", scripture: "Isaiah 7:14", topic: "Advent", series: "advent", thumbnail: "https://images.unsplash.com/photo-1543525238-54e3d131f629?w=600&q=80", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", hasNotes: true },
  { id: 9, title: "The Light Has Come", speaker: "Pastor David Kimani", date: "2024-12-08", duration: "41 min", scripture: "John 1:9–14", topic: "Advent", series: "advent", thumbnail: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80", videoUrl: null, hasNotes: true },
];

function PlayIcon({ size = 20, color = "white" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function DownloadIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function BookIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function SearchIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={MID_GRAY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ─── Sermon Notes Reader Modal ───────────────────────────────────────────────
function SermonNotesReader({ sermon, notesMap, onClose }) {
  const notes = notesMap[sermon.id] || fallbackSermonNotes[sermon.id];
  const scrollRef = useRef(null);
  const [readProgress, setReadProgress] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [activeSection, setActiveSection] = useState(0);

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
      <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(44,44,42,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", borderRadius: 16, padding: 48, maxWidth: 400, textAlign: "center" }}>
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
      {/* Backdrop close */}
      <div style={{ position: "absolute", inset: 0 }} onClick={onClose} />

      <div style={{ position: "relative", width: "100%", maxWidth: 780, background: "#FAFAF8", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.4)", zIndex: 1 }}>

        {/* Progress bar */}
        <div style={{ height: 3, background: "#EAE9E6", position: "absolute", top: 0, left: 0, right: 0, zIndex: 2 }}>
          <div style={{ height: "100%", width: `${readProgress}%`, background: COPPER, transition: "width 0.2s" }} />
        </div>

        {/* Header toolbar */}
        <div style={{ padding: "20px 32px 16px", borderBottom: "1px solid #E8E7E4", display: "flex", alignItems: "center", gap: 16, background: "white", marginTop: 3 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: COPPER, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 3 }}>{sermon.scripture}</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: CHARCOAL, lineHeight: 1.3 }}>{sermon.title}</h2>
            <div style={{ fontSize: 12, color: MID_GRAY, marginTop: 2 }}>{sermon.speaker} · {dateStr}</div>
          </div>

          {/* Font size */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #E0DFDB", borderRadius: 8, padding: "4px 10px" }}>
            <button onClick={() => setFontSize(f => Math.max(13, f - 1))} style={{ background: "none", border: "none", cursor: "pointer", color: MID_GRAY, fontSize: 16, lineHeight: 1, padding: "2px 4px" }}>A</button>
            <div style={{ width: 1, height: 16, background: "#E0DFDB" }} />
            <button onClick={() => setFontSize(f => Math.min(22, f + 1))} style={{ background: "none", border: "none", cursor: "pointer", color: CHARCOAL, fontSize: 20, lineHeight: 1, padding: "2px 4px" }}>A</button>
          </div>

          {/* Download */}
          <button style={{ display: "flex", alignItems: "center", gap: 7, background: COPPER_LIGHT, color: COPPER_DARK, border: "none", borderRadius: 8, padding: "9px 16px", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
            <DownloadIcon size={14} /> Download PDF
          </button>

          {/* Close */}
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 8, background: "#F2F1EF", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: MID_GRAY, flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Body: sidebar + content */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>

          {/* Sidebar — outline nav */}
          <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid #E8E7E4", background: "#F7F6F4", overflowY: "auto", padding: "24px 0" }}>
            <div style={{ padding: "0 20px 12px", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9E9D99" }}>Outline</div>
            {notes.outline.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveSection(i);
                  const el = document.getElementById(`section-${i}`);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 20px", background: activeSection === i ? COPPER_LIGHT : "transparent", border: "none", borderLeft: `3px solid ${activeSection === i ? COPPER : "transparent"}`, cursor: "pointer", transition: "background 0.15s" }}
              >
                <div style={{ fontSize: 11, color: activeSection === i ? COPPER_DARK : COPPER, fontWeight: 600, marginBottom: 2 }}>{item.ref}</div>
                <div style={{ fontSize: 13, color: activeSection === i ? CHARCOAL : "#555553", lineHeight: 1.35, fontFamily: "'DM Sans', sans-serif" }}>{item.point}</div>
              </button>
            ))}

            <div style={{ margin: "20px 20px 12px", borderTop: "1px solid #E2E1DE" }} />
            <div style={{ padding: "0 20px 10px", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9E9D99" }}>Sections</div>
            {notes.sections.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  const el = document.getElementById(`prose-${i}`);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "7px 20px", background: "transparent", border: "none", cursor: "pointer" }}
              >
                <div style={{ fontSize: 12, color: MID_GRAY, fontFamily: "'DM Sans', sans-serif" }}>{s.heading}</div>
              </button>
            ))}
          </div>

          {/* Main reading area */}
          <div ref={scrollRef} onScroll={handleScroll} style={{ flex: 1, overflowY: "auto", padding: "40px 48px 60px" }}>

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
            <div style={{ background: CHARCOAL, borderRadius: 12, padding: "28px 32px", marginBottom: 32 }}>
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

            {/* Read progress indicator at bottom */}
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
function AudioPlayer({ duration }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
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
          <span style={{ fontSize: 12, color: "#888", fontFamily: "'DM Sans', sans-serif" }}>{Math.floor(progress / 100 * parseInt(duration))} min</span>
          <span style={{ fontSize: 12, color: "#888", fontFamily: "'DM Sans', sans-serif" }}>{duration}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Video Embed ──────────────────────────────────────────────────────────────
function isVideoFile(url) {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url || "");
}

function isAudioFile(url) {
  return /\.(mp3|wav|m4a|ogg|aac)(\?|$)/i.test(url || "");
}

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
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Click to load video</span>
        </div>
      )}
      {loaded && <iframe title="Sermon player" src={url + "?autoplay=1"} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} frameBorder="0" allow="autoplay; fullscreen" allowFullScreen />}
    </div>
  );
}

// ─── Featured Sermon ──────────────────────────────────────────────────────────
function SermonMedia({ sermon }) {
  if (sermon.videoUrl) {
    return <VideoEmbed url={sermon.videoUrl} />;
  }
  if (sermon.audioUrl) {
    if (isAudioFile(sermon.audioUrl)) {
      return <audio controls src={sermon.audioUrl} style={{ width: "100%" }} />;
    }
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

function FeaturedSermon({ sermon, seriesData, onReadNotes }) {
  return (
    <div style={{ background: CHARCOAL, borderRadius: 16, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, marginBottom: 56 }}>
      <div style={{ position: "relative" }}>
        <img src={sermon.thumbnail} alt={sermon.title} style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 360 }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to right, transparent 60%, ${CHARCOAL})` }} />
        <div style={{ position: "absolute", top: 20, left: 20 }}>
          <span style={{ background: COPPER, color: CHARCOAL, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "5px 12px", borderRadius: 20 }}>Latest Sermon</span>
        </div>
      </div>
      <div style={{ padding: "40px 40px 36px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, color: COPPER, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
            {sermon.series ? seriesData.find(s => s.id === sermon.series)?.title : sermon.topic}
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: "white", lineHeight: 1.3, marginBottom: 12 }}>{sermon.title}</h2>
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
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img src={sermon.thumbnail} alt={sermon.title} style={{ width: "100%", height: 170, objectFit: "cover", display: "block", transition: "transform 0.4s", transform: hovered ? "scale(1.04)" : "scale(1)" }} />
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
  const seriesSermons = sermons.filter(s => s.series === series.id);
  return (
    <div style={{ background: "white", borderRadius: 14, overflow: "hidden", border: "1px solid #E6E5E2", marginBottom: 16 }}>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
        <img src={series.cover} alt={series.title} style={{ width: 88, height: 72, objectFit: "cover", flexShrink: 0 }} />
        <div style={{ flex: 1, padding: "14px 20px" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: CHARCOAL, marginBottom: 3 }}>{series.title}</div>
          <div style={{ fontSize: 12, color: MID_GRAY }}>{series.description}</div>
        </div>
        <div style={{ padding: "0 20px", textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: COPPER, fontFamily: "'Playfair Display', serif" }}>{seriesSermons.length}</div>
          <div style={{ fontSize: 11, color: MID_GRAY }}>messages</div>
        </div>
        <div style={{ padding: "0 20px", color: MID_GRAY, flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
        </div>
      </div>
      {open && (
        <div style={{ borderTop: "1px solid #F0EFEB" }}>
          {seriesSermons.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 20px", borderBottom: i < seriesSermons.length - 1 ? "1px solid #F5F4F2" : "none", background: i % 2 === 0 ? "white" : "#FAFAF9" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: COPPER_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: COPPER_DARK, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: CHARCOAL, marginBottom: 2 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: MID_GRAY }}>{s.speaker} · {s.scripture} · {s.duration}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
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
  const [seriesData, setSeriesData] = useState(fallbackSeriesData);
  const [sermonsData, setSermonsData] = useState(fallbackSermonsData);
  const [sermonNotesMap, setSermonNotesMap] = useState(fallbackSermonNotes);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeries, setFilterSeries] = useState("all");
  const [filterSpeaker, setFilterSpeaker] = useState("all");
  const [filterTopic, setFilterTopic] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("archive");
  const [notesSermon, setNotesSermon] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [series, sermons] = await Promise.all([
          fetchJson("/api/sermons/series"),
          fetchJson("/api/sermons"),
        ]);

        if (!mounted) return;

        if (Array.isArray(series) && series.length) {
          setSeriesData(
            series.map((item) => ({
              id: item.id,
              title: item.title,
              cover: item.cover_url || "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=400&q=80",
              count: item.count || 0,
              description: item.description || "",
            }))
          );
        }

        if (Array.isArray(sermons) && sermons.length) {
          const mappedSermons = sermons.map((item) => ({
            id: item.id,
            title: item.title,
            speaker: item.speaker,
            date: item.date,
            duration: item.duration || "—",
            scripture: item.scripture || "",
            topic: item.topic || "",
            series: item.series_id || "",
            thumbnail: item.thumbnail || "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80",
            videoUrl: item.video_url || null,
            audioUrl: item.audio_url || null,
            documentUrl: item.document_url || null,
            hasNotes: Boolean(item.has_notes),
            featured: Boolean(item.featured),
          }));

          setSermonsData(mappedSermons);

          const notesEntries = await Promise.all(
            mappedSermons
              .filter((item) => item.hasNotes)
              .map(async (item) => {
                try {
                  const notes = await fetchJson(`/api/sermons/${item.id}/notes`);
                  return [
                    item.id,
                    {
                      outline: notes.outline || [],
                      keyScriptures: notes.key_scriptures || [],
                      sections: notes.sections || [],
                      reflectionQuestions: notes.reflection_questions || [],
                      prayer: notes.prayer || "",
                    },
                  ];
                } catch {
                  return [item.id, fallbackSermonNotes[item.id] || null];
                }
              })
          );

          const notesMap = { ...fallbackSermonNotes };
          notesEntries.forEach(([id, notes]) => {
            if (notes) notesMap[id] = notes;
          });
          setSermonNotesMap(notesMap);
        }
      } catch {
        if (!mounted) return;
        setSeriesData(fallbackSeriesData);
        setSermonsData(fallbackSermonsData);
        setSermonNotesMap(fallbackSermonNotes);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const speakers = useMemo(() => [...new Set(sermonsData.map((s) => s.speaker))], [sermonsData]);
  const topics = useMemo(() => [...new Set(sermonsData.map((s) => s.topic))], [sermonsData]);

  const featured = useMemo(
    () => sermonsData.find((s) => s.featured) || sermonsData[0],
    [sermonsData]
  );

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
  const handleFilter = () => setPage(1);

  const selectStyle = { padding: "10px 14px", border: "1px solid #E0DFDb", borderRadius: 9, fontSize: 13, color: CHARCOAL, background: "white", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235F5E5A' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 32, minWidth: 150 };

  return (
    <>
      <style>{globalStyles}</style>
      {notesSermon && <SermonNotesReader sermon={notesSermon} notesMap={sermonNotesMap} onClose={() => setNotesSermon(null)} />}

      <div style={{ minHeight: "100vh", background: LIGHT_GRAY }}>
        {/* Header */}
        <div style={{ background: CHARCOAL, padding: "56px 48px 48px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ fontSize: 11, color: COPPER, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Sunday Messages</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 700, color: "white", marginBottom: 14, lineHeight: 1.2 }}>Sermons &amp; Teaching</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", maxWidth: 520, lineHeight: 1.7 }}>Every message preached from this pulpit — available to listen, watch, and read. Let the Word dwell in you richly.</p>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px 80px" }}>
          {/* Search & Filter */}
          <div style={{ background: "white", borderRadius: 14, padding: "24px 28px", margin: "32px 0 40px", border: "1px solid #E6E5E2" }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ position: "relative", flex: "1 1 260px" }}>
                <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}><SearchIcon /></div>
                <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); handleFilter(); }} placeholder="Search by title, speaker, scripture, or topic…" style={{ width: "100%", padding: "10px 14px 10px 42px", border: "1px solid #E0DFDb", borderRadius: 9, fontSize: 13, color: CHARCOAL, outline: "none", fontFamily: "'DM Sans', sans-serif" }} />
              </div>
              <select value={filterSeries} onChange={e => { setFilterSeries(e.target.value); handleFilter(); }} style={selectStyle}>
                <option value="all">All Series</option>
                {seriesData.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
              <select value={filterSpeaker} onChange={e => { setFilterSpeaker(e.target.value); handleFilter(); }} style={selectStyle}>
                <option value="all">All Speakers</option>
                {speakers.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filterTopic} onChange={e => { setFilterTopic(e.target.value); handleFilter(); }} style={selectStyle}>
                <option value="all">All Topics</option>
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="date" value={dateRange.from} onChange={e => { setDateRange(p => ({ ...p, from: e.target.value })); handleFilter(); }} style={{ ...selectStyle, minWidth: 0, paddingRight: 14, backgroundImage: "none" }} />
                <span style={{ fontSize: 12, color: MID_GRAY }}>to</span>
                <input type="date" value={dateRange.to} onChange={e => { setDateRange(p => ({ ...p, to: e.target.value })); handleFilter(); }} style={{ ...selectStyle, minWidth: 0, paddingRight: 14, backgroundImage: "none" }} />
              </div>
              {(searchQuery || filterSeries !== "all" || filterSpeaker !== "all" || filterTopic !== "all" || dateRange.from || dateRange.to) && (
                <button onClick={() => { setSearchQuery(""); setFilterSeries("all"); setFilterSpeaker("all"); setFilterTopic("all"); setDateRange({ from: "", to: "" }); setPage(1); }} style={{ fontSize: 12, color: MID_GRAY, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "'DM Sans', sans-serif" }}>Clear filters</button>
              )}
            </div>
          </div>

          <FeaturedSermon sermon={featured} seriesData={seriesData} onReadNotes={setNotesSermon} />

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 32, borderBottom: "2px solid #E6E5E2" }}>
            {[["archive", "Sermon Archive"], ["series", "By Series"]].map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{ padding: "12px 24px", background: "none", border: "none", borderBottom: activeTab === id ? `2px solid ${COPPER}` : "2px solid transparent", marginBottom: -2, cursor: "pointer", fontSize: 14, fontWeight: 500, color: activeTab === id ? COPPER_DARK : MID_GRAY, fontFamily: "'DM Sans', sans-serif", transition: "color 0.15s" }}>{label}</button>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", paddingBottom: 10 }}>
              <span style={{ fontSize: 13, color: MID_GRAY }}>{filtered.length} message{filtered.length !== 1 ? "s" : ""}</span>
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24, marginBottom: 40 }}>
                  {paged.map(s => <SermonCard key={s.id} sermon={s} onReadNotes={setNotesSermon} />)}
                </div>
              )}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #E0DFDb", background: page === 1 ? "#F5F4F2" : "white", color: page === 1 ? "#C0BFBC" : CHARCOAL, cursor: page === 1 ? "default" : "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>← Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setPage(n)} style={{ width: 38, height: 38, borderRadius: 8, border: `1px solid ${n === page ? COPPER : "#E0DFDb"}`, background: n === page ? COPPER : "white", color: n === page ? "white" : CHARCOAL, cursor: "pointer", fontSize: 13, fontWeight: n === page ? 600 : 400, fontFamily: "'DM Sans', sans-serif" }}>{n}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #E0DFDb", background: page === totalPages ? "#F5F4F2" : "white", color: page === totalPages ? "#C0BFBC" : CHARCOAL, cursor: page === totalPages ? "default" : "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Next →</button>
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