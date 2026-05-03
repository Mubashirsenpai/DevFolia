"use client";

import { useRef, useState } from "react";

type Props = {
  phone: string;
};

export function CopyPhoneButton({ phone }: Props) {
  const [copied, setCopied] = useState(false);
  const holdTimerRef = useRef<number | null>(null);

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  function startHoldCopy() {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
    }
    holdTimerRef.current = window.setTimeout(() => {
      copyNumber();
      holdTimerRef.current = null;
    }, 420);
  }

  function cancelHoldCopy() {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }

  return (
    <button
      type="button"
      onClick={copyNumber}
      onMouseDown={startHoldCopy}
      onMouseUp={cancelHoldCopy}
      onMouseLeave={cancelHoldCopy}
      onTouchStart={startHoldCopy}
      onTouchEnd={cancelHoldCopy}
      className="inline-flex min-h-11 items-center rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-white hover:border-emerald-500/50 hover:text-emerald-200"
      title="Click or hold to copy number"
    >
      {copied ? "Copied" : phone}
    </button>
  );
}
