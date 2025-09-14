import { useEffect, useRef } from "react";

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  locationName?: string;
}

export function MapModal({ isOpen, onClose, latitude, longitude, locationName }: MapModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && mapRef.current) {
      // iframeを作成してOpenStreetMapを表示
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';

      mapRef.current.innerHTML = '';
      mapRef.current.appendChild(iframe);
    }
  }, [isOpen, latitude, longitude]);

  if (!isOpen) return null;

  return (
    <div className="map-modal-overlay">
      <div className="map-modal">
        <div className="map-modal-header">
          <h3>{locationName || `位置: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="map-container" ref={mapRef}></div>
      </div>
    </div>
  );
}