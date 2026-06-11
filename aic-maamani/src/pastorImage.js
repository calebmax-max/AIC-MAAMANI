import { useEffect, useState } from "react";
import { fetchJson } from "./api";

export const DEFAULT_PASTOR_IMAGE =
  "https://placehold.co/360x460/F2F1EF/2C2C2A?text=Add+Pastor+Photo";

export function usePastorImage() {
  const [src, setSrc] = useState(DEFAULT_PASTOR_IMAGE);

  useEffect(() => {
    let mounted = true;
    fetchJson("/api/about/pastor/photo")
      .then((data) => {
        if (!mounted) return;
        setSrc(data?.photo || DEFAULT_PASTOR_IMAGE);
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
