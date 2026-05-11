import { useState, useEffect } from 'react';

const DonacionesPage = () => {
  const [donaciones, setDonaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState(null);

  // Estados para el formulario
  const [nombreDonante, setNombreDonante] = useState('');
  const [tipoDonacion, setTipoDonacion] = useState('ROPA');
  const [cantidad, setCantidad] = useState('');
  const [detalle, setDetalle] = useState('');

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
    
    const donacionData = {
      nombreDonante,
      tipoDonacion,
      cantidad: parseFloat(cantidad),
      detalle
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
    setDetalle(donacion.detalle);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombreDonante('');
    setCantidad('');
    setDetalle('');
    setTipoDonacion('ROPA');
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
      <div className="stat-card" style={{ marginBottom: '3rem', textAlign: 'left' }}>
        <h3>{editandoId ? `Editando Donación #${editandoId}` : 'Registrar Nueva Donación'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          
          <input 
            type="text" 
            placeholder="Nombre del Donante" 
            required 
            value={nombreDonante}
            onChange={(e) => setNombreDonante(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
          />

          <select 
            value={tipoDonacion}
            onChange={(e) => setTipoDonacion(e.target.value)}
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
            placeholder="Cantidad (ej: 10.5)" 
            required 
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
          />

          <input 
            type="text" 
            placeholder="Detalle (ej: 5 pantalones azules)" 
            required 
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
          />

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" style={{ flex: 1, padding: '1rem', borderRadius: '8px', background: editandoId ? '#3b82f6' : 'var(--primary-color)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
              {editandoId ? 'Actualizar Donación' : 'Registrar Donación'}
            </button>
            {editandoId && (
              <button type="button" onClick={cancelarEdicion} style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

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
                <th>Acciones</th>
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
