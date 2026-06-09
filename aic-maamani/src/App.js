import { useEffect, useState } from "react";
import ChurchHomepage from "./ChurchHomepage";
import AboutPage from "./AboutPage";
import SermonsPage from "./SermonsPage";
import ChurchEvents from "./ChurchEvents";
import BlogDevotionals from "./Blogdevotionals";
import ChurchGallery from "./Churchgallery";
import ContactPage from "./ContactPage";
import AdminPanel from "./Adminpanel";

const COPPER = "#EF9F27";
const CHARCOAL = "#2C2C2A";
const LIGHT = "#F2F1EF";
const MID = "#5F5E5A";

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="shared-nav"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        minHeight: "68px",
        background: current === "home" && !scrolled ? "transparent" : CHARCOAL,
        borderBottom:
          current === "home" && !scrolled
            ? "none"
            : "1px solid rgba(239,159,39,0.18)",
        backdropFilter:
          current === "home" && !scrolled ? "none" : "blur(14px)",
        transition: "all 0.3s",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2.5rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <a
          href="#home"
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "1.4rem",
            color: "#fff",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: COPPER }}>◇</span> AIC MAAMANI
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
      </div>

      <div className="nav-inner" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        <div className="nav-links" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {NAV_ITEMS.map(({ id, label }) => {
          const active = current === id;
          const linkColor =
            current === "home" && !scrolled
              ? active
                ? COPPER
                : "rgba(255,255,255,0.72)"
              : active
                ? COPPER
                : "rgba(255,255,255,0.68)";

          return (
            <a
              key={id}
              className="nav-link"
              href={`#${id}`}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: active ? 500 : 400,
                letterSpacing: "0.1em",
                fontSize: "0.78rem",
                textTransform: "uppercase",
                color: linkColor,
                textDecoration: "none",
                transition: "color 0.2s",
                borderBottom: active
                  ? `1px solid ${COPPER}`
                  : "1px solid transparent",
                paddingBottom: "2px",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = COPPER;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = linkColor;
              }}
            >
              {label}
            </a>
          );
        })}
      </div>
    </div>
  </nav>
  );
}

export default function App() {
  const route = useHashRoute();
  const RouteComponent = ROUTES[route] || ROUTES.home;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  const needsTopOffset = route !== "home";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: ${LIGHT}; color: ${CHARCOAL}; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: ${MID}; border-radius: 3px; }
        a { -webkit-tap-highlight-color: transparent; }

        .page-shell { width: min(1200px, 100%); margin: 0 auto; }
        .page-shell > section { width: 100%; }
        .grid-stack { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; }
        .timeline-row { display: grid; grid-template-columns: 118px 1fr; gap: 0 2.5rem; }
        .timeline-row .timeline-meta { text-align: right; padding-right: 1.5rem; }
        .timeline-row .timeline-dot { position: absolute; right: -6px; top: 10px; }
        .hero-grid { display: grid; grid-template-columns: 340px 1fr; gap: 5rem; align-items: start; }
        .values-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem; }
        .contact-form .form-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
        .contact-form .form-row.full { grid-template-columns: 1fr; }
        .shared-nav .nav-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
        .shared-nav .nav-links { display: flex; flex-wrap: wrap; gap: 0.85rem; align-items: center; justify-content: flex-end; width: 100%; }
        .shared-nav .nav-links a { white-space: nowrap; }
        .shared-nav .nav-link { font-size: 0.75rem; }

        @media (max-width: 1024px) {
          .page-shell { padding: 0 1.2rem; }
          .grid-stack { grid-template-columns: 1fr; }
          .hero-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .values-grid { grid-template-columns: 1fr; }
          .timeline-row { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          nav.shared-nav { padding: 0 1rem; }
          nav.shared-nav { min-height: auto; }
          nav.shared-nav .nav-inner { flex-direction: column; align-items: stretch; justify-content: center; padding: 0.85rem 0; gap: 0.9rem; }
          nav.shared-nav .nav-links { justify-content: center; gap: 0.75rem; }
          nav.shared-nav .nav-link { font-size: 0.72rem; }
          .about-nav .nav-inner { flex-direction: column; align-items: stretch; justify-content: center; padding: 0.75rem 0; gap: 0.8rem; }
          .about-nav .nav-links { justify-content: center; }
          .contact-form .form-row { grid-template-columns: 1fr; }
          .contact-form button { width: 100%; }
          .page-shell { padding: 0 0.9rem; }
        }
      `}</style>

      {route !== "admin" && <SharedNav current={route} />}

      <main className="page-shell" style={{ paddingTop: needsTopOffset && route !== "admin" ? "68px" : 0 }}>
        {route === "home" ? (
          <RouteComponent showNav={false} />
        ) : route === "about" ? (
          <RouteComponent showNav={false} />
        ) : route === "admin" ? (
          <RouteComponent />
        ) : (
          <RouteComponent />
        )}
      </main>
    </>
  );
}
