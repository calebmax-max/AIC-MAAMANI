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
  { id: "home", label: "Home" },
  { id: "about", label: "About Us" },
  { id: "sermons", label: "Sermons" },
  { id: "events", label: "Events" },
  { id: "blog", label: "Blog" },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact Us" },
];

const ROUTES = {
  home: ChurchHomepage,
  about: AboutPage,
  sermons: SermonsPage,
  events: ChurchEvents,
  blog: BlogDevotionals,
  gallery: ChurchGallery,
  contact: ContactPage,
  admin: AdminPanel,
};

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

function SharedNav({ current }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [current]);

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

  const transparent = current === "home" && !scrolled;

  return (
    <nav
      ref={navRef}
      className="shared-nav"
      style={{
        background: transparent ? "transparent" : "rgba(44,44,42,0.97)",
        borderBottom: transparent ? "none" : "1px solid rgba(239,159,39,0.18)",
        backdropFilter: transparent ? "none" : "blur(14px)",
      }}
    >
      <a href="#home" className="nav-brand">
        <span style={{ color: COPPER }}>◇</span> AIC MAAMANI
      </a>

      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        {NAV_ITEMS.map(({ id, label }) => {
          const active = current === id;
          const baseColor = active ? COPPER : "rgba(255,255,255,0.68)";

          return (
            <a
              key={id}
              href={`#${id}`}
              className={`nav-link${active ? " active" : ""}`}
              onClick={() => setMenuOpen(false)}
              style={{ color: baseColor }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = COPPER;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = baseColor;
              }}
            >
              {label}
            </a>
          );
        })}
      </div>

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

function SharedFooter() {
  return (
    <footer
      className="site-footer"
      style={{
        background: "#1A1918",
        borderTop: "1px solid rgba(239,159,39,0.12)",
        padding: "3rem 2.5rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: "1.35rem",
          color: "#fff",
          marginBottom: "0.4rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
        }}
      >
        <span style={{ color: COPPER }}>◇</span> AIC MAAMANI
      </div>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 300,
          fontSize: "0.73rem",
          letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.3)",
          marginBottom: "1.75rem",
        }}
      >
        A Church for Every Soul · Maamani, Kitui
      </p>
      <div className="footer-links">
        {NAV_ITEMS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 400,
              fontSize: "0.7rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = COPPER;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.35)";
            }}
          >
            {label}
          </a>
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
            fontSize: "0.82rem",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = COPPER;
            e.currentTarget.style.borderColor = COPPER;
            e.currentTarget.style.background = "rgba(239,159,39,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.35)";
            e.currentTarget.style.borderColor = "rgba(239,159,39,0.28)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          ◈
        </a>
      </div>
      <div
        style={{
          marginTop: "2rem",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 300,
          fontSize: "0.63rem",
          letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.18)",
        }}
      >
        Developed by TONIE TECH 2026
      </div>
    </footer>
  );
}

export default function App() {
  const route = useHashRoute();
  const RouteComponent = ROUTES[route] || ROUTES.home;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  const isAdmin = route === "admin";
  const isHome = route === "home";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800&display=swap');
      `}</style>

      {!isAdmin && <SharedNav current={route} />}

      <main
        style={{
          paddingTop: !isAdmin && !isHome ? "var(--nav-h)" : 0,
        }}
      >
        <RouteComponent showNav={false} />
      </main>

      {!isAdmin && route !== "about" && <SharedFooter />}
    </>
  );
}
