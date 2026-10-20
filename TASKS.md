# Tasks: Malang Coffee Shop & Kopi Susu Market Intelligence Dashboard

## Rules for the AI
- One task per request. Task state lives in `STATUS.md` and `.delivery/`, not checkboxes.
- Change only `Allowed Paths`. Need something outside them → stop and ask.
- Respect `AGENTS.md`: YAGNI, native-first, no unrequested abstractions.
- 1 task ≈ 1 commit that passes its own check.

## Pending

### TASK-001: Initialize Astro, TypeScript strict, Tailwind CSS, and seed research corpus
- **Requirement:** REQ-001
- **Risk Level:** R2 — foundational project & build pipeline setup.
- **Allowed Paths:** `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/data/malang_coffee_master_93_brands.json`, `src/data/malang_osm_157_named_pois.json`, `src/data/malang_universities_9_anchors.json`, `src/data/malang_analytics_results.json`
- **Canonical Contract Owners:** `data.seedCorpus`, `build.astroConfig`
- **Accepted Invariants:** Canonical numbers from `~/Documents/work/research/malang-coffee-data/` (`93` brands, `176` outlets, `25,570` Kopi Susu cups/day, `157` OSM POIs, `R² = 0.7407`) remain 100% unmodified during seeding.
- **Depends On:** None
- **Verification:** Done when `npm install` and `npx astro check` succeed and a JSON integrity check confirms 93 brand records, 157 OSM POI records, 9 university anchors, and OLS/Monte Carlo objects exist in `src/data/`.
- **Reopen Conditions:** Any record count or aggregate cup sum diverges from `malang_analytics_results.json`.
- **Non-Scope:** UI components, pages, client islands.
- **Escalation Conditions:** A required dependency introduces a security vulnerability or conflicts with Astro static build mode.

### TASK-002: Implement Astro Content Layer schemas and build-time bounds validation
- **Requirement:** REQ-002 (constraints: REQ-001)
- **Risk Level:** R2 — schema contract & build-time trust boundary.
- **Allowed Paths:** `src/content.config.ts`, `src/lib/types/coffee-intelligence.ts`, `tests/schema.test.ts`, `vitest.config.ts`
- **Canonical Contract Owners:** `schema.coffeeBrand`, `schema.osmPoi`, `schema.analyticsResults`
- **Accepted Invariants:** Every brand record enforces `gmaps_rating` in `1.0..5.0`, positive cup counts, valid WGS84 Malang coordinates, and non-empty `kecamatan`/`category_tier`.
- **Depends On:** TASK-001
- **Verification:** Done when `npx vitest run tests/schema.test.ts` passes both positive validation (all 93 brands + 157 POIs pass) and negative validation (injecting a negative cup count or invalid rating throws a descriptive Zod path error).
- **Reopen Conditions:** Schema allows `any` or fails to reject out-of-range coordinates or negative numeric fields.
- **Non-Scope:** UI rendering or client-side calculators.
- **Escalation Conditions:** Upstream dataset schema requires adding or removing canonical columns.

### TASK-003: Build analytical layout shell, Okabe-Ito tokens, tabular-nums, and URL state store
- **Requirement:** REQ-012
- **Risk Level:** R1 — shared design tokens, accessible shell, and URL state synchronization.
- **Allowed Paths:** `src/styles/global.css`, `src/lib/formatters.ts`, `src/lib/stores/dashboardStore.ts`, `src/components/layout/AppShell.astro`, `src/components/layout/KpiCard.astro`, `src/components/layout/MindmapModal.astro`
- **Canonical Contract Owners:** `ui.designTokens`, `ui.appShell`, `state.dashboardStore`
- **Accepted Invariants:** All 8 Okabe-Ito `--chart-1`..`--chart-8` tokens are defined; `.num-tabular` enforces `font-variant-numeric: tabular-nums`; IDR currency uses `Intl.NumberFormat('id-ID')`; invalid URL query params clamp safely to defaults.
- **Visual Contract:** 12-column analytical shell with sidebar navigation, `Asia/Jakarta (WIB)` dataset freshness badge, interactive Mindmap modal, and WCAG AA (`>= 4.5:1`) contrast across desktop (`1440px`) and mobile (`375px`).
- **Depends On:** TASK-002
- **Verification:** Done when `npx astro check` passes, `formatters.ts` formats IDR/percentages deterministically, and opening a URL with query parameters (`?kecamatan=Kedungkandang+%28Sawojajar%29&is24h=false`) hydrates `dashboardStore` and restores the exact filter state.
- **Reopen Conditions:** Numeric values render without `tabular-nums` or unvalidated query parameters cause client runtime exceptions.
- **Non-Scope:** Feature-specific charts or simulators.
- **Escalation Conditions:** New global state requirements exceed URL + Nanostores capacity.

### TASK-004: Build Executive Macro Overview page (`/`) with Kecamatan, Tier charts, and Mindmap
- **Requirement:** REQ-003 (constraints: REQ-012)
- **Risk Level:** R1 — primary landing dashboard and macro charts.
- **Allowed Paths:** `src/pages/index.astro`, `src/components/islands/MacroChartsIsland.tsx`
- **Canonical Contract Owners:** `page.executiveOverview`
- **Accepted Invariants:** Displays verified macro KPIs (`39,728` sample cups/day, `25,570` Kopi Susu cups/day, `72,600` city-wide TAM cups/day, `Rp495B–Rp540B` annual GMV, `R² = 74.1%`, `418.9%` top archetype ROI), max 4 KPI cards per row, and interactive Kecamatan & Tier charts.
- **Visual Contract:** Executive Overview (`/`) renders 4-card KPI strip, 8-col Kecamatan volume/saturation chart + 4-col Category Tier distribution chart, and the interactive 6-pillar Product/Market Mindmap with zero horizontal overflow at `1440px` and `375px`.
- **Depends On:** TASK-003
- **Verification:** Done when `npm run build` succeeds and rendering `/` in a headless browser confirms all 6 macro metrics, Kecamatan bars (including `Lowokwaru`, `Klojen`, `Kedungkandang (Sawojajar)`, `Blimbing`, `Sukun`), Category Tier breakdown, and Mindmap tree are visible with zero console errors.
- **Reopen Conditions:** Initial JS payload on `/` exceeds `130KB` gzipped or KPI numbers deviate from `malang_analytics_results.json`.
- **Non-Scope:** 93-brand data grid, Leaflet map, financial simulators.
- **Escalation Conditions:** Chart library bundle size exceeds the `130KB` gzipped budget.

### TASK-005: Build 93-Brand TanStack Table v8 Explorer with instant multi-faceted filtering
- **Requirement:** REQ-004 (constraints: REQ-012)
- **Risk Level:** R2 — interactive data grid over 93 brands x 36 columns.
- **Allowed Paths:** `src/pages/explorer.astro`, `src/components/islands/BrandExplorerTable.tsx`
- **Canonical Contract Owners:** `page.explorer`, `ui.brandExplorerTable`
- **Accepted Invariants:** All 93 brands (including *Haya Espresso Bar*, *Easy Breezy Coffee*, *SWAG Coffee*, *Uma Coffee & Space*, *Daily Dose*, *Pesenkopi Plus*, *Jokolet*, *Lafayette*) are searchable and filterable by `kecamatan`, `category_tier`, `is_24h`, and price range in `< 100ms`.
- **Visual Contract:** Sticky filter bar, 4-card dynamic filtered subtotal strip, right-aligned `tabular-nums` metric columns, RevPASH status badge, column visibility toggle, and slide-over 36-attribute brand detail drawer.
- **Depends On:** TASK-003
- **Verification:** Done when filtering `kecamatan = "Kedungkandang (Sawojajar)"` or searching `"Haya"` on `/explorer` narrows the table to matching rows, updates the filtered Kopi Susu cup subtotal, and syncs with `URLSearchParams` with zero console errors.
- **Reopen Conditions:** Filtering lags beyond `100ms` or table overflows layout viewport without scroll containment.
- **Non-Scope:** 4-brand side-by-side comparison drawer, CSV/JSON file download, Leaflet map.
- **Escalation Conditions:** Table virtualization is needed for datasets > 1,000 rows.

### TASK-006: Add 4-Brand Side-by-Side Comparison Drawer and Filtered CSV/JSON Export
- **Requirement:** REQ-005 (constraints: REQ-004, REQ-012)
- **Risk Level:** R1 — comparison matrix and client-side data export.
- **Allowed Paths:** `src/components/islands/BrandCompareDrawer.tsx`, `src/components/islands/BrandExplorerTable.tsx`, `src/lib/exporters.ts`
- **Canonical Contract Owners:** `ui.brandCompareDrawer`, `lib.exporters`
- **Accepted Invariants:** Users can pin `1..4` brands; unchecked checkboxes disable at `4` selected; CSV/JSON export serializes the exact active filtered rows with valid UTF-8 headers.
- **Visual Contract:** Side-by-side comparison drawer benchmarking price, daily Kopi Susu velocity, RevPASH, Google Maps rating/reviews, GoFood markup %, and campus gravity across up to 4 selected brands.
- **Depends On:** TASK-005
- **Verification:** Done when selecting *Haya Espresso Bar*, *Easy Breezy Coffee*, and *Pesenkopi Plus* opens the comparison drawer with all comparative metrics aligned in `tabular-nums`, and clicking "Export CSV" generates a valid 36-column CSV matching the active filter.
- **Reopen Conditions:** Exported CSV drops quotes on comma-containing strings or allows > 4 brands to break drawer layout.
- **Non-Scope:** Geospatial map rendering.
- **Escalation Conditions:** Server-side PDF export is requested.

### TASK-007: Build Interactive Leaflet Geospatial Map with 93 Brands, 157 OSM POIs, and 9 University Gravity Rings
- **Requirement:** REQ-006 (constraints: REQ-001, REQ-012)
- **Risk Level:** R2 — client-only geospatial canvas and Haversine buffer math.
- **Allowed Paths:** `src/lib/engines/geo-haversine.ts`, `src/components/islands/MalangGeoMap.tsx`, `src/pages/explorer.astro`
- **Canonical Contract Owners:** `ui.malangGeoMap`, `engine.geoHaversine`
- **Accepted Invariants:** Hydrates via `client:only="react"` inside a reserved `min-h-[520px]` container (`CLS < 0.02`); plots all 93 brands colored by Category Tier (`--chart-1`..`--chart-6`), toggles 157 OSM POIs, and renders 500m & 1,000m Haversine circles around all 9 Malang universities.
- **Visual Contract:** Interactive map panel on `/explorer` with layer toggles (`93 Commercial Brands`, `157 OSM Cafe POIs`, `9 Campus Gravity Rings 500m/1km`), colorblind-safe legend, and rich brand telemetry popup on marker click.
- **Depends On:** TASK-005
- **Verification:** Done when `npm run build` succeeds without `window is not defined` SSR errors, and opening `/explorer` renders the map markers, 9 university rings, and displays *Haya Espresso Bar*'s popup (`-7.9752, 112.6608`, `185 Kopi Susu/day`, `Sawojajar`) when clicked.
- **Reopen Conditions:** Map causes SSR crash during `astro build` or fails to filter markers when `dashboardStore` Kecamatan filter changes.
- **Non-Scope:** Paid Mapbox tiles or live GPS routing.
- **Escalation Conditions:** Tile provider rate-limits public requests.

### TASK-008: Implement OLS Econometric Demand & RevPASH Lab (`/analytics`)
- **Requirement:** REQ-007 (constraints: REQ-012)
- **Risk Level:** R2 — econometric formula accuracy and waterfall attribution UI.
- **Allowed Paths:** `src/lib/engines/ols-demand.ts`, `src/components/islands/EconometricLabIsland.tsx`, `src/pages/analytics.astro`, `tests/engines.test.ts`
- **Canonical Contract Owners:** `engine.olsDemand`, `page.analytics`
- **Accepted Invariants:** Implements exact OLS coefficients (`Intercept: -238.767`, `Seats: +0.331`, `Is24H: +56.703`, `Price/1k: -2.889`, `ln(Reviews): +63.250`, `Gravity/100: +16.599`), computes `RevPASH = DailyRev / (Seats * Hours)`, and triggers `"Wi-Fi Squatting Risk"` below `Rp2,500/seat-hr`.
- **Visual Contract:** Split `/analytics` view with interactive sliders, brand presets (*Haya Espresso Bar*, *Pesenkopi Plus*, *Jokolet*, *Nakoa*), factor attribution waterfall chart, and live RevPASH diagnostic gauge.
- **Depends On:** TASK-003
- **Verification:** Done when `npx vitest run tests/engines.test.ts` verifies the OLS formula and RevPASH thresholds against `malang_analytics_results.json`, and selecting the *Haya Espresso Bar* preset on `/analytics` renders the waterfall chart and RevPASH readout accurately.
- **Reopen Conditions:** OLS output drifts from `run_malang_coffee_analytics.py` coefficients.
- **Non-Scope:** Monte Carlo P&L simulator.
- **Escalation Conditions:** Refitting regression weights at runtime is requested.

### TASK-009: Implement Interactive BOM COGS Editor & Menu Engineering Quadrant Matrix
- **Requirement:** REQ-008 (constraints: REQ-007, REQ-012)
- **Risk Level:** R1 — beverage BOM unit economics and quadrant classification.
- **Allowed Paths:** `src/lib/engines/menu-engineering.ts`, `src/components/islands/MenuEngineeringIsland.tsx`, `src/pages/analytics.astro`, `tests/engines.test.ts`
- **Canonical Contract Owners:** `engine.menuEngineering`, `ui.menuEngineeringIsland`
- **Accepted Invariants:** Computes exact per-cup COGS and Gross Margin % from adjustable raw material prices (Espresso blend `Rp/kg`, Fresh milk `Rp/L`, Aren sugar `Rp/kg`, Packaging `Rp/cup`) and classifies SKUs into *Stars*, *Plowhorses*, *Puzzles*, and *Dogs*.
- **Visual Contract:** Interactive scatter/quadrant chart and BOM grammage table on `/analytics` with instant margin recalculation and reset button.
- **Depends On:** TASK-008
- **Verification:** Done when `npx vitest run tests/engines.test.ts` passes BOM COGS math assertions and adjusting milk price from `Rp18,500/L` to `Rp22,000/L` on `/analytics` updates per-cup COGS and Gross Margin % in real time.
- **Reopen Conditions:** Gross margin % formula divides by zero or misclassifies quadrant boundaries.
- **Non-Scope:** Store-level Capex or delivery commission math.
- **Escalation Conditions:** Multi-currency supplier pricing is requested.

### TASK-010: Build 12-Month Academic Calendar Monte Carlo P&L & GoFood Margin Simulator (`/simulator`)
- **Requirement:** REQ-009 (constraints: REQ-010, REQ-012)
- **Risk Level:** R2 — financial cashflow modeling, academic seasonality, and Capex payback math.
- **Allowed Paths:** `src/lib/engines/monte-carlo-pnl.ts`, `src/components/islands/FinancialSimIsland.tsx`, `src/pages/simulator.astro`, `tests/engines.test.ts`
- **Canonical Contract Owners:** `engine.monteCarloPnl`, `page.simulator`
- **Accepted Invariants:** Reproduces the 4 verified store archetypes (**Format A Rp65M**, **Format B Rp160M**, **Format C Rp265M**, **Format D Rp680M**), applies the 12-month Malang academic seasonality curve (`Jul–Aug` and `Jan–Feb` student exodus vs `Sawojajar/Sulfat` commuter dampening), and outputs P10/P50/P90 net profit, ROI %, and payback month.
- **Visual Contract:** Archetype selector tabs, interactive Capex/Rent/Velocity sliders, 12-month seasonal EBITDA + cumulative payback chart, and P10/P50/P90 comparison table on `/simulator`.
- **Depends On:** TASK-003
- **Verification:** Done when `npx vitest run tests/engines.test.ts` confirms Format B default outputs (`P50 Net Profit ~Rp670.17M`, `ROI 418.9%`, `4-month payback`) and toggling between Campus Cluster and Neighborhood Commuter (`Sawojajar`) visibly dampens the July–August holiday dip on `/simulator`.
- **Reopen Conditions:** Cumulative cashflow payback month calculation is off or ignores fixed Opex during holiday slump months.
- **Non-Scope:** Live bank/accounting API integration.
- **Escalation Conditions:** Custom tax/depreciation schedules are requested.

### TASK-011: Build Delivery Aggregator (GoFood / ShopeeFood / GrabFood) Markup & Margin Calculator
- **Requirement:** REQ-010 (constraints: REQ-009, REQ-012)
- **Risk Level:** R1 — delivery commission & promo co-pay unit economics.
- **Allowed Paths:** `src/lib/engines/delivery-margin.ts`, `src/components/islands/DeliveryMarginIsland.tsx`, `src/pages/simulator.astro`, `tests/engines.test.ts`
- **Canonical Contract Owners:** `engine.deliveryMargin`, `ui.deliveryMarginIsland`
- **Accepted Invariants:** Accurately models `20% + Rp1,000` platform commission, campaign co-pay subsidy, and packaging seal cost (`Rp800`), calculates Net Merchant Payout & Net Contribution Margin, and computes the exact recommended markup % to preserve dine-in margin.
- **Visual Contract:** Stacked Rupiah breakdown bar (`COGS + Seal`, `Platform Cut`, `Promo Co-Pay`, `Net Margin`), red margin erosion warning banner when net contribution `< Rp4,000/cup`, and one-click `"Apply Optimal Markup"` button on `/simulator`.
- **Depends On:** TASK-010
- **Verification:** Done when `npx vitest run tests/engines.test.ts` verifies that a `Rp15,000` Kopi Susu (`Rp5,050` COGS+seal) at `25%` markup (`Rp18,750`), `20% + Rp1,000` fee, and `15%` promo co-pay yields `Rp11,188` net payout and `Rp6,138` (`54.9%`) net margin on `/simulator`.
- **Reopen Conditions:** Rounding logic produces invalid Rupiah denominations or miscalculates platform commission base.
- **Non-Scope:** Direct GoBiz / GrabMerchant API integration.
- **Escalation Conditions:** Tiered dynamic delivery distance fees are added.

### TASK-012: Build Voice-of-Customer (VoC) Sentiment & Blue-Ocean Corridor Playbooks (`/insights`) and run full verification gate
- **Requirement:** REQ-011 (constraints: REQ-012)
- **Risk Level:** R1 — NLP review sentiment visualization, corridor recommender, and end-to-end verification.
- **Allowed Paths:** `src/pages/insights.astro`, `src/components/islands/VocPlaybookIsland.tsx`
- **Canonical Contract Owners:** `page.insights`, `ui.vocPlaybookIsland`
- **Accepted Invariants:** Renders the 6-pillar VoC sentiment breakdown across 48,000+ Google Maps/GoFood reviews and filters blue-ocean corridor playbooks (`Sawojajar / Velodrome`, `Unmuh / UMM Campus III`, `Sulfat / Blimbing`, `Kayutangan Heritage`, `Sudimoro 24H`) by investor capital tier (`< Rp100M`, `Rp100M–Rp250M`, `> Rp250M`).
- **Visual Contract:** 6-pillar horizontal sentiment chart + radar comparison and interactive capital-tier playbook cards on `/insights`, verified across desktop (`1440px`) and mobile (`375px`).
- **Depends On:** TASK-004, TASK-007, TASK-009, TASK-011
- **Verification:** Done when `npm test`, `npm run build`, and headless browser inspection across all 5 routes (`/`, `/explorer`, `/analytics`, `/simulator`, `/insights`) pass with `0` console/page errors, `0` schema errors, and verified responsive layout at `1440px` and `375px`.
- **Reopen Conditions:** Any route fails build, throws a hydration warning, or clips content on mobile.
- **Non-Scope:** External live review scraping.
- **Escalation Conditions:** Automated sentiment re-training pipeline is requested.
