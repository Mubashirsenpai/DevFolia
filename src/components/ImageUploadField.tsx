"use client";

import { useState } from "react";
import { uploadPortfolioImage } from "@/app/admin/actions";

type Props = {
  fieldName: string;
  label: string;
  initialUrl?: string | null;
};

export function ImageUploadField({ fieldName, label, initialUrl }: Props) {
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
    const r = await uploadPortfolioImage(fd);
    setBusy(false);
    if (r.ok) {
      setUrl(r.url);
      setMessage("Saved to gallery.");
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
        accept="image/jpeg,image/png,image/webp,image/gif"
        disabled={busy}
        onChange={onFile}
        className="block w-full text-sm text-[var(--muted)] file:mr-3 file:rounded-md file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-emerald-500"
      />
      {busy && (
        <p className="text-xs text-[var(--muted)]">Uploading…</p>
      )}
      {message && (
        <p className="text-xs text-amber-300">{message}</p>
      )}
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="mt-2 h-24 w-24 rounded-lg border border-[var(--border)] object-cover"
        />
      ) : null}
    </div>
  );
}
