import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Create a custom SVG DivIcon with CivicCare's theme color
export const createPinIcon = (color = '#1E8E6E', label?: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; width: 32px; height: 42px; transform: translate(-50%, -100%);">
        <svg viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25)); width: 100%; height: 100%;">
          <path d="M16 0C7.163 0 0 7.163 0 16C0 27 16 42 16 42C16 42 32 27 32 16C32 7.163 24.837 0 16 0Z" fill="${color}"/>
          <circle cx="16" cy="15" r="7" fill="white"/>
        </svg>
        ${label ? `<span style="position: absolute; top: 8px; left: 0; right: 0; text-align: center; font-size: 10px; font-weight: 700; color: ${color};">${label}</span>` : ''}
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42]
  });
};

interface LocationPickerProps {
  position: [number, number];
  onPositionChange: (pos: [number, number]) => void;
}

const DraggableMarker: React.FC<LocationPickerProps> = ({ position, onPositionChange }) => {
  const markerRef = useRef<L.Marker>(null);

  useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    }
  });

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const latLng = marker.getLatLng();
        onPositionChange([latLng.lat, latLng.lng]);
      }
    }
  };

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={createPinIcon('#1E8E6E')}
    />
  );
};

// Component to dynamically re-center map when props change
const MapUpdater: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom || map.getZoom());
  }, [center, zoom, map]);
  return null;
};

interface SimpleMapProps {
  center: [number, number];
  zoom?: number;
  className?: string;
  draggablePin?: boolean;
  onPositionChange?: (pos: [number, number]) => void;
  markers?: Array<{
    id: number | string;
    position: [number, number];
    title: string;
    color?: string;
    popupContent?: React.ReactNode;
  }>;
}

export const CivicMap: React.FC<SimpleMapProps> = ({
  center,
  zoom = 14,
  className = 'h-[280px] md:h-[380px]',
  draggablePin = false,
  onPositionChange,
  markers = []
}) => {
  return (
    <div className={`relative w-full rounded-xl overflow-hidden border border-[#E3EAE7] shadow-civic-sm ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapUpdater center={center} zoom={zoom} />

        {draggablePin && onPositionChange && (
          <DraggableMarker position={center} onPositionChange={onPositionChange} />
        )}

        {!draggablePin &&
          markers.map((m) => (
            <Marker
              key={m.id}
              position={m.position}
              icon={createPinIcon(m.color || '#1E8E6E')}
            >
              {m.popupContent && <Popup>{m.popupContent}</Popup>}
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};
