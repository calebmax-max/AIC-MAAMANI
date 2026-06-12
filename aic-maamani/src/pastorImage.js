import { useEffect, useState, useCallback } from "react";
import { fetchJson, API_BASE } from "./api";

export const DEFAULT_PASTOR_IMAGE =
  "https://placehold.co/360x460/F2F1EF/2C2C2A?text=Add+Pastor+Photo";

function resolveUrl(src) {
  if (!src) return "";
  if (/^(?:https?:)?\/\//i.test(src) || src.startsWith("data:")) return src;
  return `${API_BASE}${src}`;
}

// Append a cache-buster so the browser always loads the new image after upload
function bustCache(url) {
  if (!url || url.startsWith("https://placehold.co")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${Date.now()}`;
}

export function usePastorImage() {
  const [src, setSrc] = useState(DEFAULT_PASTOR_IMAGE);

  const refresh = useCallback(() => {
    let mounted = true;
    fetchJson("/api/about/pastor/photo")
      .then((data) => {
        if (!mounted) return;
        const resolved = resolveUrl(data?.photo);
        setSrc(resolved ? bustCache(resolved) : DEFAULT_PASTOR_IMAGE);
      })
      .catch(() => {
        if (mounted) setSrc(DEFAULT_PASTOR_IMAGE);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // Initial load
    const cleanup = refresh();

    // Re-fetch whenever admin panel saves a new photo
    window.addEventListener("pastor-photo-updated", refresh);
    return () => {
      cleanup?.();
      window.removeEventListener("pastor-photo-updated", refresh);
    };
  }, [refresh]);

  return { pastorImageSrc: src, refreshPastorImage: refresh };
}