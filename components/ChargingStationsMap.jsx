"use client";

import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

function FitStations({ stations }) {
  const map = useMap();

  useEffect(() => {
    if (stations.length > 0) {
      map.fitBounds(
        stations.map((station) => [station.latitude, station.longitude]),
        { padding: [32, 32], maxZoom: 12 }
      );
    }
  }, [map, stations]);

  return null;
}

export default function ChargingStationsMap({ stations }) {
  return (
    <MapContainer
      center={[41.0082, 28.9784]}
      zoom={10}
      scrollWheelZoom={false}
      className="z-0 h-[420px] w-full md:h-[560px]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitStations stations={stations} />
      {stations.map((station) => (
        <CircleMarker
          key={station.id}
          center={[station.latitude, station.longitude]}
          radius={7}
          pathOptions={{
            color: "#047857",
            fillColor: "#10b981",
            fillOpacity: 0.85,
          }}
        >
          <Popup>
            <strong>{station.name}</strong>
            {station.operator && station.operator !== station.name && (
              <div>İşletmeci: {station.operator}</div>
            )}
            {station.brand && station.brand !== station.name && (
              <div>Marka: {station.brand}</div>
            )}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
