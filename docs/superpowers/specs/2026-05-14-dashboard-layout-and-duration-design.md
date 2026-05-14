# Dashboard Layout Fix + Duration Selector — Design

**Date:** 2026-05-14
**Status:** Approved

## Problem

1. **Desktop layout is broken.** The sidebar renders `lg:static` (occupying space in the
   flex row) *and* `<main>` adds `lg:ml-72 xl:ml-80` (a matching left margin). The content
   is offset twice — pushed ~288–320px past where it should sit — so it is squished and
   overflows horizontally.
2. **Only a 1-year window is supported.** The simulation is driven by a free-form
   "Start Date" picker that defaults to one year ago. There is no quick way to view other
   time horizons.

## Goals

- Fix the desktop layout with a clean sidebar + content split.
- Replace the Start Date picker with a duration selector (preset windows).
- Light visual polish — keep the existing light theme and blue accent.

Out of scope: dark mode, new color language, end-date / arbitrary-window simulation,
changes to the data-fetch layer or API.

## Design

### 1. Desktop layout fix

Keep the sidebar `lg:static` inside the flex row and **remove `lg:ml-72 xl:ml-80` from
`<main>`** in `App.jsx`. The flex row then handles the offset once. Mobile behavior
(fixed overlay sidebar + toggle + backdrop) is unchanged. Touches `App.jsx`; `Sidebar.jsx`
only if the static/fixed classes need a matching tweak.

### 2. Duration selector

- **Presets:** `1M`, `3M`, `6M`, `1Y`, `3Y`, `5Y`, `Max`.
- **Location:** a chip/pill row in the **Portfolio Performance card header**
  (`PortfolioChart.jsx`), right-aligned next to the title. Active chip = solid blue fill;
  inactive = subtle outline.
- **State:** `globalConfig.startDate` is replaced by `globalConfig.duration` (string, e.g.
  `'1Y'`), persisted to localStorage.
- **Migration:** when reading saved config, normalize to
  `{ contribution: saved.contribution ?? 100, duration: saved.duration ?? '1Y' }`.
  Any legacy `startDate` field is dropped.
- **Derivation:** the effective start date is computed from `duration` inside the
  `results` useMemo in `App.jsx`:
  - `1M/3M/6M` → `subMonths(now, n)`
  - `1Y/3Y/5Y` → `subYears(now, n)`
  - `Max` → an epoch-early date (e.g. `'1900-01-01'`) so all available history is included.
- **No re-fetch:** `TIME_SERIES_WEEKLY_ADJUSTED` already returns 20+ years of data;
  `calculateReturns` simply filters from a different start date. The `App.jsx` fetch
  `useEffect` dependency on `globalConfig.startDate` is updated to `globalConfig.duration`.
- **Sidebar:** the "Simulation Settings" section keeps only **Weekly Investment**; the
  date `<input>` is removed.
- **Empty state:** the chart (and therefore the selector) only renders once there is at
  least one holding — unchanged. `duration` still persists meanwhile.

### 3. Visual polish (light theme + blue accent retained)

- Unify the card elevation/border treatment across `StatsCard`, `StockCard`, and
  `PortfolioChart` into one consistent style.
- Consistent section spacing; add a clear page header row in the main content area.
- Duration chips styled per the mockup (blue fill active / outline inactive).
- Keep the mobile compact header's Value/Return figures in sync.

## Files affected

- `src/App.jsx` — layout fix, `globalConfig` shape + migration, duration→startDate
  derivation, fetch `useEffect` deps.
- `src/components/PortfolioChart.jsx` — duration chip row in the card header.
- `src/components/Sidebar.jsx` — remove Start Date input; layout class tweak if needed.
- `src/components/StatsCard.jsx`, `src/components/StockCard.jsx` — card style unification.

## Testing

- `npm run build` and `npm run lint` pass.
- Manual: desktop view no longer squished; sidebar + content aligned at `lg`/`xl`.
- Manual: switching duration chips updates stats, chart, and holdings without a re-fetch;
  selection persists across reload; legacy localStorage configs load without error.
