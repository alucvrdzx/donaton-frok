import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import catalogoProductos from '../data/catalogoProductos';
import SkeletonLoader from '../components/SkeletonLoader';
import MapaLogistica from '../components/MapaLogistica';

const LogisticaPage = () => {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const rol = user ? user.rol : 'GUEST';

  const [logistica, setLogistica] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [necesidades, setNecesidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingInv, setLoadingInv] = useState(true);
  const [editandoId, setEditandoId] = useState(null);

  const [destino, setDestino] = useState('');
  const [estado, setEstado] = useState('PENDIENTE');
  const [categoria, setCategoria] = useState(Object.keys(catalogoProductos)[0]);
  const [producto, setProducto] = useState(catalogoProductos[Object.keys(catalogoProductos)[0]][0]);
  const [cantidad, setCantidad] = useState('');
  const [detalle, setDetalle] = useState('');
  const [necesidadId, setNecesidadId] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  const [sedes, setSedes] = useState([]);

  const fetchLogistica = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/logistica');
      const data = await response.json();
      const content = data.content || data;
      setLogistica(content);
    } catch (error) {
      console.error("Error al cargar logística:", error);
    }
    setLoading(false);
  };

  const fetchSedes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sedes');
      const data = await response.json();
      const content = data.content || data;
      setSedes(content);
    } catch (error) {
      console.error("Error al cargar sedes:", error);
    }
  };

  const fetchInventario = async () => {
    setLoadingInv(true);
    try {
      const response = await fetch('http://localhost:3001/api/inventario');
      const data = await response.json();
      const content = data.content || data;
      setInventario(Array.isArray(content) ? content.filter(item => item.stock > 0) : []);
    } catch (error) {
      console.error("Error al cargar inventario:", error);
    }
    setLoadingInv(false);
  };

  const fetchNecesidades = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/necesidades', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await response.json();
      const content = data.content || data;
      setNecesidades(Array.isArray(content) ? content.filter(n => n.estado !== 'CUBIERTA') : []);
    } catch (error) {
      console.error("Error al cargar necesidades:", error);
    }
  };

  useEffect(() => {
    fetchLogistica();
    fetchInventario();
    fetchNecesidades();
    fetchSedes();
  }, []);

  const getStockDisponible = () => {
    const item = inventario.find(i => i.categoria === categoria && i.producto === producto && i.detalle === detalle);
    return item ? item.stock : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const stockDisponible = getStockDisponible();
    const cantidadNum = parseFloat(cantidad);

    // Validar stock al crear (no al editar, porque el editado ya descontó)
    if (!editandoId) {
      if (stockDisponible <= 0) {
        alert(`No hay stock disponible de "${detalle}" en la categoría "${producto}". Primero debe registrarse una donación.`);
        return;
      }
      if (cantidadNum > stockDisponible) {
        alert(`Stock insuficiente. Disponible: ${stockDisponible}. Solicitado: ${cantidadNum}.`);
        return;
      }
    }

    const envioData = {
      destino,
      estado: editandoId ? undefined : estado, // No cambiar estado al editar
      categoria,
      producto,
      cantidad: cantidadNum,
      detalle,
      necesidadId: necesidadId ? parseInt(necesidadId) : null,
      lat: lat !== null && lat !== undefined ? lat : (-33.4489 + (Math.random() - 0.5) * 0.05),
      lng: lng !== null && lng !== undefined ? lng : (-70.6693 + (Math.random() - 0.5) * 0.05)
    };

    try {
      if (editandoId) {
        await fetch(`http://localhost:3001/api/logistica/${editandoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(envioData)
        });
        alert("¡Envío actualizado correctamente!");
      } else {
        await fetch('http://localhost:3001/api/logistica', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...envioData, estado })
        });
        alert("¡Envío logístico creado!");
      }

      cancelarEdicion();
      fetchLogistica();
      fetchInventario();
    } catch (error) {
      alert("Hubo un error al procesar el envío.");
    }
  };

  const editarEnvio = (envio) => {
    setEditandoId(envio.id);
    setDestino(envio.destino || '');
    setCategoria(envio.categoria || Object.keys(catalogoProductos)[0]);
    setProducto(envio.producto || '');
    setCantidad(envio.cantidad?.toString() || '');
    setDetalle(envio.detalle || '');
    setNecesidadId(envio.necesidadId || '');
    setLat(envio.lat || null);
    setLng(envio.lng || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setDestino('');
    setEstado('PENDIENTE');
    setCategoria(Object.keys(catalogoProductos)[0]);
    setProducto(catalogoProductos[Object.keys(catalogoProductos)[0]][0]);
    setCantidad('');
    setDetalle('');
    setNecesidadId('');
    setLat(null);
    setLng(null);
  };

  const eliminarEnvio = async (envio) => {
    const msg = envio.estado === 'ENTREGADO'
      ? `Este envío ya fue entregado. Al eliminarlo, se devolverán ${envio.cantidad} unidades de "${envio.detalle}" al inventario. ¿Continuar?`
      : `¿Eliminar el envío #${envio.id} a "${envio.destino}"?`;
    
    if (window.confirm(msg)) {
      try {
        await fetch(`http://localhost:3001/api/logistica/${envio.id}`, { method: 'DELETE' });
        fetchLogistica();
        fetchInventario();
        alert("Envío eliminado.");
      } catch (error) {
        alert("Error al eliminar el envío.");
      }
    }
  };

  const marcarEntregado = async (id) => {
    if (window.confirm("¿Marcar este envío como ENTREGADO? Se descontará del inventario automáticamente.")) {
      try {
        await fetch(`http://localhost:3001/api/logistica/${id}/estado`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: 'ENTREGADO' })
        });
        fetchLogistica();
        fetchInventario();
        alert("¡Envío marcado como entregado! El inventario se actualizó automáticamente.");
      } catch (error) {
        alert("Error al actualizar el estado.");
      }
    }
  };

  const autocompletarDesdeInventario = (item) => {
    setCategoria(item.categoria || Object.keys(catalogoProductos)[0]);
    setProducto(item.producto || '');
    setDetalle(item.detalle || '');
  };

  const handleNecesidadSelect = (e) => {
    const id = e.target.value;
    setNecesidadId(id);
    if (id) {
      const nec = necesidades.find(n => n.id === parseInt(id));
      if (nec) {
        setDestino(nec.ubicacion || '');
        setCategoria(nec.categoria || Object.keys(catalogoProductos)[0]);
        setProducto(nec.producto || '');
        const faltante = (nec.cantidadRequerida || 0) - (nec.cantidadCubierta || 0);
        setCantidad(faltante > 0 ? faltante.toString() : '');
        setLat(nec.lat || null);
        setLng(nec.lng || null);
      }
    }
  };

  const stockActual = getStockDisponible();

  return (
    <div className="page-container">
      <header className="header" style={{ marginBottom: '2rem' }}>
        <h1>Gestión Logística</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Planifica envíos seleccionando recursos directamente del inventario disponible.
        </p>
      </header>

      {/* Mapa de Rutas Logísticas */}
      <div className="stat-card no-hover" style={{ marginBottom: '2rem', padding: '1.5rem', marginTop: '3rem' }}>
        <h3 style={{ marginTop: 0 }}>Rutas Activas (Mapa en Tiempo Real)</h3>
        {loading ? (
           <SkeletonLoader count={1} type="card" />
        ) : (
           <MapaLogistica envios={logistica} sedes={sedes} necesidades={necesidades} />
        )}
      </div>

      {rol !== 'USER' && rol !== 'GUEST' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>

        {/* Formulario */}
        <div className="stat-card" style={{ textAlign: 'left', margin: 0, height: '100%' }}>
          <h3 style={{ marginTop: 0 }}>
            {editandoId ? `Editando Envío #${editandoId}` : 'Crear Envío'}
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Selecciona un item del inventario o elige del catálogo.
          </p>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <select
              value={necesidadId}
              onChange={handleNecesidadSelect}
              style={{
                border: '1px solid #3b82f6',
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#fff'
              }}
            >
              <option value="">-- Asociar a una Necesidad (Opcional) --</option>
              {necesidades.map(n => (
                <option key={n.id} value={n.id}>
                  #{n.id} - {n.titulo} ({n.producto})
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Destino (ej: Refugio Norte)"
              required
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
            </div>
            <input
              type="text"
              placeholder="Detalle o Formato"
              required
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
            />

            {/* Indicador de stock disponible */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <input
                type="number"
                step="0.01"
                placeholder="Cantidad a enviar"
                required
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                style={{ flex: 1 }}
              />
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 'bold',
                color: stockActual > 0 ? '#10b981' : '#ef4444',
                whiteSpace: 'nowrap'
              }}>
                Stock: {stockActual}
              </span>
            </div>

            {!editandoId && (
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              >
                <option value="PENDIENTE">PENDIENTE</option>
                <option value="EN_TRANSITO">EN TRÁNSITO</option>
              </select>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={!editandoId && stockActual <= 0}
                style={{
                  flex: 1,
                  padding: '1rem',
                  borderRadius: '8px',
                  background: editandoId ? '#3b82f6' : (stockActual > 0 ? '#f59e0b' : '#6b7280'),
                  color: 'white',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: !editandoId && stockActual <= 0 ? 'not-allowed' : 'pointer',
                  opacity: !editandoId && stockActual <= 0 ? 0.5 : 1
                }}
              >
                {editandoId ? 'Actualizar Envío' : (stockActual > 0 ? 'Despachar Envío' : 'Sin Stock Disponible')}
              </button>
              {editandoId && (
                <button
                  type="button"
                  onClick={cancelarEdicion}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'var(--text-primary)',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Panel de Inventario Rápido */}
        <div className="stat-card" style={{ textAlign: 'left', margin: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Inventario Disponible</span>
            <button
              onClick={fetchInventario}
              style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
            >
              Refrescar
            </button>
          </h3>

          {loadingInv ? <p>Cargando inventario...</p> : (
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '350px', paddingRight: '0.5rem' }}>
              {inventario.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>No hay stock disponible.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {inventario.map((item) => (
                    <li
                      key={item.id}
                      onClick={() => autocompletarDesdeInventario(item)}
                      style={{
                        background: 'rgba(15, 23, 42, 0.4)',
                        border: '1px solid var(--surface-border)',
                        borderRadius: '12px',
                        padding: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.transform = 'translateX(5px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(15, 23, 42, 0.4)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                          <span className={`badge badge-${(item.categoria || '').toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                            {item.categoria}
                          </span>
                          <strong style={{ color: 'var(--text-primary)' }}>{item.producto}</strong>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {item.detalle || 'Sin detalle'} (Click para seleccionar)
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>{item.stock}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.unidadMedida || 'uds'}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        </div>
      )}

      {/* Lista de Envíos */}
      <h3>Envíos Actuales</h3>
      {loading ? <p>Cargando envíos...</p> : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nº Envío</th>
                <th>Destino</th>
                <th>Categoría</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Detalle</th>
                <th>Estado</th>
                {rol !== 'USER' && rol !== 'GUEST' && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {logistica.map((l) => (
                <tr key={l.id} style={editandoId === l.id ? { background: 'rgba(59, 130, 246, 0.1)' } : {}}>
                  <td>#{l.id}</td>
                  <td style={{ fontWeight: '500' }}>{l.destino}</td>
                  <td>
                    <span className={`badge badge-${(l.categoria || '').toLowerCase()}`}>
                      {l.categoria || '—'}
                    </span>
                  </td>
                  <td>{l.producto || '—'}</td>
                  <td>{l.cantidad || '—'}</td>
                  <td>{l.detalle || '—'}</td>
                  <td>
                    <span className={`badge ${l.estado === 'ENTREGADO' ? 'badge-alimento' :
                        l.estado === 'EN_TRANSITO' ? 'badge-ropa' : 'badge-monetaria'
                      }`}>
                      {l.estado}
                    </span>
                  </td>
                  {rol !== 'USER' && rol !== 'GUEST' && (
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {l.estado !== 'ENTREGADO' && (
                          <button
                            onClick={() => marcarEntregado(l.id)}
                            className="action-btn"
                            style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', cursor: 'pointer', fontSize: '0.8rem', padding: '0.4rem 0.7rem', borderRadius: '6px' }}
                          >
                            ✓ Entregar
                          </button>
                        )}
                        <button
                          onClick={() => editarEnvio(l)}
                          className="action-btn"
                          style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', cursor: 'pointer', fontSize: '0.8rem', padding: '0.4rem 0.7rem', borderRadius: '6px' }}
                        >
                          ✎ Editar
                        </button>
                        <button
                          onClick={() => eliminarEnvio(l)}
                          className="action-btn"
                          style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', cursor: 'pointer', fontSize: '0.8rem', padding: '0.4rem 0.7rem', borderRadius: '6px' }}
                        >
                          ✕ Eliminar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {logistica.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No hay envíos registrados.
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

export default LogisticaPage;
