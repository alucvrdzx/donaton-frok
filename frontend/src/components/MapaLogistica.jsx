import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Iconos con Emojis usando L.divIcon con aura/fondo para contraste
const sedeIcon = new L.divIcon({
  html: `
    <div style="display: flex; flex-direction: column; align-items: center; margin-top: -10px;">
      <div style="font-size: 24px; background: white; border-radius: 50%; padding: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid #3b82f6; display: flex; justify-content: center; align-items: center; width: 34px; height: 34px;">
        🏛️
      </div>
      <div style="background: rgba(255,255,255,0.9); padding: 1px 4px; border-radius: 4px; font-size: 10px; font-weight: bold; color: #1e293b; margin-top: 2px; border: 1px solid #ccc;">
        Sede
      </div>
    </div>
  `,
  className: 'emoji-icon',
  iconSize: [40, 50],
  iconAnchor: [20, 50],
  popupAnchor: [0, -50]
});

const necesidadIcon = new L.divIcon({
  html: `
    <div style="display: flex; flex-direction: column; align-items: center; margin-top: -10px;">
      <div style="font-size: 24px; background: white; border-radius: 50%; padding: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid #ef4444; display: flex; justify-content: center; align-items: center; width: 34px; height: 34px;">
        📍
      </div>
    </div>
  `,
  className: 'emoji-icon',
  iconSize: [40, 50],
  iconAnchor: [20, 50],
  popupAnchor: [0, -50]
});

const MapaLogistica = ({ envios, sedes = [], necesidades = [] }) => {
  // Sede central por defecto (si no hay sedes en la BD)
  const sedeCentro = [-33.4489, -70.6693]; 

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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Renderizar Sedes desde la BD si existen, si no renderizar la central hardcodeada */}
        {sedes.length > 0 ? (
          sedes.map(sede => (
            <Marker key={`sede-${sede.id}`} position={[sede.lat, sede.lng]} icon={sedeIcon}>
              <Popup>
                <strong>Sede {sede.tipo === 'CENTRAL' ? 'Central' : 'Regional'}: {sede.nombre}</strong>
                <br />
                {sede.direccion}
              </Popup>
            </Marker>
          ))
        ) : (
          <Marker position={sedeCentro} icon={sedeIcon}>
            <Popup>
              <strong>Sede Central Donatón</strong>
              <br />
              Punto de acopio principal.
            </Popup>
          </Marker>
        )}

        {/* Renderizar Necesidades Activas */}
        {necesidades.map(n => {
          if (n.lat && n.lng) {
            return (
              <Marker key={`nec-${n.id}`} position={[n.lat, n.lng]} icon={necesidadIcon}>
                <Popup>
                  <strong>{n.titulo}</strong>
                  <br />
                  Faltan: {n.cantidadRequerida - n.cantidadCubierta} de {n.producto}
                  <br />
                  Estado: {n.estado}
                </Popup>
              </Marker>
            );
          }
          return null;
        })}

        {/* Renderizar Envíos */}
        {envios.filter(e => e.estado === 'EN_TRANSITO' || e.estado === 'PENDIENTE').map((envio) => {
          const loc = getLocation(envio);
          const color = envio.estado === 'EN_TRANSITO' ? '#3b82f6' : '#6b7280';

          return (
            <React.Fragment key={`envio-${envio.id}`}>
              {/* Solo renderizamos el marcador del envío si no tiene una necesidad asociada con lat/lng exactas, para evitar duplicados */}
              {!envio.necesidadId && (
                <Marker position={loc} icon={necesidadIcon}>
                  <Popup>
                    <strong>Destino: {envio.destino}</strong>
                    <br />
                    Envío #{envio.id} - {envio.estado}
                    <br />
                    {envio.cantidad}x {envio.detalle}
                  </Popup>
                </Marker>
              )}
              
              {/* Dibujar línea (asumiendo que sale de la sede central por ahora) */}
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
