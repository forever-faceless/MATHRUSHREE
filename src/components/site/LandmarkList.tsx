import {
  Bus,
  Building2,
  Factory,
  GraduationCap,
  Hospital,
  Landmark as LandmarkIcon,
  MapPin,
  Milestone,
  Plane,
  School,
  Store,
  TrainFront,
  Trees,
  type LucideIcon,
} from "lucide-react";
import type { Landmark, LandmarkCategory } from "@/lib/db/schema";
import { estimateDriveMinutes, formatDistance, formatMinutes, haversineKm } from "@/lib/geo";
import { pick, type Dictionary, type Locale } from "@/lib/i18n";

export const categoryIcons: Record<LandmarkCategory, LucideIcon> = {
  city_centre: Building2,
  bus_stand: Bus,
  railway: TrainFront,
  highway: Milestone,
  hospital: Hospital,
  school: School,
  college: GraduationCap,
  market: Store,
  temple: LandmarkIcon,
  industrial: Factory,
  park: Trees,
  airport: Plane,
  other: MapPin,
};

export type LandmarkDistance = {
  landmark: Landmark;
  km: number;
  distance: string;
  drive: string;
};

export function computeDistances(origin: { lat: number; lng: number }, landmarks: Landmark[], locale: Locale): LandmarkDistance[] {
  return landmarks
    .map((landmark) => {
      const km = haversineKm(origin.lat, origin.lng, landmark.lat, landmark.lng);
      const minutes = landmark.driveMinutes ?? estimateDriveMinutes(km);
      return { landmark, km, distance: formatDistance(km, locale), drive: formatMinutes(minutes, locale) };
    })
    .sort((a, b) => a.landmark.sortOrder - b.landmark.sortOrder || a.km - b.km);
}

export function LandmarkList({ items, locale, dict }: { items: LandmarkDistance[]; locale: Locale; dict: Dictionary }) {
  if (!items.length) return null;
  return (
    <ul className="divide-y divide-olive-900/8">
      {items.map(({ landmark, distance, drive }) => {
        const Icon = categoryIcons[landmark.category] ?? MapPin;
        return (
          <li key={landmark.id} className="flex items-center gap-4 py-3.5">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-olive-50 text-olive-700">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-olive-900">{pick(landmark, "name", locale)}</p>
              <p className="text-xs text-ink-500">{dict.landmark[landmark.category]}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold tabular-nums text-olive-900">{distance}</p>
              <p className="text-xs text-ink-500">
                {drive} {dict.projects.driveTime}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
