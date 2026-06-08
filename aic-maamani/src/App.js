import { useState, useEffect } from "react";
import ChurchHomepage from "./ChurchHomepage";
import AboutPage from "./AboutPage";
import SermonsPage from "./SermonsPage";
import ChurchEvents from "./ChurchEvents";

// ── Palette ────────────────────────────────────────────────
const COPPER   = "#EF9F27";
const CHARCOAL = "#2C2C2A";
const LIGHT    = "#F2F1EF";
const MID      = "#5F5E5A";

// ── Routes ─────────────────────────────────────────────────
const ROUTES = [
  { id: "home",    label: "Home",    Component: ChurchHomepage },
  { id: "about",   label: "About",   Component: AboutPage      },
  { id: "sermons", label: "Sermons", Component: SermonsPage    },
  { id: "events",  label: "Events",  Component: ChurchEvents   },
];

// ── Hash router ────────────────────────────────────────────
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

// Pages that already render their own nav internally
const PAGES_WITH_OWN_NAV = new Set(["home", "about"]);

// ── Shared Nav (only for pages without their own) ──────────
function SharedNav({ current }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  if (PAGES_WITH_OWN_NAV.has(current)) return null;

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      height: "68px",
      background: scrolled ? "rgba(44,44,42,0.97)" : CHARCOAL,
      borderBottom: scrolled ? `1px solid rgba(239,159,39,0.18)` : "none",
      backdropFilter: scrolled ? "blur(14px)" : "none",
      transition: "all 0.3s",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 2.5rem",
    }}>
      <a href="#home" style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: "1.4rem", color: "#fff",
        textDecoration: "none",
        display: "flex", alignItems: "center", gap: "0.5rem",
      }}>
        <span style={{ color: COPPER }}>◈</span> Grace Covenant
      </a>
      <div style={{ display: "flex", gap: "2.2rem", alignItems: "center" }}>
        {ROUTES.map(({ id, label }) => {
          const active = current === id;
          return (
            <a key={id} href={`#${id}`} style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: active ? 500 : 400,
              letterSpacing: "0.1em", fontSize: "0.78rem",
              textTransform: "uppercase",
              color: active ? COPPER : "rgba(255,255,255,0.65)",
              textDecoration: "none", transition: "color 0.2s",
              borderBottom: active ? `1px solid ${COPPER}` : "1px solid transparent",
              paddingBottom: "2px",
            }}
              onMouseEnter={e => { e.target.style.color = COPPER; }}
              onMouseLeave={e => { e.target.style.color = active ? COPPER : "rgba(255,255,255,0.65)"; }}
            >{label}</a>
          );
        })}
        <a href="#give" style={{
          background: COPPER, color: CHARCOAL,
          padding: "0.5rem 1.4rem",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500, letterSpacing: "0.12em",
          fontSize: "0.75rem", textTransform: "uppercase",
          textDecoration: "none",
        }}>Give Now</a>
      </div>
    </nav>
  );
}

// ── App ────────────────────────────────────────────────────
export default function App() {
  const route = useHashRoute();
  useEffect(() => { window.scrollTo(0, 0); }, [route]);

  const activeRoute = ROUTES.find(r => r.id === route) || ROUTES[0];
  const { Component } = activeRoute;
  const needsTopOffset = !PAGES_WITH_OWN_NAV.has(route);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&family=Playfair+Display:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: ${LIGHT}; color: ${CHARCOAL}; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: ${MID}; border-radius: 3px; }
      `}</style>
      <SharedNav current={route} />
      <main style={{ paddingTop: needsTopOffset ? "68px" : 0 }}>
        <Component />
      </main>
    </>
  );
}