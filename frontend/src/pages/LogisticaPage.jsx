import { useState, useEffect } from 'react';

const LogisticaPage = () => {
  const [logistica, setLogistica] = useState([]);
  const [loading, setLoading] = useState(true);

  const [destino, setDestino] = useState('');
  const [estado, setEstado] = useState('En Preparación');

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
      estado
    };

    try {
      await fetch('http://localhost:3001/api/logistica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoEnvio)
      });
      
      setDestino('');
      setEstado('En Preparación');
      fetchLogistica();
      alert("¡Envío logístico creado!");
    } catch (error) {
      alert("Hubo un error al crear el envío.");
    }
  };

  return (
    <div className="page-container">
      <header className="header" style={{ marginBottom: '2rem' }}>
        <h1>Gestión Logística</h1>
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
          <select 
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
          >
            <option value="En Preparación">En Preparación</option>
            <option value="En Tránsito">En Tránsito</option>
            <option value="Entregado">Entregado</option>
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
                <th>Estado Logístico</th>
              </tr>
            </thead>
            <tbody>
              {logistica.map((l) => (
                <tr key={l.id}>
                  <td>#{l.id}</td>
                  <td style={{ fontWeight: '500' }}>{l.destino}</td>
                  <td>
                    <span className={`badge ${
                      l.estado === 'Entregado' ? 'badge-alimento' :
                      l.estado === 'En Tránsito' ? 'badge-ropa' : 'badge-monetaria'
                    }`}>
                      {l.estado}
                    </span>
                  </td>
                </tr>
              ))}
              {logistica.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
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
