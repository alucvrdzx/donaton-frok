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
    <div className="home-page" style={{
      // Anulamos el padding lateral del contenedor para que la imagen ocupe todo el ancho
      margin: '-3rem -1.5rem',
      paddingBottom: '2rem'
    }}>

      {/* 1. SECCIÓN DE HÉROE (BANNER PRINCIPAL CON IMAGEN) */}
      <section className="hero-section" style={{
        position: 'relative',
        height: '450px',
        width: '100%',
        overflow: 'hidden'
      }}>
        <img src="/images/hero-image.png" alt="Voluntarios Donatón entregando ayuda" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* Gradiente sutil para que el texto sea legible */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0) 100%)' }}></div>
        <div style={{ position: 'absolute', bottom: '6rem', left: '3rem', right: '3rem', color: 'var(--text-primary)' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', fontFamily: 'Outfit, sans-serif' }}>Donatón: Transparencia en Cada Ayuda.</h1>
          <p style={{ fontSize: '1.4rem', margin: 0, opacity: 0.9 }}>Mejorando la gestión humanitaria desde nuestra fundación.</p>
        </div>
      </section>

      {/* 2. CONTENEDOR PRINCIPAL SUPERPUESTO */}
      <div style={{
        position: 'relative',
        marginTop: '-4rem', // Efecto de superposición sobre la imagen
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '0 3rem'
      }}>

        {/* QUIÉNES SOMOS */}
        <section className="info-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          background: 'var(--surface-color)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--surface-border)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 15px 35px rgba(0,0,0,0.3)'
        }}>
          {/* Columna Texto */}
          <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '1.3rem', margin: '0 0 1rem 0', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)' }}>QUIÉNES SOMOS</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', margin: 0, fontSize: '1.1rem' }}>
              Donatón es una ONG dedicada a transformar la gestión de ayudas humanitarias.
              Fundada con la visión de centralizar y eficientar la logística para asegurar
              que cada recurso llegue a quienes más lo necesitan, de manera rápida, segura y transparente.
            </p>
          </div>

          {/* Columna Imagen */}
          <div style={{ height: '100%', minHeight: '300px' }}>
            <img src="/images/team-image.png" alt="Equipo Donatón planificando logística" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </section>

        {/* 3. SECCIÓN DE ESTADÍSTICAS */}
        <section className="stats-grid" style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          <div className="stat-card" style={{ borderTop: '5px solid #8b5cf6', margin: 0, padding: '2rem', textAlign: 'left' }}>
            <div className="stat-label" style={{ marginBottom: '0.8rem', color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '1rem' }}>Total Donaciones</div>
            <div className="stat-value" style={{ margin: 0, fontSize: '3.5rem' }}>{stats.donaciones.length}</div>
          </div>
          <div className="stat-card" style={{ borderTop: '5px solid #10b981', margin: 0, padding: '2rem', textAlign: 'left' }}>
            <div className="stat-label" style={{ marginBottom: '0.8rem', color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '1rem' }}>Productos en Inventario</div>
            <div className="stat-value" style={{ margin: 0, fontSize: '3.5rem' }}>{stats.inventario.length}</div>
          </div>
          <div className="stat-card" style={{ borderTop: '5px solid #f59e0b', margin: 0, padding: '2rem', textAlign: 'left' }}>
            <div className="stat-label" style={{ marginBottom: '0.8rem', color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '1rem' }}>Envíos Logísticos</div>
            <div className="stat-value" style={{ margin: 0, fontSize: '3.5rem' }}>{stats.logistica.length}</div>
          </div>
        </section>

        {/* 4. ESTADO DE MICROSERVICIOS */}
        <div className="stat-card" style={{ textAlign: 'left', padding: '2rem 3rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            🌐 Estado de Microservicios
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#10b981', fontSize: '1.4rem' }}>✅</span> <b>Servicio de Donaciones</b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#10b981', fontSize: '1.4rem' }}>✅</span> <b>Servicio de Inventario</b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#10b981', fontSize: '1.4rem' }}>✅</span> <b>Servicio de Logística</b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#10b981', fontSize: '1.4rem' }}>✅</span> <b>API Gateway</b>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
