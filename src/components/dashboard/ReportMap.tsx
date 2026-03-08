import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import type { ReportPayload } from "@/services/awsService";

const statusColors: Record<string, string> = {
  pending: "#f59e0b",
  "in-review": "#001f3f",
  resolved: "#22c55e",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  "in-review": "In Review",
  resolved: "Resolved",
};

function createIcon(status: string) {
  const color = statusColors[status] || "#001f3f";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.27 21.73 0 14 0z" fill="${color}"/>
    <circle cx="14" cy="14" r="6" fill="white"/>
  </svg>`;
  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -40],
  });
}

interface ReportMapProps {
  reports: ReportPayload[];
  isVisible?: boolean;
}

const PUNE_CENTER: [number, number] = [18.52, 73.856];

const ReportMap = ({ reports, isVisible = true }: ReportMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView(PUNE_CENTER, 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Add markers when reports change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markers: L.Marker[] = [];
    reports.forEach((report) => {
      const lat = report.location.lat > 18 ? report.location.lat : 18.52;
      const lng = report.location.lng > 73 ? report.location.lng : 73.856;
      const marker = L.marker([lat, lng], { icon: createIcon(report.status) })
        .bindPopup(
          `<div style="min-width:160px">
            <p style="font-weight:700;font-size:13px;margin:0">${report.id}</p>
            <p style="font-size:12px;margin:4px 0">${report.description}</p>
            <span style="display:inline-block;border-radius:9999px;padding:2px 8px;font-size:11px;font-weight:600;color:#fff;background:${statusColors[report.status]}">${statusLabels[report.status]}</span>
          </div>`
        )
        .addTo(map);
      markers.push(marker);
    });

    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [reports]);

  // Invalidate size when toggled visible
  useEffect(() => {
    if (isVisible && mapRef.current) {
      setTimeout(() => mapRef.current?.invalidateSize(), 150);
    }
  }, [isVisible]);

  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
        <MapPin className="h-4 w-4 text-primary" />
        Pune Region Map
      </h2>
      <div
        ref={containerRef}
        className="h-[420px] w-full overflow-hidden rounded-2xl border border-border"
      />
      <div className="flex items-center justify-center gap-4 text-[11px]">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-warning" /> Pending</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> In Review</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-success" /> Resolved</span>
      </div>
    </div>
  );
};

export default ReportMap;
