import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapaLogistica = ({ envios }) => {
  // Sede central (origen)
  const sedeCentro = [-33.4489, -70.6693]; // Santiago, Chile (ejemplo)

  // Obtener la ubicación real o generar una cercana si no tiene (para retrocompatibilidad)
  const getLocation = (envio) => {
    if (envio.lat && envio.lng) {
      return [envio.lat, envio.lng];
    }
    const seed = envio.id;
    const randomOffsetLat = (Math.sin(seed * 12.9898) * 43758.5453 % 1) * 0.1 - 0.05;
    const randomOffsetLng = (Math.cos(seed * 78.233) * 43758.5453 % 1) * 0.1 - 0.05;
    return [sedeCentro[0] + randomOffsetLat, sedeCentro[1] + randomOffsetLng];
  };

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
      <MapContainer center={sedeCentro} zoom={11} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Marcador de Sede Central */}
        <Marker position={sedeCentro}>
          <Popup>
            <strong>Sede Central Donatón</strong>
            <br />
            Punto de acopio principal.
          </Popup>
        </Marker>

        {envios.filter(e => e.estado === 'EN_TRANSITO' || e.estado === 'PENDIENTE').map((envio) => {
          const loc = getLocation(envio);
          const color = envio.estado === 'EN_TRANSITO' ? 'blue' : 'gray';

          return (
            <React.Fragment key={envio.id}>
              <Marker position={loc}>
                <Popup>
                  <strong>Destino: {envio.destino}</strong>
                  <br />
                  Envío #{envio.id} - {envio.estado}
                  <br />
                  {envio.cantidad}x {envio.detalle}
                </Popup>
              </Marker>
              
              {/* Dibujar línea desde sede hasta destino */}
              <Polyline 
                positions={[sedeCentro, loc]} 
                color={color} 
                dashArray={envio.estado === 'PENDIENTE' ? "5, 10" : ""}
                weight={2}
              />
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapaLogistica;
