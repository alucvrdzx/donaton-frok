import { useState, useEffect } from 'react';

const LogisticaPage = () => {
  const [logistica, setLogistica] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchLogistica();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
        alert("¡Envío marcado como entregado! El inventario se actualizó automáticamente.");
      } catch (error) {
        alert("Error al actualizar el estado.");
      }
    }
  };

  return (
    <div className="page-container">
      <header className="header" style={{ marginBottom: '2rem' }}>
        <h1>Gestión Logística</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Al marcar un envío como ENTREGADO, el inventario se descuenta automáticamente vía RabbitMQ
        </p>
      </header>

      <div className="stat-card" style={{ marginBottom: '3rem', textAlign: 'left' }}>
        <h3>Crear Envío</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <input 
            type="text" 
            placeholder="Destino (ej: Refugio Norte)" 
            required 
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <select 
              value={producto}
              onChange={(e) => setProducto(e.target.value)}
              style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            >
              <option value="ROPA">ROPA</option>
              <option value="ALIMENTO">ALIMENTO</option>
              <option value="BEBESTIBLE">BEBESTIBLE</option>
              <option value="MONETARIA">MONETARIA</option>
            </select>
            <input 
              type="number" 
              step="0.01"
              placeholder="Cantidad" 
              required 
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            />
          </div>
          <input 
            type="text" 
            placeholder="Detalle del producto (ej: Camisetas, Arroz)" 
            required 
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
          />
          <select 
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
          >
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="EN_TRANSITO">EN TRÁNSITO</option>
          </select>
          <button type="submit" style={{ padding: '1rem', borderRadius: '8px', background: '#f59e0b', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            Despachar Envío
          </button>
        </form>
      </div>

      <h3>Envíos Actuales</h3>
      {loading ? <p>Cargando...</p> : (
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
                    <span className={`badge ${
                      l.estado === 'ENTREGADO' ? 'badge-alimento' :
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
