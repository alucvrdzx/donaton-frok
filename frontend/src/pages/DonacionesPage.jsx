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
  const [emailDonante, setEmailDonante] = useState(user?.email || '');
  const [tipoDonacion, setTipoDonacion] = useState('ROPA');
  const [cantidad, setCantidad] = useState('');
  const [detalle, setDetalle] = useState(catalogoProductos['ROPA'][0]);
  const [modoNuevoProducto, setModoNuevoProducto] = useState(false);
  const [productoCustom, setProductoCustom] = useState('');

  // Estado para el toast de confirmación
  const [toast, setToast] = useState({ visible: false, type: '', message: '', submessage: '' });
  const [enviando, setEnviando] = useState(false);

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

  // Auto-cerrar toast después de 5 segundos
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  const mostrarToast = (type, message, submessage = '') => {
    setToast({ visible: true, type, message, submessage });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const detalleFinal = modoNuevoProducto ? productoCustom.trim() : detalle;
    if (!detalleFinal) {
      mostrarToast('error', 'Debes seleccionar o crear un producto.');
      return;
    }

    setEnviando(true);

    const donacionData = {
      nombreDonante,
      emailDonante,
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
        mostrarToast('success', '¡Donación actualizada con éxito!', 'Los cambios se guardaron correctamente.');
      } else {
        // Crear nueva
        const response = await fetch('http://localhost:3001/api/donaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(donacionData)
        });
        const result = await response.json();

        if (result.emailEnviado) {
          mostrarToast('success', '¡Donación registrada con éxito!', `📧 Se envió un correo de confirmación a ${emailDonante}`);
        } else if (emailDonante) {
          mostrarToast('warning', '¡Donación registrada!', 'No se pudo enviar el correo de confirmación, pero la donación quedó registrada.');
        } else {
          mostrarToast('success', '¡Donación registrada con éxito!', 'Gracias por tu generosidad.');
        }
      }
      
      // Limpiar formulario y recargar lista
      cancelarEdicion();
      fetchDonaciones();
    } catch (error) {
      mostrarToast('error', 'Error al procesar la donación', 'Por favor intenta de nuevo.');
    }

    setEnviando(false);
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
    setEmailDonante(user?.email || '');
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
        mostrarToast('success', 'Donación eliminada correctamente.');
        fetchDonaciones();
      } catch (error) {
        mostrarToast('error', 'Error al eliminar la donación.');
      }
    }
  };

  // Estilos del toast
  const toastStyles = {
    container: {
      position: 'fixed',
      top: '2rem',
      right: '2rem',
      zIndex: 9999,
      minWidth: '360px',
      maxWidth: '450px',
      padding: '1.2rem 1.5rem',
      borderRadius: '16px',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
      transform: toast.visible ? 'translateX(0)' : 'translateX(120%)',
      opacity: toast.visible ? 1 : 0,
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      border: '1px solid',
      ...(toast.type === 'success' && {
        background: 'rgba(16, 185, 129, 0.12)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
      }),
      ...(toast.type === 'error' && {
        background: 'rgba(239, 68, 68, 0.12)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
      }),
      ...(toast.type === 'warning' && {
        background: 'rgba(245, 158, 11, 0.12)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
      }),
    },
    icon: {
      fontSize: '1.8rem',
      flexShrink: 0,
      marginTop: '2px',
    },
    closeBtn: {
      position: 'absolute',
      top: '0.8rem',
      right: '0.8rem',
      background: 'none',
      border: 'none',
      color: 'var(--text-secondary)',
      cursor: 'pointer',
      fontSize: '1.1rem',
      padding: '4px',
      lineHeight: 1,
      opacity: 0.6,
      transition: 'opacity 0.2s',
    }
  };

  const toastIcons = { success: '✅', error: '❌', warning: '⚠️' };

  return (
    <div className="page-container">
      <header className="header" style={{ marginBottom: '2rem' }}>
        <h1>Gestión de Donaciones</h1>
      </header>

      {/* Toast de notificación */}
      <div style={toastStyles.container}>
        <span style={toastStyles.icon}>{toastIcons[toast.type]}</span>
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>
            {toast.message}
          </p>
          {toast.submessage && (
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {toast.submessage}
            </p>
          )}
        </div>
        <button 
          style={toastStyles.closeBtn}
          onClick={() => setToast(prev => ({ ...prev, visible: false }))}
          onMouseEnter={e => e.target.style.opacity = '1'}
          onMouseLeave={e => e.target.style.opacity = '0.6'}
        >
          ✕
        </button>
      </div>

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

          {/* Campo de Email — NUEVO */}
          <div style={{ position: 'relative' }}>
            <input 
              type="email" 
              placeholder="Correo electrónico (para recibir confirmación)" 
              value={emailDonante}
              onChange={(e) => setEmailDonante(e.target.value)}
              style={{ paddingLeft: '2.8rem' }}
            />
            <span style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '1.1rem',
              opacity: 0.5,
              pointerEvents: 'none'
            }}>
              📧
            </span>
          </div>

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
            <button 
              type="submit" 
              disabled={enviando}
              style={{ 
                flex: 1, 
                padding: '1rem', 
                borderRadius: '8px', 
                background: enviando 
                  ? 'rgba(99, 102, 241, 0.3)' 
                  : editandoId 
                    ? '#3b82f6' 
                    : 'var(--primary-color)', 
                color: 'white', 
                border: 'none', 
                fontWeight: 'bold', 
                cursor: enviando ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease'
              }}
            >
              {enviando ? (
                <>
                  <span style={{
                    display: 'inline-block',
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}></span>
                  Procesando...
                </>
              ) : (
                editandoId ? 'Actualizar Donación' : 'Registrar Donación'
              )}
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
