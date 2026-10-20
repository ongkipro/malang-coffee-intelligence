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
  {
    title: 'Playbook 5: Cloud Beverage Hub Lowokwaru (Pure Delivery)',
    corridor: 'Lowokwaru (Akses Sigura-gura / Bendungan)',
    budgetTier: '< Rp100M',
    recommendedFormat: 'Format E: Multi-Brand Ghost Beverage Kitchen',
    capexIdr: 'Rp 50 Juta – Rp 75 Juta',
    targetAovIdr: 'Rp 42.000 (Delivery Basket)',
    benchmarkBrand: 'Tomoro Express / Fore Cloud / Kopi Se-Indonesia Delivery',
    strategicAdvantage: 'Tanpa sewa ruko mahal pinggir jalan raya (cukup ruko gang akses motor ojol), tanpa beban AC/listrik tamu nugas, 100% fokus kecepatan racik < 90 detik.',
    keyPitfallToAvoid: 'Wajib menguasai bundling paket 1 Liter dan multi-cup agar komisi GoFood 20% + Rp 1.000 tidak menggerus margin bersih.',
  },
];

interface ConsumerPersona {
  id: string;
  name: string;
  sharePct: number;
  aovRange: string;
  dwellTime: string;
  peakHours: string;
  mustHaves: string[];
  dealbreakers: string[];
  representativeReview: string;
  recommendedAction: string;
}

const CONSUMER_PERSONAS: ConsumerPersona[] = [
  {
    id: 'student',
    name: 'Mahasiswa Nugas & Skripsi',
    sharePct: 52,
    aovRange: 'Rp 18.000 – Rp 25.000',
    dwellTime: '2.5 – 5.0 Jam',
    peakHours: '14:00 – 17:30 & 20:00 – 02:00',
    mustHaves: [
      'Wi-Fi stabil > 50 Mbps (ping rendah untuk Zoom/Google Meet)',
      'Stopkontak colokan di tiap kaki meja/pilar',
      'Meja ergonomis tinggi (bukan meja pendek model lounge)',
      'Toleransi barista terhadap waktu duduk yang lama',
    ],
    dealbreakers: [
      'Wi-Fi disconnecting mendadak saat submit tugas kuliah',
      'Kursi kayu tanpa sandaran yang membuat pegal punggung',
      'Musik kafe terlalu keras/bising (EDM) yang mengganggu konsentrasi',
    ],
    representativeReview:
      '"Kopi susunya pas gak bikin lambung perih, colokannya melimpah di setiap pilar. Betah banget ngerjain tugas akhir 4 jam di sini tanpa merasa diusir barista."',
    recommendedAction:
      'Sediakan voucher perpanjangan Wi-Fi 3 jam tiap pembelian cup kedua atau cemilan pendamping untuk monetisasi dwell time.',
  },
  {
    id: 'commuter',
    name: 'Komuter Residensial & Pekerja',
    sharePct: 24,
    aovRange: 'Rp 22.000 – Rp 35.000',
    dwellTime: '5 – 15 Menit (Takeaway / Drive-by)',
    peakHours: '06:30 – 09:30 & 16:30 – 18:30',
    mustHaves: [
      'Waktu saji cepat (< 3 menit dari order ke cup)',
      'Kemasan anti-bocor (cup sealer rapat + cup holder motor)',
      'Akses parkir motor/mobil praktis tanpa ribet parkir liar',
      'Jam buka pagi (mulai 06:30 atau 07:00 pagi)',
    ],
    dealbreakers: [
      'Antrean lambat karena kasir melayani pesanan delivery online bersamaan',
      'Buka siang jam 10:00 (kehilangan jam kopi pagi orang berangkat kerja)',
      'Es batu mencair cepat sebelum sampai di meja kantor',
    ],
    representativeReview:
      '"Langganan tiap pagi sebelum masuk kantor via Jl. Danau Toba Sawojajar. Parkir gampang, tinggal tap QRIS langsung siap dalam 2 menit. Rasa kopi tetep bold."',
    recommendedAction:
      'Pasang fitur Pick-Up via WhatsApp / Web POS agar pesanan sudah siap ambil saat komuter menepi di depan outlet.',
  },
  {
    id: 'family_tourist',
    name: 'Keluarga & Wisatawan Akhir Pekan',
    sharePct: 14,
    aovRange: 'Rp 45.000 – Rp 85.000',
    dwellTime: '1.0 – 2.0 Jam',
    peakHours: 'Jumat–Minggu 09:00 – 13:00 & 18:00 – 21:30',
    mustHaves: [
      'Area parkir mobil lega (minimal muat 4–8 mobil)',
      'Ruang bebas asap rokok ber-AC (Non-smoking indoor)',
      'Toilet bersih, wangi, dan wastafel higienis',
      'Menu variatif: Kopi klasik, Artisan Tea, Pastry/Toast, & Kids meal',
    ],
    dealbreakers: [
      'Asap rokok campur aduk di area dalam (indoor smoking)',
      'Lahan parkir sempit hingga harus parkir di seberang jalan raya padat',
      'Ketiadaan pilihan makanan berat atau cemilan anak',
    ],
    representativeReview:
      '"Suasana Kayutangan heritage estetik buat foto keluarga. Ada menu kopi jadul dan toast srikaya enak buat anak-anak. Toiletnya bersih dan terawat."',
    recommendedAction:
      'Kembangkan paket Bundling Sarapan Keluarga (2 Kopi O/Kopi Susu + 2 Roti Bakar + Telur 1/2 Matang) seharga Rp 55.000–65.000.',
  },
  {
    id: 'delivery_driver',
    name: 'Driver Ojek Online Delivery',
    sharePct: 10,
    aovRange: 'Rp 38.000 – Rp 75.000 (Nilai Keranjang)',
    dwellTime: '3 – 8 Menit (Waiting Time)',
    peakHours: '11:30 – 14:00 & 18:30 – 21:00',
    mustHaves: [
      'Dedicated Pickup Counter terpisah dari kasir dine-in',
      'Layar/Papan nomor antrean pesanan online yang jelas',
      'Kantong plastik tebal + lakban isolasi anti-tumpah untuk ojol motor',
      'Dispenser air putih atau tempat berteduh saat hujan',
    ],
    dealbreakers: [
      'Menunggu barista meracik > 15 menit (merusak performa rating driver)',
      'Pesanan salah varian suhu (pesan Less Ice dibuatkan Normal Ice)',
      'Kemasan rembes saat melewati jalanan berlubang/paving',
    ],
    representativeReview:
      '"Outlet yang punya meja khusus ojol dan barista sigap selalu jadi berkah buat driver. Gak perlu antre di belakang pembeli dine-in."',
    recommendedAction:
      'Terapkan stiker segel QC pada kantong takeaway dan sediakan dispenser air galon gratis untuk membangun relasi baik dengan komunitas ojol Malang.',
  },
];

export default function VocPlaybookIsland() {
  const [selectedBudget, setSelectedBudget] = useState<string>('ALL');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('student');

  const filteredPlaybooks = selectedBudget === 'ALL'
    ? PLAYBOOKS
    : PLAYBOOKS.filter(p => p.budgetTier === selectedBudget);

  const activePersona = CONSUMER_PERSONAS.find(p => p.id === selectedPersonaId) || CONSUMER_PERSONAS[0];

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

      {/* 2. Consumer Persona Deep-Dive Matrix */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              4 Arketipe Persona Konsumen Kopi Malang
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Profil demografis, ekspektasi fasilitas, toleransi harga, dan dealbreaker dari 4 segmen utama pasar Malang
            </p>
          </div>

          {/* Persona Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {CONSUMER_PERSONAS.map((persona) => (
              <button
                key={persona.id}
                type="button"
                onClick={() => setSelectedPersonaId(persona.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedPersonaId === persona.id
                    ? 'bg-[var(--accent-base)] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {persona.name} ({persona.sharePct}%)
              </button>
            ))}
          </div>
        </div>

        {/* Active Persona Detailed Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Summary Box */}
          <div className="lg:col-span-4 bg-slate-50/90 border border-slate-200/80 p-5 rounded-xl space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pangsa Pasar</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-100 text-blue-900">
                  {activePersona.sharePct}% Total Transaksi
                </span>
              </div>
              <strong className="text-base text-slate-900 block mt-1.5">{activePersona.name}</strong>
            </div>

            <div className="space-y-2 border-t border-slate-200/60 pt-3 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Kisaran Belanja (AOV):</span>
                <strong className="font-mono text-slate-900">{activePersona.aovRange}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Durasi Duduk (Dwell Time):</span>
                <strong className="font-mono text-slate-900">{activePersona.dwellTime}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jam Puncak Kedatangan:</span>
                <strong className="font-mono text-slate-900">{activePersona.peakHours}</strong>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200/70 text-[11px] text-slate-600 space-y-1">
              <strong className="text-slate-900 block font-semibold">Tindakan Rekomendasi Kasir &amp; SOP:</strong>
              <p className="leading-relaxed">{activePersona.recommendedAction}</p>
            </div>
          </div>

          {/* Right Breakdown: Must-Haves, Dealbreakers & Quote */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Must-Haves */}
              <div className="bg-emerald-50/40 border border-emerald-200/70 p-4 rounded-xl space-y-2">
                <strong className="text-emerald-950 font-bold flex items-center gap-1.5">
                  <span className="text-emerald-700">✓</span> Fasilitas &amp; Fitur Wajib (Must-Haves)
                </strong>
                <ul className="space-y-1.5 text-[11px] text-emerald-900">
                  {activePersona.mustHaves.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-700 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dealbreakers */}
              <div className="bg-rose-50/40 border border-rose-200/70 p-4 rounded-xl space-y-2">
                <strong className="text-rose-950 font-bold flex items-center gap-1.5">
                  <span className="text-rose-700">✕</span> Dealbreakers (Penyebab Rating Bintang 1-2)
                </strong>
                <ul className="space-y-1.5 text-[11px] text-rose-900">
                  {activePersona.dealbreakers.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-700 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Representative Review Quote */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl text-xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Contoh Kutipan Review Asli (NLP Synthesized Review):
              </span>
              <p className="italic text-slate-800 leading-relaxed text-[12px]">
                {activePersona.representativeReview}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Blue-Ocean Corridor Entry Playbooks */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* 4. Operational Feasibility & Regulatory 2026 Checklist */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            Checklist Kepatuhan Regulasi &amp; Kesiapan Teknis Operasional (Malang Raya 2026)
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Daftar persyaratan legalitas dan standar teknis yang wajib dipenuhi sebelum membuka outlet komersial di Kota Malang
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Card 1 */}
          <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/70 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                1
              </span>
              <strong className="text-slate-900 font-semibold">Legalitas KBLI 56303</strong>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Pendaftaran NIB (Nomor Induk Berusaha) berbasis risiko rendah melalui OSS-RBA untuk klasifikasi Restoran/Kafe/Kedai Minuman Minum di Tempat.
            </p>
            <span className="text-[10px] text-emerald-700 font-semibold block pt-1 border-t border-slate-200/60">
              ✓ Wajib OSS-RBA Aktif
            </span>
          </div>

          {/* Card 2 */}
          <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/70 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                2
              </span>
              <strong className="text-slate-900 font-semibold">Sertifikasi Halal BPJPH</strong>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Kewajiban sertifikasi halal untuk bahan baku F&amp;B (kopi, susu pasteurisasi, sirup perisa, powder boba) sesuai UU Jaminan Produk Halal.
            </p>
            <span className="text-[10px] text-emerald-700 font-semibold block pt-1 border-t border-slate-200/60">
              ✓ LPPOM MUI / BPJPH
            </span>
          </div>

          {/* Card 3 */}
          <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/70 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                3
              </span>
              <strong className="text-slate-900 font-semibold">PLN 11.000 VA B-1</strong>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Kelistrikan komersial tegangan rendah stabil untuk menahan beban mesin espresso 2-group (3.2 kW), undercounter chiller (800W), dan AC split 2 PK.
            </p>
            <span className="text-[10px] text-emerald-700 font-semibold block pt-1 border-t border-slate-200/60">
              ✓ Rekening PLN Tarif Bisnis
            </span>
          </div>

          {/* Card 4 */}
          <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/70 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                4
              </span>
              <strong className="text-slate-900 font-semibold">Limbah &amp; Grease Trap</strong>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Pemasangan perangkap lemak (grease trap) pada bak cuci dan penampungan ampas kopi (spent coffee grounds) yang disalurkan ke petani pupuk organik Dampit.
            </p>
            <span className="text-[10px] text-emerald-700 font-semibold block pt-1 border-t border-slate-200/60">
              ✓ Standar DLH Kota Malang
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
