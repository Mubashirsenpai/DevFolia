"use client";

import { useEffect, useState } from "react";

const headlines = [
  "Establish a professional portfolio that communicates credibility and capability.",
  "Present your expertise through a refined portfolio built for professional visibility.",
  "Strengthen your professional presence with a portfolio designed for trust and impact.",
];

export function HeroHeadlineSlideshow() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"enter" | "center" | "exit">("enter");

  useEffect(() => {
    const enterTimer = window.setTimeout(() => {
      setPhase("center");
    }, 40);

    const interval = window.setInterval(() => {
      setPhase("exit");
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % headlines.length);
        setPhase("enter");
        window.setTimeout(() => {
          setPhase("center");
        }, 40);
      }, 360);
    }, 5200);

    return () => {
      window.clearTimeout(enterTimer);
      window.clearInterval(interval);
    };
  }, []);

  const animationClass =
    phase === "enter"
      ? "translate-x-10 opacity-0"
      : phase === "exit"
        ? "-translate-x-10 opacity-0"
        : "translate-x-0 opacity-100";

  return (
    <h1
      className={`mt-4 max-w-4xl text-4xl font-bold tracking-tight text-white transition-all duration-500 ease-out sm:text-6xl ${animationClass}`}
      aria-live="polite"
    >
      {headlines[index]}
    </h1>
  );
}
