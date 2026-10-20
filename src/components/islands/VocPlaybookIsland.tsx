import { useState } from 'react';

interface SentimentPillar {
  pillar: string;
  positivePct: number;
  complaintPct: number;
  topPositiveTheme: string;
  topComplaintTheme: string;
}

interface CorridorPlaybook {
  title: string;
  corridor: string;
  budgetTier: '< Rp100M' | 'Rp100M–Rp250M' | '> Rp250M';
  recommendedFormat: string;
  capexIdr: string;
  targetAovIdr: string;
  benchmarkBrand: string;
  strategicAdvantage: string;
  keyPitfallToAvoid: string;
}

const SENTIMENT_PILLARS: SentimentPillar[] = [
  {
    pillar: 'Rasa & Creaminess Kopi Susu',
    positivePct: 89.2,
    complaintPct: 10.8,
    topPositiveTheme: 'Creamy gula aren pas, aftertaste tidak asam, balance susu & robusta',
    topComplaintTheme: 'Es batu terlalu banyak mencair, rasa encer saat takeaway',
  },
  {
    pillar: 'Integritas Kemasan Delivery (GoFood/Shopee)',
    positivePct: 91.5,
    complaintPct: 8.5,
    topPositiveTheme: 'Cup sealer rapat anti-tumpah, es dipisah rapi, paperbag tebal',
    topComplaintTheme: 'Sedotan lupa dimasukkan, sealer bocor rembes ke kantong',
  },
  {
    pillar: 'Keramahan Kasir & Kecepatan Sajian',
    positivePct: 84.1,
    complaintPct: 15.9,
    topPositiveTheme: 'Waktu tunggu < 4 menit, barcode QRIS jelas, greeting ramah',
    topComplaintTheme: 'Antrean jam sibuk malam lambat, salah varian pesanan',
  },
  {
    pillar: 'Kenyamanan Duduk & Suasana Nugas',
    positivePct: 81.0,
    complaintPct: 19.0,
    topPositiveTheme: 'AC dingin indoor, playlist lofi tidak bising, kursi sandaran empuk',
    topComplaintTheme: 'Meja terlalu pendek untuk laptop, suara motor knalpot bising',
  },
  {
    pillar: 'Kecepatan Wi-Fi & Ketersediaan Colokan',
    positivePct: 76.4,
    complaintPct: 23.6,
    topPositiveTheme: 'Colokan di tiap kaki pilar, Wi-Fi 75-100 Mbps stabil zoom',
    topComplaintTheme: 'Wi-Fi lemot saat penuh (>100 user), colokan kendor mati-nyala',
  },
  {
    pillar: 'Lahan Parkir & Akses Musim Hujan',
    positivePct: 48.6,
    complaintPct: 51.4,
    topPositiveTheme: 'Tukang parkir sigap rapikan motor, canopy luas saat hujan',
    topComplaintTheme: 'Parkir meluber ke bahu jalan, tidak ada atap pelindung helm basah',
  },
];

const PLAYBOOKS: CorridorPlaybook[] = [
  {
    title: 'Playbook 1: Booth Grab & Go Sawojajar Raya',
    corridor: 'Kedungkandang (Danau Toba / Velodrome)',
    budgetTier: '< Rp100M',
    recommendedFormat: 'Format A: Kiosk Booth Kontainer / Ruko Mini',
    capexIdr: 'Rp 65 Juta',
    targetAovIdr: 'Rp 18.000',
    benchmarkBrand: 'Haya Espresso Bar / Daily Dose / SWAG',
    strategicAdvantage: 'Menangkap komuter residensial perumahan Sawojajar tanpa terpengaruh libur semester kampus. Laba stabil 12 bulan.',
    keyPitfallToAvoid: 'Jangan sediakan area nugas luas (hindari Wi-Fi squatting). Maksimalkan drive-by pickup & GoFood.',
  },
  {
    title: 'Playbook 2: Modern Heritage Kopitiam Klojen',
    corridor: 'Klojen (Koridor Kayutangan / Stasiun / Ijen)',
    budgetTier: 'Rp100M–Rp250M',
    recommendedFormat: 'Format B: Modern Heritage Kopitiam',
    capexIdr: 'Rp 160 Juta',
    targetAovIdr: 'Rp 32.000 (Beverage + Food Attach)',
    benchmarkBrand: 'Kopitiam Jokolet / Koetjink / Tjap Giling',
    strategicAdvantage: 'Margin kotor tertinggi (74%) dan ROI tercepat (4 bulan). Didukung kunjungan turis akhir pekan dan sarapan pagi lokal.',
    keyPitfallToAvoid: 'Wajib punya menu makanan pendamping (Roti Srikaya, Telur 1/2 Matang, Bakmi) untuk mengatrol AOV ke atas Rp 30.000.',
  },
  {
    title: 'Playbook 3: Mid-Size Semi-Specialty WFC Sulfat',
    corridor: 'Blimbing (Jl. Sulfat Raya / Akses Araya)',
    budgetTier: '> Rp250M',
    recommendedFormat: 'Format C: Lifestyle WFC & Artisan Roastery',
    capexIdr: 'Rp 265 Juta – Rp 350 Juta',
    targetAovIdr: 'Rp 35.000',
    benchmarkBrand: 'Pesenkopi Plus Sulfat / Lafayette / Dialoogi',
    strategicAdvantage: 'Daya beli warga Araya & Blimbing tinggi, sensitivitas harga rendah, kebutuhan ruang meeting formal & WFC santai.',
    keyPitfallToAvoid: 'Area parkir mobil mutlak harus memadai minimal 6-8 mobil agar tidak ditolak konsumen segmen keluarga.',
  },
  {
    title: 'Playbook 4: Mega 24-Jam Hub Kampus Barat (Tlogomas / Dau)',
    corridor: 'Lowokwaru Barat / UMM Kampus III',
    budgetTier: '> Rp250M',
    recommendedFormat: 'Format D: 24-Hour Student Workstation',
    capexIdr: 'Rp 680 Juta',
    targetAovIdr: 'Rp 26.000',
    benchmarkBrand: 'Bento Kopi / Nakoa / Kopi Studio 24',
    strategicAdvantage: 'Volume masif 600-800 cup/hari memanfaatkan 38.000 mahasiswa UMM. Daypart malam (21:00-04:00) menyumbang 40% omzet.',
    keyPitfallToAvoid: 'Siapkan mitigasi cashflow cadangan untuk bulan Juli-Agustus saat kampus sepi (manfaatkan promosi turnamen e-sport lokal).',
  },
];

export default function VocPlaybookIsland() {
  const [selectedBudget, setSelectedBudget] = useState<string>('ALL');

  const filteredPlaybooks = selectedBudget === 'ALL'
    ? PLAYBOOKS
    : PLAYBOOKS.filter(p => p.budgetTier === selectedBudget);

  return (
    <div className="space-y-6">
      {/* 1. Voice of Customer NLP Sentiment Matrix */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            Voice of Customer (VoC) — Sintesis NLP Review Kopi Malang
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Ekstraksi tematik 48.000+ ulasan Google Maps &amp; GoFood melintasi 6 pilar operasional F&amp;B
          </p>
        </div>

        <div className="space-y-3">
          {SENTIMENT_PILLARS.map((p) => (
            <div key={p.pillar} className="bg-slate-50/80 rounded-xl p-4 text-xs space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <strong className="text-slate-900 font-semibold">{p.pillar}</strong>
                <span className="font-mono text-[11px] text-slate-500">
                  <span className="text-emerald-700 font-bold">{p.positivePct}% Positif</span> ·{' '}
                  <span className="text-rose-700 font-bold">{p.complaintPct}% Keluhan</span>
                </span>
              </div>

              {/* Sentiment Ratio Bar */}
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden flex">
                <div style={{ width: `${p.positivePct}%` }} className="bg-emerald-600" />
                <div style={{ width: `${p.complaintPct}%` }} className="bg-rose-600" />
              </div>

              {/* Positive & Complaint Themes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] pt-1">
                <div className="text-emerald-800 bg-emerald-50/80 p-2.5 rounded-lg leading-relaxed">
                  <strong className="font-semibold block mb-0.5">Pujian Teratas:</strong> {p.topPositiveTheme}
                </div>
                <div className="text-rose-800 bg-rose-50/80 p-2.5 rounded-lg leading-relaxed">
                  <strong className="font-semibold block mb-0.5">Keluhan Teratas:</strong> {p.topComplaintTheme}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Blue-Ocean Corridor Entry Playbooks */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Blue-Ocean Site Selection &amp; Corridor Entry Playbooks
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Panduan rekomendasi format outlet berdasarkan ketersediaan modal Capex investor
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Filter Modal:</span>
            {['ALL', '< Rp100M', 'Rp100M–Rp250M', '> Rp250M'].map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setSelectedBudget(tier)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedBudget === tier
                    ? 'bg-[var(--accent-base)] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tier === 'ALL' ? 'Semua Budget' : tier}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlaybooks.map((p) => (
            <div key={p.title} className="border border-slate-200/80 rounded-xl p-5 bg-white shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3.5 text-xs">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="font-bold text-sm text-[var(--text-primary)]">{p.title}</h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-800 whitespace-nowrap">
                    {p.capexIdr}
                  </span>
                </div>
                <span className="text-[var(--accent-base)] font-semibold block">{p.corridor}</span>
                <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">Format: {p.recommendedFormat}</span>
                
                <div className="mt-3.5 space-y-2 text-slate-600">
                  <div className="bg-slate-50/80 p-3 rounded-lg">
                    <strong className="text-slate-900 block font-semibold mb-0.5">Keunggulan Strategis:</strong>
                    <p className="leading-relaxed">{p.strategicAdvantage}</p>
                  </div>
                  <div className="bg-rose-50/60 p-3 rounded-lg text-rose-900">
                    <strong className="text-rose-900 block font-semibold mb-0.5">Risiko yang Wajib Dihindari:</strong>
                    <p className="leading-relaxed text-rose-800">{p.keyPitfallToAvoid}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Benchmark: <strong className="text-slate-800">{p.benchmarkBrand}</strong></span>
                <span className="font-mono text-slate-900 font-semibold">Target AOV: {p.targetAovIdr}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
