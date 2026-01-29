"use client";

import { useEffect, useState } from "react";

export function GlobalImageLightbox() {
  const [activeSrc, setActiveSrc] = useState<string | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.tagName !== "IMG") return;
      const img = target as HTMLImageElement;
      const src = img.currentSrc || img.src;
      if (!src) return;
      setActiveSrc(src);
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveSrc(null);
      }
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  if (!activeSrc) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
      onClick={() => setActiveSrc(null)}
    >
      <img
        src={activeSrc}
        alt="Preview"
        className="max-h-[90vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
      />
    </div>
  );
}
