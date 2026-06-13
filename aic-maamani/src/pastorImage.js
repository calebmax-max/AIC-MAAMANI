import { useEffect, useState, useCallback } from "react";
import { fetchJson, API_BASE } from "./api";

export const DEFAULT_PASTOR_IMAGE =
  "https://placehold.co/360x460/F2F1EF/2C2C2A?text=Add+Pastor+Photo";

// ── Module-level cache ──────────────────────────────────
let _cachedSrc = null;          // null = not yet fetched
let _listeners = new Set();     // all mounted hook instances

function notifyListeners(src) {
  _cachedSrc = src;
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

let _fetching = false;

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
  // If already cached, start with the real image — no flash
  const [src, setSrc] = useState(_cachedSrc ?? DEFAULT_PASTOR_IMAGE);

  useEffect(() => {
    _listeners.add(setSrc);

    // Only fetch if nothing is cached yet
    if (_cachedSrc === null) {
      fetchPastorImage();
    } else {
      // Already have it — sync immediately
      setSrc(_cachedSrc);
    }

    // Re-fetch on admin upload
    const onUpdate = () => {
      _cachedSrc = null;   // invalidate cache
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
    fetchPastorImage();
  }, []);

  return { pastorImageSrc: src, refreshPastorImage: refresh };
}