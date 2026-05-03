"use client";

import { useState } from "react";
import { uploadResumePdf } from "@/app/admin/actions";
import {
  cvPdfFilename,
  resumePdfForcedDownloadUrl,
  resumePdfViewerUrl,
} from "@/lib/cv-links";

type Props = {
  fieldName: string;
  label: string;
  initialUrl?: string | null;
  portfolioDisplayName?: string | null;
};

export function ResumeUploadField({ fieldName, label, initialUrl, portfolioDisplayName }: Props) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMessage("");
    const fd = new FormData();
    fd.append("file", file);
    const r = await uploadResumePdf(fd);
    setBusy(false);
    if (r.ok) {
      setUrl(r.url);
      setMessage("Resume uploaded and saved.");
    } else {
      setMessage(r.error);
    }
    e.target.value = "";
  }

  return (
    <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
      <input type="hidden" name={fieldName} value={url} readOnly />
      <input
        type="file"
        accept="application/pdf,.pdf"
        disabled={busy}
        onChange={onFile}
        className="block w-full text-sm text-[var(--muted)] file:mr-3 file:rounded-md file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-emerald-500"
      />
      {busy && <p className="text-xs text-[var(--muted)]">Uploading…</p>}
      {message && <p className="text-xs text-amber-300">{message}</p>}
      {url ? (
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <a
            href={resumePdfViewerUrl(url)}
            target="_blank"
            rel="noreferrer"
            className="text-emerald-300 underline decoration-emerald-400/60 underline-offset-2 hover:text-emerald-200"
          >
            Preview PDF
          </a>
          <a
            href={resumePdfForcedDownloadUrl(url, portfolioDisplayName)}
            download={cvPdfFilename(portfolioDisplayName)}
            target="_blank"
            rel="noreferrer"
            className="text-emerald-300 underline decoration-emerald-400/60 underline-offset-2 hover:text-emerald-200"
          >
            Download PDF
          </a>
        </p>
      ) : null}
    </div>
  );
}
