import { useEffect, useState, useRef } from "react";
import "./App.css";
import ChurchHomepage from "./ChurchHomepage";
import AboutPage from "./AboutPage";
import SermonsPage from "./SermonsPage";
import ChurchEvents from "./ChurchEvents";
import BlogDevotionals from "./Blogdevotionals";
import ChurchGallery from "./Churchgallery";
import ContactPage from "./ContactPage";
import AdminPanel from "./Adminpanel";

const COPPER = "#EF9F27";
const NAV_ITEMS = [
  { id: "home",    label: "Home" },
  { id: "about",   label: "About" },
  { id: "sermons", label: "Sermons" },
  { id: "events",  label: "Events" },
  { id: "blog",    label: "Blog" },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact Us" },
];

const ROUTES = {
  home:    ChurchHomepage,
  about:   AboutPage,
  sermons: SermonsPage,
  events:  ChurchEvents,
  blog:    BlogDevotionals,
  gallery: ChurchGallery,
  contact: ContactPage,
  admin:   AdminPanel,
};

/* ── Hash-based router ──────────────────────────────────────── */
function useHashRoute() {
  const getRoute = () => window.location.hash.replace("#", "") || "home";
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const handler = () => setRoute(getRoute());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  return route;
}

/* ── Shared navigation ──────────────────────────────────────── */
function SharedNav({ current }) {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const navRef                    = useRef(null);

  /* Scroll detection → solidify nav background */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close menu when route changes */
  useEffect(() => { setMenuOpen(false); }, [current]);

  /* Close menu when clicking outside the nav */
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

  /* Determine whether nav should be transparent */
  const transparent = current === "home" && !scrolled;

  return (
    <nav
      ref={navRef}
      className="shared-nav"
      style={{
        background:     transparent ? "transparent" : "rgba(44,44,42,0.97)",
        borderBottom:   transparent ? "none" : "1px solid rgba(239,159,39,0.18)",
        backdropFilter: transparent ? "none"        : "blur(14px)",
      }}
    >
      {/* ── Brand (always far left) ────────────────── */}
      <a href="#home" className="nav-brand">
        <span style={{ color: COPPER }}>◇</span> AIC MAAMANI
      </a>

      {/* ── Link list (far right on desktop, dropdown on mobile) ── */}
      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        {NAV_ITEMS.map(({ id, label }) => {
          const active     = current === id;
          const baseColor  = active ? COPPER : "rgba(255,255,255,0.68)";

          return (
            <a
              key={id}
              href={`#${id}`}
              className={`nav-link${active ? " active" : ""}`}
              onClick={() => setMenuOpen(false)}
              style={{ color: baseColor }}
              onMouseEnter={(e) => { e.currentTarget.style.color = COPPER; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = baseColor; }}
            >
              {label}
            </a>
          );
        })}
      </div>

      {/* ── Hamburger — renders after links in DOM but CSS `order` pins it far right on mobile ── */}
      <button
        type="button"
        className="nav-toggle"
        onClick={() => setMenuOpen((v) => !v)}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
      >
        <span>{menuOpen ? "✕" : "☰"}</span>
        <span>{menuOpen ? "CLOSE" : "MENU"}</span>
      </button>
    </nav>
  );
}

/* ── Root app ────────────────────────────────────────────────── */
export default function App() {
  const route          = useHashRoute();
  const RouteComponent = ROUTES[route] || ROUTES.home;

  /* Scroll to top on every route change */
  useEffect(() => { window.scrollTo(0, 0); }, [route]);

  const isAdmin = route === "admin";
  const isHome  = route === "home";

  return (
    <>
      {/* ── Google Fonts ─────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800&display=swap');
      `}</style>

      {/* ── Shared nav (hidden on admin) ─────────────── */}
      {!isAdmin && <SharedNav current={route} />}

      {/* ── Page content ─────────────────────────────── */}
      <main
        className="page-shell"
        style={{
          /* push content below fixed nav on all non-home, non-admin pages */
          paddingTop: !isAdmin && !isHome ? "var(--nav-h)" : 0,
        }}
      >
        <RouteComponent showNav={false} />
      </main>
    </>
  );
}
