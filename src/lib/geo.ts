import type { LandmarkCategory } from "@/lib/db/schema";

const EARTH_RADIUS_KM = 6371;

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/** Rough drive-time estimate for small-town roads when no manual value is entered. */
export function estimateDriveMinutes(km: number): number {
  const avgSpeedKmh = km < 3 ? 22 : km < 15 ? 32 : 45;
  return Math.max(1, Math.round((km / avgSpeedKmh) * 60));
}

export function formatDistance(km: number, locale: "en" | "kn"): string {
  if (km < 1) {
    const m = Math.max(50, Math.round(km * 20) * 50);
    return locale === "kn" ? `${m} ಮೀ` : `${m} m`;
  }
  const value = km < 10 ? km.toFixed(1) : Math.round(km).toString();
  return locale === "kn" ? `${value} ಕಿ.ಮೀ` : `${value} km`;
}

export function formatMinutes(min: number, locale: "en" | "kn"): string {
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (locale === "kn") return m ? `${h} ಗಂ ${m} ನಿ` : `${h} ಗಂ`;
    return m ? `${h} hr ${m} min` : `${h} hr`;
  }
  return locale === "kn" ? `${min} ನಿಮಿಷ` : `${min} min`;
}

export function googleMapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function googleDirectionsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function isValidLatLng(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

/** Hassan town centre; used as the default map centre for new projects. */
export const HASSAN_CENTRE = { lat: 13.0033, lng: 76.1004 };

export const LANDMARK_CATEGORY_ORDER: LandmarkCategory[] = [
  "city_centre",
  "bus_stand",
  "railway",
  "highway",
  "hospital",
  "school",
  "college",
  "market",
  "temple",
  "industrial",
  "park",
  "airport",
  "other",
];
