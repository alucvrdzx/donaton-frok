import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import catalogoProductos from '../data/catalogoProductos';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icono para sedes
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

// Icono para necesidades activas
const necesidadIcon = new L.divIcon({
  html: `
    <div style="display: flex; flex-direction: column; align-items: center; margin-top: -10px;">
      <div style="font-size: 24px; background: white; border-radius: 50%; padding: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid #ef4444; display: flex; justify-content: center; align-items: center; width: 34px; height: 34px;">
        📍
      </div>
      <div style="background: rgba(255,255,255,0.9); padding: 1px 4px; border-radius: 4px; font-size: 10px; font-weight: bold; color: #ef4444; margin-top: 2px; border: 1px solid #ccc;">
        Emergencia
      </div>
    </div>
  `,
  className: 'emoji-icon',
  iconSize: [40, 50],
  iconAnchor: [20, 50],
  popupAnchor: [0, -50]
});

const NecesidadesPage = () => {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const rol = user ? user.rol : 'GUEST';

  const [necesidades, setNecesidades] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cantidadRequerida, setCantidadRequerida] = useState('');
  const [categoria, setCategoria] = useState(Object.keys(catalogoProductos)[0]);
  const [producto, setProducto] = useState(catalogoProductos[Object.keys(catalogoProductos)[0]][0]);
  const [ubicacion, setUbicacion] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [geocoding, setGeocoding] = useState(false);

  // Componente auxiliar para cambiar el centro del mapa
  const ChangeView = ({ center }) => {
    const map = useMap();
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
    return null;
  };

  // Componente auxiliar para manejar clics en el mapa
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setLat(e.latlng.lat);
        setLng(e.latlng.lng);
      },
    });

    return lat && lng ? (
      <Marker position={[lat, lng]}>
        <Popup>Ubicación exacta de la necesidad</Popup>
      </Marker>
    ) : null;
  };

  const handleGeocode = async () => {
    if (!ubicacion.trim()) {
      alert("Ingresa una dirección primero.");
      return;
    }
    setGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ubicacion)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setLat(parseFloat(data[0].lat));
        setLng(parseFloat(data[0].lon));
      } else {
        alert("No se encontró la dirección. Intenta ser más específico o haz clic manualmente en el mapa.");
      }
    } catch (error) {
      alert("Error buscando la dirección.");
    }
    setGeocoding(false);
  };

  const fetchNecesidades = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://worcester-alex-despite-facts.trycloudflare.com/api/necesidades', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await response.json();
      const content = data.content || data;
      setNecesidades(Array.isArray(content) ? content : []);
    } catch (error) {
      console.error("Error al cargar necesidades:", error);
    }
    setLoading(false);
  };

  const fetchSedes = async () => {
    try {
      const response = await fetch('https://worcester-alex-despite-facts.trycloudflare.com/api/sedes');
      const data = await response.json();
      const content = data.content || data;
      setSedes(Array.isArray(content) ? content : []);
    } catch (error) {
      console.error("Error al cargar sedes:", error);
    }
  };

  useEffect(() => {
    fetchNecesidades();
    fetchSedes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const necesidadData = {
      titulo,
      descripcion,
      cantidadRequerida: parseFloat(cantidadRequerida),
      categoria,
      producto,
      ubicacion,
      lat,
      lng
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://worcester-alex-despite-facts.trycloudflare.com/api/necesidades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(necesidadData)
      });

      if (response.ok) {
        alert("¡Necesidad registrada con éxito!");
        limpiarFormulario();
        fetchNecesidades();
      } else {
        const errorData = await response.json();
        if (errorData.errors) {
          const msgs = Object.values(errorData.errors).join('\n');
          alert(`Error de validación:\n${msgs}`);
        } else {
          alert(errorData.message || "Error al registrar la necesidad.");
        }
      }
    } catch (error) {
      alert("Error de conexión al registrar la necesidad.");
    }
  };

  const limpiarFormulario = () => {
    setTitulo('');
    setDescripcion('');
    setCantidadRequerida('');
    setCategoria(Object.keys(catalogoProductos)[0]);
    setProducto(catalogoProductos[Object.keys(catalogoProductos)[0]][0]);
    setUbicacion('');
    setLat(null);
    setLng(null);
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    const confirmMsg = nuevoEstado === 'CUBIERTA'
      ? '¿Marcar esta necesidad como CUBIERTA? Esto indica que fue satisfecha.'
      : `¿Cambiar el estado a ${nuevoEstado}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://worcester-alex-despite-facts.trycloudflare.com/api/necesidades/${id}/estado?estado=${nuevoEstado}`, {
        method: 'PATCH',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.ok) {
        fetchNecesidades();
      } else {
        alert("Error al actualizar el estado.");
      }
    } catch (error) {
      alert("Error de conexión al actualizar el estado.");
    }
  };

  const eliminarNecesidad = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta necesidad?")) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`https://worcester-alex-despite-facts.trycloudflare.com/api/necesidades/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      fetchNecesidades();
    } catch (error) {
      alert("Error al eliminar la necesidad.");
    }
  };

  const getEstadoBadgeStyle = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return { background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' };
      case 'EN_PROCESO':
        return { background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' };
      case 'CUBIERTA':
        return { background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' };
      default:
        return { background: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af' };
    }
  };

  const getProgreso = (n) => {
    if (!n.cantidadRequerida || n.cantidadRequerida === 0) return 0;
    return Math.min(100, Math.round((n.cantidadCubierta / n.cantidadRequerida) * 100));
  };

  // Guard: solo ADMIN y TRABAJADOR
  if (rol !== 'ADMIN' && rol !== 'TRABAJADOR') {
    return (
      <div className="page-container">
        <div className="stat-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒 Acceso Restringido</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}>
            La gestión de necesidades está disponible solo para trabajadores y administradores.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/login" className="btn-login" style={{ padding: '0.8rem 2rem' }}>Iniciar Sesión</Link>
            <Link to="/" style={{ padding: '0.8rem 2rem', color: 'var(--text-secondary)', textDecoration: 'underline' }}>Volver al Inicio</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="header" style={{ marginBottom: '2rem' }}>
        <h1>Gestión de Necesidades</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Registra y gestiona las necesidades humanitarias. Al crear una necesidad se notifica asincrónicamente al sistema.
        </p>
      </header>

      {/* Formulario de Creación */}
      <div className="stat-card" style={{ marginBottom: '3rem', textAlign: 'left' }}>
        <h3 style={{ marginTop: 0 }}>Registrar Nueva Necesidad</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <input
            type="text"
            placeholder="Título (ej: Agua potable para refugio central)"
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <textarea
            placeholder="Descripción detallada de la necesidad..."
            required
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            style={{
              padding: '0.8rem',
              borderRadius: '8px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem',
              resize: 'vertical'
            }}
          />

          <div className="responsive-grid-3">
            <select
              value={categoria}
              onChange={(e) => {
                setCategoria(e.target.value);
                setProducto(catalogoProductos[e.target.value]?.[0] || '');
              }}
            >
              {Object.keys(catalogoProductos).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={producto}
              onChange={(e) => setProducto(e.target.value)}
              required
            >
              {(catalogoProductos[categoria] || []).map(prod => (
                <option key={prod} value={prod}>{prod}</option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              placeholder="Cantidad requerida"
              required
              value={cantidadRequerida}
              onChange={(e) => setCantidadRequerida(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Ubicación (ej: Gimnasio Municipal, Sector 4)"
              required
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={handleGeocode}
              disabled={geocoding}
              style={{
                padding: '0.8rem 1.5rem',
                borderRadius: '8px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                fontWeight: 'bold',
                cursor: geocoding ? 'not-allowed' : 'pointer',
                opacity: geocoding ? 0.7 : 1
              }}
            >
              {geocoding ? 'Buscando...' : '🔍 Validar Dirección'}
            </button>
          </div>

          <div style={{ width: '100%', height: '250px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <MapContainer 
              center={lat && lng ? [lat, lng] : [-33.4489, -70.6693]} 
              zoom={lat && lng ? 15 : 10} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ChangeView center={lat && lng ? [lat, lng] : null} />
              <LocationMarker />
              
              {/* Renderizar sedes en el mapa de necesidades */}
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
                <Marker position={[-33.4489, -70.6693]} icon={sedeIcon}>
                  <Popup>
                    <strong>Sede Central Donatón</strong>
                    <br />
                    Punto de acopio principal.
                  </Popup>
                </Marker>
              )}

              {/* Renderizar necesidades activas (no cubiertas) */}
              {necesidades.filter(n => n.estado !== 'CUBIERTA').map(n => {
                if (n.lat && n.lng) {
                  return (
                    <Marker key={`nec-${n.id}`} position={[n.lat, n.lng]} icon={necesidadIcon}>
                      <Popup>
                        <strong>{n.titulo}</strong>
                        <br />
                        {n.producto} - Faltan: {n.cantidadRequerida - n.cantidadCubierta}
                        <br />
                        Estado: {n.estado}
                      </Popup>
                    </Marker>
                  );
                }
                return null;
              })}
            </MapContainer>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-0.5rem' }}>
            * Usa "Validar Dirección" o haz clic directamente en el mapa para ajustar la ubicación exacta. {(!lat || !lng) && <span style={{ color: '#ef4444' }}>(Falta fijar punto)</span>}
          </p>

          <button
            type="submit"
            style={{
              padding: '1rem',
              borderRadius: '8px',
              background: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Registrar Necesidad
          </button>
        </form>
      </div>

      {/* Resumen de Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card" style={{ borderTop: '4px solid #fbbf24' }}>
          <div className="stat-value" style={{ color: '#fbbf24' }}>
            {necesidades.filter(n => n.estado === 'PENDIENTE').length}
          </div>
          <div className="stat-label">Pendientes</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #60a5fa' }}>
          <div className="stat-value" style={{ color: '#60a5fa' }}>
            {necesidades.filter(n => n.estado === 'EN_PROCESO').length}
          </div>
          <div className="stat-label">En Proceso</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #34d399' }}>
          <div className="stat-value" style={{ color: '#34d399' }}>
            {necesidades.filter(n => n.estado === 'CUBIERTA').length}
          </div>
          <div className="stat-label">Cubiertas</div>
        </div>
      </div>

      {/* Tabla de Necesidades */}
      <h3>Listado de Necesidades</h3>
      {loading ? <p>Cargando necesidades...</p> : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Categoría</th>
                <th>Producto</th>
                <th>Progreso</th>
                <th>Estado</th>
                <th>Ubicación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {necesidades.map((n) => (
                <tr key={n.id}>
                  <td>#{n.id}</td>
                  <td>
                    <div>
                      <strong>{n.titulo}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {n.descripcion?.length > 60 ? n.descripcion.substring(0, 60) + '...' : n.descripcion}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${(n.categoria || '').toLowerCase()}`}>
                      {n.categoria}
                    </span>
                  </td>
                  <td>{n.producto}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        flex: 1,
                        height: '8px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        minWidth: '60px'
                      }}>
                        <div style={{
                          width: `${getProgreso(n)}%`,
                          height: '100%',
                          background: getProgreso(n) === 100 ? '#34d399' : '#6366f1',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {n.cantidadCubierta}/{n.cantidadRequerida}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      ...getEstadoBadgeStyle(n.estado),
                      padding: '0.3rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {n.estado}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.9rem' }}>{n.ubicacion}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {n.estado === 'PENDIENTE' && (
                        <button
                          onClick={() => cambiarEstado(n.id, 'EN_PROCESO')}
                          className="action-btn"
                          style={{
                            background: 'rgba(59, 130, 246, 0.2)',
                            color: '#60a5fa',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            padding: '0.4rem 0.7rem',
                            borderRadius: '6px'
                          }}
                        >
                          ▶ Iniciar
                        </button>
                      )}
                      {n.estado === 'EN_PROCESO' && (
                        <button
                          onClick={() => cambiarEstado(n.id, 'CUBIERTA')}
                          className="action-btn"
                          style={{
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#34d399',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            padding: '0.4rem 0.7rem',
                            borderRadius: '6px'
                          }}
                        >
                          ✓ Cubrir
                        </button>
                      )}
                      {n.estado !== 'CUBIERTA' && (
                        <button
                          onClick={() => eliminarNecesidad(n.id)}
                          className="action-btn btn-danger"
                          style={{ fontSize: '0.8rem', padding: '0.4rem 0.7rem', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          ✕ Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {necesidades.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No hay necesidades registradas aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NecesidadesPage;
