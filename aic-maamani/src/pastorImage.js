import { useEffect, useState, useCallback } from "react";
import { fetchJson, API_BASE } from "./api";

export const DEFAULT_PASTOR_IMAGE =
  "https://placehold.co/360x460/F2F1EF/2C2C2A?text=Add+Pastor+Photo";

const STORAGE_KEY = "pastor_image_src";

// ── Module-level cache ──────────────────────────────────
let _cachedSrc = localStorage.getItem(STORAGE_KEY) || null;
let _listeners = new Set();
let _fetching = false;

function notifyListeners(src) {
  _cachedSrc = src;
  try { localStorage.setItem(STORAGE_KEY, src); } catch (_) {}
  _listeners.forEach(fn => fn(src));
}

function resolveUrl(src) {
  if (!src) return "";
  if (/^(?:https?:)?\/\//i.test(src) || src.startsWith("data:")) return src;
  return `${API_BASE}${src}`;
}

function bustCache(url) {
  if (!url || url.startsWith("https://placehold.co")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${Date.now()}`;
}

function fetchPastorImage() {
  if (_fetching) return;
  _fetching = true;
  fetchJson("/api/about/pastor/photo")
    .then((data) => {
      const resolved = resolveUrl(data?.photo);
      notifyListeners(resolved ? bustCache(resolved) : DEFAULT_PASTOR_IMAGE);
    })
    .catch(() => {
      notifyListeners(DEFAULT_PASTOR_IMAGE);
    })
    .finally(() => { _fetching = false; });
}

export function usePastorImage() {
  // On first render: use localStorage value if available, else placeholder
  const [src, setSrc] = useState(_cachedSrc ?? DEFAULT_PASTOR_IMAGE);

  useEffect(() => {
    _listeners.add(setSrc);

    // Always re-fetch in background to stay fresh,
    // but the stored URL renders immediately so there's no flash
    fetchPastorImage();

    const onUpdate = () => {
      _cachedSrc = null;
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      fetchPastorImage();
    };
    window.addEventListener("pastor-photo-updated", onUpdate);

    return () => {
      _listeners.delete(setSrc);
      window.removeEventListener("pastor-photo-updated", onUpdate);
    };
  }, []);

  const refresh = useCallback(() => {
    _cachedSrc = null;
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    fetchPastorImage();
  }, []);

  return { pastorImageSrc: src, refreshPastorImage: refresh };
}