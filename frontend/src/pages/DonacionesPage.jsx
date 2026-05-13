import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import catalogoProductos from '../data/catalogoProductos';

const DonacionesPage = () => {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const rol = user ? user.rol : 'GUEST';

  const [donaciones, setDonaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState(null);

  // Estados para el formulario
  const [nombreDonante, setNombreDonante] = useState(user?.nombre || '');
  const [tipoDonacion, setTipoDonacion] = useState('ROPA');
  const [cantidad, setCantidad] = useState('');
  const [detalle, setDetalle] = useState(catalogoProductos['ROPA'][0]);
  const [modoNuevoProducto, setModoNuevoProducto] = useState(false);
  const [productoCustom, setProductoCustom] = useState('');

  const fetchDonaciones = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/donaciones');
      const data = await response.json();
      setDonaciones(data);
    } catch (error) {
      console.error("Error al cargar donaciones:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDonaciones();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const detalleFinal = modoNuevoProducto ? productoCustom.trim() : detalle;
    if (!detalleFinal) {
      alert('Debes seleccionar o crear un producto.');
      return;
    }

    const donacionData = {
      nombreDonante,
      tipoDonacion,
      cantidad: parseFloat(cantidad),
      detalle: detalleFinal
    };

    try {
      if (editandoId) {
        // Actualizar existente
        await fetch(`http://localhost:3001/api/donaciones/${editandoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(donacionData)
        });
        alert("¡Donación actualizada con éxito!");
      } else {
        // Crear nueva
        await fetch('http://localhost:3001/api/donaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(donacionData)
        });
        alert("¡Donación registrada con éxito!");
      }
      
      // Limpiar formulario y recargar lista
      cancelarEdicion();
      fetchDonaciones();
    } catch (error) {
      alert("Hubo un error al procesar la donación.");
    }
  };

  const cargarParaEditar = (donacion) => {
    setEditandoId(donacion.id);
    setNombreDonante(donacion.nombreDonante);
    setTipoDonacion(donacion.tipoDonacion);
    setCantidad(donacion.cantidad);
    
    // Verificar si el detalle existe en el catálogo
    const productosCategoria = catalogoProductos[donacion.tipoDonacion] || [];
    if (productosCategoria.includes(donacion.detalle)) {
      setDetalle(donacion.detalle);
      setModoNuevoProducto(false);
    } else {
      // Producto custom: activar modo texto
      setModoNuevoProducto(true);
      setProductoCustom(donacion.detalle);
    }
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombreDonante(user?.nombre || '');
    setCantidad('');
    setDetalle(catalogoProductos[tipoDonacion]?.[0] || '');
    setTipoDonacion('ROPA');
    setModoNuevoProducto(false);
    setProductoCustom('');
  };

  const eliminarDonacion = async (id) => {
    if(window.confirm("¿Estás seguro de eliminar esta donación?")) {
      try {
        await fetch(`http://localhost:3001/api/donaciones/${id}`, {
          method: 'DELETE'
        });
        fetchDonaciones();
      } catch (error) {
        alert("Error al eliminar.");
      }
    }
  };

  return (
    <div className="page-container">
      <header className="header" style={{ marginBottom: '2rem' }}>
        <h1>Gestión de Donaciones</h1>
      </header>

      {/* Formulario Sencillo */}
      {rol === 'GUEST' ? (
        <div className="stat-card" style={{ marginBottom: '3rem', textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>¡Únete a nuestra causa!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Para registrar una nueva donación necesitas iniciar sesión o crear una cuenta gratuita.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/login" className="btn-login" style={{ padding: '0.8rem 2rem' }}>Iniciar Sesión</Link>
            <Link to="/register" className="btn-register" style={{ padding: '0.8rem 2rem' }}>Crear Cuenta</Link>
          </div>
        </div>
      ) : (
      <div className="stat-card" style={{ marginBottom: '3rem', textAlign: 'left' }}>
        <h3>{editandoId ? `Editando Donación #${editandoId}` : 'Registrar Nueva Donación'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          
          <input 
            type="text" 
            placeholder="Nombre del Donante" 
            required 
            value={nombreDonante}
            onChange={(e) => setNombreDonante(e.target.value)}
            disabled={!!user?.nombre}
            style={user?.nombre ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
          />

          <select 
            value={tipoDonacion}
            onChange={(e) => {
              setTipoDonacion(e.target.value);
              setDetalle(catalogoProductos[e.target.value]?.[0] || '');
              setModoNuevoProducto(false);
            }}
          >
            {Object.keys(catalogoProductos).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

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
                {(catalogoProductos[tipoDonacion] || []).map(prod => (
                  <option key={prod} value={prod}>{prod}</option>
                ))}
              </select>
            )}
            {(rol === 'ADMIN' || rol === 'TRABAJADOR') && (
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
            )}
          </div>

          <input 
            type="number" 
            step="0.01"
            placeholder="Cantidad (ej: 10.5)" 
            required 
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" style={{ flex: 1, padding: '1rem', borderRadius: '8px', background: editandoId ? '#3b82f6' : 'var(--primary-color)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
              {editandoId ? 'Actualizar Donación' : 'Registrar Donación'}
            </button>
            {editandoId && (
              <button type="button" onClick={cancelarEdicion} style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
      )}

      {/* Lista de Donaciones */}
      <h3>Listado Actual</h3>
      {loading ? <p>Cargando...</p> : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Donante</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Detalle</th>
                {rol !== 'USER' && rol !== 'GUEST' && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {donaciones.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td style={{ fontWeight: '500' }}>{d.nombreDonante}</td>
                  <td>
                    <span className={`badge badge-${d.tipoDonacion.toLowerCase()}`}>
                      {d.tipoDonacion}
                    </span>
                  </td>
                  <td>{d.cantidad} {d.unidadMedida}</td>
                  <td>{d.detalle}</td>
                  {rol !== 'USER' && rol !== 'GUEST' && (
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => cargarParaEditar(d)}
                          className="action-btn"
                          style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' }}
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => eliminarDonacion(d.id)}
                          className="action-btn btn-danger"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {donaciones.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No hay donaciones registradas aún.
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

export default DonacionesPage;
