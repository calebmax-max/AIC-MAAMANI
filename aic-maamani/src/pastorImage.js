import { useEffect, useState } from "react";
import { fetchJson, API_BASE } from "./api";

export const DEFAULT_PASTOR_IMAGE =
  "https://placehold.co/360x460/F2F1EF/2C2C2A?text=Add+Pastor+Photo";

// Resolves a backend-relative path (e.g. "/uploads/pastor.jpg") into a
// full URL using the same base the API calls use.
function resolveUrl(src) {
  if (!src) return "";
  if (/^(?:https?:)?\/\//i.test(src) || src.startsWith("data:")) return src;
  return `${API_BASE}${src}`;
}

export function usePastorImage() {
  const [src, setSrc] = useState(DEFAULT_PASTOR_IMAGE);

  useEffect(() => {
    let mounted = true;
    fetchJson("/api/about/pastor/photo")
      .then((data) => {
        if (!mounted) return;
        const resolved = resolveUrl(data?.photo);
        setSrc(resolved || DEFAULT_PASTOR_IMAGE);
      })
      .catch(() => {
        if (mounted) setSrc(DEFAULT_PASTOR_IMAGE);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { pastorImageSrc: src };
}