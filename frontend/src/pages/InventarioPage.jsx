import { useState, useEffect } from 'react';

const InventarioPage = () => {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const rol = user ? user.rol : 'GUEST';

  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);

  const [producto, setProducto] = useState('');
  const [stock, setStock] = useState('');
  const [detalle, setDetalle] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('unidades');

  const fetchInventario = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/inventario');
      const data = await response.json();
      setInventario(data);
    } catch (error) {
      console.error("Error al cargar inventario:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInventario();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const nuevoProducto = {
      producto,
      stock: parseFloat(stock),
      detalle,
      unidadMedida
    };

    try {
      await fetch('http://localhost:3001/api/inventario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoProducto)
      });
      
      setProducto('');
      setStock('');
      setDetalle('');
      setUnidadMedida('unidades');
      fetchInventario();
      alert("¡Producto agregado al inventario!");
    } catch (error) {
      alert("Hubo un error al guardar en el inventario.");
    }
  };

  return (
    <div className="page-container">
      <header className="header" style={{ marginBottom: '2rem' }}>
        <h1>Gestión de Inventario</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          El inventario se actualiza automáticamente con cada donación recibida vía RabbitMQ
        </p>
      </header>

      {rol !== 'USER' && rol !== 'GUEST' && (
        <div className="stat-card" style={{ marginBottom: '3rem', textAlign: 'left' }}>
          <h3>Agregar Producto Manualmente</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <input 
            type="text" 
            placeholder="Tipo de Producto (ej: ROPA, ALIMENTO)" 
            required 
            value={producto}
            onChange={(e) => setProducto(e.target.value)}
            
          />
          <input 
            type="text" 
            placeholder="Detalle (ej: Camisetas, Arroz)" 
            required 
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input 
              type="number" 
              step="0.01"
              placeholder="Stock" 
              required 
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              
            />
            <select 
              value={unidadMedida}
              onChange={(e) => setUnidadMedida(e.target.value)}
              
            >
              <option value="unidades">Unidades</option>
              <option value="kilos">Kilos</option>
              <option value="litros">Litros</option>
              <option value="pesos">Pesos</option>
            </select>
          </div>
          <button type="submit" style={{ padding: '1rem', borderRadius: '8px', background: '#10b981', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            Guardar Producto
          </button>
        </form>
      </div>
      )}

      <h3>Listado de Inventario</h3>
      {loading ? <p>Cargando...</p> : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Detalle</th>
                <th>Stock</th>
                <th>Unidad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {inventario.map((i) => (
                <tr key={i.id}>
                  <td>{i.id}</td>
                  <td>
                    <span className={`badge badge-${(i.producto || '').toLowerCase()}`}>
                      {i.producto}
                    </span>
                  </td>
                  <td style={{ fontWeight: '500' }}>{i.detalle || '—'}</td>
                  <td>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{i.stock}</span>
                    {i.unidadMedida && <span style={{ color: 'var(--text-secondary)', marginLeft: '0.3rem' }}>{i.unidadMedida}</span>}
                  </td>
                  <td>{i.unidadMedida || '—'}</td>
                  <td>
                    {i.stock === 0 ? (
                      <span className="badge badge-danger" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>Agotado</span>
                    ) : i.stock < 10 ? (
                      <span className="badge badge-monetaria">Stock Bajo</span>
                    ) : (
                      <span className="badge badge-alimento">En Stock</span>
                    )}
                  </td>
                </tr>
              ))}
              {inventario.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No hay productos en el inventario.
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

export default InventarioPage;
