# SOHA — Project Handoff & Build Guide

**SOHA (سها)** is a personal, Persian-first rebrand of the open-source **goose** AI agent
(Rust core + Electron/React desktop, Apache-2.0). This document is the single source of
truth for what's done, how to build/run/release, and the non-obvious gotchas. Read this
first in any new session.

---

## 1. Status (current)

Everything below is **done, validated, committed, and pushed** to branch `soha-brand`:

- ✅ Full SOHA branding (app name, window title, OS icon = emblem, in-app logos, system prompt)
- ✅ Telemetry hard-disabled (`crates/goose/src/posthog.rs` → `posthog_capture` is a no-op)
- ✅ Persian UI: `fa.json` (1606 keys) + native menu + most hardcoded strings; settings picker
- ✅ Bundled remote MCP server "sokan" (streamable_http + Bearer header, token placeholder, disabled)
- ✅ Two Persian recipes (`مقاله‌نویس` article-writer, `خلاصه‌ساز` summarizer) bundled via `GOOSE_RECIPE_PATH`
- ✅ All links to goose-owned sites removed; report/help links → `https://sohaagent.ir`
- ✅ Chat watermark uses the SOHA typography logo (no "سها" text)
- ✅ **Our own `goosed.exe`** built (MSVC) and bundled → telemetry-off + SOHA system prompt are real
- ✅ **Working Windows installer** `SOHA-<ver> Setup.exe` (Squirrel) + auto-update artifacts
- ✅ Auto-update config points at `zakeri-dev/soha-agent`

**Open / TODO:**
- ⏳ Rename the GitHub repo `goose` → `soha-agent` (code already updated; do the GitHub-side rename).
- ⏳ Publish the first GitHub Release with the 3 update artifacts (enables auto-update). See §6.
- ⏳ Code signing to remove the SmartScreen "Run anyway" warning (paid; see §7).
- ⏳ Optional polish: RTL layout for Persian; rename the `goose://` deeplink protocol; real sokan token.

---

## 2. Repo, remotes, branches

- Working dir / repo root: `F:\Git\Soha-Agent-Assistant`
- `origin` = `https://github.com/zakeri-dev/soha-agent` (the user's fork; after the rename — see §8)
- `upstream` = `https://github.com/aaif-goose/goose` (official; pull updates only, push disabled)
- Branches: `main` (clean upstream mirror), **`soha-brand`** (all SOHA work — the active branch), `release` (unused so far)
- Logos: `LOGO/` — `Soha-Logo.png` (emblem, used for icons + in-app), `Soha-Logo-Typo.png` (wordmark, chat watermark), `Soha-Logo-Full.png` (emblem+text, not currently used).

Pull upstream updates later:
```
git fetch upstream
git checkout main; git merge --ff-only upstream/main
git checkout soha-brand; git rebase main
```

---

## 3. Build environment (CRITICAL — read before building)

Installed on this machine:
- **fnm** (Node version manager). Two Node versions matter:
  - **Node 24** (`fnm use 24`) — for **development** (goose's engine requirement) and editing.
  - **Node 22** (`fnm use 22`) — **ONLY for building the installer** (see the extract-zip gotcha §3.1).
- **pnpm 10** (installed per-fnm-node via `npm i -g pnpm@10`). **Do NOT use pnpm 11** (§3.2).
- **Rust** via rustup, pinned to **1.92** by `rust-toolchain.toml`, target `x86_64-pc-windows-msvc`.
- **VS Build Tools 2022** (MSVC 14.44), **CMake**, **LLVM** (libclang) — for building `goosed.exe`.
- **Docker Desktop** — used earlier to validate the Rust core; not needed for normal builds now.

Each fresh PowerShell call must re-establish PATH + fnm:
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
fnm env --shell powershell | Out-String | Invoke-Expression
fnm use 24   # or 22 for the installer build
```

### 3.1 ⚠️ The extract-zip / Node 24 gotcha (most important)
`extract-zip@2.0.1` (used by electron-forge/@electron/packager and the `electron` npm postinstall)
**silently extracts almost nothing on Node 24** (resolves OK, but the electron binary isn't
unpacked). Symptoms: `pnpm make`/`package` says "Finalizing package" then `out/` is empty; the
dev `electron` binary is missing (`node_modules/electron/path.txt` absent).
- **Fix for the installer build:** run `pnpm run make` under **Node 22** (`fnm use 22`), where
  extract-zip works correctly.
- **Fix for the dev electron binary (if missing):** extract the cached zip manually:
  `Expand-Archive %LOCALAPPDATA%\electron\Cache\<hash>\electron-v41.0.0-win32-x64.zip` into
  `ui/node_modules/electron/dist`, then write `ui/node_modules/electron/path.txt` = `electron.exe`.

### 3.2 ⚠️ pnpm version
Use **pnpm 10**. pnpm 11 breaks two things here: `blockExoticSubdeps` rejects an electron git
subdep during `install`, and electron-forge's preflight fails with "node-linker must be hoisted".
`ui/.npmrc` already sets `node-linker=hoisted`.

### 3.3 ⚠️ React vite alias (dev only)
`ui/desktop/vite.renderer.config.mts` aliases `react`/`react-dom` to
`ui/desktop/node_modules/...`, but pnpm hoists them to `ui/node_modules`. If `pnpm start-gui`
errors `Failed to resolve import "react/jsx-dev-runtime"`, create directory junctions:
```powershell
New-Item -ItemType Junction -Path "ui\desktop\node_modules\react"     -Target "ui\node_modules\react"
New-Item -ItemType Junction -Path "ui\desktop\node_modules\react-dom" -Target "ui\node_modules\react-dom"
```

---

## 4. How to RUN (dev)

Needs `goosed.exe` present at `ui/desktop/src/bin/goosed.exe` (build it per §5, or it's already there).
```powershell
# PATH + fnm (Node 24) as in §3
cd F:\Git\Soha-Agent-Assistant\ui\desktop
$env:GOOSE_LOCALE = "fa"      # open in Persian
pnpm run start-gui
```
Window title shows "SOHA"; sidebar/menu in Persian; recipes under «دستورهای کار».

---

## 5. How to BUILD `goosed.exe` (the Rust backend)

Needs the MSVC env + CMake + LLVM. From repo root:
```powershell
$env:Path = "...Machine + User PATH..."          # see §3
$vcvars = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat"
cmd /c "`"$vcvars`" && set" | ForEach-Object { if ($_ -match '^([^=]+)=(.*)$') { Set-Item -Path "Env:\$($matches[1])" -Value $matches[2] } }
$env:LIBCLANG_PATH = "$env:ProgramFiles\LLVM\bin"
cargo build --release -p goose-server --target x86_64-pc-windows-msvc
# then copy into the desktop app:
Copy-Item ".\target\x86_64-pc-windows-msvc\release\goosed.exe" ".\ui\desktop\src\bin\goosed.exe" -Force
```
Build is long (release; includes llama.cpp via cmake). `goosed.exe --version` should print
`goose-server 1.38.0`. The first run may stop before linking the `goosed` bin — just re-run the
`cargo build` line (it's incremental and finishes the bin in ~2 min).

---

## 6. How to BUILD the Windows INSTALLER

⚠️ Use **Node 22 + pnpm 10** (see §3.1/§3.2). Make sure `ui/desktop/src/bin/goosed.exe` exists.
```powershell
$env:Path = "...Machine + User PATH..."
fnm env --shell powershell | Out-String | Invoke-Expression
fnm use 22
$env:ELECTRON_ARCH = "x64"
$env:GITHUB_OWNER = "zakeri-dev"; $env:GITHUB_REPO = "soha-agent"; $env:GOOSE_BUNDLE_NAME = "SOHA"
cd F:\Git\Soha-Agent-Assistant\ui\desktop
pnpm run make
```
Artifacts → `ui/desktop/out/make/squirrel.windows/x64/`:
- **`SOHA-1.38.0 Setup.exe`** — the installer (distribute this single file; double-click to install).
- `SOHA-1.38.0-full.nupkg` + `RELEASES` — the auto-update artifacts.

**Portable alternative** (no install, if the installer pipeline ever breaks): manually assemble —
copy `ui/node_modules/electron/dist/*` to a folder, rename `electron.exe`→`SOHA.exe`, put
`package.json` + `.vite/` into `resources/app/`, and copy `src/bin`,`src/images`,`src/recipes`
into `resources/`. The main process bundles all JS deps, so no `node_modules` is needed. (A built
portable zip already exists at `ui/desktop/out/SOHA-win32-x64.zip`.)

---

## 7. Code signing (the "Run anyway" warning)

Unsigned → Windows SmartScreen shows "Run anyway". To remove it you need a trusted cert (paid):
- **Microsoft/Azure Trusted Signing** (~$10/mo) — cloud signing, SmartScreen-trusted. Best value.
- **Certum Open Source Code Signing** (~$30/yr) — cheap, for individual OSS devs (reputation builds over time).
- **SignPath Foundation** — free signing for qualifying OSS projects.
- EV cert (~$300-600/yr) — instant SmartScreen pass, needs HW token + usually a registered business.
Self-signed does NOT help SmartScreen. `forge.config.ts` already has placeholders
(`WINDOWS_CERTIFICATE_FILE` etc.); wire the chosen method into the maker/packager when a cert exists.

---

## 8. RELEASE process (enables auto-update)

Auto-update reads GitHub Releases of `zakeri-dev/soha-agent`. To publish a release:

1. **Rename the GitHub repo** `goose` → `soha-agent` (GitHub → repo Settings → Repository name).
   Then point local origin at it: `git remote set-url origin https://github.com/zakeri-dev/soha-agent.git`
2. **Authenticate gh once** (interactive, user only): `gh auth login` (GitHub.com → HTTPS → browser/device code).
3. **Create the release** and upload the 3 artifacts (versioned tag must match the app version):
```powershell
cd F:\Git\Soha-Agent-Assistant
$dir = "ui\desktop\out\make\squirrel.windows\x64"
gh release create v1.38.0 `
  "$dir\SOHA-1.38.0 Setup.exe" `
  "$dir\SOHA-1.38.0-full.nupkg" `
  "$dir\RELEASES" `
  --repo zakeri-dev/soha-agent --title "SOHA 1.38.0" --notes "اولین انتشار SOHA"
```
electron-updater then auto-updates installed apps when a newer release is published.
**Bumping versions:** update `version` in `ui/desktop/package.json`, rebuild the installer (§6),
create a new release with the new tag + artifacts.

---

## 9. Where things live (quick map)

| What | Path |
|---|---|
| App identity / makers / installer config | `ui/desktop/forge.config.ts` |
| Build-time GITHUB_OWNER/REPO/BUNDLE defaults | `ui/desktop/vite.main.config.mts` |
| Auto-update repo defaults | `ui/desktop/src/utils/autoUpdater.ts`, `src/utils/githubUpdater.ts` |
| Window icon / native menu / recipe-path env | `ui/desktop/src/main.ts` |
| In-app logo component | `ui/desktop/src/components/icons/Goose.tsx` (renders `soha-mark.png`) |
| Chat watermark (typo logo) | `ui/desktop/src/components/BaseChat.tsx` |
| Icons / logos | `ui/desktop/src/images/` (`icon.{png,ico,icns}`, `soha-mark.png`, `soha-typo.png`) |
| System prompt identity | `crates/goose/src/prompts/system.md` |
| Telemetry kill switch | `crates/goose/src/posthog.rs` |
| Persian locale | `ui/desktop/src/i18n/messages/fa.json` + `i18n/index.ts` |
| Bundled MCP servers | `ui/desktop/src/components/settings/extensions/bundled-extensions.json` (+ `.ts`) |
| Bundled recipes | `ui/desktop/src/recipes/{article-writer,summarizer}.yaml` |
| Branding details doc | `SOHA_BRANDING.md` |

Note: the `goose://` deeplink protocol and internal identifiers (`goosed`, `GooseApp`,
`GOOSE_*` config keys) are intentionally left as-is — they're internal, not user-facing brand.
