/**
 * Haversine distance and spatial gravity functions.
 */

export const haversineDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371.0; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1000) / 1000;
};

export interface CampusAnchor {
  name: string;
  code: string;
  lat: number;
  lon: number;
  active_students: number;
  kecamatan: string;
}

export const calculateCampusGravity = (
  lat: number,
  lon: number,
  campuses: CampusAnchor[]
): number => {
  let score = 0;
  for (const c of campuses) {
    const d = haversineDistanceKm(lat, lon, c.lat, c.lon);
    // Gravity = Students / (d^2 + 0.15) / 1000
    score += (c.active_students / 1000) / (d * d + 0.15);
  }
  return Math.round(score * 10) / 10;
};
