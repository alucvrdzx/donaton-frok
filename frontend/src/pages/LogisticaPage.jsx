import { useState, useEffect } from 'react';

const LogisticaPage = () => {
  const [logistica, setLogistica] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingInv, setLoadingInv] = useState(true);

  const [destino, setDestino] = useState('');
  const [estado, setEstado] = useState('PENDIENTE');
  const [producto, setProducto] = useState('ROPA');
  const [cantidad, setCantidad] = useState('');
  const [detalle, setDetalle] = useState('');

  const fetchLogistica = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/logistica');
      const data = await response.json();
      setLogistica(data);
    } catch (error) {
      console.error("Error al cargar logística:", error);
    }
    setLoading(false);
  };

  const fetchInventario = async () => {
    setLoadingInv(true);
    try {
      const response = await fetch('http://localhost:3001/api/inventario');
      const data = await response.json();
      // Filtrar los que tienen stock > 0
      setInventario(data.filter(item => item.stock > 0));
    } catch (error) {
      console.error("Error al cargar inventario:", error);
    }
    setLoadingInv(false);
  };

  useEffect(() => {
    fetchLogistica();
    fetchInventario();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar cantidad contra inventario disponible
    const itemInventario = inventario.find(i => i.producto === producto && i.detalle === detalle);
    if (!itemInventario) {
      if (!window.confirm(`Advertencia: No se encontró '${detalle}' de tipo '${producto}' en el inventario actual. ¿Deseas enviarlo de todos modos?`)) {
        return;
      }
    } else if (parseFloat(cantidad) > itemInventario.stock) {
      alert(`Error: La cantidad solicitada (${cantidad}) excede el stock disponible (${itemInventario.stock}).`);
      return;
    }

    const nuevoEnvio = {
      destino,
      estado,
      producto,
      cantidad: parseFloat(cantidad),
      detalle
    };

    try {
      await fetch('http://localhost:3001/api/logistica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoEnvio)
      });

      setDestino('');
      setEstado('PENDIENTE');
      setProducto('ROPA');
      setCantidad('');
      setDetalle('');
      fetchLogistica();
      alert("¡Envío logístico creado!");
    } catch (error) {
      alert("Hubo un error al crear el envío.");
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
        fetchInventario(); // Refrescar inventario tras descontar
        alert("¡Envío marcado como entregado! El inventario se actualizó automáticamente.");
      } catch (error) {
        alert("Error al actualizar el estado.");
      }
    }
  };

  const autocompletarDesdeInventario = (item) => {
    setProducto(item.producto || 'ROPA');
    setDetalle(item.detalle || '');
    // Opcional: prellenar con todo el stock, o dejar vacio para que el usuario elija
    // setCantidad(item.stock.toString()); 
  };

  return (
    <div className="page-container">
      <header className="header" style={{ marginBottom: '2rem' }}>
        <h1>Gestión Logística</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Planifica envíos seleccionando recursos directamente del inventario disponible.
        </p>
      </header>

      {/* Grid superior: Formulario + Inventario Dispobible */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>

        {/* Formulario */}
        <div className="stat-card" style={{ textAlign: 'left', margin: 0, height: '100%' }}>
          <h3 style={{ marginTop: 0 }}>Crear Envío</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Selecciona un item del inventario o escribe los detalles manualmente.</p>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <input
              type="text"
              placeholder="Destino (ej: Refugio Norte)"
              required
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <select
                value={producto}
                onChange={(e) => setProducto(e.target.value)}
                
              >
                <option value="ROPA">ROPA</option>
                <option value="ALIMENTO">ALIMENTO</option>
                <option value="BEBESTIBLE">BEBESTIBLE</option>
                <option value="MONETARIA">MONETARIA</option>
              </select>
              <input
                type="text"
                placeholder="Detalle (ej: Arroz)"
                required
                value={detalle}
                onChange={(e) => setDetalle(e.target.value)}
                
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <input
                type="number"
                step="0.01"
                placeholder="Cantidad a enviar"
                required
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                
              />
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                
              >
                <option value="PENDIENTE">PENDIENTE</option>
                <option value="EN_TRANSITO">EN TRÁNSITO</option>
              </select>
            </div>

            <button type="submit" style={{ padding: '1rem', borderRadius: '8px', background: '#f59e0b', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
              Despachar Envío
            </button>
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
                          <span className={`badge badge-${(item.producto || '').toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                            {item.producto}
                          </span>
                          <strong style={{ color: 'var(--text-primary)' }}>{item.detalle || 'Sin detalle'}</strong>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Click para seleccionar
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

      {/* Lista de Envíos */}
      <h3>Envíos Actuales</h3>
      {loading ? <p>Cargando envíos...</p> : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nº Envío</th>
                <th>Destino</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Detalle</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {logistica.map((l) => (
                <tr key={l.id}>
                  <td>#{l.id}</td>
                  <td style={{ fontWeight: '500' }}>{l.destino}</td>
                  <td>
                    <span className={`badge badge-${(l.producto || '').toLowerCase()}`}>
                      {l.producto || '—'}
                    </span>
                  </td>
                  <td>{l.cantidad || '—'}</td>
                  <td>{l.detalle || '—'}</td>
                  <td>
                    <span className={`badge ${l.estado === 'ENTREGADO' ? 'badge-alimento' :
                        l.estado === 'EN_TRANSITO' ? 'badge-ropa' : 'badge-monetaria'
                      }`}>
                      {l.estado}
                    </span>
                  </td>
                  <td>
                    {l.estado !== 'ENTREGADO' ? (
                      <button
                        onClick={() => marcarEntregado(l.id)}
                        className="action-btn"
                        style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', cursor: 'pointer' }}
                      >
                        Marcar Entregado
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>✅ Completado</span>
                    )}
                  </td>
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
