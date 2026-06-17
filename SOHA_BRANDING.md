# SOHA — Branding & Customization Notes

SOHA (سها) is a personal, Persian-friendly rebrand of the open-source **goose** AI agent
(Apache-2.0). This document records what was customized and what remains.

> Upstream attribution is preserved (LICENSE / NOTICE). Per Apache-2.0 §6 the original
> "goose" name and logo are NOT used as our product brand — SOHA has its own name and logo.

## Repository layout

- `origin` → `https://github.com/zakeri-dev/goose` (our fork — work & releases)
- `upstream` → `https://github.com/aaif-goose/goose` (official; pull updates only, push disabled)
- Branches: `main` (clean upstream mirror), `soha-brand` (all SOHA work), `release` (build point)

To pull upstream updates later:
```
git fetch upstream
git checkout main && git merge --ff-only upstream/main
git checkout soha-brand && git rebase main
```

## What was customized

### Branding (Phase 1)
- App identity → **SOHA**: `ui/desktop/package.json` (name `soha-app`, productName `SOHA`),
  `ui/desktop/forge.config.ts` (deb/rpm/flatpak names, ids, homepage, update repo owner → `zakeri-dev`).
- Icons regenerated from `LOGO/Soha-Logo-Full.png` → `ui/desktop/src/images/icon.{png,ico,icns}`,
  `icon-512.png`, `icon@2x.png`, `icon-light.{png,icns}`.
- Linux desktop entries: `forge.deb.desktop`, `forge.rpm.desktop`.
- System prompt identity → SOHA: `crates/goose/src/prompts/system.md`.
- Visible strings in `ui/desktop/src/main.ts` (About panel, dialogs, notifications).
- Telemetry hard-disabled: `crates/goose/src/posthog.rs` `posthog_capture` is now a no-op —
  no events are sent to any PostHog endpoint.

### Bundled MCP servers (Phase 2)
- `ui/desktop/src/components/settings/extensions/bundled-extensions.ts` now passes
  `headers` / `envs` / `env_keys` for `streamable_http` extensions.
- `bundled-extensions.json` ships **sokan** (remote streamable_http MCP) preconfigured.
  ⚠️ The auth token is a PLACEHOLDER (`Bearer REPLACE_WITH_YOUR_SOKAN_TOKEN`) and the
  extension is `enabled: false` — set your real token and enable it. The real token is
  intentionally NOT committed (it would leak in a public repo).
- To add more remote MCP servers (e.g. Figma), append entries of the same shape:
  ```json
  {
    "id": "figma", "name": "figma", "display_name": "Figma",
    "description": "...", "enabled": false, "type": "streamable_http",
    "uri": "https://<figma-mcp-endpoint>/mcp",
    "headers": { "Authorization": "Bearer <token>" },
    "timeout": 300, "bundled": true
  }
  ```

### Persian language (Phase 3)
- `ui/desktop/src/i18n/messages/fa.json` — full Persian catalog (1606 keys), brand = سها.
- `fa` registered in `ui/desktop/src/i18n/index.ts` (`SUPPORTED_LOCALES`) and selectable in
  Settings (AppSettingsSection language picker). `LanguageSetting` type + main-process
  validation updated.
- RTL layout (mirroring the whole UI) is NOT done yet — text is translated; deferred to a later phase.

### Marketplace v1 — bundled recipes (Phase 4)
- Two Persian recipes in `ui/desktop/src/recipes/`: `article-writer.yaml` (مقاله‌نویس),
  `summarizer.yaml` (خلاصه‌ساز).
- Packaged via forge `extraResource: ['src/bin','src/images','src/recipes']` and exposed to
  the backend by setting `GOOSE_RECIPE_PATH` to the bundled dir in `main.ts`, so they appear
  in the in-app recipe library.
- A dedicated marketplace UI + remote registry is a later phase.

## Build environment

- Node 24 via **fnm** (system Node 22 untouched). pnpm 10.x (NOT 11 — pnpm 11's
  `blockExoticSubdeps` rejects an electron git subdep; use pnpm 10).
- Rust core (`goosed`) builds in **Docker** (no local MSVC build tools). Desktop UI builds
  natively with Node/pnpm.
- Validated so far: `pnpm install`, `pnpm run i18n:compile`, `pnpm run typecheck` all pass.

## Remaining / open

- **Phase 5 — Windows installer**: makers currently produce a ZIP for Windows (no
  `maker-squirrel` wired). Producing a real installer + the Windows `goosed.exe` from a
  non-MSVC environment is the main open problem (options: `cargo-xwin` cross-compile, or
  build goosed in Docker for windows-gnu, then package). Not solved yet.
- Auto-update channel points at `zakeri-dev/goose` (GITHUB_OWNER/REPO) — needs releases published there.
- In-app emblem SVGs (`src/images/icon.svg`, `glyph.svg`) still show the goose mark; replace
  with a SOHA SVG for full in-app logo consistency.
