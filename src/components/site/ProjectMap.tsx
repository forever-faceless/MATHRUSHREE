"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";

export type MapPin = { lat: number; lng: number; label: string; sub?: string };
export type MapLandmark = { id: number; lat: number; lng: number; label: string; category: string; distance: string; drive?: string };
export type MapSite = { id: number; lat: number; lng: number; label: string; href: string; status: string; active?: boolean };

export type ProjectMapProps = {
  main: MapPin;
  landmarks?: MapLandmark[];
  sites?: MapSite[];
  showLines?: boolean;
  /** Fit the view around the main pin and sites only (landmarks can be far away). */
  focus?: "all" | "layout";
  className?: string;
  interactive?: boolean;
};

const pinSvg = (fill: string, stroke: string, glyph?: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42">
    <path d="M17 41c6-9 14-16 14-24A14 14 0 0 0 3 17c0 8 8 15 14 24Z" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
    ${glyph ?? `<circle cx="17" cy="17" r="5.5" fill="${stroke}"/>`}
  </svg>`;

const houseGlyph = `<path d="M17 9 9 16h2.2v7h11.6v-7H25l-8-7Z" fill="#1a1d0c"/>`;

const mainIcon = L.divIcon({ className: "mhcs-pin", html: pinSvg("#d8b573", "#1a1d0c", houseGlyph), iconSize: [34, 42], iconAnchor: [17, 41], popupAnchor: [0, -36] });
const landmarkIcon = L.divIcon({ className: "mhcs-pin", html: pinSvg("#fdfcf8", "#215f76"), iconSize: [26, 32], iconAnchor: [13, 31], popupAnchor: [0, -26] });

const siteFill: Record<string, string> = {
  available: "#2f7a4f",
  reserved: "#4b5b95",
  booked: "#a8731d",
  sold: "#a53a3a",
};

function siteIcon(status: string, active: boolean, label: string) {
  const fill = siteFill[status] ?? "#55552f";
  const size = active ? 30 : 22;
  return L.divIcon({
    className: "mhcs-pin",
    html: `<div style="width:${size}px;height:${size}px;border-radius:999px;background:${fill};border:2px solid ${active ? "#d8b573" : "#fdfcf8"};box-shadow:0 2px 6px rgba(0,0,0,.35);color:#fff;font:600 ${active ? 12 : 10}px/1 system-ui;display:flex;align-items:center;justify-content:center">${label.length <= 3 ? label : ""}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [36, 36], maxZoom: 16 });
  }, [map, points]);
  return null;
}

export default function ProjectMap({ main, landmarks = [], sites = [], showLines = true, focus = "all", className, interactive = true }: ProjectMapProps) {
  const points = useMemo<[number, number][]>(() => {
    const pts: [number, number][] = [[main.lat, main.lng]];
    for (const s of sites) pts.push([s.lat, s.lng]);
    if (focus === "all") for (const l of landmarks) pts.push([l.lat, l.lng]);
    return pts;
  }, [main, sites, landmarks, focus]);

  return (
    <MapContainer
      center={[main.lat, main.lng]}
      zoom={14}
      scrollWheelZoom={false}
      dragging={interactive}
      className={className ?? "h-full w-full"}
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />

      {showLines
        ? landmarks.map((l) => (
            <Polyline key={`line-${l.id}`} positions={[[main.lat, main.lng], [l.lat, l.lng]]} pathOptions={{ color: "#215f76", weight: 1.5, dashArray: "4 6", opacity: 0.7 }} />
          ))
        : null}

      {landmarks.map((l) => (
        <Marker key={l.id} position={[l.lat, l.lng]} icon={landmarkIcon}>
          <Tooltip direction="top" offset={[0, -28]} className="mhcs-tooltip" permanent={false}>
            {l.label} · {l.distance}
          </Tooltip>
          <Popup>
            <strong>{l.label}</strong>
            <br />
            {l.distance}
            {l.drive ? ` · ${l.drive}` : ""}
          </Popup>
        </Marker>
      ))}

      {sites.map((s) => (
        <Marker key={`site-${s.id}`} position={[s.lat, s.lng]} icon={siteIcon(s.status, Boolean(s.active), s.label)} zIndexOffset={s.active ? 1000 : 0}>
          <Popup>
            <strong>{s.label}</strong>
            <br />
            <a href={s.href} style={{ color: "#8a6b3b", fontWeight: 600 }}>
              →
            </a>
          </Popup>
        </Marker>
      ))}

      <Marker position={[main.lat, main.lng]} icon={mainIcon} zIndexOffset={500}>
        <Popup>
          <strong>{main.label}</strong>
          {main.sub ? (
            <>
              <br />
              {main.sub}
            </>
          ) : null}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
