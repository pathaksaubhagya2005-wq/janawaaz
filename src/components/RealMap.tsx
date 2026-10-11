"use client";

import { useEffect, useRef, useState } from "react";
import type { Complaint } from "@/lib/types";

/* Real OpenStreetMap (Leaflet) loaded from a CDN, so no npm install is needed. */
const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

let leafletPromise: Promise<any> | null = null;
function loadLeaflet(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const w = window as any;
  if (w.L) return Promise.resolve(w.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = LEAFLET_CSS;
      document.head.appendChild(l);
    }
    const s = document.createElement("script");
    s.src = LEAFLET_JS;
    s.async = true;
    s.onload = () => resolve(w.L);
    s.onerror = () => {
      leafletPromise = null;
      reject(new Error("Leaflet failed to load"));
    };
    document.head.appendChild(s);
  });
  return leafletPromise;
}

const PIN_COLOR: Record<string, string> = {
  critical: "#dc2626",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#64748b",
};

interface Props {
  complaints?: Complaint[];
  picked?: { lat: number; lng: number } | null;
  onPick?: (lat: number, lng: number) => void;
  className?: string;
}

const NOIDA: [number, number] = [28.5706, 77.3272];

export function RealMap({ complaints = [], picked, onPick, className = "h-60" }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const pinRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const onPickRef = useRef(onPick);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  // create the map once
  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !el.current || mapRef.current) return;
        const map = L.map(el.current, { zoomControl: true, attributionControl: true }).setView(NOIDA, 12);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        layerRef.current = L.layerGroup().addTo(map);
        map.on("click", (e: any) => onPickRef.current?.(e.latlng.lat, e.latlng.lng));
        mapRef.current = map;
        setReady(true);
        setTimeout(() => map.invalidateSize(), 200);
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        pinRef.current = null;
      }
    };
  }, []);

  // existing complaints
  useEffect(() => {
    const L = (window as any).L;
    if (!ready || !L || !layerRef.current) return;
    layerRef.current.clearLayers();
    complaints.forEach((c) => {
      L.circleMarker([c.latitude, c.longitude], {
        radius: 6,
        color: "#ffffff",
        weight: 2,
        fillColor: PIN_COLOR[c.priority] ?? "#64748b",
        fillOpacity: 0.95,
      })
        .bindTooltip(`#${c.complaintNumber}`)
        .addTo(layerRef.current);
    });
  }, [complaints, ready]);

  // picked location pin (draggable)
  useEffect(() => {
    const L = (window as any).L;
    const map = mapRef.current;
    if (!ready || !L || !map) return;
    if (!picked) {
      if (pinRef.current) {
        map.removeLayer(pinRef.current);
        pinRef.current = null;
      }
      return;
    }
    const ll: [number, number] = [picked.lat, picked.lng];
    if (!pinRef.current) {
      const icon = L.divIcon({
        className: "",
        html: '<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:#2563eb;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);transform:rotate(-45deg)"></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 22],
      });
      pinRef.current = L.marker(ll, { icon, draggable: true }).addTo(map);
      pinRef.current.on("dragend", () => {
        const p = pinRef.current.getLatLng();
        onPickRef.current?.(p.lat, p.lng);
      });
    } else {
      pinRef.current.setLatLng(ll);
    }
    map.setView(ll, Math.max(map.getZoom(), 16));
  }, [picked, ready]);

  if (failed) {
    return (
      <div className={`${className} flex items-center justify-center rounded-xl bg-slate-100 p-4 text-center text-sm text-slate-500`}>
        Map could not load (check internet). You can still type the address.
      </div>
    );
  }

  return (
    <div className={`${className} relative overflow-hidden rounded-xl border border-slate-200`}>
      <div ref={el} className="absolute inset-0 z-0" />
      {!ready && <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100 text-sm text-slate-500">Loading map…</div>}
    </div>
  );
}
