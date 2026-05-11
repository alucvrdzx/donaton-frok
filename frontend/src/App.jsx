import { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [donaciones, setDonaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonaciones = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/donaciones');
        if (!response.ok) {
          throw new Error('No se pudo conectar con el servidor BFF');
        }
        const data = await response.json();
        setDonaciones(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDonaciones();
  }, []);

  // Función para formatear fechas bonitas
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Función para obtener la clase CSS según el tipo de donación
  const getTypeClass = (tipo) => {
    if (!tipo) return 'type-ropa'; // Default
    return `type-${tipo.toLowerCase()}`;
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Donatón Global</h1>
        <p>Plataforma Humanitaria Centralizada</p>
      </header>

      {/* Stats Section */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{donaciones.length}</div>
          <div className="stat-label">Total Donaciones</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {donaciones.filter(d => d.tipoDonacion === 'ALIMENTO').length}
          </div>
          <div className="stat-label">Alimentos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {donaciones.filter(d => d.tipoDonacion === 'ROPA').length}
          </div>
          <div className="stat-label">Ropa</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {donaciones.filter(d => d.tipoDonacion === 'MONETARIA').length}
          </div>
          <div className="stat-label">Monetarias</div>
        </div>
      </section>

      {/* Main Content */}
      <main>
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Conectando con la red de microservicios...</p>
          </div>
        ) : error ? (
          <div className="empty-state" style={{ borderColor: 'rgba(244, 63, 94, 0.5)' }}>
            <h2>⚠️ Error de Conexión</h2>
            <p>{error}</p>
          </div>
        ) : donaciones.length === 0 ? (
          <div className="empty-state">
            <h2>Aún no hay donaciones</h2>
            <p>Sé el primero en hacer un aporte a través del API Gateway.</p>
          </div>
        ) : (
          <div className="donations-grid">
            {donaciones.map((donacion) => (
              <div key={donacion.id} className={`donation-card ${getTypeClass(donacion.tipoDonacion)}`}>
                
                <div className="card-header">
                  <div>
                    <h3 className="donante-name">{donacion.nombreDonante}</h3>
                    <span className="fecha">{formatDate(donacion.fechaDonacion)}</span>
                  </div>
                  <span className="tipo-badge">{donacion.tipoDonacion}</span>
                </div>

                <div className="cantidad-display">
                  <span className="cantidad-val">
                    {donacion.tipoDonacion === 'MONETARIA' ? '$' : ''}
                    {donacion.cantidad.toLocaleString('es-CL')}
                  </span>
                  <span className="cantidad-unit">{donacion.unidadMedida}</span>
                </div>

                <div className="detalle-box">
                  <p>{donacion.detalle}</p>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
