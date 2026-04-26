"use client";

import { FormEvent, useState } from "react";

type ContactFormProps = {
  recipientEmail: string;
};

export function ContactForm({ recipientEmail }: ContactFormProps) {
  const [name, setName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = `New contact message from ${name || "Website visitor"}`;
    const body = [
      `Name: ${name}`,
      `Email: ${senderEmail}`,
      "",
      "Message:",
      message,
    ].join("\n");

    window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card mt-8 rounded-2xl p-6">
      <p className="text-lg font-semibold text-white">Send a message</p>

      <label className="mt-4 block text-sm text-slate-300">
        Name
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-500/50"
          placeholder="Your full name"
        />
      </label>

      <label className="mt-4 block text-sm text-slate-300">
        Your email
        <input
          required
          type="email"
          value={senderEmail}
          onChange={(event) => setSenderEmail(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-500/50"
          placeholder="you@example.com"
        />
      </label>

      <label className="mt-4 block text-sm text-slate-300">
        Message
        <textarea
          required
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-500/50"
          placeholder="Tell us how we can help..."
        />
      </label>

      <button
        type="submit"
        className="mt-5 inline-flex rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
      >
        Send message
      </button>
    </form>
  );
}
