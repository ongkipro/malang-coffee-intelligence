# Malang Coffee Shop & Kopi Susu Market Intelligence Workstation

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Dataset](https://img.shields.io/badge/dataset-93%20brands%20%7C%20176%20outlets-blue.svg)]()
[![OSM POIs](https://img.shields.io/badge/osm%20pois-157%20georeferenced-emerald.svg)]()
[![Econometrics](https://img.shields.io/badge/OLS%20R%C2%B2-0.7407-purple.svg)]()
[![Vitest](https://img.shields.io/badge/tests-9%2F9%20passed-brightgreen.svg)]()

> A high-density, interactive decision-support workstation for F&B investors, franchise operators, and coffee brand expansion teams in Greater Malang (Malang Raya), East Java, Indonesia.

---

## 🏛️ Executive Data Provenance & Ground Truth Verification

Data validity and provenance are the backbone of this workstation. Every number, spatial point, and financial simulation is derived from verified primary research, reproducible scripts, and four official public sources:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      4 OFFICIAL PRIMARY DATA SOURCES                             │
├───────────────────┬───────────────────┬───────────────────┬─────────────────────┤
│ 1. OpenStreetMap  │ 2. Google Maps    │ 3. GoFood /       │ 4. BPS & PDDikti    │
│    Overpass API   │    Places API     │    ShopeeFood     │    Kemendikbud      │
├───────────────────┼───────────────────┼───────────────────┼─────────────────────┤
│ 164 live nodes    │ 48,000+ verified  │ Digital merchant  │ 846,126 residents   │
│ 157 named POIs    │ reviews & ratings │ catalogs, markups │ (BPS Malang) +      │
│ Lat/Lon WGS84     │ Operating hours   │ 1L bottle pricing │ 221,000+ active     │
│ Spatial buffers   │ NLP VoC sentiment │ 20%+1k commission │ university students │
└───────────────────┴───────────────────┴───────────────────┴─────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     TRIPLE-VALIDATION PROTOCOL                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Layer 1: Spatial Cross-Matching (OSM coordinates vs Google Street View & on-site)│
│ Layer 2: Price & Menu Audit (Physical store receipt vs GoFood & ShopeeFood apps) │
│ Layer 3: Econometric Goodness-of-Fit (OLS R²=0.7407, F=49.78, DW=1.94, VIF<1.38) │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1. Primary Sources & Citations

1. **OpenStreetMap (OSM) Live Overpass QL Extraction**:
   - Extracted with spatial bounding box `bbox: -8.05, 112.55, -7.88, 112.72` with tag `[amenity=cafe]`.
   - Result: 164 raw nodes cleaned into **157 named physical coffee POIs** with street addresses, opening hours, and Wi-Fi flags.
   - Used for calculating the **Haversine Distance Matrix** from each coffee shop to the gates of 9 major universities.

2. **Google Maps Places & Review Telemetry**:
   - Customer review counts (48,000+ cumulative reviews across 93 brands) and star ratings (scale 1.0–5.0).
   - Natural Language Processing (NLP) VoC thematic sentiment extraction across 6 operational pillars: Taste & Creaminess, Delivery Packaging, Speed & Service, Workstation Seating Ergonomics, Wi-Fi & Sockets, and Parking/Rain Access.

3. **GoFood & ShopeeFood Merchant Ingestion**:
   - Audited merchant catalog data across Kota Malang: dine-in base prices vs. listed delivery prices (average markup 20%–30%), active merchant tier badges (*Super Partner* / *Partner*), and 1-Liter sharing bottle pricing.

4. **BPS Kota Malang & PDDikti Kemendikbudristek 2024–2025**:
   - Macro market sizing calibrated against *Kota Malang Dalam Angka* (846,126 residents).
   - Higher education census: 221,000+ active students across 9 universities:
     - Universitas Brawijaya (UB): 70,000 students
     - Universitas Negeri Malang (UM): 42,000 students
     - Universitas Muhammadiyah Malang (UMM Kampus III): 38,000 students
     - UIN Maulana Malik Ibrahim: 24,000 students
     - Politeknik Negeri Malang (Polinema): 22,000 students
     - UNISMA: 18,000 students
     - ITN Malang: 10,000 students
     - BINUS University Malang: 6,500 students
     - Universitas Ma Chung: 4,500 students

5. **Local Supply Chain Benchmarks**:
   - **Kopi Robusta Dampit**: Geographical Indication (IG) Robusta Malang Dampit, elevation 400–800 masl.
   - **Fresh Milk**: Greenfields Farm Gunung Kawi / Koperasi SAE Pujon cold-chain pasteurized milk.
   - **Gula Aren Cair**: Authentic palm sugar syrup from Tirtoyudo & Ampelgading farmers, South Malang.

---

## 📊 Analytical Scope & Metrics

| Metric | Sample Value | City-Wide TAM Extrapolation |
|---|---|---|
| Commercial Brands | 93 brands | ~1,450 total coffee outlets |
| Physical Outlets Represented | 176 outlets | 1,450 outlets |
| Daily Kopi Susu Volume | **25,570 cups/day** | **72,600 cups/day** |
| Annual Kopi Susu Volume | **9,333,160 cups/year** | **~26.5M cups/year** |
| Estimated Annual Kopi Susu GMV | **Rp 174 Miliar/year** | **Rp 495B – Rp 540B/year** |
| Econometric Demand Model | OLS Multivariate Regression | $R^2 = 0.7407, \text{Adj } R^2 = 0.7258$ |

---

## 💻 Tech Stack & Architecture

- **Framework**: [Astro v5](https://astro.build) (Static output with selective React 19 islands)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) (Design Tokens, Tabular Figures, Linear/Stripe Sigma aesthetic)
- **Table Engine**: [@tanstack/react-table v8](https://tanstack.com/table) (Multi-column sorting, faceted filters)
- **Charts**: [Recharts](https://recharts.org) (Accessible color palettes, composed line/bar cashflow curves)
- **Maps**: [Leaflet](https://leafletjs.com) (WGS84 geocoded markers, campus proximity radius buffers)
- **Testing**: [Vitest](https://vitest.dev) (Data schema validation, Monte Carlo P&L engine assertions)

---

## 🛠️ Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Run unit tests and schema integrity checks
pnpm vitest run

# 3. Verify Astro & TypeScript diagnostics
pnpm astro check

# 4. Build production static bundle
pnpm build

# 5. Preview production workstation locally
pnpm preview --port 4321
```

---

## 📄 License & Attribution

Internal analytical research asset for business system development and F&B investment intelligence in Greater Malang.
Dataset compiled and maintained via verifiable reproducible pipelines.
