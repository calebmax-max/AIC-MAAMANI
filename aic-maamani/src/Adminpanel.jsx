import { useState, useEffect, useCallback } from "react";

const API = process.env.REACT_APP_API_BASE_URL || "";
const AUTH_KEY = "aicMaamaniAdminToken";

const COPPER = "#EF9F27";
const COPPER2 = "#BA7517";
const CHARCOAL = "#2C2C2A";
const MID = "#5F5E5A";
const LIGHT = "#F2F1EF";
const WHITE = "#FFFFFF";
const DANGER = "#C0392B";
const SUCCESS = "#1D6A42";

const fonts = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');`;

const css = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'DM Sans', sans-serif; background: ${LIGHT}; color: ${CHARCOAL}; }
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: ${LIGHT}; }
::-webkit-scrollbar-thumb { background: #bbb; border-radius: 3px; }
input, select, textarea {
  font-family: 'DM Sans', sans-serif;
  background: ${WHITE};
  border: 1px solid #ddd;
  color: ${CHARCOAL};
  padding: 0.55rem 0.8rem;
  font-size: 0.875rem;
  width: 100%;
  outline: none;
  transition: border 0.2s;
  border-radius: 2px;
}
input:focus, select:focus, textarea:focus { border-color: ${COPPER}; }
textarea { resize: vertical; min-height: 90px; }
label { font-size: 0.72rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: ${MID}; display: block; margin-bottom: 4px; }
.form-row { margin-bottom: 1rem; }
.badge { display: inline-block; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 9px; border-radius: 2px; }
.badge-gold { background: #FEF3D9; color: ${COPPER2}; }
.badge-green { background: #D1F2E1; color: ${SUCCESS}; }
.badge-red { background: #FDECEA; color: ${DANGER}; }
.badge-gray { background: #EBEBEB; color: ${MID}; }
table { width: 100%; border-collapse: collapse; font-size: 0.86rem; }
th { font-size: 0.65rem; letter-spacing: 0.13em; text-transform: uppercase; color: ${MID}; font-weight: 500; padding: 0.6rem 0.8rem; border-bottom: 2px solid #E0DDD8; text-align: left; }
td { padding: 0.75rem 0.8rem; border-bottom: 1px solid #E8E6E0; vertical-align: top; }
tr:last-child td { border-bottom: none; }
tr:hover td { background: #FAF8F5; }
.btn { display: inline-flex; align-items: center; gap: 6px; font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 0.78rem; letter-spacing: 0.08em; cursor: pointer; border: none; padding: 0.5rem 1.1rem; transition: all 0.2s; }
.btn-primary { background: ${COPPER}; color: ${CHARCOAL}; }
.btn-primary:hover { background: ${COPPER2}; color: ${WHITE}; }
.btn-danger { background: transparent; border: 1px solid ${DANGER}; color: ${DANGER}; }
.btn-danger:hover { background: ${DANGER}; color: ${WHITE}; }
.btn-ghost { background: transparent; border: 1px solid #D0CCC5; color: ${MID}; }
.btn-ghost:hover { border-color: ${CHARCOAL}; color: ${CHARCOAL}; }
.modal-overlay { position: fixed; inset: 0; background: rgba(26,25,24,0.6); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal { background: ${WHITE}; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; padding: 2rem; border-top: 4px solid ${COPPER}; }
.modal-title { font-family: 'DM Serif Display', serif; font-size: 1.4rem; color: ${CHARCOAL}; margin-bottom: 1.5rem; }
.toast { position: fixed; bottom: 1.5rem; right: 1.5rem; background: ${CHARCOAL}; color: ${WHITE}; padding: 0.8rem 1.4rem; font-size: 0.82rem; letter-spacing: 0.05em; z-index: 300; border-left: 4px solid ${COPPER}; animation: slideIn 0.3s ease; }
@keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
.stat-card { background: ${WHITE}; border: 1px solid #E0DDD8; padding: 1.25rem 1.5rem; border-left: 4px solid ${COPPER}; }
.stat-num { font-family: 'DM Serif Display', serif; font-size: 2rem; color: ${CHARCOAL}; line-height: 1; }
.stat-label { font-size: 0.7rem; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: ${MID}; margin-top: 0.3rem; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.page-title { font-family: 'DM Serif Display', serif; font-size: 1.75rem; color: ${CHARCOAL}; }
.card { background: ${WHITE}; border: 1px solid #E0DDD8; }
.empty { text-align: center; padding: 3rem 1rem; color: ${MID}; font-size: 0.88rem; }
`;

// ─── API helpers ───────────────────────────────────────────────────────────────

async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem(AUTH_KEY);
  const res = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    if (res.status === 401 && token) localStorage.removeItem(AUTH_KEY);
    throw new Error(err.detail || "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className="toast">{message}</div>;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <h2 className="modal-title" style={{ margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.3rem", color: MID, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Confirm ─────────────────────────────────────────────────────────────────

function Confirm({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 380 }}>
        <p style={{ fontSize: "0.93rem", color: MID, marginBottom: "1.5rem", lineHeight: 1.7 }}>{message}</p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

function LoginGate({ onLogin, loading, error, password, setPassword }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: "2rem",
      background: "linear-gradient(135deg, #f6f1e8 0%, #ece6dd 50%, #f8f4ee 100%)",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 460,
        background: WHITE,
        border: "1px solid #E0DDD8",
        borderTop: `4px solid ${COPPER}`,
        padding: "2rem",
        boxShadow: "0 18px 40px rgba(44,44,42,0.08)",
      }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2rem", color: CHARCOAL, marginBottom: "0.35rem" }}>
          AIC Maamani Admin
        </div>
        <p style={{ fontSize: "0.9rem", color: MID, lineHeight: 1.7, marginBottom: "1.5rem" }}>
          Sign in to manage sermons, events, messages, team members, blog posts, and gallery content.
        </p>
        <div className="form-row">
          <label>Admin Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") onLogin(); }}
            placeholder="Enter admin password"
          />
        </div>
        {error && <div style={{ fontSize: "0.82rem", color: DANGER, marginBottom: "1rem" }}>{error}</div>}
        <button className="btn btn-primary" onClick={onLogin} disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
          {loading ? "Signing in..." : "Enter Admin Panel"}
        </button>
      </div>
    </div>
  );
}

function Dashboard({ stats }) {
  const items = [
    { label: "Sermons", value: stats.sermons ?? "—", icon: "🎙" },
    { label: "Events", value: stats.events ?? "—", icon: "📅" },
    { label: "Blog Posts", value: stats.posts ?? "—", icon: "✍" },
    { label: "Gallery Photos", value: stats.photos ?? "—", icon: "🖼" },
    { label: "Gallery Videos", value: stats.videos ?? "—", icon: "▶" },
    { label: "Messages", value: stats.messages ?? "—", icon: "✉" },
    { label: "Team Members", value: stats.team ?? "—", icon: "🙏" },
  ];
  return (
    <div>
      <div className="section-header">
        <h1 className="page-title">Dashboard</h1>
        <span style={{ fontSize: "0.75rem", color: MID }}>AIC Maamani Admin</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
        {items.map(({ label, value, icon }) => (
          <div className="stat-card" key={label}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>{icon}</div>
            <div className="stat-num">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: WHITE, border: "1px solid #E0DDD8", padding: "1.5rem", borderLeft: `4px solid ${COPPER}` }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.1rem", marginBottom: "0.6rem" }}>Quick Links</div>
        <p style={{ fontSize: "0.85rem", color: MID, lineHeight: 1.8 }}>
          Use the sidebar to manage sermons, events, blog posts, gallery photos and videos, contact messages, and team members.
          All changes are immediately reflected on the church website.
        </p>
      </div>
    </div>
  );
}

// ─── Sermons ─────────────────────────────────────────────────────────────────

const emptySermon = { title: "", speaker: "", date: "", duration: "", scripture: "", topic: "", series_id: "", thumbnail: "", video_url: "", has_notes: false, featured: false };
const emptySermonNotes = {
  outline: "[]",
  key_scriptures: "[]",
  sections: "[]",
  reflection_questions: "[]",
  prayer: "",
};

function SermonsPanel({ toast }) {
  const [sermons, setSermons] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptySermon);
  const [confirm, setConfirm] = useState(null);
  const [notesModal, setNotesModal] = useState(null);
  const [notesForm, setNotesForm] = useState(emptySermonNotes);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, sr] = await Promise.all([apiFetch("/sermons"), apiFetch("/sermons/series")]);
      setSermons(s); setSeries(sr);
    } catch (e) { toast("Failed to load sermons"); }
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm(emptySermon); setModal("new"); };
  const openEdit = (s) => {
    setForm({ ...s, date: s.date?.slice(0, 10) || "", series_id: s.series_id || "", thumbnail: s.thumbnail || "", video_url: s.video_url || "", scripture: s.scripture || "", topic: s.topic || "", duration: s.duration || "" });
    setModal("edit");
  };

  const openNotes = async (s) => {
    try {
      const notes = await apiFetch(`/sermons/${s.id}/notes`);
      setNotesForm({
        outline: JSON.stringify(notes.outline || [], null, 2),
        key_scriptures: JSON.stringify(notes.key_scriptures || [], null, 2),
        sections: JSON.stringify(notes.sections || [], null, 2),
        reflection_questions: JSON.stringify(notes.reflection_questions || [], null, 2),
        prayer: notes.prayer || "",
      });
    } catch {
      setNotesForm(emptySermonNotes);
    }
    setNotesModal(s);
  };

  const save = async () => {
    try {
      if (modal === "new") {
        await apiFetch("/sermons", { method: "POST", body: JSON.stringify({ ...form }) });
        toast("Sermon created");
      } else {
        await apiFetch(`/sermons/${form.id}`, { method: "PUT", body: JSON.stringify({ ...form }) });
        toast("Sermon updated");
      }
      setModal(null); load();
    } catch (e) { toast(e.message); }
  };

  const del = async (id) => {
    try {
      await apiFetch(`/sermons/${id}`, { method: "DELETE" });
      toast("Sermon deleted"); setConfirm(null); load();
    } catch (e) { toast(e.message); }
  };

  const saveNotes = async () => {
    try {
      const payload = {
        sermon_id: notesModal.id,
        outline: JSON.parse(notesForm.outline || "[]"),
        key_scriptures: JSON.parse(notesForm.key_scriptures || "[]"),
        sections: JSON.parse(notesForm.sections || "[]"),
        reflection_questions: JSON.parse(notesForm.reflection_questions || "[]"),
        prayer: notesForm.prayer,
      };
      try {
        await apiFetch(`/sermons/${notesModal.id}/notes`, { method: "PUT", body: JSON.stringify(payload) });
      } catch {
        await apiFetch(`/sermons/${notesModal.id}/notes`, { method: "POST", body: JSON.stringify(payload) });
      }
      toast("Sermon notes saved");
      setNotesModal(null);
      load();
    } catch (e) {
      toast("Notes must be valid JSON arrays");
    }
  };

  const F = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="section-header">
        <h1 className="page-title">Sermons</h1>
        <button className="btn btn-primary" onClick={openNew}>+ New Sermon</button>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        {loading ? <div className="empty">Loading…</div> : sermons.length === 0 ? <div className="empty">No sermons yet.</div> : (
          <table>
            <thead><tr>
              <th>Title</th><th>Speaker</th><th>Date</th><th>Series</th><th>Featured</th><th></th>
            </tr></thead>
            <tbody>
              {sermons.map(s => (
                <tr key={s.id}>
                  <td><strong style={{ fontWeight: 500 }}>{s.title}</strong><br /><span style={{ fontSize: "0.75rem", color: MID }}>{s.scripture}</span></td>
                  <td>{s.speaker}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{s.date}</td>
                  <td>{series.find(sr => sr.id === s.series_id)?.title || <span style={{ color: "#bbb" }}>—</span>}</td>
                  <td>{s.featured ? <span className="badge badge-gold">Featured</span> : <span className="badge badge-gray">No</span>}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button className="btn btn-ghost" style={{ marginRight: 6 }} onClick={() => openEdit(s)}>Edit</button>
                    <button className="btn btn-ghost" style={{ marginRight: 6 }} onClick={() => openNotes(s)}>Notes</button>
                    <button className="btn btn-danger" onClick={() => setConfirm(s.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title={modal === "new" ? "New Sermon" : "Edit Sermon"} onClose={() => setModal(null)}>
          {[["title", "Title *"], ["speaker", "Speaker *"], ["date", "Date *"], ["duration", "Duration"], ["scripture", "Scripture"], ["topic", "Topic"], ["thumbnail", "Thumbnail URL"], ["video_url", "Video URL"]].map(([k, label]) => (
            <div className="form-row" key={k}>
              <label>{label}</label>
              <input type={k === "date" ? "date" : "text"} value={form[k] || ""} onChange={e => F(k, e.target.value)} />
            </div>
          ))}
          <div className="form-row">
            <label>Series</label>
            <select value={form.series_id || ""} onChange={e => F("series_id", e.target.value)}>
              <option value="">— None —</option>
              {series.map(sr => <option key={sr.id} value={sr.id}>{sr.title}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.25rem" }}>
            {[["featured", "Featured"], ["has_notes", "Has Notes"]].map(([k, label]) => (
              <label key={k} style={{ display: "flex", alignItems: "center", gap: 7, textTransform: "none", letterSpacing: 0, fontSize: "0.85rem", cursor: "pointer" }}>
                <input type="checkbox" checked={form[k]} onChange={e => F(k, e.target.checked)} style={{ width: "auto" }} /> {label}
              </label>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>Save Sermon</button>
          </div>
        </Modal>
      )}

      {confirm && <Confirm message="Delete this sermon? This cannot be undone." onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}

      {notesModal && (
        <Modal title={`Notes: ${notesModal.title}`} onClose={() => setNotesModal(null)}>
          {[
            ["outline", "Outline JSON"],
            ["key_scriptures", "Key Scriptures JSON"],
            ["sections", "Sections JSON"],
            ["reflection_questions", "Reflection Questions JSON"],
          ].map(([k, label]) => (
            <div className="form-row" key={k}>
              <label>{label}</label>
              <textarea
                value={notesForm[k]}
                onChange={(e) => setNotesForm((f) => ({ ...f, [k]: e.target.value }))}
                style={{ minHeight: 110, fontFamily: "monospace", fontSize: "0.8rem" }}
              />
            </div>
          ))}
          <div className="form-row">
            <label>Prayer</label>
            <textarea
              value={notesForm.prayer}
              onChange={(e) => setNotesForm((f) => ({ ...f, prayer: e.target.value }))}
              style={{ minHeight: 90 }}
            />
          </div>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => setNotesModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveNotes}>Save Notes</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Events ──────────────────────────────────────────────────────────────────

const emptyEvent = { title: "", category: "general", date: "", time: "", end_time: "", location: "", online: false, description: "", spots: "" };

function EventsPanel({ toast }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyEvent);
  const [confirm, setConfirm] = useState(null);
  const [regModal, setRegModal] = useState(null);
  const [regs, setRegs] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try { setEvents(await apiFetch("/events")); }
    catch (e) { toast("Failed to load events"); }
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (ev) => {
    setForm({ ...ev, date: ev.date?.slice(0, 10) || "", time: ev.time || "", end_time: ev.end_time || "", location: ev.location || "", description: ev.description || "", spots: ev.spots ?? "" });
    setModal("edit");
  };

  const save = async () => {
    try {
      const payload = { ...form, spots: form.spots === "" ? null : Number(form.spots) };
      if (modal === "new") { await apiFetch("/events", { method: "POST", body: JSON.stringify(payload) }); toast("Event created"); }
      else { await apiFetch(`/events/${form.id}`, { method: "PUT", body: JSON.stringify(payload) }); toast("Event updated"); }
      setModal(null); load();
    } catch (e) { toast(e.message); }
  };

  const del = async (id) => {
    try { await apiFetch(`/events/${id}`, { method: "DELETE" }); toast("Event deleted"); setConfirm(null); load(); }
    catch (e) { toast(e.message); }
  };

  const viewRegs = async (ev) => {
    try {
      const r = await apiFetch(`/events/${ev.id}/registrations`);
      setRegs(r); setRegModal(ev.title);
    } catch (e) { toast("Could not load registrations"); }
  };

  const F = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const cats = ["general", "youth", "worship", "outreach", "prayer", "community"];

  return (
    <div>
      <div className="section-header">
        <h1 className="page-title">Events</h1>
        <button className="btn btn-primary" onClick={() => { setForm(emptyEvent); setModal("new"); }}>+ New Event</button>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        {loading ? <div className="empty">Loading…</div> : events.length === 0 ? <div className="empty">No events yet.</div> : (
          <table>
            <thead><tr><th>Title</th><th>Date</th><th>Category</th><th>Location</th><th>Spots</th><th></th></tr></thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id}>
                  <td><strong style={{ fontWeight: 500 }}>{ev.title}</strong></td>
                  <td style={{ whiteSpace: "nowrap" }}>{ev.date}<br /><span style={{ fontSize: "0.75rem", color: MID }}>{ev.time}{ev.end_time ? ` – ${ev.end_time}` : ""}</span></td>
                  <td><span className="badge badge-gray">{ev.category}</span></td>
                  <td>{ev.location || "—"}</td>
                  <td>{ev.spots ? `${ev.spots_taken ?? 0}/${ev.spots}` : "Open"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button className="btn btn-ghost" style={{ marginRight: 6 }} onClick={() => viewRegs(ev)}>Registrations</button>
                    <button className="btn btn-ghost" style={{ marginRight: 6 }} onClick={() => openEdit(ev)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => setConfirm(ev.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title={modal === "new" ? "New Event" : "Edit Event"} onClose={() => setModal(null)}>
          {[["title", "Title *"], ["date", "Date *"], ["time", "Start Time"], ["end_time", "End Time"], ["location", "Location"], ["spots", "Capacity (leave blank for unlimited)"]].map(([k, label]) => (
            <div className="form-row" key={k}>
              <label>{label}</label>
              <input type={k === "date" ? "date" : "text"} value={form[k] || ""} onChange={e => F(k, e.target.value)} />
            </div>
          ))}
          <div className="form-row">
            <label>Category</label>
            <select value={form.category || ""} onChange={e => F("category", e.target.value)}>
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Description</label>
            <textarea value={form.description || ""} onChange={e => F("description", e.target.value)} />
          </div>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 7, textTransform: "none", letterSpacing: 0, fontSize: "0.85rem", cursor: "pointer" }}>
              <input type="checkbox" checked={form.online} onChange={e => F("online", e.target.checked)} style={{ width: "auto" }} /> Online event
            </label>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>Save Event</button>
          </div>
        </Modal>
      )}

      {regModal && (
        <Modal title={`Registrations — ${regModal}`} onClose={() => setRegModal(null)}>
          {regs.length === 0 ? <p style={{ color: MID, fontSize: "0.88rem" }}>No registrations yet.</p> : (
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Registered</th></tr></thead>
              <tbody>
                {regs.map(r => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.email}</td>
                    <td>{r.phone || "—"}</td>
                    <td style={{ fontSize: "0.75rem" }}>{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Modal>
      )}

      {confirm && <Confirm message="Delete this event? Registrations will also be removed." onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

const emptyPost = { title: "", category: "devotional", excerpt: "", author: "", initials: "", date: "", read_time: "", bio_role: "", bio: "", tags: "", emoji: "", hero_bg: "", body: "[]" };

function BlogPanel({ toast }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyPost);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setPosts(await apiFetch("/blog")); }
    catch (e) { toast("Failed to load posts"); }
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (p) => {
    setForm({ ...p, tags: (p.tags || []).join(", "), body: JSON.stringify(p.body || [], null, 2) });
    setModal("edit");
  };

  const save = async () => {
    try {
      let parsedBody = [];
      try { parsedBody = JSON.parse(form.body); } catch { toast("Invalid JSON in body field"); return; }
      const payload = { ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean), body: parsedBody };
      if (modal === "new") { await apiFetch("/blog", { method: "POST", body: JSON.stringify(payload) }); toast("Post created"); }
      else { await apiFetch(`/blog/${form.id}`, { method: "PUT", body: JSON.stringify(payload) }); toast("Post updated"); }
      setModal(null); load();
    } catch (e) { toast(e.message); }
  };

  const del = async (id) => {
    try { await apiFetch(`/blog/${id}`, { method: "DELETE" }); toast("Post deleted"); setConfirm(null); load(); }
    catch (e) { toast(e.message); }
  };

  const F = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const cats = ["devotional", "teaching", "testimony", "announcement"];

  return (
    <div>
      <div className="section-header">
        <h1 className="page-title">Blog & Devotionals</h1>
        <button className="btn btn-primary" onClick={() => { setForm(emptyPost); setModal("new"); }}>+ New Post</button>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        {loading ? <div className="empty">Loading…</div> : posts.length === 0 ? <div className="empty">No posts yet.</div> : (
          <table>
            <thead><tr><th>Title</th><th>Author</th><th>Category</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id}>
                  <td>
                    <strong style={{ fontWeight: 500 }}>{p.title}</strong><br />
                    <span style={{ fontSize: "0.75rem", color: MID }}>{p.excerpt?.slice(0, 60)}{p.excerpt?.length > 60 ? "…" : ""}</span>
                  </td>
                  <td>{p.author || "—"}</td>
                  <td><span className="badge badge-gray">{p.category}</span></td>
                  <td style={{ whiteSpace: "nowrap" }}>{p.date}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button className="btn btn-ghost" style={{ marginRight: 6 }} onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => setConfirm(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title={modal === "new" ? "New Post" : "Edit Post"} onClose={() => setModal(null)}>
          {[["title", "Title *"], ["author", "Author"], ["initials", "Initials (e.g. GW)"], ["date", "Date"], ["read_time", "Read Time (e.g. 4 min read)"], ["bio_role", "Author Role"], ["tags", "Tags (comma-separated)"], ["emoji", "Emoji label"], ["hero_bg", "Hero background color (#hex)"]].map(([k, label]) => (
            <div className="form-row" key={k}>
              <label>{label}</label>
              <input type="text" value={form[k] || ""} onChange={e => F(k, e.target.value)} />
            </div>
          ))}
          <div className="form-row">
            <label>Category</label>
            <select value={form.category || ""} onChange={e => F("category", e.target.value)}>
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Excerpt</label>
            <textarea value={form.excerpt || ""} onChange={e => F("excerpt", e.target.value)} style={{ minHeight: 70 }} />
          </div>
          <div className="form-row">
            <label>Author Bio</label>
            <textarea value={form.bio || ""} onChange={e => F("bio", e.target.value)} style={{ minHeight: 60 }} />
          </div>
          <div className="form-row">
            <label>Body (JSON array of {`{type, text}`} objects)</label>
            <textarea value={form.body || ""} onChange={e => F("body", e.target.value)} style={{ minHeight: 130, fontFamily: "monospace", fontSize: "0.8rem" }} />
          </div>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>Save Post</button>
          </div>
        </Modal>
      )}

      {confirm && <Confirm message="Delete this post permanently?" onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

function GalleryPanel({ toast }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ src: "", alt: "", album: "Worship", height: 800 });
  const [confirm, setConfirm] = useState(null);
  const albums = ["Worship", "Youth", "Outreach 2024", "Community", "Missions"];

  const load = useCallback(async () => {
    setLoading(true);
    try { setPhotos(await apiFetch("/gallery/photos")); }
    catch (e) { toast("Failed to load photos"); }
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    try {
      await apiFetch("/gallery/photos", { method: "POST", body: JSON.stringify({ ...form, height: Number(form.height) }) });
      toast("Photo added"); setModal(false); load();
    } catch (e) { toast(e.message); }
  };

  const del = async (id) => {
    try { await apiFetch(`/gallery/photos/${id}`, { method: "DELETE" }); toast("Photo deleted"); setConfirm(null); load(); }
    catch (e) { toast(e.message); }
  };

  const F = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="section-header">
        <h1 className="page-title">Gallery</h1>
        <button className="btn btn-primary" onClick={() => { setForm({ src: "", alt: "", album: "Worship", height: 800 }); setModal(true); }}>+ Add Photo</button>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        {loading ? <div className="empty">Loading…</div> : photos.length === 0 ? <div className="empty">No photos yet.</div> : (
          <table>
            <thead><tr><th>Preview</th><th>Alt Text</th><th>Album</th><th></th></tr></thead>
            <tbody>
              {photos.map(p => (
                <tr key={p.id}>
                  <td>
                    <img src={p.src} alt={p.alt || ""} style={{ width: 80, height: 55, objectFit: "cover", border: "1px solid #E0DDD8" }}
                      onError={e => { e.target.style.display = "none"; }} />
                  </td>
                  <td>{p.alt || <span style={{ color: "#bbb" }}>—</span>}</td>
                  <td><span className="badge badge-gray">{p.album}</span></td>
                  <td><button className="btn btn-danger" onClick={() => setConfirm(p.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title="Add Photo" onClose={() => setModal(false)}>
          <div className="form-row"><label>Image URL *</label><input type="text" value={form.src} onChange={e => F("src", e.target.value)} /></div>
          <div className="form-row"><label>Alt Text</label><input type="text" value={form.alt} onChange={e => F("alt", e.target.value)} /></div>
          <div className="form-row">
            <label>Album</label>
            <select value={form.album} onChange={e => F("album", e.target.value)}>
              {albums.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="form-row"><label>Height (px)</label><input type="number" value={form.height} onChange={e => F("height", e.target.value)} /></div>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>Add Photo</button>
          </div>
        </Modal>
      )}

      {confirm && <Confirm message="Delete this photo permanently?" onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ─── Messages ────────────────────────────────────────────────────────────────

function VideosPanel({ toast }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", thumb: "", youtube_id: "", date: "" });
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setVideos(await apiFetch("/gallery/videos")); }
    catch (e) { toast("Failed to load videos"); }
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    try {
      await apiFetch("/gallery/videos", { method: "POST", body: JSON.stringify({ ...form }) });
      toast("Video added");
      setModal(false);
      load();
    } catch (e) {
      toast(e.message);
    }
  };

  const del = async (id) => {
    try {
      await apiFetch(`/gallery/videos/${id}`, { method: "DELETE" });
      toast("Video deleted");
      setConfirm(null);
      load();
    } catch (e) {
      toast(e.message);
    }
  };

  const F = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="section-header">
        <h1 className="page-title">Gallery Videos</h1>
        <button className="btn btn-primary" onClick={() => { setForm({ title: "", thumb: "", youtube_id: "", date: "" }); setModal(true); }}>+ Add Video</button>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        {loading ? <div className="empty">Loadingâ€¦</div> : videos.length === 0 ? <div className="empty">No videos yet.</div> : (
          <table>
            <thead><tr><th>Preview</th><th>Title</th><th>YouTube ID</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {videos.map(v => (
                <tr key={v.id}>
                  <td>
                    {v.thumb ? (
                      <img
                        src={v.thumb}
                        alt={v.title || ""}
                        style={{ width: 100, height: 60, objectFit: "cover", border: "1px solid #E0DDD8" }}
                        onError={e => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <span className="badge badge-gray">No thumbnail</span>
                    )}
                  </td>
                  <td><strong style={{ fontWeight: 500 }}>{v.title}</strong></td>
                  <td style={{ fontSize: "0.8rem", color: MID }}>{v.youtube_id || "—"}</td>
                  <td>{v.date || "—"}</td>
                  <td><button className="btn btn-danger" onClick={() => setConfirm(v.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title="Add Video" onClose={() => setModal(false)}>
          <div className="form-row"><label>Title *</label><input type="text" value={form.title} onChange={e => F("title", e.target.value)} /></div>
          <div className="form-row"><label>Thumbnail URL</label><input type="text" value={form.thumb} onChange={e => F("thumb", e.target.value)} /></div>
          <div className="form-row"><label>YouTube ID</label><input type="text" value={form.youtube_id} onChange={e => F("youtube_id", e.target.value)} /></div>
          <div className="form-row"><label>Date</label><input type="text" value={form.date} onChange={e => F("date", e.target.value)} /></div>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>Add Video</button>
          </div>
        </Modal>
      )}

      {confirm && <Confirm message="Delete this video permanently?" onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}
function MessagesPanel({ toast }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setMessages(await apiFetch(`/contact?unread_only=${unreadOnly}`)); }
    catch (e) { toast("Failed to load messages"); }
    setLoading(false);
  }, [toast, unreadOnly]);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    try { await apiFetch(`/contact/${id}/read`, { method: "PATCH" }); toast("Marked as read"); load(); }
    catch (e) { toast(e.message); }
  };

  const del = async (id) => {
    try { await apiFetch(`/contact/${id}`, { method: "DELETE" }); toast("Message deleted"); setConfirm(null); setSelected(null); load(); }
    catch (e) { toast(e.message); }
  };

  const unread = messages.filter(m => !m.read).length;

  return (
    <div>
      <div className="section-header">
        <h1 className="page-title">Contact Messages {unread > 0 && <span className="badge badge-gold" style={{ fontSize: "0.75rem", marginLeft: 8 }}>{unread} unread</span>}</h1>
        <label style={{ display: "flex", alignItems: "center", gap: 7, textTransform: "none", letterSpacing: 0, fontSize: "0.85rem", cursor: "pointer" }}>
          <input type="checkbox" checked={unreadOnly} onChange={e => setUnreadOnly(e.target.checked)} style={{ width: "auto" }} /> Unread only
        </label>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        {loading ? <div className="empty">Loading…</div> : messages.length === 0 ? <div className="empty">No messages.</div> : (
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Date</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {messages.map(m => (
                <tr key={m.id} style={{ cursor: "pointer" }} onClick={() => setSelected(m)}>
                  <td><strong style={{ fontWeight: m.read ? 400 : 600 }}>{m.name}</strong></td>
                  <td>{m.email}</td>
                  <td>{m.subject}</td>
                  <td style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>{new Date(m.created_at).toLocaleDateString()}</td>
                  <td>{m.read ? <span className="badge badge-gray">Read</span> : <span className="badge badge-gold">Unread</span>}</td>
                  <td onClick={e => e.stopPropagation()} style={{ whiteSpace: "nowrap" }}>
                    {!m.read && <button className="btn btn-ghost" style={{ marginRight: 6 }} onClick={() => markRead(m.id)}>Mark Read</button>}
                    <button className="btn btn-danger" onClick={() => setConfirm(m.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <Modal title={`Message from ${selected.name}`} onClose={() => setSelected(null)}>
          <div style={{ marginBottom: "1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {[["Email", selected.email], ["Phone", selected.phone || "—"], ["Subject", selected.subject], ["Date", new Date(selected.created_at).toLocaleString()]].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: MID, marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: "0.88rem" }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: LIGHT, padding: "1rem 1.25rem", borderLeft: `3px solid ${COPPER}`, marginBottom: "1.25rem" }}>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.8, color: CHARCOAL }}>{selected.message}</p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            {!selected.read && <button className="btn btn-ghost" onClick={() => { markRead(selected.id); setSelected(s => ({ ...s, read: true })); }}>Mark Read</button>}
            <button className="btn btn-danger" onClick={() => setConfirm(selected.id)}>Delete</button>
          </div>
        </Modal>
      )}

      {confirm && <Confirm message="Delete this message permanently?" onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ─── Team ─────────────────────────────────────────────────────────────────────

const emptyMember = { name: "", role: "", bio: "", photo: "", order: 0 };

function TeamPanel({ toast }) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyMember);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setTeam(await apiFetch("/about/team")); }
    catch (e) { toast("Failed to load team"); }
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (m) => { setForm({ ...m, photo: m.photo || "" }); setModal("edit"); };

  const save = async () => {
    try {
      if (modal === "new") { await apiFetch("/about/team", { method: "POST", body: JSON.stringify({ ...form, order: Number(form.order) }) }); toast("Member added"); }
      else { await apiFetch(`/about/team/${form.id}`, { method: "PUT", body: JSON.stringify({ ...form, order: Number(form.order) }) }); toast("Member updated"); }
      setModal(null); load();
    } catch (e) { toast(e.message); }
  };

  const del = async (id) => {
    try { await apiFetch(`/about/team/${id}`, { method: "DELETE" }); toast("Member removed"); setConfirm(null); load(); }
    catch (e) { toast(e.message); }
  };

  const F = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="section-header">
        <h1 className="page-title">Team Members</h1>
        <button className="btn btn-primary" onClick={() => { setForm(emptyMember); setModal("new"); }}>+ Add Member</button>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        {loading ? <div className="empty">Loading…</div> : team.length === 0 ? <div className="empty">No team members yet.</div> : (
          <table>
            <thead><tr><th>#</th><th>Name</th><th>Role</th><th>Bio</th><th></th></tr></thead>
            <tbody>
              {team.map(m => (
                <tr key={m.id}>
                  <td style={{ color: MID, fontSize: "0.8rem" }}>{m.order}</td>
                  <td><strong style={{ fontWeight: 500 }}>{m.name}</strong></td>
                  <td>{m.role || "—"}</td>
                  <td style={{ fontSize: "0.8rem", color: MID, maxWidth: 240 }}>{m.bio?.slice(0, 80)}{m.bio?.length > 80 ? "…" : ""}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button className="btn btn-ghost" style={{ marginRight: 6 }} onClick={() => openEdit(m)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => setConfirm(m.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal title={modal === "new" ? "Add Team Member" : "Edit Member"} onClose={() => setModal(null)}>
          {[["name", "Name *"], ["role", "Role"], ["photo", "Photo URL"], ["order", "Display Order"]].map(([k, label]) => (
            <div className="form-row" key={k}>
              <label>{label}</label>
              <input type={k === "order" ? "number" : "text"} value={form[k] ?? ""} onChange={e => F(k, e.target.value)} />
            </div>
          ))}
          <div className="form-row"><label>Bio</label><textarea value={form.bio || ""} onChange={e => F("bio", e.target.value)} /></div>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>Save Member</button>
          </div>
        </Modal>
      )}

      {confirm && <Confirm message="Remove this team member?" onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "◈" },
  { id: "sermons", label: "Sermons", icon: "♪" },
  { id: "events", label: "Events", icon: "⌁" },
  { id: "blog", label: "Blog", icon: "✎" },
  { id: "gallery", label: "Gallery", icon: "◧" },
  { id: "videos", label: "Videos", icon: "▶" },
  { id: "messages", label: "Messages", icon: "✉" },
  { id: "team", label: "Team", icon: "❖" },
];

export default function AdminPanel() {
  const [page, setPage] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({});
  const [authed, setAuthed] = useState(() => Boolean(localStorage.getItem(AUTH_KEY)));
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const showToast = useCallback((msg) => setToast(msg), []);
  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    setPassword("");
    setStats({});
    setPage("dashboard");
  }, []);

  useEffect(() => {
    if (!authed) return;
    (async () => {
      try {
        const data = await apiFetch("/admin/stats");
        setStats(data);
      } catch (e) {
        if (String(e.message || "").includes("Admin authentication required")) {
          logout();
        }
      }
    })();
  }, [authed, page, logout]);

  const login = async () => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Login failed");
      localStorage.setItem(AUTH_KEY, data.access_token);
      setAuthed(true);
      setPassword("");
      showToast("Signed in to admin panel");
    } catch (e) {
      setAuthError(e.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const panels = {
    dashboard: <Dashboard stats={stats} />,
    sermons: <SermonsPanel toast={showToast} />,
    events: <EventsPanel toast={showToast} />,
    blog: <BlogPanel toast={showToast} />,
    gallery: <GalleryPanel toast={showToast} />,
    videos: <VideosPanel toast={showToast} />,
    messages: <MessagesPanel toast={showToast} />,
    team: <TeamPanel toast={showToast} />,
  };

  if (!authed) {
    return (
      <>
        <style>{fonts}</style>
        <style>{css}</style>
        <LoginGate
          onLogin={login}
          loading={authLoading}
          error={authError}
          password={password}
          setPassword={setPassword}
        />
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </>
    );
  }

  return (
    <>
      <style>{fonts}</style>
      <style>{css}</style>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <aside style={{ width: 220, background: CHARCOAL, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "1.5rem 1.4rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.15rem", color: WHITE, display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ color: COPPER }}>◈</span> AIC MAAMANI
            </div>
            <div style={{ fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginTop: "0.25rem" }}>Admin Panel</div>
          </div>
          <nav style={{ flex: 1, padding: "0.75rem 0" }}>
            {NAV.map(({ id, label, icon }) => {
              const active = page === id;
              return (
                <button
                  key={id}
                  onClick={() => setPage(id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "0.7rem",
                    padding: "0.65rem 1.4rem",
                    background: active ? "rgba(239,159,39,0.12)" : "transparent",
                    borderLeft: active ? "3px solid " + COPPER : "3px solid transparent",
                    border: "none", cursor: "pointer",
                    color: active ? COPPER : "rgba(255,255,255,0.55)",
                    fontFamily: "'DM Sans', sans-serif", fontSize: "0.84rem", fontWeight: active ? 500 : 400,
                    textAlign: "left", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
                >
                  <span style={{ fontSize: "1rem", lineHeight: 1 }}>{icon}</span> {label}
                </button>
              );
            })}
          </nav>
          <div style={{ padding: "1rem 1.4rem", borderTop: "1px solid rgba(255,255,255,0.07)", fontSize: "0.68rem", color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em" }}>
            v1.0.0 · AIC Maamani
          </div>
          <div style={{ padding: "0 1.4rem 1.2rem" }}>
            <button
              className="btn btn-ghost"
              onClick={logout}
              style={{ width: "100%", justifyContent: "center", borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)" }}
            >
              Log out
            </button>
          </div>
        </aside>
        <main style={{ flex: 1, padding: "2rem 2.5rem", overflowY: "auto", maxWidth: "calc(100vw - 220px)" }}>
          {panels[page]}
        </main>
      </div>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}


