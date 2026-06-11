import { useState, useEffect, useCallback, useRef } from "react";

const API = `${process.env.REACT_APP_API_BASE_URL || window.location.origin}/api`;

function resolveUrl(src) {
  if (!src) return "";
  if (/^(?:https?:)?\/\//i.test(src) || src.startsWith("data:")) return src;
  const base = (process.env.REACT_APP_API_BASE_URL || window.location.origin).replace(/\/$/, "");
  return `${base}${src}`;
}

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
.section-header { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
.page-title { font-family: 'DM Serif Display', serif; font-size: 1.75rem; color: ${CHARCOAL}; }
.card { background: ${WHITE}; border: 1px solid #E0DDD8; }
.empty { text-align: center; padding: 3rem 1rem; color: ${MID}; font-size: 0.88rem; }
.admin-outer { padding: 1.5rem; }
.admin-tabs-row { display: flex; gap: 0.5rem; flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 0.25rem; }
.table-scroll { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; }
@media (max-width: 600px) {
  .modal { padding: 1.25rem; }
  .page-title { font-size: 1.35rem; }
  .admin-outer { padding: 1rem 0.75rem; }
  .toast { right: 0.75rem; left: 0.75rem; bottom: 0.75rem; }
}
`;

// ─── API helpers ───────────────────────────────────────────────────────────────

async function apiFetch(path, opts = {}) {
  const isFormData = typeof FormData !== "undefined" && opts.body instanceof FormData;
  const { headers: customHeaders, ...restOpts } = opts;
  const hasJsonBody = !isFormData && restOpts.body !== undefined && restOpts.body !== null;
  const token = typeof window !== 'undefined' ? localStorage.getItem('aic_maamani_token') : null;
  const headers = {
    ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };
  const res = await fetch(`${API}${path}`, {
    ...restOpts,
    credentials: "include",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
}

function buildFormData(fields) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (value instanceof File) {
      if (value.name) formData.append(key, value);
      return;
    }
    formData.append(key, String(value));
  });
  return formData;
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

function LoginGate({ onLogin, loading, error, username, setUsername, password, setPassword }) {
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
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") onLogin(); }}
            placeholder="Enter admin username"
          />
        </div>
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

const emptySermon = {
  title: "",
  speaker: "",
  date: "",
  duration: "",
  scripture: "",
  topic: "",
  series_id: "",
  thumbnail: "",
  document_text: "",
  video_file: null,
  audio_file: null,
  document_file: null,
  has_notes: false,
  featured: false,
};
const emptySermonNotes = {
  outline: [{ ref: "", point: "", subText: "" }],
  keyScriptures: [{ ref: "", text: "" }],
  sections: [{ heading: "", body: "" }],
  reflectionQuestions: "",
  prayer: "",
};

const cloneEmptyNotes = () => ({
  outline: [{ ref: "", point: "", subText: "" }],
  keyScriptures: [{ ref: "", text: "" }],
  sections: [{ heading: "", body: "" }],
  reflectionQuestions: "",
  prayer: "",
});

const normalizeOutlineItems = (items) => {
  const source = Array.isArray(items) && items.length ? items : [{ ref: "", point: "", subText: "" }];
  return source.map((item) => ({
    ref: item?.ref || "",
    point: item?.point || "",
    subText: Array.isArray(item?.sub) ? item.sub.join("\n") : "",
  }));
};

const normalizeKeyScriptures = (items) => {
  const source = Array.isArray(items) && items.length ? items : [{ ref: "", text: "" }];
  return source.map((item) => ({
    ref: item?.ref || "",
    text: item?.text || "",
  }));
};

const normalizeSections = (items) => {
  const source = Array.isArray(items) && items.length ? items : [{ heading: "", body: "" }];
  return source.map((item) => ({
    heading: item?.heading || "",
    body: item?.body || "",
  }));
};

const rowsFromText = (value) =>
  String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

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
    setForm({
      ...emptySermon,
      ...s,
      date: s.date?.slice(0, 10) || "",
      series_id: s.series_id || "",
      scripture: s.scripture || "",
      topic: s.topic || "",
      duration: s.duration || "",
      thumbnail: s.thumbnail || "",
      document_text: s.document_text || "",
      video_file: null,
      audio_file: null,
      document_file: null,
    });
    setModal("edit");
  };

  const openNotes = async (s) => {
    try {
      const notes = await apiFetch(`/sermons/${s.id}/notes`);
      setNotesForm({
        outline: normalizeOutlineItems(notes.outline),
        keyScriptures: normalizeKeyScriptures(notes.key_scriptures),
        sections: normalizeSections(notes.sections),
        reflectionQuestions: Array.isArray(notes.reflection_questions) ? notes.reflection_questions.join("\n") : "",
        prayer: notes.prayer || "",
      });
    } catch {
      setNotesForm(cloneEmptyNotes());
    }
    setNotesModal(s);
  };

  const save = async () => {
    try {
      const payload = buildFormData({
        title: form.title,
        speaker: form.speaker,
        date: form.date,
        duration: form.duration,
        scripture: form.scripture,
          topic: form.topic,
          series_id: form.series_id,
          thumbnail: form.thumbnail,
          document_text: form.document_text,
          has_notes: form.has_notes,
          featured: form.featured,
          video_file: form.video_file,
          audio_file: form.audio_file,
          document_file: form.document_file,
      });
      if (modal === "new") {
        await apiFetch("/sermons", { method: "POST", body: payload });
        toast("Sermon created");
      } else {
        await apiFetch(`/sermons/${form.id}`, { method: "PUT", body: payload });
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
        outline: notesForm.outline
          .filter((item) => item.ref || item.point || item.subText)
          .map((item) => ({
            ref: item.ref.trim(),
            point: item.point.trim(),
            sub: rowsFromText(item.subText),
          })),
        key_scriptures: notesForm.keyScriptures
          .filter((item) => item.ref || item.text)
          .map((item) => ({
            ref: item.ref.trim(),
            text: item.text.trim(),
          })),
        sections: notesForm.sections
          .filter((item) => item.heading || item.body)
          .map((item) => ({
            heading: item.heading.trim(),
            body: item.body.trim(),
          })),
        reflection_questions: rowsFromText(notesForm.reflectionQuestions),
        prayer: notesForm.prayer.trim(),
      };
      try {
        await apiFetch(`/sermons/${notesModal.id}/notes`, { method: "PUT", body: JSON.stringify(payload) });
      } catch (putErr) {
        // Only create new notes if they don't exist yet (404). Re-throw all other errors.
        if (!putErr.message?.includes("404") && !putErr.message?.toLowerCase().includes("not found")) throw putErr;
        await apiFetch(`/sermons/${notesModal.id}/notes`, { method: "POST", body: JSON.stringify(payload) });
      }
      toast("Sermon notes saved");
      setNotesModal(null);
      load();
    } catch (e) {
      toast(e.message || "Unable to save notes");
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
          {[["title", "Title *"], ["speaker", "Speaker *"], ["date", "Date *"], ["scripture", "Scripture"], ["topic", "Topic"]].map(([k, label]) => (
            <div className="form-row" key={k}>
              <label>{label}</label>
              <input type={k === "date" ? "date" : "text"} value={form[k] || ""} onChange={e => F(k, e.target.value)} />
            </div>
          ))}
          <div className="form-row">
            <label>Duration</label>
            <input type="text" value={form.duration || ""} onChange={e => F("duration", e.target.value)} placeholder="e.g. 45 min, 1h 20m, 1:20" />
          </div>
          <div className="form-row">
            <label>Thumbnail URL</label>
            <input type="text" value={form.thumbnail || ""} onChange={e => F("thumbnail", e.target.value)} placeholder="https://…" />
            {form.thumbnail && (
              <img src={form.thumbnail} alt="thumbnail preview" style={{ marginTop: 8, width: "100%", maxHeight: 120, objectFit: "cover", borderRadius: 4, border: "1px solid #E0DDD8" }} onError={e => { e.currentTarget.style.display = "none"; }} />
            )}
          </div>
          <div className="form-row">
            <label>Video File</label>
            <input type="file" accept="video/*" onChange={e => F("video_file", e.target.files?.[0] || null)} />
          </div>
          <div className="form-row">
            <label>Audio File</label>
            <input type="file" accept="audio/*" onChange={e => F("audio_file", e.target.files?.[0] || null)} />
          </div>
            <div className="form-row">
              <label>Document File</label>
              <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={e => F("document_file", e.target.files?.[0] || null)} />
            </div>
            <div className="form-row">
              <label>Document Text</label>
              <textarea
                value={form.document_text || ""}
                onChange={e => F("document_text", e.target.value)}
                placeholder="Paste sermon text here if you want it readable directly on the page"
                rows={8}
              />
              <div style={{ fontSize: "0.75rem", color: MID, lineHeight: 1.6, marginTop: 6 }}>
                If you paste text here, it will be shown on the sermon page. If this is left blank, the app will try to extract text from the uploaded document file.
              </div>
            </div>
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
          <div className="form-row">
            <label>Outline</label>
            {notesForm.outline.map((item, index) => (
              <div key={`outline-${index}`} style={{ display: "grid", gap: 8, marginBottom: 10 }}>
                <input
                  type="text"
                  placeholder="Reference"
                  value={item.ref}
                  onChange={(e) => setNotesForm((f) => {
                    const outline = [...f.outline];
                    outline[index] = { ...outline[index], ref: e.target.value };
                    return { ...f, outline };
                  })}
                />
                <input
                  type="text"
                  placeholder="Point"
                  value={item.point}
                  onChange={(e) => setNotesForm((f) => {
                    const outline = [...f.outline];
                    outline[index] = { ...outline[index], point: e.target.value };
                    return { ...f, outline };
                  })}
                />
                <textarea
                  placeholder="Subpoints, one per line"
                  value={item.subText}
                  onChange={(e) => setNotesForm((f) => {
                    const outline = [...f.outline];
                    outline[index] = { ...outline[index], subText: e.target.value };
                    return { ...f, outline };
                  })}
                  style={{ minHeight: 80 }}
                />
              </div>
            ))}
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setNotesForm((f) => ({ ...f, outline: [...f.outline, { ref: "", point: "", subText: "" }] }))}
              style={{ marginBottom: 12 }}
            >
              + Add outline item
            </button>
          </div>
          <div className="form-row">
            <label>Key Scriptures</label>
            {notesForm.keyScriptures.map((item, index) => (
              <div key={`scripture-${index}`} style={{ display: "grid", gap: 8, marginBottom: 10 }}>
                <input
                  type="text"
                  placeholder="Reference"
                  value={item.ref}
                  onChange={(e) => setNotesForm((f) => {
                    const keyScriptures = [...f.keyScriptures];
                    keyScriptures[index] = { ...keyScriptures[index], ref: e.target.value };
                    return { ...f, keyScriptures };
                  })}
                />
                <textarea
                  placeholder="Scripture text"
                  value={item.text}
                  onChange={(e) => setNotesForm((f) => {
                    const keyScriptures = [...f.keyScriptures];
                    keyScriptures[index] = { ...keyScriptures[index], text: e.target.value };
                    return { ...f, keyScriptures };
                  })}
                  style={{ minHeight: 80 }}
                />
              </div>
            ))}
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setNotesForm((f) => ({ ...f, keyScriptures: [...f.keyScriptures, { ref: "", text: "" }] }))}
              style={{ marginBottom: 12 }}
            >
              + Add scripture
            </button>
          </div>
          <div className="form-row">
            <label>Sections</label>
            {notesForm.sections.map((item, index) => (
              <div key={`section-${index}`} style={{ display: "grid", gap: 8, marginBottom: 10 }}>
                <input
                  type="text"
                  placeholder="Heading"
                  value={item.heading}
                  onChange={(e) => setNotesForm((f) => {
                    const sections = [...f.sections];
                    sections[index] = { ...sections[index], heading: e.target.value };
                    return { ...f, sections };
                  })}
                />
                <textarea
                  placeholder="Body"
                  value={item.body}
                  onChange={(e) => setNotesForm((f) => {
                    const sections = [...f.sections];
                    sections[index] = { ...sections[index], body: e.target.value };
                    return { ...f, sections };
                  })}
                  style={{ minHeight: 110 }}
                />
              </div>
            ))}
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setNotesForm((f) => ({ ...f, sections: [...f.sections, { heading: "", body: "" }] }))}
              style={{ marginBottom: 12 }}
            >
              + Add section
            </button>
          </div>
          <div className="form-row">
            <label>Reflection Questions</label>
            <textarea
              value={notesForm.reflectionQuestions}
              onChange={(e) => setNotesForm((f) => ({ ...f, reflectionQuestions: e.target.value }))}
              placeholder="One question per line"
              style={{ minHeight: 100 }}
            />
          </div>
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

function PasswordModal({ onClose, onSave, loading, error, currentPassword, setCurrentPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword }) {
  return (
    <Modal title="Change Password" onClose={onClose}>
      <div className="form-row">
        <label>Current Password</label>
        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
      </div>
      <div className="form-row">
        <label>New Password</label>
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
      </div>
      <div className="form-row">
        <label>Confirm New Password</label>
        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
      </div>
      {error && <div style={{ fontSize: "0.82rem", color: DANGER, marginBottom: "1rem" }}>{error}</div>}
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={onSave} disabled={loading}>{loading ? "Saving..." : "Update Password"}</button>
      </div>
    </Modal>
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

const emptyPost = { title: "", category: "devotional", date: "", tags: "", body: "" };

// Convert plain paragraphs to the body array format the API expects.
// Lines separated by blank lines become separate paragraph blocks.
function bodyTextToBlocks(text) {
  return text
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => ({ type: "paragraph", text: p }));
}

// Convert body array back to plain text for editing.
function bodyBlocksToText(blocks) {
  if (!Array.isArray(blocks)) return "";
  return blocks.map(b => b.text || "").join("\n\n");
}

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
    setForm({
      ...p,
      tags: (p.tags || []).join(", "),
      body: bodyBlocksToText(p.body || []),
    });
    setModal("edit");
  };

  const save = async () => {
    if (!form.title.trim()) { toast("Title is required"); return; }
    const payload = {
      ...form,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      body: bodyTextToBlocks(form.body),
    };
    try {
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
            <thead><tr><th>Title</th><th>Category</th><th>Date</th><th>Tags</th><th></th></tr></thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id}>
                  <td><strong style={{ fontWeight: 500 }}>{p.title}</strong></td>
                  <td><span className="badge badge-gray">{p.category}</span></td>
                  <td style={{ whiteSpace: "nowrap" }}>{p.date}</td>
                  <td style={{ fontSize: "0.75rem", color: MID }}>{(p.tags || []).join(", ") || "—"}</td>
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
          <div className="form-row">
            <label>Title *</label>
            <input type="text" value={form.title || ""} onChange={e => F("title", e.target.value)} placeholder="e.g. Walking in Faith" />
          </div>
          <div className="form-row">
            <label>Date</label>
            <input type="date" value={form.date || ""} onChange={e => F("date", e.target.value)} />
          </div>
          <div className="form-row">
            <label>Category</label>
            <select value={form.category || "devotional"} onChange={e => F("category", e.target.value)}>
              {cats.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Tags (separate with commas)</label>
            <input type="text" value={form.tags || ""} onChange={e => F("tags", e.target.value)} placeholder="e.g. faith, prayer, community" />
          </div>
          <div className="form-row">
            <label>Post Content</label>
            <p style={{ fontSize: "0.75rem", color: MID, marginBottom: 6, lineHeight: 1.6 }}>
              Type the full post here. Leave a blank line between paragraphs.
            </p>
            <textarea
              value={form.body || ""}
              onChange={e => F("body", e.target.value)}
              style={{ minHeight: 220, lineHeight: 1.7, fontSize: "0.9rem" }}
              placeholder={"Write your devotional here...\n\nLeave a blank line to start a new paragraph."}
            />
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
  const [editForm, setEditForm] = useState({ id: null, alt: "", album: "Worship", src: "" });
  const [multiForm, setMultiForm] = useState({ album: "Worship", files: [], previews: [] });
  const [uploadProgress, setUploadProgress] = useState(null);
  const [confirm, setConfirm] = useState(null); // "delete-one:<id>" | "delete-all" | null
  const [deleteAllProgress, setDeleteAllProgress] = useState(null);
  const savingRef = useRef(false);
  const albums = ["Worship", "Church", "Youth", "Outreach", "Outreach 2024", "Community", "Missions"];

  const load = useCallback(async () => {
    setLoading(true);
    try { setPhotos(await apiFetch("/gallery/photos")); }
    catch (e) { toast("Failed to load photos"); }
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  // Create stable object URLs when files are selected, revoke old ones
  const setFiles = (files) => {
    setMultiForm(f => {
      f.previews.forEach(url => URL.revokeObjectURL(url));
      const previews = files.map(file => URL.createObjectURL(file));
      return { ...f, files, previews };
    });
  };

  const removeFile = (i) => {
    setMultiForm(f => {
      URL.revokeObjectURL(f.previews[i]);
      return {
        ...f,
        files: f.files.filter((_, j) => j !== i),
        previews: f.previews.filter((_, j) => j !== i),
      };
    });
  };

  const saveEdit = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    try {
      const payload = buildFormData({ album: editForm.album, alt: editForm.alt, height: 400 });
      await apiFetch(`/gallery/photos/${editForm.id}`, { method: "PUT", body: payload });
      toast("Photo updated");
      setModal(false);
      await load();
    } catch (e) {
      toast(e.message);
    } finally {
      savingRef.current = false;
    }
  };

  const saveMulti = async () => {
    if (savingRef.current) return;
    if (!multiForm.files.length) { toast("Select at least one photo"); return; }
    savingRef.current = true;
    const total = multiForm.files.length;
    let done = 0;
    let failed = 0;
    setUploadProgress({ done: 0, total });
    for (const file of multiForm.files) {
      try {
        const payload = buildFormData({
          album: multiForm.album,
          alt: file.name.replace(/\.[^/.]+$/, ""),
          height: 400,
          image_file: file,
        });
        await apiFetch("/gallery/photos", { method: "POST", body: payload });
        done++;
      } catch {
        failed++;
      }
      setUploadProgress({ done: done + failed, total });
    }
    multiForm.previews.forEach(url => URL.revokeObjectURL(url));
    savingRef.current = false;
    setUploadProgress(null);
    setModal(false);
    await load();
    if (failed === 0) toast(`${done} photo${done !== 1 ? "s" : ""} added`);
    else toast(`${done} uploaded, ${failed} failed`);
  };

  const del = async (id) => {
    try {
      await apiFetch(`/gallery/photos/${id}`, { method: "DELETE" });
      toast("Photo deleted");
      setConfirm(null);
      await load();
    } catch (e) {
      toast(e.message);
    }
  };

  const delAll = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    const snapshot = [...photos];
    const total = snapshot.length;
    let done = 0;
    let failed = 0;
    setConfirm(null);
    setDeleteAllProgress({ done: 0, total });
    for (const p of snapshot) {
      try {
        await apiFetch(`/gallery/photos/${p.id}`, { method: "DELETE" });
        done++;
      } catch {
        failed++;
      }
      setDeleteAllProgress({ done: done + failed, total });
    }
    savingRef.current = false;
    setDeleteAllProgress(null);
    await load();
    if (failed === 0) toast(`All ${done} photo${done !== 1 ? "s" : ""} deleted`);
    else toast(`${done} deleted, ${failed} failed`);
  };

  const openAdd = () => {
    setMultiForm({ album: "Church", files: [], previews: [] });
    setModal("add");
  };

  const openEdit = (p) => {
    setEditForm({ id: p.id, alt: p.alt || "", album: p.album || "Church", src: resolveUrl(p.src) });
    setModal("edit");
  };

  return (
    <div>
      <div className="section-header">
        <h1 className="page-title">Gallery</h1>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          {photos.length > 0 && !loading && (
            <button className="btn btn-danger" onClick={() => setConfirm("delete-all")}>
              🗑 Delete All
            </button>
          )}
          <button className="btn btn-primary" onClick={openAdd}>+ Add Photos</button>
        </div>
      </div>

      {deleteAllProgress && (
        <div style={{ marginBottom: "1rem", background: WHITE, border: "1px solid #E0DDD8", padding: "1rem" }}>
          <div style={{ fontSize: "0.78rem", color: MID, marginBottom: 6 }}>
            Deleting {deleteAllProgress.done} / {deleteAllProgress.total}…
          </div>
          <div style={{ height: 6, background: "#E8E6E0", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3, background: DANGER,
              width: `${(deleteAllProgress.done / deleteAllProgress.total) * 100}%`,
              transition: "width 0.3s ease",
            }} />
          </div>
        </div>
      )}

      <div className="card" style={{ overflowX: "auto" }}>
        {loading ? <div className="empty">Loading…</div> : photos.length === 0 ? <div className="empty">No photos yet.</div> : (
          <table>
            <thead><tr><th>Preview</th><th>Alt Text</th><th>Album</th><th></th></tr></thead>
            <tbody>
              {photos.map(p => (
                <tr key={p.id}>
                  <td>
                    <img
                      src={resolveUrl(p.src)}
                      alt={p.alt || ""}
                      style={{ width: 140, height: 90, objectFit: "cover", borderRadius: 4, border: "1px solid #E0DDD8", display: "block", background: "#F8F5F0" }}
                      onError={e => { e.currentTarget.style.opacity = "0.2"; }}
                    />
                  </td>
                  <td>{p.alt || <span style={{ color: "#bbb" }}>—</span>}</td>
                  <td><span className="badge badge-gray">{p.album}</span></td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button className="btn btn-ghost" style={{ marginRight: 6 }} onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => setConfirm(`delete-one:${p.id}`)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal === "add" && (
        <Modal title="Add Photos" onClose={() => !uploadProgress && setModal(false)}>
          <div className="form-row">
            <label>Photos * (select multiple)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={e => setFiles(Array.from(e.target.files || []))}
            />
            {multiForm.files.length > 0 && (
              <>
                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {multiForm.previews.map((src, i) => (
                    <div key={i} style={{ position: "relative", width: 80, flexShrink: 0 }}>
                      <img
                        src={src}
                        alt={multiForm.files[i]?.name || ""}
                        style={{ width: 80, height: 64, objectFit: "cover", borderRadius: 4, border: "1px solid #E0DDD8", display: "block" }}
                      />
                      <button
                        onClick={() => removeFile(i)}
                        style={{
                          position: "absolute", top: -6, right: -6,
                          width: 18, height: 18, borderRadius: "50%",
                          background: DANGER, border: "none", color: WHITE,
                          fontSize: 11, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          padding: 0,
                        }}
                      >×</button>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 6, fontSize: "0.75rem", color: MID }}>
                  {multiForm.files.length} photo{multiForm.files.length !== 1 ? "s" : ""} selected
                </div>
              </>
            )}
          </div>
          <div className="form-row">
            <label>Album</label>
            <select value={multiForm.album} onChange={e => setMultiForm(f => ({ ...f, album: e.target.value }))}>
              {albums.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          {uploadProgress && (
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.78rem", color: MID, marginBottom: 6 }}>
                Uploading {uploadProgress.done} / {uploadProgress.total}…
              </div>
              <div style={{ height: 6, background: "#E8E6E0", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 3, background: COPPER,
                  width: `${(uploadProgress.done / uploadProgress.total) * 100}%`,
                  transition: "width 0.3s ease",
                }} />
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => setModal(false)} disabled={!!uploadProgress}>Cancel</button>
            <button className="btn btn-primary" onClick={saveMulti} disabled={!!uploadProgress}>
              {uploadProgress
                ? `Uploading ${uploadProgress.done}/${uploadProgress.total}…`
                : `Upload ${multiForm.files.length || ""} Photo${multiForm.files.length !== 1 ? "s" : ""}`}
            </button>
          </div>
        </Modal>
      )}

      {modal === "edit" && (
        <Modal title="Edit Photo" onClose={() => setModal(false)}>
          {editForm.src && (
            <div style={{ marginBottom: "1rem" }}>
              <img
                src={editForm.src}
                alt={editForm.alt}
                style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 4, border: "1px solid #E0DDD8" }}
                onError={e => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          )}
          <div className="form-row">
            <label>Alt Text</label>
            <input type="text" value={editForm.alt} onChange={e => setEditForm(f => ({ ...f, alt: e.target.value }))} />
          </div>
          <div className="form-row">
            <label>Album</label>
            <select value={editForm.album} onChange={e => setEditForm(f => ({ ...f, album: e.target.value }))}>
              {albums.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveEdit}>Update Photo</button>
          </div>
        </Modal>
      )}

      {confirm && confirm.startsWith("delete-one:") && (
        <Confirm
          message="Delete this photo permanently? This cannot be undone."
          onConfirm={() => del(confirm.replace("delete-one:", ""))}
          onCancel={() => setConfirm(null)}
        />
      )}

      {confirm === "delete-all" && (
        <Confirm
          message={`Delete all ${photos.length} photos permanently? This cannot be undone.`}
          onConfirm={delAll}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

// ─── Messages ────────────────────────────────────────────────────────────────

function VideosPanel({ toast }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", video_file: null });
  const [previewUrl, setPreviewUrl] = useState(null); // local object URL for selected file
  const [confirm, setConfirm] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const savingRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setVideos(await apiFetch("/gallery/videos")); }
    catch (e) { toast("Failed to load videos"); }
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setForm({ title: "", date: "", video_file: null });
    setPreviewUrl(null);
    setModal(true);
  };

  const handleFileChange = (file) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setForm(f => ({ ...f, video_file: file || null }));
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const closeModal = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setModal(false);
  };

  const save = async () => {
    if (savingRef.current) return;
    if (!form.video_file) { toast("Upload a video from your device"); return; }
    savingRef.current = true;
    try {
      const payload = buildFormData({
        title: form.title,
        date: form.date,
        video_file: form.video_file,
      });
      await apiFetch("/gallery/videos", { method: "POST", body: payload });
      toast("Video added");
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setModal(false);
      await load();
    } catch (e) {
      toast(e.message);
    } finally {
      savingRef.current = false;
    }
  };

  const del = async (id) => {
    try {
      await apiFetch(`/gallery/videos/${id}`, { method: "DELETE" });
      toast("Video deleted");
      setConfirm(null);
      if (playingId === id) setPlayingId(null);
      await load();
    } catch (e) {
      toast(e.message);
    }
  };

  const F = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="section-header">
        <h1 className="page-title">Gallery Videos</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Video</button>
      </div>
      <div className="card">
        {loading ? <div className="empty">Loading…</div> : videos.length === 0 ? <div className="empty">No videos yet.</div> : (
          <div>
            {videos.map(v => {
              const src = resolveUrl(v.video_url);
              const isPlaying = playingId === v.id;
              return (
                <div key={v.id} style={{ borderBottom: "1px solid #E8E6E0", padding: "1rem 1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: isPlaying || src ? "0.75rem" : 0 }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: "0.9rem", color: CHARCOAL }}>{v.title}</div>
                      {v.date && <div style={{ fontSize: "0.75rem", color: MID, marginTop: 2 }}>{v.date}</div>}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                      {src && (
                        <button
                          className="btn btn-ghost"
                          onClick={() => setPlayingId(isPlaying ? null : v.id)}
                        >
                          {isPlaying ? "⏹ Hide" : "▶ Play"}
                        </button>
                      )}
                      <button className="btn btn-danger" onClick={() => setConfirm(v.id)}>Delete</button>
                    </div>
                  </div>
                  {src && isPlaying && (
                    <video
                      key={src}
                      controls
                      autoPlay
                      src={src}
                      style={{ width: "100%", maxHeight: 320, borderRadius: 6, background: "#000", display: "block" }}
                      onError={() => toast("Could not load video")}
                    />
                  )}
                  {src && !isPlaying && (
                    <div
                      onClick={() => setPlayingId(v.id)}
                      style={{
                        height: 54, borderRadius: 6,
                        background: "linear-gradient(135deg, #2C2C2A, #5F5E5A)",
                        display: "flex", alignItems: "center", gap: "0.75rem",
                        padding: "0 1rem", cursor: "pointer",
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: COPPER, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <span style={{ fontSize: 14, color: WHITE, marginLeft: 2 }}>▶</span>
                      </div>
                      <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>Click to play</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && (
        <Modal title="Add Video" onClose={closeModal}>
          <div className="form-row">
            <label>Title *</label>
            <input type="text" value={form.title} onChange={e => F("title", e.target.value)} />
          </div>
          <div className="form-row">
            <label>Upload Video From Device *</label>
            <input type="file" accept="video/*" onChange={e => handleFileChange(e.target.files?.[0])} />
          </div>
          {previewUrl && (
            <div className="form-row">
              <label>Preview</label>
              <video
                src={previewUrl}
                controls
                style={{ width: "100%", maxHeight: 200, borderRadius: 4, background: "#000", display: "block" }}
              />
            </div>
          )}
          <div className="form-row">
            <label>Date</label>
            <input type="text" value={form.date} onChange={e => F("date", e.target.value)} placeholder="e.g. January 2025" />
          </div>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>Add Video</button>
          </div>
        </Modal>
      )}

      {confirm && <Confirm message="Delete this video permanently?" onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}
// ─── Messages PIN gate ───────────────────────────────────────────────────────

/**
 * MessagesPinGate
 * Requires a separate Messages PIN (stored in the DB) before showing messages.
 * Falls back to a first-time setup screen if no PIN has been set yet.
 * Auto-locks after 30 minutes of inactivity.
 */
function MessagesPinGate({ toast, children }) {
  const SESSION_KEY  = "aic_messages_unlocked_until";
  const LOCK_MINUTES = 30;

  const isUnlocked = () => {
    try {
      const exp = parseInt(sessionStorage.getItem(SESSION_KEY) || "0", 10);
      return Date.now() < exp;
    } catch { return false; }
  };

  const [unlocked,    setUnlocked]    = useState(isUnlocked);
  const [pinSet,      setPinSet]      = useState(null);   // null = checking
  const [pin,         setPin]         = useState("");
  const [currentPin,  setCurrentPin]  = useState("");
  const [newPin,      setNewPin]      = useState("");
  const [confirmPin,  setConfirmPin]  = useState("");
  const [checking,    setChecking]    = useState(false);
  const [pinError,    setPinError]    = useState("");
  const [mode,        setMode]        = useState("unlock"); // unlock | change
  const inputRef = useRef(null);

  // Check if PIN has been set yet
  useEffect(() => {
    apiFetch("/admin/messages-pin/status")
      .then(d => setPinSet(d.is_set))
      .catch(() => setPinSet(false));
  }, []);

  useEffect(() => {
    if (!unlocked && pinSet !== null) {
      setPin(""); setPinError("");
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [unlocked, pinSet]);

  const unlock = async () => {
    if (!pin) { setPinError("Please enter your PIN"); return; }
    setChecking(true); setPinError("");
    try {
      await apiFetch("/admin/messages-pin/verify", {
        method: "POST",
        body: JSON.stringify({ pin }),
      });
      const exp = Date.now() + LOCK_MINUTES * 60 * 1000;
      sessionStorage.setItem(SESSION_KEY, String(exp));
      setUnlocked(true);
      toast("Messages unlocked");
    } catch {
      setPinError("Incorrect PIN. Please try again.");
      setPin("");
      inputRef.current?.focus();
    }
    setChecking(false);
  };

  const setFirstPin = async () => {
    if (newPin.length < 4) { setPinError("PIN must be at least 4 characters"); return; }
    if (newPin !== confirmPin) { setPinError("PINs do not match"); return; }
    setChecking(true); setPinError("");
    try {
      await apiFetch("/admin/messages-pin", {
        method: "PUT",
        body: JSON.stringify({ new_pin: newPin }),
      });
      setPinSet(true);
      toast("Messages PIN set");
      // Auto-unlock after setting for the first time
      const exp = Date.now() + LOCK_MINUTES * 60 * 1000;
      sessionStorage.setItem(SESSION_KEY, String(exp));
      setUnlocked(true);
    } catch (e) { setPinError(e.message || "Failed to set PIN"); }
    setChecking(false);
  };

  const changePin = async () => {
    if (!currentPin) { setPinError("Enter your current PIN"); return; }
    if (newPin.length < 4) { setPinError("New PIN must be at least 4 characters"); return; }
    if (newPin !== confirmPin) { setPinError("New PINs do not match"); return; }
    setChecking(true); setPinError("");
    try {
      await apiFetch("/admin/messages-pin", {
        method: "PUT",
        body: JSON.stringify({ current_pin: currentPin, new_pin: newPin }),
      });
      toast("Messages PIN updated");
      setMode("unlock");
      setCurrentPin(""); setNewPin(""); setConfirmPin(""); setPin("");
    } catch (e) { setPinError(e.message || "Failed to update PIN"); }
    setChecking(false);
  };

  const lock = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setUnlocked(false);
    setMode("unlock");
  };

  // Still checking PIN status
  if (pinSet === null) {
    return <div className="empty">Checking access…</div>;
  }

  // First-time PIN setup
  if (!pinSet) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "60vh", padding: "2rem" }}>
        <div style={{ background: WHITE, border: "1px solid #E0DDD8", borderTop: `4px solid ${COPPER}`, padding: "2.25rem 2rem", width: "100%", maxWidth: 400, boxShadow: "0 8px 32px rgba(44,44,42,0.08)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem", textAlign: "center" }}>🔐</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.35rem", color: CHARCOAL, textAlign: "center", marginBottom: "0.35rem" }}>Set a Messages PIN</div>
          <p style={{ fontSize: "0.82rem", color: MID, textAlign: "center", lineHeight: 1.7, marginBottom: "1.5rem" }}>
            Create a separate PIN just for viewing messages.<br />This is different from your admin login password.
          </p>
          <div className="form-row">
            <label>New PIN (min. 4 characters)</label>
            <input ref={inputRef} type="password" value={newPin} onChange={e => setNewPin(e.target.value)} onKeyDown={e => e.key === "Enter" && setFirstPin()} placeholder="Create a PIN" autoComplete="new-password" />
          </div>
          <div className="form-row">
            <label>Confirm PIN</label>
            <input type="password" value={confirmPin} onChange={e => setConfirmPin(e.target.value)} onKeyDown={e => e.key === "Enter" && setFirstPin()} placeholder="Repeat your PIN" autoComplete="new-password" />
          </div>
          {pinError && <div style={{ fontSize: "0.8rem", color: DANGER, marginBottom: "0.85rem" }}>⚠ {pinError}</div>}
          <button className="btn btn-primary" onClick={setFirstPin} disabled={checking} style={{ width: "100%", justifyContent: "center" }}>
            {checking ? "Saving…" : "Set PIN & View Messages →"}
          </button>
        </div>
      </div>
    );
  }

  // Change-PIN mode (accessible once unlocked)
  if (mode === "change") {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "60vh", padding: "2rem" }}>
        <div style={{ background: WHITE, border: "1px solid #E0DDD8", borderTop: `4px solid ${COPPER}`, padding: "2.25rem 2rem", width: "100%", maxWidth: 400, boxShadow: "0 8px 32px rgba(44,44,42,0.08)" }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.35rem", color: CHARCOAL, marginBottom: "1.5rem" }}>Change Messages PIN</div>
          <div className="form-row">
            <label>Current PIN</label>
            <input type="password" value={currentPin} onChange={e => setCurrentPin(e.target.value)} placeholder="Current PIN" autoComplete="current-password" />
          </div>
          <div className="form-row">
            <label>New PIN</label>
            <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="New PIN (min. 4 chars)" autoComplete="new-password" />
          </div>
          <div className="form-row">
            <label>Confirm New PIN</label>
            <input type="password" value={confirmPin} onChange={e => setConfirmPin(e.target.value)} onKeyDown={e => e.key === "Enter" && changePin()} placeholder="Repeat new PIN" autoComplete="new-password" />
          </div>
          {pinError && <div style={{ fontSize: "0.8rem", color: DANGER, marginBottom: "0.85rem" }}>⚠ {pinError}</div>}
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => { setMode("unlock"); setPinError(""); }}>Cancel</button>
            <button className="btn btn-primary" onClick={changePin} disabled={checking}>{checking ? "Saving…" : "Update PIN"}</button>
          </div>
        </div>
      </div>
    );
  }

  // Locked — show PIN entry
  if (!unlocked) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "60vh", padding: "2rem" }}>
        <div style={{ background: WHITE, border: "1px solid #E0DDD8", borderTop: `4px solid ${COPPER}`, padding: "2.25rem 2rem", width: "100%", maxWidth: 400, boxShadow: "0 8px 32px rgba(44,44,42,0.08)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem", textAlign: "center" }}>🔒</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.35rem", color: CHARCOAL, textAlign: "center", marginBottom: "0.35rem" }}>Messages</div>
          <p style={{ fontSize: "0.82rem", color: MID, textAlign: "center", lineHeight: 1.7, marginBottom: "1.5rem" }}>
            This section contains private messages from the congregation.<br />Enter your Messages PIN to continue.
          </p>
          <div className="form-row">
            <label>Messages PIN</label>
            <input ref={inputRef} type="password" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && unlock()} placeholder="Enter your Messages PIN" autoComplete="current-password" />
          </div>
          {pinError && <div style={{ fontSize: "0.8rem", color: DANGER, marginBottom: "0.85rem" }}>⚠ {pinError}</div>}
          <button className="btn btn-primary" onClick={unlock} disabled={checking} style={{ width: "100%", justifyContent: "center" }}>
            {checking ? "Verifying…" : "Unlock Messages →"}
          </button>
          <p style={{ fontSize: "0.7rem", color: MID, textAlign: "center", marginTop: "1rem", lineHeight: 1.6 }}>
            Access expires automatically after {LOCK_MINUTES} minutes.
          </p>
        </div>
      </div>
    );
  }

  // Unlocked — show banner + children
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.72rem", color: MID, letterSpacing: "0.06em" }}>
          🔓 Messages unlocked · auto-locks in {LOCK_MINUTES} min
        </span>
        <button className="btn btn-ghost" style={{ padding: "0.3rem 0.75rem", fontSize: "0.72rem" }} onClick={() => setMode("change")}>
          Change PIN
        </button>
        <button className="btn btn-ghost" style={{ padding: "0.3rem 0.75rem", fontSize: "0.72rem" }} onClick={lock}>
          Lock Now
        </button>
      </div>
      {children}
    </div>
  );
}

function MessagesInner({ toast }) {
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

  // Label map so subject keys look nice in the table
  const SUBJECT_LABELS = {
    "general": "General Enquiry",
    "prayer-request": "Prayer Request",
    "pastoral-care": "Pastoral Care",
    "volunteering": "Volunteering",
    "events": "Events & Programmes",
    "media": "Media",
    "other": "Other",
  };

  const unread = messages.filter(m => !m.read).length;

  return (
    <div>
      <div className="section-header">
        <h1 className="page-title">
          Contact Messages{unread > 0 && (
            <span className="badge badge-gold" style={{ fontSize: "0.75rem", marginLeft: 8 }}>{unread} unread</span>
          )}
        </h1>
        <label style={{ display: "flex", alignItems: "center", gap: 7, textTransform: "none", letterSpacing: 0, fontSize: "0.85rem", cursor: "pointer" }}>
          <input type="checkbox" checked={unreadOnly} onChange={e => setUnreadOnly(e.target.checked)} style={{ width: "auto" }} /> Unread only
        </label>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        {loading ? <div className="empty">Loading…</div> : messages.length === 0 ? <div className="empty">No messages.</div> : (
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Subject</th><th>Date</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {messages.map(m => (
                <tr key={m.id} style={{ cursor: "pointer" }} onClick={() => setSelected(m)}>
                  <td><strong style={{ fontWeight: m.read ? 400 : 600 }}>{m.name}</strong></td>
                  <td style={{ fontSize: "0.82rem" }}>{m.email || "—"}</td>
                  <td>{SUBJECT_LABELS[m.subject] || m.subject}</td>
                  <td style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>{new Date(m.created_at).toLocaleDateString()}</td>
                  <td>{m.read ? <span className="badge badge-gray">Read</span> : <span className="badge badge-gold">Unread</span>}</td>
                  <td onClick={e => e.stopPropagation()} style={{ whiteSpace: "nowrap" }}>
                    {!m.read && (
                      <button className="btn btn-ghost" style={{ marginRight: 6 }} onClick={() => markRead(m.id)}>Mark Read</button>
                    )}
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
            {[
              ["Email", selected.email || "—"],
              ["Phone", selected.phone || "—"],
              ["Subject", SUBJECT_LABELS[selected.subject] || selected.subject],
              ["Date", new Date(selected.created_at).toLocaleString()],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: MID, marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: "0.88rem" }}>{v}</div>
              </div>
            ))}
          </div>
          {/* Private prayer flag */}
          {selected.message?.includes("[This prayer request is private") && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: "0.75rem", background: "#FEF3D9", border: "1px solid #F5D88A", padding: "0.5rem 0.85rem", fontSize: "0.78rem", color: COPPER2, fontWeight: 600 }}>
              🔒 Private prayer request — handle with care
            </div>
          )}
          <div style={{ background: LIGHT, padding: "1rem 1.25rem", borderLeft: `3px solid ${COPPER}`, marginBottom: "1.25rem" }}>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.8, color: CHARCOAL }}>
              {selected.message?.replace(/\n\n\[This prayer request is private[^\]]*\]/, "").trim()}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            {!selected.read && (
              <button className="btn btn-ghost" onClick={() => { markRead(selected.id); setSelected(s => ({ ...s, read: true })); }}>
                Mark Read
              </button>
            )}
            <button className="btn btn-danger" onClick={() => setConfirm(selected.id)}>Delete</button>
          </div>
        </Modal>
      )}

      {confirm && (
        <Confirm message="Delete this message permanently?" onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />
      )}
    </div>
  );
}

function MessagesPanel({ toast }) {
  return (
    <MessagesPinGate toast={toast}>
      <MessagesInner toast={toast} />
    </MessagesPinGate>
  );
}

// ─── Team ─────────────────────────────────────────────────────────────────────

const emptyMember = { name: "", role: "", bio: "", photo: "", order: 0 };

function TeamMemberModal({ modal, form, F, onClose, onSave }) {
  const fileInputRef = useRef(null);
  const [previewPhoto, setPreviewPhoto] = useState(form.photo ? resolveUrl(form.photo) : "");
  const [photoFile, setPhotoFile] = useState(null);

  // Sync preview when form.photo changes (e.g. opening edit)
  useEffect(() => {
    if (!photoFile) setPreviewPhoto(form.photo ? resolveUrl(form.photo) : "");
  }, [form.photo, photoFile]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => { if (previewPhoto?.startsWith("blob:")) URL.revokeObjectURL(previewPhoto); };
  }, [previewPhoto]);

  const pickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewPhoto?.startsWith("blob:")) URL.revokeObjectURL(previewPhoto);
    setPhotoFile(file);
    const blobUrl = URL.createObjectURL(file);
    setPreviewPhoto(blobUrl);
    F("_photoFile", file);
    e.target.value = "";
  };

  const clearPhoto = () => {
    if (previewPhoto?.startsWith("blob:")) URL.revokeObjectURL(previewPhoto);
    setPhotoFile(null);
    setPreviewPhoto("");
    F("photo", "");
    F("_photoFile", null);
  };

  return (
    <Modal title={modal === "new" ? "Add Team Member" : "Edit Member"} onClose={onClose}>
      {[["name", "Name *"], ["role", "Role"], ["order", "Display Order"]].map(([k, label]) => (
        <div className="form-row" key={k}>
          <label>{label}</label>
          <input type={k === "order" ? "number" : "text"} value={form[k] ?? ""} onChange={e => F(k, e.target.value)} />
        </div>
      ))}
      {/* Photo upload */}
      <div className="form-row">
        <label>Photo</label>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Preview box */}
          <div style={{ width: 90, height: 110, background: LIGHT, border: "1px solid #E0DDD8", overflow: "hidden", flexShrink: 0 }}>
            {previewPhoto ? (
              <img src={previewPhoto} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ display: "grid", placeItems: "center", height: "100%", color: MID, fontSize: "0.72rem", textAlign: "center", padding: "0.4rem" }}>
                No photo
              </div>
            )}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={pickFile}
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewPhoto ? "Change Photo" : "Upload Photo"}
            </button>
            {previewPhoto && (
              <button type="button" className="btn btn-danger" onClick={clearPhoto}>
                Remove Photo
              </button>
            )}
            <div style={{ fontSize: "0.75rem", color: MID, lineHeight: 1.6 }}>
              {photoFile ? `Selected: ${photoFile.name}` : "Upload a photo from your device."}
            </div>
            {/* Also allow pasting a URL directly */}
            <input
              type="text"
              placeholder="Or paste a photo URL"
              value={(!photoFile && form.photo) ? form.photo : ""}
              onChange={e => {
                if (previewPhoto?.startsWith("blob:")) URL.revokeObjectURL(previewPhoto);
                setPhotoFile(null);
                F("_photoFile", null);
                F("photo", e.target.value);
                setPreviewPhoto(e.target.value ? resolveUrl(e.target.value) : "");
              }}
            />
          </div>
        </div>
      </div>
      <div className="form-row"><label>Bio</label><textarea value={form.bio || ""} onChange={e => F("bio", e.target.value)} /></div>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={onSave}>Save Member</button>
      </div>
    </Modal>
  );
}

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

  const openEdit = (m) => { setForm({ ...m, photo: m.photo || "", _photoFile: null }); setModal("edit"); };

  const save = async () => {
    try {
      const photoFile = form._photoFile;
      let photoUrl = form.photo || "";

      // If a new file was picked, upload it first via FormData
      if (photoFile) {
        const fd = buildFormData({
          name: form.name,
          role: form.role || "",
          bio: form.bio || "",
          order: Number(form.order),
          photo_file: photoFile,
        });
        if (modal === "new") {
          await apiFetch("/about/team", { method: "POST", body: fd });
        } else {
          await apiFetch(`/about/team/${form.id}`, { method: "PUT", body: fd });
        }
      } else {
        // No new file — send JSON as before
        const payload = { name: form.name, role: form.role || "", bio: form.bio || "", photo: photoUrl, order: Number(form.order) };
        if (modal === "new") { await apiFetch("/about/team", { method: "POST", body: JSON.stringify(payload) }); }
        else { await apiFetch(`/about/team/${form.id}`, { method: "PUT", body: JSON.stringify(payload) }); }
      }
      toast(modal === "new" ? "Member added" : "Member updated");
      setModal(null);
      load();
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
          <button className="btn btn-primary" onClick={() => { setForm({ ...emptyMember, _photoFile: null }); setModal("new"); }}>+ Add Member</button>
        </div>
        <div className="card" style={{ overflowX: "auto" }}>
          {loading ? <div className="empty">Loading…</div> : team.length === 0 ? <div className="empty">No team members yet.</div> : (
          <table>
            <thead><tr><th>#</th><th>Photo</th><th>Name</th><th>Role</th><th>Bio</th><th></th></tr></thead>
            <tbody>
              {team.map(m => (
                <tr key={m.id}>
                  <td style={{ color: MID, fontSize: "0.8rem" }}>{m.order}</td>
                  <td>
                    {m.photo ? (
                      <img src={resolveUrl(m.photo)} alt={m.name} style={{ width: 40, height: 50, objectFit: "cover", display: "block", border: "1px solid #E0DDD8" }} />
                    ) : (
                      <div style={{ width: 40, height: 50, background: LIGHT, border: "1px dashed #D0CCC5", display: "grid", placeItems: "center" }}>
                        <span style={{ fontSize: "0.6rem", color: MID }}>None</span>
                      </div>
                    )}
                  </td>
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
        <TeamMemberModal
          modal={modal}
          form={form}
          F={F}
          onClose={() => setModal(null)}
          onSave={save}
        />
      )}

      {confirm && <Confirm message="Remove this team member?" onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

function PastorPhotoCard({ toast }) {
  const fileInputRef = useRef(null);
  const [currentPhoto, setCurrentPhoto] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/about/pastor/photo");
      setCurrentPhoto(resolveUrl(data?.photo || ""));
      setPreviewPhoto(resolveUrl(data?.photo || ""));
    } catch (e) {
      toast(e.message || "Failed to load pastor photo");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (previewPhoto?.startsWith("blob:")) URL.revokeObjectURL(previewPhoto);
    };
  }, [previewPhoto]);

  const pickFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (previewPhoto?.startsWith("blob:")) URL.revokeObjectURL(previewPhoto);
    setSelectedFile(file);
    setPreviewPhoto(URL.createObjectURL(file));
    event.target.value = "";
  };

  const save = async () => {
    if (!selectedFile) {
      toast("Choose an image from your device first");
      return;
    }
    setSaving(true);
    try {
      const payload = buildFormData({ photo_file: selectedFile });
      const data = await apiFetch("/about/pastor/photo", { method: "PUT", body: payload });
      setCurrentPhoto(resolveUrl(data?.photo || ""));
      setPreviewPhoto(resolveUrl(data?.photo || ""));
      setSelectedFile(null);
      toast("Pastor photo updated");
    } catch (e) {
      toast(e.message || "Unable to update pastor photo");
    } finally {
      setSaving(false);
    }
  };

  const clear = async () => {
    setSaving(true);
    try {
      const payload = buildFormData({ photo_url: "" });
      await apiFetch("/about/pastor/photo", { method: "PUT", body: payload });
      setCurrentPhoto("");
      setPreviewPhoto("");
      setSelectedFile(null);
      toast("Pastor photo cleared");
    } catch (e) {
      toast(e.message || "Unable to clear pastor photo");
    } finally {
      setSaving(false);
    }
  };

  const showPhoto = previewPhoto || currentPhoto;

  return (
    <div className="card" style={{ marginBottom: "1.25rem", borderLeft: `4px solid ${COPPER}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.1rem", color: CHARCOAL }}>Pastor Photo</div>
          <div style={{ fontSize: "0.82rem", color: MID, marginTop: "0.25rem" }}>
            Upload a device image once and it will show on the Home and About pages.
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()} disabled={saving}>
            Choose File
          </button>
          <button className="btn btn-primary" onClick={save} disabled={saving || !selectedFile}>
            {saving ? "Saving..." : "Save Photo"}
          </button>
          <button className="btn btn-danger" onClick={clear} disabled={saving}>
            Clear
          </button>
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={pickFile} style={{ display: "none" }} />
      <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "1rem", alignItems: "start" }}>
        <div style={{ width: 140, height: 180, background: LIGHT, border: "1px solid #E0DDD8", overflow: "hidden" }}>
          {loading ? (
            <div style={{ display: "grid", placeItems: "center", height: "100%", color: MID, fontSize: "0.8rem" }}>
              Loading…
            </div>
          ) : showPhoto ? (
            <img src={showPhoto} alt="Pastor preview" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{ display: "grid", placeItems: "center", height: "100%", color: MID, fontSize: "0.8rem", textAlign: "center", padding: "0.5rem" }}>
              No pastor photo set
            </div>
          )}
        </div>
        <div style={{ fontSize: "0.84rem", color: MID, lineHeight: 1.8 }}>
          {selectedFile ? `Selected file: ${selectedFile.name}` : "Pick a photo from your device, then save it to publish the new pastor image site-wide."}
        </div>
      </div>
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

function AboutPanel({ toast }) {
  return (
    <div>
      <div className="section-header">
        <h1 className="page-title">About Settings</h1>
        <span style={{ fontSize: "0.75rem", color: MID }}>Pastor photo and about-page media</span>
      </div>
      <PastorPhotoCard toast={toast} />
      <div className="card">
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.05rem", marginBottom: "0.35rem" }}>About Page Tip</div>
        <p style={{ fontSize: "0.85rem", color: MID, lineHeight: 1.8, margin: 0 }}>
          The photo you save here appears on both the Home page and the About page.
        </p>
      </div>
    </div>
  );
}

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

NAV.splice(1, 0, { id: "about", label: "About", icon: "✦" });

export default function AdminPanel() {
  const [page, setPage] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({});
  const [authed, setAuthed] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [passwordModal, setPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const showToast = useCallback((msg) => setToast(msg), []);
  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Best effort only; local state still clears.
    }
    // Remove any token stored for token-based auth
    try { localStorage.removeItem('aic_maamani_token'); } catch {}
    setAuthed(false);
    setCurrentUser(null);
    setPassword("");
    setUsername("admin");
    setStats({});
    setPage("dashboard");
  }, []);

  const backToSite = useCallback(() => {
    logout();
    window.location.hash = "#home";
  }, [logout]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await apiFetch("/admin/me");
        if (!active) return;
        const data = await apiFetch("/admin/stats");
        if (!active) return;
        setAuthed(true);
        setCurrentUser(me);
        setStats(data);
        setUsername(me.username || "admin");
      } catch {
        if (!active) return;
        setAuthed(false);
      } finally {
        if (active) setAuthReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!authed) return;
    (async () => {
      try {
        const [me, data] = await Promise.all([apiFetch("/admin/me"), apiFetch("/admin/stats")]);
        setCurrentUser(me);
        setStats(data);
      } catch (e) {
        if (String(e.message || "").includes("Admin authentication required")) {
          logout();
        }
      }
    })();
  }, [authed, logout]);

  const login = async () => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const data = await apiFetch("/admin/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      // If server returned a token, store it and use token-based auth going forward
      if (data.token) {
        localStorage.setItem('aic_maamani_token', data.token);
      }
      setAuthed(true);
      setCurrentUser({ username: data.username || username, role: data.role || "full_admin" });
      setPassword("");
      setUsername(data.username || username);
      showToast("Signed in to admin panel");
    } catch (e) {
      setAuthError(e.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const savePassword = async () => {
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    setPasswordSaving(true);
    try {
      await apiFetch("/admin/password", {
        method: "PUT",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      showToast("Password updated");
      setPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setPasswordError(e.message || "Unable to update password");
    } finally {
      setPasswordSaving(false);
    }
  };

  const panels = {
    dashboard: <Dashboard stats={stats} />,
    about: <AboutPanel toast={showToast} />,
    sermons: <SermonsPanel toast={showToast} />,
    events: <EventsPanel toast={showToast} />,
    blog: <BlogPanel toast={showToast} />,
    gallery: <GalleryPanel toast={showToast} />,
    videos: <VideosPanel toast={showToast} />,
    messages: <MessagesPanel toast={showToast} />,
    team: <TeamPanel toast={showToast} />,
  };

  if (!authReady) {
    return (
      <>
        <style>{fonts}</style>
        <style>{css}</style>
        <div style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          background: "linear-gradient(135deg, #f6f1e8 0%, #ece6dd 50%, #f8f4ee 100%)",
          color: CHARCOAL,
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: "0.04em",
        }}>
          Checking admin session...
        </div>
      </>
    );
  }

  if (!authed) {
    return (
      <>
        <style>{fonts}</style>
        <style>{css}</style>
        <LoginGate
          onLogin={login}
          loading={authLoading}
          error={authError}
          username={username}
          setUsername={setUsername}
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
      <style>{`
        @media (max-width: 700px) {
          .admin-shell-outer { flex-direction: column !important; }
          .admin-sidebar { width: 100% !important; flex-direction: row !important; flex-wrap: wrap; }
          .admin-sidebar nav { flex-direction: row !important; flex-wrap: wrap; flex: unset; width: 100%; padding: 0.5rem !important; }
          .admin-sidebar nav button { width: auto !important; padding: 0.5rem 0.9rem !important; font-size: 0.78rem !important; }
          .admin-sidebar-top { flex-direction: row; align-items: center; justify-content: space-between; }
          .admin-main { padding: 1.25rem 1rem !important; max-width: 100vw !important; }
          table th, table td { font-size: 0.78rem; padding: 0.55rem 0.5rem; }
        }
      `}</style>
      <div className="admin-shell-outer" style={{ display: "flex", minHeight: "100vh" }}>
        <aside className="admin-sidebar" style={{ width: 220, background: CHARCOAL, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "1.5rem 1.4rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.15rem", color: WHITE, display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ color: COPPER }}>◈</span> AIC MAAMANI
            </div>
            <div style={{ fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginTop: "0.25rem" }}>
              Admin Panel{currentUser ? ` · ${currentUser.username}` : ""}
            </div>
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
                    borderWidth: "0 0 0 3px",
                    borderStyle: "solid",
                    borderColor: active ? COPPER : "transparent",
                    cursor: "pointer",
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
              onClick={backToSite}
              style={{ width: "100%", justifyContent: "center", borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)", marginBottom: "0.65rem" }}
            >
              Back to Site
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => setPasswordModal(true)}
              style={{ width: "100%", justifyContent: "center", borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)", marginBottom: "0.65rem" }}
            >
              Change Password
            </button>
            <button
              className="btn btn-ghost"
              onClick={logout}
              style={{ width: "100%", justifyContent: "center", borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)" }}
            >
              Log out
            </button>
          </div>
        </aside>
        <main className="admin-main" style={{ flex: 1, padding: "2rem 2.5rem", overflowY: "auto", maxWidth: "calc(100vw - 220px)" }}>
          {panels[page]}
        </main>
      </div>
      {passwordModal && (
        <PasswordModal
          onClose={() => setPasswordModal(false)}
          onSave={savePassword}
          loading={passwordSaving}
          error={passwordError}
          currentPassword={currentPassword}
          setCurrentPassword={setCurrentPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
        />
      )}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}