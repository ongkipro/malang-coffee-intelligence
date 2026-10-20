import { useState, useMemo } from 'react';
import type { CoffeeBrand } from '../../lib/types/coffee-intelligence';
import { formatIdr, formatNumber } from '../../lib/formatters';

interface Props {
  brands?: CoffeeBrand[];
}

interface CorridorLeaseBenchmark {
  corridor: string;
  kecamatan: string;
  ruko2FloorRentYr: string;
  boothSpaceRentYr: string;
  parkingRiskLevel: 'Tinggi (Bahu Jalan Padat)' | 'Sedang (Ruko Terbatas)' | 'Rendah (Halaman Luas)';
  dominantSegment: string;
  holidayDropRisk: string;
  pb1Enforcement: string;
}

const CORRIDOR_LEASE_BENCHMARKS: CorridorLeaseBenchmark[] = [
  {
    corridor: 'Jl. Soekarno-Hatta (Suhat Utama & Watugong)',
    kecamatan: 'Lowokwaru',
    ruko2FloorRentYr: 'Rp 165 Jt – Rp 260 Jt / thn',
    boothSpaceRentYr: 'Rp 36 Jt – Rp 60 Jt / thn',
    parkingRiskLevel: 'Tinggi (Bahu Jalan Padat)',
    dominantSegment: 'Mahasiswa UB/Polinema, Nugas 24 Jam, Crowd Malam',
    holidayDropRisk: '-24% s/d -28% (Jan–Feb & Jul–Agu)',
    pb1Enforcement: 'Ketat (Wajib Tapping Box PB1 10%)',
  },
  {
    corridor: 'Jl. Besar Ijen / Guntur / Pahlawan Trip / Wilis',
    kecamatan: 'Klojen',
    ruko2FloorRentYr: 'Rp 150 Jt – Rp 240 Jt / thn',
    boothSpaceRentYr: 'Rp 40 Jt – Rp 65 Jt / thn',
    parkingRiskLevel: 'Sedang (Ruko Terbatas)',
    dominantSegment: 'Eksekutif, WFC Premium, Keluarga & Wisatawan',
    holidayDropRisk: '-8% (Stabil didukung Wisata & Warga Lokal)',
    pb1Enforcement: 'Ketat (Wajib Tapping Box PB1 10%)',
  },
  {
    corridor: 'Kayutangan Heritage (Basuki Rahmat & Gang Dalam)',
    kecamatan: 'Klojen',
    ruko2FloorRentYr: 'Rp 95 Jt – Rp 175 Jt / thn',
    boothSpaceRentYr: 'Rp 28 Jt – Rp 48 Jt / thn',
    parkingRiskLevel: 'Tinggi (Bahu Jalan Padat)',
    dominantSegment: 'Turis Heritage, Kopitiam Pagi, Hangout Malam',
    holidayDropRisk: '+15% Lonjakan saat Libur Nasional/Weekend',
    pb1Enforcement: 'Ketat di Koridor Utama / UMKM di Gang Dalam',
  },
  {
    corridor: 'Sawojajar Raya (Danau Tondano, Bratan, Maninjau, Sentani)',
    kecamatan: 'Kedungkandang',
    ruko2FloorRentYr: 'Rp 50 Jt – Rp 85 Jt / thn',
    boothSpaceRentYr: 'Rp 18 Jt – Rp 32 Jt / thn',
    parkingRiskLevel: 'Rendah (Halaman Luas)',
    dominantSegment: 'Komuter Residensial, Keluarga Timur, Remote Worker',
    holidayDropRisk: '0% (Bebas Siklus Libur Semester Kampus)',
    pb1Enforcement: 'Moderat (Campuran Tapping Box & Self-Assessment)',
  },
  {
    corridor: 'Dinoyo / MT Haryono / Sigura-gura / Bendungan Sutami',
    kecamatan: 'Lowokwaru',
    ruko2FloorRentYr: 'Rp 85 Jt – Rp 140 Jt / thn',
    boothSpaceRentYr: 'Rp 24 Jt – Rp 42 Jt / thn',
    parkingRiskLevel: 'Tinggi (Bahu Jalan Padat)',
    dominantSegment: 'Mahasiswa Kos UIN/UNISMA/ITN/UB, Grab-and-Go & 24H',
    holidayDropRisk: '-26% s/d -30% (Sangat Bergantung Kalender Akademik)',
    pb1Enforcement: 'Moderat',
  },
  {
    corridor: 'Sudimoro / Borobudur / Mojolangu (North Coffee Belt)',
    kecamatan: 'Lowokwaru',
    ruko2FloorRentYr: 'Rp 70 Jt – Rp 120 Jt / thn',
    boothSpaceRentYr: 'Rp 20 Jt – Rp 35 Jt / thn',
    parkingRiskLevel: 'Sedang (Ruko Terbatas)',
    dominantSegment: 'Komunitas Malam, WFC Sore, Anak Muda Lokal',
    holidayDropRisk: '-12% (Ditopang Warga Lokal Mojolangu/Blimbing)',
    pb1Enforcement: 'Moderat',
  },
  {
    corridor: 'Sulfat Raya / Araya / Panji Suroso',
    kecamatan: 'Blimbing',
    ruko2FloorRentYr: 'Rp 75 Jt – Rp 135 Jt / thn',
    boothSpaceRentYr: 'Rp 22 Jt – Rp 38 Jt / thn',
    parkingRiskLevel: 'Rendah (Halaman Luas)',
    dominantSegment: 'Keluarga Menengah-Atas, Mahasiswa BINUS, Komuter',
    holidayDropRisk: '-5% (Daya Beli Perumahan Elit Stabil)',
    pb1Enforcement: 'Ketat untuk Resto/Kafe Besar',
  },
  {
    corridor: 'Tlogomas / Joyo Agung / Mulyoagung (Dau – UMM)',
    kecamatan: 'Lowokwaru / Dau',
    ruko2FloorRentYr: 'Rp 65 Jt – Rp 115 Jt / thn',
    boothSpaceRentYr: 'Rp 18 Jt – Rp 30 Jt / thn',
    parkingRiskLevel: 'Rendah (Halaman Luas)',
    dominantSegment: '38.000 Mahasiswa UMM, Kafe View Bukit/Sawah',
    holidayDropRisk: '-18% (Kombinasi Mahasiswa UMM & Wisatawan Batu)',
    pb1Enforcement: 'Pemkot Malang / Pemkab Malang (Dau)',
  },
];

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

export default function VocPlaybookIsland({ brands = [] }: Props) {
  const [selectedBudget, setSelectedBudget] = useState<string>('ALL');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('student');
  const [brandSearch, setBrandSearch] = useState<string>('');
  const [brandKecamatan, setBrandKecamatan] = useState<string>('ALL');
  const [intelTab, setIntelTab] = useState<'ALL' | 'GMAPS' | 'GOFOOD' | 'SENSORY'>('ALL');
  const [visibleCount, setVisibleCount] = useState<number>(12);

  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      if (brandKecamatan !== 'ALL') {
        const cleanKec = brandKecamatan.toLowerCase().split(' ')[0];
        const bGeo = `${b.kecamatan || ''} ${b.corridor || ''} ${b.address || ''}`.toLowerCase();
        if (!bGeo.includes(cleanKec)) return false;
      }
      if (brandSearch.trim()) {
        const q = brandSearch.toLowerCase();
        const match =
          (b.name || '').toLowerCase().includes(q) ||
          (b.corridor || '').toLowerCase().includes(q) ||
          (b.address || '').toLowerCase().includes(q) ||
          (b.signature_kopi_susu || '').toLowerCase().includes(q) ||
          (b.bestseller_food || '').toLowerCase().includes(q) ||
          (b.gmaps_review_summary || '').toLowerCase().includes(q) ||
          (b.gofood_comment_summary || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [brands, brandKecamatan, brandSearch]);

  const filteredPlaybooks = selectedBudget === 'ALL'
    ? PLAYBOOKS
    : PLAYBOOKS.filter(p => p.budgetTier === selectedBudget);

  const activePersona = CONSUMER_PERSONAS.find(p => p.id === selectedPersonaId) || CONSUMER_PERSONAS[0];

  return (
    <div className="space-y-6">
      {/* 0. Interactive 93-Brand Google Maps Review Summary & GoFood Comment Intelligence Directory */}
      {brands.length > 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Direktori Intelijen Google Maps Review &amp; Komentar GoFood (93 Brand Tervalidasi)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {filteredBrands.length} / {brands.length} Brand
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Bedah ringkasan ulasan Google Maps, skor 6-aspek operasional, kutipan langsung pelanggan, komentar GoFood, standar kemasan anti-bocor, dan profil sensorik tiap brand
              </p>
            </div>

            {/* View Mode Tabs */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                { id: 'ALL', label: 'Semua Intel' },
                { id: 'GMAPS', label: 'Google Review & 6 Skor' },
                { id: 'GOFOOD', label: 'Komentar GoFood & Kemasan' },
                { id: 'SENSORY', label: 'Sensorik & Multi-SKU' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setIntelTab(t.id as 'ALL' | 'GMAPS' | 'GOFOOD' | 'SENSORY')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    intelTab === t.id
                      ? 'bg-[var(--accent-base)] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Kecamatan Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => {
                  setBrandSearch(e.target.value);
                  setVisibleCount(12);
                }}
                placeholder="Cari nama kafe, koridor, menu (misal: Haya, Nakoa, Kongca, croissant, pancong, parkir)..."
                className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[var(--accent-base)] text-[var(--text-primary)]"
              />
              {brandSearch && (
                <button
                  type="button"
                  onClick={() => setBrandSearch('')}
                  className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {['ALL', 'Lowokwaru', 'Klojen', 'Kedungkandang', 'Blimbing', 'Sukun', 'Dau'].map((kec) => (
                <button
                  key={kec}
                  type="button"
                  onClick={() => {
                    setBrandKecamatan(kec);
                    setVisibleCount(12);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    brandKecamatan === kec
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {kec === 'ALL' ? 'Semua Wilayah' : kec === 'Kedungkandang' ? 'Sawojajar / Timur' : kec}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Review & GoFood Intelligence Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredBrands.slice(0, visibleCount).map((b) => (
              <div
                key={b.id}
                className="border border-slate-200/90 rounded-xl p-4 bg-white hover:border-slate-300 transition-all space-y-3 text-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Card Top Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm font-bold text-slate-900">{b.name}</strong>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                          {b.kecamatan} · {b.corridor}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {b.category_tier} · {b.operating_hours || (b.is_24h ? '24 Jam' : '08.00-22.00')} · {b.seating_capacity || 50} kursi
                      </span>
                    </div>
                    <div className="text-right font-mono shrink-0">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-900 text-white text-[11px] font-bold">
                        GMaps {b.gmaps_rating.toFixed(1)} ({formatNumber(b.gmaps_reviews)})
                      </span>
                      <span className="block text-[10px] text-emerald-700 font-semibold mt-0.5">
                        GoFood {b.gofood_rating.toFixed(1)} · {b.gofood_tier || 'Partner'}
                      </span>
                    </div>
                  </div>

                  {/* Google Maps Review Section */}
                  {(intelTab === 'ALL' || intelTab === 'GMAPS') && (
                    <div className="space-y-2">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-slate-500">
                          <span>Summary Google Maps Review</span>
                          <span className="font-mono text-slate-600">{b.gmaps_reviewer_badge}</span>
                        </div>
                        <p className="text-slate-700 text-[11px] leading-relaxed">
                          {b.gmaps_review_summary}
                        </p>
                      </div>

                      {b.gmaps_aspect_scores && (
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center text-[10px]">
                          {[
                            { k: 'Rasa', v: b.gmaps_aspect_scores.taste_quality },
                            { k: 'WFC/WiFi', v: b.gmaps_aspect_scores.wfc_ergonomics },
                            { k: 'Vibe', v: b.gmaps_aspect_scores.ambiance_vibe },
                            { k: 'Parkir', v: b.gmaps_aspect_scores.parking_access },
                            { k: 'Value', v: b.gmaps_aspect_scores.value_for_money },
                            { k: 'Kecepatan', v: b.gmaps_aspect_scores.service_speed },
                          ].map((s) => (
                            <div key={s.k} className="bg-slate-50 border border-slate-200/60 rounded py-1 px-1.5">
                              <span className="text-slate-400 block text-[9px]">{s.k}</span>
                              <strong className={`font-mono ${s.v >= 4.4 ? 'text-emerald-700' : s.v < 3.3 ? 'text-rose-700' : 'text-slate-900'}`}>
                                {s.v.toFixed(1)}/5
                              </strong>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-emerald-50/50 border border-emerald-200/60 p-2.5 rounded-lg">
                          <strong className="text-emerald-900 block text-[10px] uppercase tracking-wider mb-0.5">
                            Kutipan Positif Google Maps:
                          </strong>
                          <p className="italic text-emerald-950 leading-relaxed">
                            &ldquo;{b.gmaps_verbatim_positive}&rdquo;
                          </p>
                        </div>
                        <div className="bg-rose-50/50 border border-rose-200/60 p-2.5 rounded-lg">
                          <strong className="text-rose-900 block text-[10px] uppercase tracking-wider mb-0.5">
                            Keluhan &amp; Friksi Lapangan:
                          </strong>
                          <p className="italic text-rose-950 leading-relaxed">
                            &ldquo;{b.gmaps_verbatim_negative}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* GoFood Comment & Packaging Section */}
                  {(intelTab === 'ALL' || intelTab === 'GOFOOD') && (
                    <div className="bg-blue-50/30 border border-blue-200/60 p-3 rounded-lg space-y-2 text-[11px]">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <strong className="text-slate-900 uppercase tracking-wider text-[10px] font-bold">
                          Komentar GoFood, Kemasan &amp; Bundling Delivery
                        </strong>
                        <span className="font-mono text-[10px] text-slate-600">
                          Prep {b.gofood_prep_time_min || 7} mnt · Porsi Delivery {b.delivery_share_pct || 28}% Omzet
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{b.gofood_comment_summary}</p>
                      <p className="italic text-slate-800 bg-white/90 p-2 rounded border border-blue-100">
                        &ldquo;{b.gofood_verbatim_comment}&rdquo;
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] font-mono text-slate-600 border-t border-blue-100/80">
                        <span>Dine-in: <strong>{formatIdr(b.price_kopi_susu_dinein || 18000)}</strong></span>
                        <span>GoFood: <strong className="text-amber-800">{formatIdr(b.price_kopi_susu_gofood || 22500)}</strong></span>
                        <span>GrabFood: <strong>{formatIdr(b.grabfood_price_kopi_susu || 23000)}</strong></span>
                        <span>ShopeeFood: <strong>{formatIdr(b.shopeefood_price_kopi_susu || 22000)}</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Sensory & Multi-SKU Section */}
                  {(intelTab === 'ALL' || intelTab === 'SENSORY') && b.sensory_profile && b.sku_price_basket && (
                    <div className="bg-slate-50/90 border border-slate-200/70 p-3 rounded-lg space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <strong className="text-[10px] uppercase tracking-wider font-bold text-slate-600">
                          Profil Sensorik &amp; Multi-SKU Basket
                        </strong>
                        <span className="font-mono text-[10px] text-slate-500">
                          Est. Sewa Koridor: {formatIdr(b.corridor_annual_rent_est_rp || 85000000)}/thn
                        </span>
                      </div>
                      <p className="text-slate-700">
                        <strong className="text-slate-900">Signature:</strong> {b.signature_kopi_susu} &middot;{' '}
                        <strong className="text-slate-900">Food:</strong> {b.bestseller_food}
                      </p>
                      <p className="text-slate-600">
                        <strong className="text-slate-900">Karakter Rasa:</strong> {b.sensory_profile.extraction_ratio} ({b.sensory_profile.mouthfeel_texture})
                      </p>
                      <div className="grid grid-cols-4 gap-1.5 pt-1 text-[10px] font-mono">
                        <div className="bg-white px-2 py-1 rounded border border-slate-200/60">
                          <span className="text-slate-400 block text-[9px]">Americano</span>
                          <strong>{formatIdr(b.sku_price_basket.iced_americano_rp)}</strong>
                        </div>
                        <div className="bg-white px-2 py-1 rounded border border-slate-200/60">
                          <span className="text-slate-400 block text-[9px]">Kopi Susu</span>
                          <strong>{formatIdr(b.sku_price_basket.kopi_susu_dinein_rp)}</strong>
                        </div>
                        <div className="bg-white px-2 py-1 rounded border border-slate-200/60">
                          <span className="text-slate-400 block text-[9px]">Matcha/Non</span>
                          <strong>{formatIdr(b.sku_price_basket.non_coffee_signature_rp)}</strong>
                        </div>
                        <div className="bg-white px-2 py-1 rounded border border-slate-200/60">
                          <span className="text-slate-400 block text-[9px]">Snack Entry</span>
                          <strong>{formatIdr(b.sku_price_basket.entry_snack_pastry_rp)}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Telemetry */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 font-mono">
                  <span>Wi-Fi: {b.wifi_mbps ? `${b.wifi_mbps} Mbps` : 'Non-WiFi'} · Colokan: {Math.round((b.plug_ratio ?? 0.75) * 100)}%</span>
                  <span>Parkir: {b.parking_motor_capacity || 30} Motor / {b.parking_car_capacity ?? 4} Mobil</span>
                  <span>Volume: {formatNumber(b.est_kopi_susu_cups_day)} cup KS/hr</span>
                </div>
              </div>
            ))}
          </div>

          {/* Load More / Show All Button */}
          {filteredBrands.length > visibleCount && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 24)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Tampilkan Lebih Banyak Brand ({filteredBrands.length - visibleCount} tersisa)
              </button>
              <button
                type="button"
                onClick={() => setVisibleCount(filteredBrands.length)}
                className="ml-2 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Tampilkan Semua ({filteredBrands.length})
              </button>
            </div>
          )}
        </div>
      )}
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
                <strong className="text-emerald-950 font-bold block">
                  Fasilitas &amp; Fitur Wajib (Must-Haves)
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
                <strong className="text-rose-950 font-bold block">
                  Faktor Ketidakpuasan (Dealbreakers)
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

      {/* 2.5 Corridor Commercial Lease, Parking Risk & PB1 Tax Matrix */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            Matriks Benchmark Harga Sewa Ruko Komersial, Risiko Parkir &amp; Siklus Libur per Koridor
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Referensi valuasi sewa lahan tahunan (Ruko 2 Lantai vs Booth Kiosk), tingkat friksi parkir, sensitivitas libur semester, dan pengawasan pajak PB1 10%
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600 font-semibold">
              <tr>
                <th className="p-3 min-w-[210px]">Koridor Jalan Utama</th>
                <th className="p-3">Sewa Ruko 2 Lt / Thn</th>
                <th className="p-3">Sewa Booth / Teras</th>
                <th className="p-3">Risiko Friksi Parkir</th>
                <th className="p-3">Dampak Libur Kampus</th>
                <th className="p-3">Status Pajak PB1</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {CORRIDOR_LEASE_BENCHMARKS.map((row) => (
                <tr key={row.corridor} className="hover:bg-slate-50/70">
                  <td className="p-3">
                    <strong className="font-semibold text-slate-900 block">{row.corridor}</strong>
                    <span className="text-[11px] text-slate-500">{row.kecamatan} · {row.dominantSegment}</span>
                  </td>
                  <td className="p-3 font-mono font-semibold text-slate-900 whitespace-nowrap">{row.ruko2FloorRentYr}</td>
                  <td className="p-3 font-mono text-slate-700 whitespace-nowrap">{row.boothSpaceRentYr}</td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        row.parkingRiskLevel.includes('Tinggi')
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : row.parkingRiskLevel.includes('Sedang')
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {row.parkingRiskLevel}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-700">{row.holidayDropRisk}</td>
                  <td className="p-3 text-[11px] text-slate-600">{row.pb1Enforcement}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
              Kepatuhan: OSS-RBA Aktif
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
              Kepatuhan: LPPOM MUI / BPJPH
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
              Kepatuhan: Rekening PLN Tarif B-1
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
              Kepatuhan: Standar DLH Kota Malang
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
