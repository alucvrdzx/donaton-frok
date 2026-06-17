import { useState, useEffect } from 'react';
import catalogoProductos from '../data/catalogoProductos';

const InventarioPage = () => {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const rol = user ? user.rol : 'GUEST';

  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);

  // Categorías base del sistema
  const categoriasBase = Object.keys(catalogoProductos);
  // Categorías dinámicas (base + las que ya existen en inventario)
  const categoriasExistentes = [...new Set([
    ...categoriasBase,
    ...inventario.map(i => (i.producto || '').toUpperCase()).filter(Boolean)
  ])].sort();

  const [producto, setProducto] = useState(categoriasBase[0]);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [modoNuevaCategoria, setModoNuevaCategoria] = useState(false);
  const [stock, setStock] = useState('');
  const [detalle, setDetalle] = useState(catalogoProductos[categoriasBase[0]]?.[0] || '');
  const [modoNuevoProducto, setModoNuevoProducto] = useState(false);
  const [productoCustom, setProductoCustom] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('unidades');

  const [editingId, setEditingId] = useState(null);

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
    
    const productoFinal = modoNuevaCategoria ? nuevaCategoria.toUpperCase().trim() : producto;
    const detalleFinal = modoNuevoProducto ? productoCustom.trim() : detalle;

    if (!productoFinal) {
      alert('Debes seleccionar o crear una categoría de producto.');
      return;
    }
    if (!detalleFinal) {
      alert('Debes seleccionar o crear un producto.');
      return;
    }

    const nuevoProducto = {
      producto: productoFinal,
      stock: parseFloat(stock),
      detalle: detalleFinal,
      unidadMedida
    };

    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        await fetch(`http://localhost:3001/api/inventario/${editingId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(nuevoProducto)
        });
        alert("¡Producto actualizado!");
      } else {
        await fetch('http://localhost:3001/api/inventario', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(nuevoProducto)
        });
        alert("¡Producto agregado al inventario!");
      }
      
      setProducto(categoriasBase[0]);
      setNuevaCategoria('');
      setModoNuevaCategoria(false);
      setStock('');
      setDetalle(catalogoProductos[categoriasBase[0]]?.[0] || '');
      setModoNuevoProducto(false);
      setProductoCustom('');
      setUnidadMedida('unidades');
      setEditingId(null);
      fetchInventario();
    } catch (error) {
      alert("Hubo un error al guardar en el inventario.");
    }
  };

  const handleEditInit = (item) => {
    setEditingId(item.id);
    setModoNuevaCategoria(false);
    setModoNuevoProducto(false);
    // Find the actual base category or use the custom one
    let cat = item.producto || categoriasBase[0];
    if (!categoriasExistentes.includes(cat)) {
        setModoNuevaCategoria(true);
        setNuevaCategoria(cat);
    } else {
        setProducto(cat);
    }
    setDetalle(item.detalle || '');
    setStock(item.stock || 0);
    setUnidadMedida(item.unidadMedida || 'unidades');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto del inventario?")) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/inventario/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      fetchInventario();
      alert("Producto eliminado.");
    } catch (error) {
      alert("Error al eliminar el producto.");
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
          <h3>{editingId ? 'Editar Producto' : 'Agregar Producto Manualmente'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {modoNuevaCategoria ? (
              <input
                type="text"
                placeholder="Nombre de la nueva categoría (ej: MEDICAMENTO)"
                required
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value.toUpperCase())}
                style={{ flex: 1, textTransform: 'uppercase' }}
              />
            ) : (
              <select
                value={producto}
                onChange={(e) => {
                  setProducto(e.target.value);
                  setDetalle(catalogoProductos[e.target.value]?.[0] || '');
                  setModoNuevoProducto(false);
                }}
                required
                style={{ flex: 1 }}
              >
                {categoriasExistentes.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => setModoNuevaCategoria(!modoNuevaCategoria)}
              style={{
                padding: '0.7rem 1rem',
                borderRadius: '8px',
                background: modoNuevaCategoria ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                color: modoNuevaCategoria ? '#ef4444' : '#818cf8',
                border: `1px solid ${modoNuevaCategoria ? 'rgba(239, 68, 68, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
                cursor: 'pointer',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                fontSize: '0.85rem'
              }}
            >
              {modoNuevaCategoria ? '✕ Cancelar' : '+ Nueva'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {modoNuevoProducto ? (
              <input
                type="text"
                placeholder="Nombre del producto nuevo"
                required
                value={productoCustom}
                onChange={(e) => setProductoCustom(
                  e.target.value.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase())
                )}
                style={{ flex: 1 }}
              />
            ) : (
              <select
                value={detalle}
                onChange={(e) => setDetalle(e.target.value)}
                required
                style={{ flex: 1 }}
              >
                {(catalogoProductos[modoNuevaCategoria ? '' : producto] || []).map(prod => (
                  <option key={prod} value={prod}>{prod}</option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => setModoNuevoProducto(!modoNuevoProducto)}
              style={{
                padding: '0.7rem 1rem',
                borderRadius: '8px',
                background: modoNuevoProducto ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                color: modoNuevoProducto ? '#ef4444' : '#818cf8',
                border: `1px solid ${modoNuevoProducto ? 'rgba(239, 68, 68, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
                cursor: 'pointer',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                fontSize: '0.85rem'
              }}
            >
              {modoNuevoProducto ? '✕ Cancelar' : '+ Nuevo'}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Detalle o Formato opcional (ej: Caja de 20 uds, Lata de 400g)"
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
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
          <button type="submit" style={{ padding: '1rem', borderRadius: '8px', background: editingId ? '#3b82f6' : '#10b981', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            {editingId ? 'Actualizar Producto' : 'Guardar Producto'}
          </button>
          {editingId && (
            <button type="button" onClick={() => {
                setEditingId(null);
                setProducto(categoriasBase[0]);
                setDetalle(catalogoProductos[categoriasBase[0]]?.[0] || '');
                setStock('');
            }} style={{ padding: '1rem', borderRadius: '8px', background: '#ef4444', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                Cancelar Edición
            </button>
          )}
        </form>
      </div>
      )}

      <h3>Inventario por Categoría</h3>
      {loading ? <p>Cargando...</p> : inventario.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No hay productos en el inventario.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(
            inventario.reduce((grupos, item) => {
              const cat = item.producto || 'SIN CATEGORÍA';
              if (!grupos[cat]) grupos[cat] = [];
              grupos[cat].push(item);
              return grupos;
            }, {})
          ).map(([categoria, items]) => {
            const totalStock = items.reduce((sum, i) => sum + (i.stock || 0), 0);
            const agotados = items.filter(i => i.stock === 0).length;

            return (
              <details key={categoria} className="stat-card" style={{ cursor: 'pointer', padding: 0 }} open>
                <summary style={{
                  padding: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  listStyle: 'none',
                  userSelect: 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className={`badge badge-${categoria.toLowerCase()}`} style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
                      {categoria}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {items.length} {items.length === 1 ? 'producto' : 'productos'}
                      {agotados > 0 && <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>({agotados} agotado{agotados > 1 ? 's' : ''})</span>}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: totalStock > 0 ? '#10b981' : '#ef4444' }}>
                      {totalStock} total
                    </span>
                    <span style={{ fontSize: '1.2rem', transition: 'transform 0.2s ease' }}>▼</span>
                  </div>
                </summary>

                <div style={{ padding: '0 1.5rem 1.5rem' }}>
                  <table className="data-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Producto</th>
                        <th>Detalle</th>
                        <th>Stock</th>
                        <th>Unidad</th>
                        <th>Estado</th>
                        {rol === 'ADMIN' && <th>Acciones</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((i) => (
                        <tr key={i.id}>
                          <td>{i.id}</td>
                          <td style={{ fontWeight: '500' }}>{i.producto || '—'}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{i.detalle || '—'}</td>
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
                          {rol === 'ADMIN' && (
                            <td>
                              <button onClick={() => handleEditInit(i)} style={{ padding: '0.3rem 0.5rem', marginRight: '0.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                              <button onClick={() => handleDelete(i.id)} style={{ padding: '0.3rem 0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InventarioPage;
