import { useEffect, useRef, useState } from 'react';
import type { CoffeeBrand, OsmPoi, UniversityAnchor } from '../../lib/types/coffee-intelligence';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  brands: CoffeeBrand[];
  pois: OsmPoi[];
  campuses: UniversityAnchor[];
}

const TIER_COLORS: Record<string, string> = {
  'Tier 1: National Grab-and-Go': '#0072B2',
  'Tier 2: Local Scale Champions': '#D55E00',
  'Tier 3: Modern Kopitiam': '#E69F00',
  'Tier 4: 24H Student Mega-Hubs': '#009E73',
  'Tier 5: Specialty Roasteries': '#CC79A7',
  'Tier 6: Destination & Heritage': '#56B4E9',
};

export default function MalangGeoMap({ brands, pois, campuses }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [showBrands, setShowBrands] = useState(true);
  const [showOsmPois, setShowOsmPois] = useState(false);
  const [showCampusRings, setShowCampusRings] = useState(true);

  const brandLayerGroup = useRef<L.LayerGroup | null>(null);
  const poiLayerGroup = useRef<L.LayerGroup | null>(null);
  const campusLayerGroup = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize Leaflet map centered on Kota Malang (scrollWheelZoom disabled until focused to prevent scroll hijack)
    const map = L.map(mapContainerRef.current, {
      center: [-7.9666, 112.6326],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: false,
    });
    map.on('click', () => map.scrollWheelZoom.enable());
    map.on('mouseout', () => map.scrollWheelZoom.disable());
    mapInstanceRef.current = map;

    // CartoDB Positron raster tiles (clean-light, zero-key)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    brandLayerGroup.current = L.layerGroup().addTo(map);
    poiLayerGroup.current = L.layerGroup();
    campusLayerGroup.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Brand Layer
  useEffect(() => {
    if (!brandLayerGroup.current) return;
    brandLayerGroup.current.clearLayers();

    if (showBrands) {
      brands.forEach((b) => {
        const color = TIER_COLORS[b.category_tier] || '#0072B2';
        const radius = Math.min(14, Math.max(6, Math.sqrt(b.est_kopi_susu_cups_day) * 0.7));

        const marker = L.circleMarker([b.lat, b.lon], {
          radius,
          fillColor: color,
          color: '#ffffff',
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.85,
        });

        marker.bindPopup(`
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-size: 11px; line-height: 1.45; min-width: 210px; max-width: 250px; color: #0f172a;">
            <div style="font-weight: 700; font-size: 13px; color: #0f172a;">${b.name}</div>
            <div style="color: #64748b; font-size: 10px; margin-top: 1px;">${b.kecamatan} (${b.corridor}) · ${b.category_tier.split(':')[1]?.trim() || b.category_tier}</div>
            <div style="border-top: 1px solid #e2e8f0; margin: 7px 0; padding-top: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <div><span style="color:#64748b; font-size:10px; display:block;">Kopi Susu/Hr</span><strong style="color:#2563eb; font-family:monospace;">${b.est_kopi_susu_cups_day} cups</strong></div>
              <div><span style="color:#64748b; font-size:10px; display:block;">RevPASH</span><strong style="font-family:monospace;">Rp ${(b.revpash_idr || b.revpash_rp).toLocaleString('id-ID')}</strong></div>
              <div><span style="color:#64748b; font-size:10px; display:block;">Dine-In / GoFood</span><strong style="font-family:monospace;">Rp ${((b.price_kopi_susu_dinein || b.avg_kopi_susu_price)/1000).toFixed(0)}k / Rp ${((b.price_kopi_susu_gofood || b.gofood_price_kopi_susu)/1000).toFixed(0)}k</strong></div>
              <div><span style="color:#64748b; font-size:10px; display:block;">GMaps / GoFood</span><strong style="font-family:monospace;">${b.gmaps_rating.toFixed(1)} (${b.gmaps_reviews}) · GF ${b.gofood_rating.toFixed(1)}</strong></div>
            </div>
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:5px 7px; font-size:10px; color:#334155;">
              <strong style="color:#0f172a; display:block;">${b.signature_kopi_susu}</strong>
              <span style="color:#065f46; display:block; margin-top:2px;">+ ${b.review_positive_highlight}</span>
            </div>
          </div>
        `);

        marker.addTo(brandLayerGroup.current!);
      });
    }
  }, [brands, showBrands]);

  // Update OSM POI Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !poiLayerGroup.current) return;
    poiLayerGroup.current.clearLayers();

    if (showOsmPois) {
      pois.forEach((p) => {
        const marker = L.circleMarker([p.lat, p.lon], {
          radius: 3.5,
          fillColor: '#737373',
          color: '#ffffff',
          weight: 0.5,
          opacity: 0.8,
          fillOpacity: 0.6,
        });
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 11px;">
            <strong>${p.name}</strong> (OSM Kafe)<br/>
            <span>${p.street || 'Malang'} · Dekat ${p.nearest_campus}</span>
          </div>
        `);
        marker.addTo(poiLayerGroup.current!);
      });
      poiLayerGroup.current.addTo(mapInstanceRef.current);
    } else {
      poiLayerGroup.current.removeFrom(mapInstanceRef.current);
    }
  }, [pois, showOsmPois]);

  // Update Campus Rings Layer (500m & 1km radius)
  useEffect(() => {
    if (!campusLayerGroup.current) return;
    campusLayerGroup.current.clearLayers();

    if (showCampusRings) {
      campuses.forEach((c) => {
        // Campus Anchor Pin
        const anchor = L.circleMarker([c.lat, c.lon], {
          radius: 6,
          fillColor: '#B45309',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        });
        anchor.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px;">
            <strong>${c.name}</strong><br/>
            <span>Populasi: ${c.active_students.toLocaleString('id-ID')} mahasiswa aktif</span>
          </div>
        `);
        anchor.addTo(campusLayerGroup.current!);

        // 500m Ring (High Competition Walking Zone)
        L.circle([c.lat, c.lon], {
          radius: 500,
          color: '#B45309',
          weight: 1,
          dashArray: '4, 4',
          fillColor: '#B45309',
          fillOpacity: 0.08,
        }).addTo(campusLayerGroup.current!);

        // 1000m Ring (Secondary Capture Zone)
        L.circle([c.lat, c.lon], {
          radius: 1000,
          color: '#B45309',
          weight: 1,
          dashArray: '2, 6',
          fillColor: '#B45309',
          fillOpacity: 0.03,
        }).addTo(campusLayerGroup.current!);
      });
    }
  }, [campuses, showCampusRings]);

  const handleResetView = () => {
    mapInstanceRef.current?.setView([-7.9666, 112.6326], 13);
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-4">
      {/* Controls & Layer Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <h3 className="font-bold text-sm text-[var(--text-primary)]">Geospatial Competition &amp; Campus Gravity</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">93 Brand Terverifikasi vs 157 Titik Kafe OSM vs 9 Kampus Malang</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 cursor-pointer select-none text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={showBrands}
              onChange={(e) => setShowBrands(e.target.checked)}
              className="accent-[var(--accent-base)]"
            />
            <span>93 Brand Komersial</span>
          </label>

          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 cursor-pointer select-none text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={showOsmPois}
              onChange={(e) => setShowOsmPois(e.target.checked)}
              className="accent-[var(--accent-base)]"
            />
            <span>157 Titik Kafe OSM</span>
          </label>

          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 cursor-pointer select-none text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={showCampusRings}
              onChange={(e) => setShowCampusRings(e.target.checked)}
              className="accent-[#B45309]"
            />
            <span>Ring Kampus 500m/1km</span>
          </label>

          <button
            type="button"
            onClick={handleResetView}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-medium text-slate-600 transition-colors cursor-pointer"
          >
            Reset View
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-[360px] sm:h-[520px] rounded-xl overflow-hidden relative z-0 bg-[#f8fafc]"
      />

      {/* Map Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 border-t border-slate-100 pt-3">
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0072B2]"></span> Tier 1 Grab&amp;Go
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D55E00]"></span> Tier 2 Local Scale
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E69F00]"></span> Tier 3 Kopitiam
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#009E73]"></span> Tier 4 24H Hub
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CC79A7]"></span> Tier 5 Specialty
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#56B4E9]"></span> Tier 6 Heritage
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-[#B45309]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B45309]"></span> Kampus (Ring 500m/1km)
          </span>
        </div>
        <span className="text-[11px] text-slate-400">*Ukuran pin proporsional volume cup/hari</span>
      </div>
    </div>
  );
}
