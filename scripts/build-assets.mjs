#!/usr/bin/env node
// Generates the profile banner and project cards used by README.md.
// Zero dependencies: run `node scripts/build-assets.mjs` after editing PROJECTS.
// Every SVG adapts to the viewer's light/dark preference via prefers-color-scheme.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets");

const DOMAINS = {
  ai: { label: "AI TOOLING", accent: "#8B5CF6" },
  banking: { label: "OPEN BANKING", accent: "#0EA5E9" },
  etr: { label: "E-TRANSFORMATION", accent: "#10B981" },
  ledger: { label: "LEDGER & RECON", accent: "#F59E0B" },
  payments: { label: "PAYMENTS", accent: "#EF4444" },
};

export const PROJECTS = [
  { slug: "SyzerCLI", domain: "ai", stack: ["Node.js", "MCP"],
    desc: "Terminal AI agent for OpenRouter & NVIDIA with a multi-key pool, automatic key/model failover, parallel subagents and an OpenAI-compatible local proxy." },
  { slug: "SyzerCLI-Orca", domain: "ai", stack: ["Node.js", "Electron"],
    desc: "Orca plugin for SyzerCLI: agent and subagent status, session history, usage and key manager, tab restore after restart." },
  { slug: "ohvps-kit", domain: "banking", stack: ["TypeScript", "Vitest"],
    desc: "Zero-dependency SDK for TCMB & BKM ÖHVPS 2.0.1 (GEÇİT): HBH, ÖEH, detached JWS signing and a consent state machine." },
  { slug: "tcmb-fx-engine", domain: "banking", stack: ["TypeScript", "Vitest"],
    desc: "TCMB exchange rates, EVDS parsing, cross-currency math and corporate revaluation under VUK & TDHP 646/656." },
  { slug: "ubl-tr-kit", domain: "etr", stack: ["TypeScript", "Vitest"],
    desc: "Turkish e-invoicing toolkit: integer-kuruş totals, UBL-TR 2.1 XML, VKN/TCKN/TR-IBAN validation, amount-in-words." },
  { slug: "ubl-despatch-kit", domain: "etr", stack: ["TypeScript", "Vitest"],
    desc: "e-İrsaliye (UBL-TR 2.1 Despatch Advice): XML generation, volumetric freight/desi math and carrier dispatching." },
  { slug: "ledger-core", domain: "ledger", stack: ["TypeScript", "Vitest"],
    desc: "Immutable double-entry general ledger with the Turkish Uniform Chart of Accounts (TDHP) and integer kuruş math." },
  { slug: "recon-engine", domain: "ledger", stack: ["Python", "Unittest"],
    desc: "Multi-tier reconciliation engine matching bank transactions to open receivables with confidence scoring." },
  { slug: "mt940-camt-parser", domain: "payments", stack: ["Python", "Unittest"],
    desc: "Dual parser for SWIFT MT940 and ISO 20022 CAMT.053 bank statements into normalized, exact Decimal models." },
  { slug: "payment-webhook-relay", domain: "payments", stack: ["TypeScript", "Vitest"],
    desc: "Reliable webhook ingestion and dispatch: timing-safe HMAC, idempotency locks and exponential backoff DLQ." },
];

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace";

const THEME_CSS = `
  :root { --bg:#FFFFFF; --panel:#F6F8FA; --border:#D0D7DE; --fg:#1F2328; --muted:#59636E; --grid:#EAEEF2; }
  @media (prefers-color-scheme: dark) {
    :root { --bg:#0D1117; --panel:#161B22; --border:#30363D; --fg:#E6EDF3; --muted:#9198A1; --grid:#1B222C; }
  }
  .bg { fill: var(--bg); } .panel { fill: var(--panel); stroke: var(--border); }
  .fg { fill: var(--fg); } .muted { fill: var(--muted); } .grid { stroke: var(--grid); }
`;

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Greedy word wrap using an approximate average glyph width.
function wrap(text, maxChars) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function card({ slug, domain, stack, desc }) {
  const W = 420, H = 150;
  const { label, accent } = DOMAINS[domain];
  const lines = wrap(desc, 60).slice(0, 3);
  let x = 20;
  const chips = stack
    .map((s) => {
      const w = s.length * 6.6 + 18;
      const chip = `<g transform="translate(${x},118)"><rect width="${w}" height="20" rx="10" fill="${accent}" fill-opacity="0.14"/><text x="${w / 2}" y="14" text-anchor="middle" font-family="${MONO}" font-size="11" fill="${accent}">${esc(s)}</text></g>`;
      x += w + 6;
      return chip;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(slug)}: ${esc(desc)}">
<title>${esc(slug)}</title>
<style>${THEME_CSS}</style>
<rect class="panel" x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10"/>
<clipPath id="c"><rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10"/></clipPath>
<rect clip-path="url(#c)" x="0" y="0" width="4" height="${H}" fill="${accent}"/>
<text x="20" y="26" font-family="${MONO}" font-size="10" font-weight="600" letter-spacing="1.2" fill="${accent}">${esc(label)}</text>
<text class="fg" x="20" y="50" font-family="${FONT}" font-size="17" font-weight="700">${esc(slug)}</text>
<text x="${W - 20}" y="50" text-anchor="end" font-family="${FONT}" font-size="15" class="muted">↗</text>
${lines.map((l, i) => `<text class="muted" x="20" y="${74 + i * 16}" font-family="${FONT}" font-size="12">${esc(l)}</text>`).join("\n")}
${chips}
</svg>
`;
}

function banner() {
  const W = 1200, H = 300;
  const gridLines = [];
  for (let gx = 0; gx <= W; gx += 40) gridLines.push(`<line class="grid" x1="${gx}" y1="0" x2="${gx}" y2="${H}"/>`);
  for (let gy = 0; gy <= H; gy += 40) gridLines.push(`<line class="grid" x1="0" y1="${gy}" x2="${W}" y2="${gy}"/>`);

  // A small double-entry "journal" motif on the right side.
  const rows = [
    ["120 Receivables", "12,000.00", ""],
    ["600 Sales", "", "10,000.00"],
    ["391 VAT 20%", "", "2,000.00"],
  ];
  const journal = rows
    .map(([acc, dr, cr], i) => {
      const y = 120 + i * 32;
      return `<text class="muted" x="800" y="${y}" font-family="${MONO}" font-size="13">${acc}</text>
<text class="fg" x="1010" y="${y}" text-anchor="end" font-family="${MONO}" font-size="13">${dr}</text>
<text class="fg" x="1130" y="${y}" text-anchor="end" font-family="${MONO}" font-size="13">${cr}</text>`;
    })
    .join("\n");

  const domains = Object.values(DOMAINS);
  let dx = 64;
  const pills = domains
    .map(({ label, accent }) => {
      const w = label.length * 7.4 + 26;
      const g = `<g transform="translate(${dx},212)"><rect width="${w}" height="26" rx="13" fill="${accent}" fill-opacity="0.14"/><circle cx="13" cy="13" r="3.5" fill="${accent}"/><text x="${w / 2 + 6}" y="17.5" text-anchor="middle" font-family="${MONO}" font-size="11" font-weight="600" letter-spacing="0.8" fill="${accent}">${esc(label)}</text></g>`;
      dx += w + 8;
      return g;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Yasin Balçık — Solutions Architect and Full-Stack Engineer, FinTech and E-Transformation">
<title>Yasin Balçık</title>
<style>${THEME_CSS}
  .cursor { animation: blink 1.1s steps(1) infinite; }
  @keyframes blink { 50% { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .cursor { animation: none; } }
</style>
<defs>
  <linearGradient id="fade" x1="0" x2="1">
    <stop offset="0" stop-color="#0EA5E9"/><stop offset="0.5" stop-color="#10B981"/><stop offset="1" stop-color="#8B5CF6"/>
  </linearGradient>
  <clipPath id="clip"><rect width="${W}" height="${H}" rx="16"/></clipPath>
</defs>
<g clip-path="url(#clip)">
  <rect class="bg" width="${W}" height="${H}"/>
  ${gridLines.join("")}
  <rect width="${W}" height="4" fill="url(#fade)"/>
</g>
<rect class="panel" x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" style="fill:none"/>

<text class="muted" x="64" y="78" font-family="${MONO}" font-size="14">$ whoami</text>
<text class="fg" x="64" y="128" font-family="${FONT}" font-size="48" font-weight="800" letter-spacing="-1">Yasin Balçık</text>
<text class="fg" x="64" y="164" font-family="${FONT}" font-size="20" font-weight="500">Solutions Architect &amp; Full-Stack Engineer</text>
<text class="muted" x="64" y="192" font-family="${FONT}" font-size="15">Software for regulated money flows — correct by construction, operable by finance teams.<tspan class="cursor" fill="#10B981"> ▍</tspan></text>
${pills}

<rect class="panel" x="776" y="62" width="380" height="186" rx="10"/>
<text class="muted" x="800" y="86" font-family="${MONO}" font-size="11" letter-spacing="1">JOURNAL · INV-2026-0042</text>
<text class="muted" x="1010" y="86" text-anchor="end" font-family="${MONO}" font-size="11">DR</text>
<text class="muted" x="1130" y="86" text-anchor="end" font-family="${MONO}" font-size="11">CR</text>
${journal}
<line class="grid" x1="800" y1="214" x2="1130" y2="214" style="stroke:var(--border)"/>
<text fill="#10B981" x="800" y="235" font-family="${MONO}" font-size="12" font-weight="600">✓ balanced</text>
<text class="fg" x="1130" y="235" text-anchor="end" font-family="${MONO}" font-size="12">Σ DR = Σ CR</text>
</svg>
`;
}

function write(rel, content) {
  const path = join(OUT, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  console.log(`wrote assets/${rel}`);
}

write("banner.svg", banner());
for (const p of PROJECTS) write(`cards/${p.slug}.svg`, card(p));
