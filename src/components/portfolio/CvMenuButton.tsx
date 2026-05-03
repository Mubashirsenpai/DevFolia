"use client";

import { useEffect, useRef, useState } from "react";
import {
  cvPdfFilename,
  resumePdfForcedDownloadUrl,
  resumePdfViewerUrl,
} from "@/lib/cv-links";

type Props = {
  resumeUrl?: string | null;
  /** Used for sensible download filenames (ASCII slug). */
  portfolioDisplayName?: string | null;
};

export function CvMenuButton({ resumeUrl, portfolioDisplayName }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  const downloadUrl = resumeUrl
    ? resumePdfForcedDownloadUrl(resumeUrl, portfolioDisplayName)
    : "";
  const previewUrl = resumeUrl ? resumePdfViewerUrl(resumeUrl) : "";
  const downloadName = cvPdfFilename(portfolioDisplayName);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-11 items-center rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
      >
        View CV
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(13rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[var(--border)] bg-slate-950/95 shadow-2xl backdrop-blur md:left-0 md:right-auto">
          {resumeUrl ? (
            <>
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center px-4 py-3 text-sm text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-300"
              >
                Preview CV
              </a>
              <a
                href={downloadUrl}
                download={downloadName}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center px-4 py-3 text-sm text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-300"
              >
                Download CV
              </a>
            </>
          ) : (
            <p className="px-4 py-3 text-sm text-slate-400">No CV uploaded yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
