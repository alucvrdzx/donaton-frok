import { useState, useEffect } from 'react';

const InventarioPage = () => {
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);

  const [producto, setProducto] = useState('');
  const [stock, setStock] = useState('');

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
      stock: parseInt(stock)
    };

    try {
      await fetch('http://localhost:3001/api/inventario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoProducto)
      });
      
      setProducto('');
      setStock('');
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
      </header>

      <div className="stat-card" style={{ marginBottom: '3rem', textAlign: 'left' }}>
        <h3>Agregar Producto</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <input 
            type="text" 
            placeholder="Nombre del Producto" 
            required 
            value={producto}
            onChange={(e) => setProducto(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
          />
          <input 
            type="number" 
            placeholder="Cantidad en Stock" 
            required 
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
          />
          <button type="submit" style={{ padding: '1rem', borderRadius: '8px', background: '#10b981', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            Guardar Producto
          </button>
        </form>
      </div>

      <h3>Listado de Inventario</h3>
      {loading ? <p>Cargando...</p> : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Stock Disponible</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {inventario.map((i) => (
                <tr key={i.id}>
                  <td>{i.id}</td>
                  <td style={{ fontWeight: '500' }}>{i.producto}</td>
                  <td>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{i.stock}</span>
                  </td>
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
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
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
