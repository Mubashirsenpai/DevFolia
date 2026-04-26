import { CSSProperties } from "react";

export const PORTFOLIO_THEME_ORDER = [
  "midnight",
  "emerald",
  "sunset",
  "neon",
  "royal",
  "rose",
] as const;

export type PortfolioTheme = (typeof PORTFOLIO_THEME_ORDER)[number];

type ThemeDefinition = {
  label: string;
  style?: CSSProperties;
};

const THEMES: Record<PortfolioTheme, ThemeDefinition> = {
  midnight: {
    label: "Midnight",
    style: {
      "--background": "#070b14",
      "--card": "#0f1629",
      "--border": "#1e293b",
      "--muted": "#94a3b8",
      "--accent": "#34d399",
      "--accent-soft": "#6ee7b7",
      "--hero-from": "rgba(52,211,153,0.20)",
      "--hero-to": "rgba(56,189,248,0.20)",
      "--experience-rail": "rgba(16,185,129,0.45)",
      "--education-rail": "rgba(56,189,248,0.45)",
      "--skill-bar-from": "#059669",
      "--skill-bar-to": "#34d399",
    } as CSSProperties,
  },
  emerald: {
    label: "Emerald Forest",
    style: {
      "--background": "#041110",
      "--card": "#0a1b1a",
      "--border": "#18453f",
      "--muted": "#9bc5bf",
      "--accent": "#5eead4",
      "--accent-soft": "#99f6e4",
      "--hero-from": "rgba(45,212,191,0.26)",
      "--hero-to": "rgba(16,185,129,0.20)",
      "--experience-rail": "rgba(20,184,166,0.50)",
      "--education-rail": "rgba(16,185,129,0.45)",
      "--skill-bar-from": "#0d9488",
      "--skill-bar-to": "#2dd4bf",
    } as CSSProperties,
  },
  sunset: {
    label: "Sunset Glow",
    style: {
      "--background": "#140a08",
      "--card": "#20110d",
      "--border": "#4a2a1f",
      "--muted": "#d5b0a1",
      "--accent": "#fb923c",
      "--accent-soft": "#fdba74",
      "--hero-from": "rgba(251,146,60,0.30)",
      "--hero-to": "rgba(244,63,94,0.22)",
      "--experience-rail": "rgba(249,115,22,0.50)",
      "--education-rail": "rgba(244,63,94,0.45)",
      "--skill-bar-from": "#ea580c",
      "--skill-bar-to": "#fb923c",
    } as CSSProperties,
  },
  neon: {
    label: "Neon Pulse",
    style: {
      "--background": "#090710",
      "--card": "#111028",
      "--border": "#2f2c59",
      "--muted": "#b3b1d6",
      "--accent": "#a78bfa",
      "--accent-soft": "#22d3ee",
      "--hero-from": "rgba(167,139,250,0.32)",
      "--hero-to": "rgba(34,211,238,0.24)",
      "--experience-rail": "rgba(167,139,250,0.55)",
      "--education-rail": "rgba(34,211,238,0.50)",
      "--skill-bar-from": "#7c3aed",
      "--skill-bar-to": "#22d3ee",
    } as CSSProperties,
  },
  royal: {
    label: "Royal Indigo",
    style: {
      "--background": "#0b1025",
      "--card": "#131b3d",
      "--border": "#2d3970",
      "--muted": "#a9b8e8",
      "--accent": "#93c5fd",
      "--accent-soft": "#c4b5fd",
      "--hero-from": "rgba(147,197,253,0.26)",
      "--hero-to": "rgba(196,181,253,0.24)",
      "--experience-rail": "rgba(147,197,253,0.50)",
      "--education-rail": "rgba(196,181,253,0.48)",
      "--skill-bar-from": "#3b82f6",
      "--skill-bar-to": "#8b5cf6",
    } as CSSProperties,
  },
  rose: {
    label: "Rose Gold",
    style: {
      "--background": "#170b14",
      "--card": "#24121f",
      "--border": "#4a2340",
      "--muted": "#d8b4c9",
      "--accent": "#f472b6",
      "--accent-soft": "#f9a8d4",
      "--hero-from": "rgba(244,114,182,0.28)",
      "--hero-to": "rgba(251,113,133,0.24)",
      "--experience-rail": "rgba(244,114,182,0.52)",
      "--education-rail": "rgba(251,113,133,0.48)",
      "--skill-bar-from": "#db2777",
      "--skill-bar-to": "#f472b6",
    } as CSSProperties,
  },
};

export function getPortfolioThemeDefinition(theme: string): ThemeDefinition {
  return THEMES[(PORTFOLIO_THEME_ORDER as readonly string[]).includes(theme) ? (theme as PortfolioTheme) : "midnight"];
}

export function portfolioThemeLabel(theme: string): string {
  return getPortfolioThemeDefinition(theme).label;
}
