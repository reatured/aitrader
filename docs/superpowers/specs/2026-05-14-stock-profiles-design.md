# Stock Profiles — Design

**Date:** 2026-05-14
**Status:** Approved

## Problem

The app holds a single global stock list + simulation config. There is no way to keep
separate sets of stocks (e.g. "Tech Growth" vs "Dividend Income") and switch between them.

## Goals

Let the user create, switch, rename, and delete **profiles**. Each profile owns its own
stock list **and** its own settings (weekly contribution + duration).

Out of scope: cloud sync, sharing/export, per-profile market-data caching.

## Data structure

localStorage today: `sim_symbols` (array) and `sim_config` (`{contribution, duration}`),
both global.

New shape:

```
sim_profiles        → [{ id, name, symbols: string[], config: { contribution, duration } }]
sim_active_profile  → "<id>"
```

- `id` — generated unique string (e.g. `crypto.randomUUID()` or timestamp-based fallback).
- `alphavantage_cache_*` stays **global/shared** — same symbol = same market data.
- **Migration:** on load, if `sim_profiles` is absent, build one profile named `"Default"`
  from the legacy `sim_symbols` + `sim_config` (falling back to `[]` and
  `{contribution: 100, duration: '1Y'}` if those are missing too), set it active, then
  remove the legacy `sim_symbols` / `sim_config` keys.

## Components

### `src/hooks/useProfiles.js` (new)

Owns the data structure. Encapsulates load + migration, persistence to localStorage, and
CRUD. Returns:

- `profiles` — array
- `activeProfile` — the currently selected profile object
- `activeProfileId`, `setActiveProfile(id)`
- `createProfile(name)` — empty `symbols`, default config `{contribution: 100, duration: '1Y'}`; switches to it
- `renameProfile(id, name)`
- `deleteProfile(id)` — no-op if it would remove the last profile; if the deleted profile
  was active, switch to another
- `updateActiveProfile(patch)` — shallow-merge into the active profile (used for
  symbols and config changes)

Persists `profiles` and `activeProfileId` on change via `useEffect`.

### `src/components/ProfileSwitcher.jsx` (new)

Dropdown at the top of the sidebar (above "Add Stock"). Collapsed: shows active profile
name + a one-line meta (`N stocks · $X/wk · <duration>`). Open: lists all profiles
(active highlighted) with inline rename (✎) and delete (🗑) per row, plus a
"+ New profile" action. New / rename use a simple prompt for the name. Last remaining
profile's delete is disabled.

### `src/App.jsx` (modified)

Replace the `symbols` and `globalConfig` `useState` + their persistence `useEffect`s with
`useProfiles()`. Derive `symbols = activeProfile.symbols` and
`globalConfig = activeProfile.config`. Rewire the existing handlers
(`handleAddStock`, `handleRemoveStock`, `handleUpdateConfig`) to go through
`updateActiveProfile`. `marketData` and `stockErrors` stay App-level state and remain
shared across profile switches (keyed by symbol). The fetch `useEffect` already fetches
any symbols not yet in `marketData`, so a profile switch transparently triggers fetches
for that profile's new symbols.

### `src/components/Sidebar.jsx` (modified)

Render `<ProfileSwitcher>` at the top of the sidebar panel. Accepts the profile props
from App.

## Testing

- `npm run build` and `npm run lint` pass.
- Manual (browser): create a second profile, add a different stock set, switch back and
  forth — each profile keeps its own stocks + settings; selection persists across reload.
- Manual: a fresh load with legacy `sim_symbols` / `sim_config` migrates into a "Default"
  profile without data loss or errors.
- Manual: cannot delete the last profile; deleting the active profile switches cleanly.
