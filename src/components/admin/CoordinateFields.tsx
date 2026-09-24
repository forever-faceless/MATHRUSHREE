"use client";

import { ExternalLink, MapPin } from "lucide-react";
import { useState } from "react";
import { googleMapsLink, isValidLatLng } from "@/lib/geo";
import { Input } from "./ui";

/**
 * Latitude/longitude inputs with a paste box: staff can copy "13.0230, 76.1270"
 * straight from Google Maps (right-click → copy coordinates) and both fields fill in.
 */
export function CoordinateFields({ lat, lng, fallback, label, required = false, names = { lat: "lat", lng: "lng" } }: { lat: number | null; lng: number | null; fallback?: { lat: number; lng: number }; label: string; required?: boolean; names?: { lat: string; lng: string } }) {
  const [latV, setLat] = useState(lat == null ? "" : String(lat));
  const [lngV, setLng] = useState(lng == null ? "" : String(lng));
  const [paste, setPaste] = useState("");

  const applyPaste = (value: string) => {
    setPaste(value);
    const m = value.match(/(-?\d{1,3}(?:\.\d+)?)[,\s]+(-?\d{1,3}(?:\.\d+)?)/);
    if (m) {
      setLat(m[1]);
      setLng(m[2]);
    }
  };

  const nLat = Number(latV);
  const nLng = Number(lngV);
  const valid = latV !== "" && lngV !== "" && isValidLatLng(nLat, nLng);
  const preview = valid ? { lat: nLat, lng: nLng } : fallback;

  return (
    <fieldset className="rounded-2xl border border-olive-900/10 bg-white/60 p-4 sm:p-5">
      <legend className="px-2 text-sm font-semibold text-olive-900">
        <MapPin className="mr-1 inline h-4 w-4 text-gold-600" /> {label}
      </legend>
      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_1fr]">
        <Input
          label="Paste from Google Maps"
          name="__coords_paste"
          value={paste}
          onChange={(e) => applyPaste(e.target.value)}
          placeholder="13.0230, 76.1270"
          hint="In Google Maps, right-click the spot → click the coordinates to copy → paste here."
        />
        <Input label="Latitude" name={names.lat} type="number" step="any" value={latV} onChange={(e) => setLat(e.target.value)} required={required} />
        <Input label="Longitude" name={names.lng} type="number" step="any" value={lngV} onChange={(e) => setLng(e.target.value)} required={required} />
      </div>
      {preview ? (
        <a href={googleMapsLink(preview.lat, preview.lng)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-gold-700 hover:underline">
          <ExternalLink className="h-3.5 w-3.5" /> {valid ? "Check this point in Google Maps" : "Open Hassan in Google Maps to find the spot"}
        </a>
      ) : null}
    </fieldset>
  );
}
