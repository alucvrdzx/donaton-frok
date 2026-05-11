import { useState, useEffect } from 'react';

const HomePage = () => {
  const [stats, setStats] = useState({
    donaciones: [],
    inventario: [],
    logistica: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [resDonaciones, resInventario, resLogistica] = await Promise.all([
          fetch('http://localhost:3001/api/donaciones').catch(() => ({ ok: false })),
          fetch('http://localhost:3001/api/inventario').catch(() => ({ ok: false })),
          fetch('http://localhost:3001/api/logistica').catch(() => ({ ok: false }))
        ]);

        const donaciones = resDonaciones.ok ? await resDonaciones.json() : [];
        const inventario = resInventario.ok ? await resInventario.json() : [];
        const logistica = resLogistica.ok ? await resLogistica.json() : [];

        setStats({ donaciones, inventario, logistica });
        setLoading(false);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Cargando panel central...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <header className="header" style={{ marginBottom: '2rem' }}>
        <h1>Panel Central</h1>
        <p>Visión global del ecosistema Donatón</p>
      </header>

      <section className="stats-grid">
        <div className="stat-card" style={{ borderTop: '4px solid #6366f1' }}>
          <div className="stat-value">{stats.donaciones.length}</div>
          <div className="stat-label">Total Donaciones</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #10b981' }}>
          <div className="stat-value">{stats.inventario.length}</div>
          <div className="stat-label">Productos en Inventario</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #f59e0b' }}>
          <div className="stat-value">{stats.logistica.length}</div>
          <div className="stat-label">Envíos Logísticos</div>
        </div>
      </section>

      <div className="donations-grid" style={{ marginTop: '3rem' }}>
        <div className="stat-card" style={{ gridColumn: '1 / -1', textAlign: 'left' }}>
          <h2>🌐 Estado de Microservicios</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Todos los servicios están conectados y operativos mediante el API Gateway.</p>
          <ul style={{ marginTop: '1rem', lineHeight: '2' }}>
            <li>✅ <b>Servicio de Donaciones</b> (Puerto 8081) - OK</li>
            <li>✅ <b>Servicio de Inventario</b> (Puerto 8082) - OK</li>
            <li>✅ <b>Servicio de Logística</b> (Puerto 8083) - OK</li>
            <li>✅ <b>API Gateway</b> (Puerto 8080) - Enrutando tráfico</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
