import { useState, useEffect } from 'react';

const HomePage = () => {
  const [stats, setStats] = useState({
    donaciones: [],
    inventario: [],
    logistica: [],
    necesidades: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [resDonaciones, resInventario, resLogistica, resNecesidades] = await Promise.all([
          fetch('https://option-laden-investigator-careful.trycloudflare.com/api/donaciones').catch(() => ({ ok: false })),
          fetch('https://option-laden-investigator-careful.trycloudflare.com/api/inventario').catch(() => ({ ok: false })),
          fetch('https://option-laden-investigator-careful.trycloudflare.com/api/logistica').catch(() => ({ ok: false })),
          fetch('https://option-laden-investigator-careful.trycloudflare.com/api/necesidades').catch(() => ({ ok: false }))
        ]);

        const rawDonaciones = resDonaciones.ok ? await resDonaciones.json() : [];
        const rawInventario = resInventario.ok ? await resInventario.json() : [];
        const rawLogistica = resLogistica.ok ? await resLogistica.json() : [];
        const rawNecesidades = resNecesidades.ok ? await resNecesidades.json() : [];

        const donaciones = rawDonaciones.content || rawDonaciones;
        const inventario = rawInventario.content || rawInventario;
        const logistica = rawLogistica.content || rawLogistica;
        const necesidades = rawNecesidades.content || rawNecesidades;

        setStats({ donaciones, inventario, logistica, necesidades });
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
    <div className="home-page-wrapper">

      {/* 1. SECCIÓN DE HÉROE (BANNER PRINCIPAL CON IMAGEN) */}
      <section className="hero-section">
        <img src="/images/hero-image.png" alt="Voluntarios Donatón entregando ayuda" className="hero-img" />
        {/* Gradiente sutil para que el texto sea legible */}
        <div className="hero-gradient"></div>
        <div className="hero-text-container">
          <h1 className="hero-title">Donatón: Transparencia en Cada Ayuda.</h1>
          <p className="hero-subtitle">Mejorando la gestión humanitaria desde nuestra fundación.</p>
        </div>
      </section>

      {/* 2. CONTENEDOR PRINCIPAL SUPERPUESTO */}
      <div className="home-content-container">

        {/* QUIÉNES SOMOS */}
        <section className="info-grid-container">
          {/* Columna Texto */}
          <div className="info-text-col">
            <h2 className="info-title">QUIÉNES SOMOS</h2>
            <p className="info-desc">
              Donatón es una ONG dedicada a transformar la gestión de ayudas humanitarias.
              Fundada con la visión de centralizar y eficientar la logística para asegurar
              que cada recurso llegue a quienes más lo necesitan, de manera rápida, segura y transparente.
            </p>
          </div>

          {/* Columna Imagen */}
          <div className="info-img-col">
            <img src="/images/team-image.png" alt="Equipo Donatón planificando logística" className="info-img" />
          </div>
        </section>

        {/* 3. SECCIÓN DE ESTADÍSTICAS */}
        <section className="stats-grid-container">
          <div className="stat-card stat-donaciones">
            <div className="stat-label">Total Donaciones</div>
            <div className="stat-value">{stats.donaciones.length}</div>
          </div>
          <div className="stat-card stat-inventario">
            <div className="stat-label">Productos en Inventario</div>
            <div className="stat-value">{stats.inventario.length}</div>
          </div>
          <div className="stat-card stat-logistica">
            <div className="stat-label">Envíos Logísticos</div>
            <div className="stat-value">{stats.logistica.length}</div>
          </div>
          <div className="stat-card stat-necesidades">
            <div className="stat-label">Necesidades Activas</div>
            <div className="stat-value">{Array.isArray(stats.necesidades) ? stats.necesidades.filter(n => n.estado !== 'CUBIERTA').length : 0}</div>
          </div>
        </section>

        {/* 4. ESTADO DE MICROSERVICIOS */}
        <div className="stat-card microservices-card">
          <h2 className="microservices-title">
            🌐 Estado de Microservicios
          </h2>
          <div className="microservices-grid">
            <div className="ms-status">
              <span className="ms-icon">✅</span> <b>Servicio de Donaciones</b>
            </div>
            <div className="ms-status">
              <span className="ms-icon">✅</span> <b>Servicio de Inventario</b>
            </div>
            <div className="ms-status">
              <span className="ms-icon">✅</span> <b>Servicio de Logística</b>
            </div>
            <div className="ms-status">
              <span className="ms-icon">✅</span> <b>Servicio de Necesidades</b>
            </div>
            <div className="ms-status">
              <span className="ms-icon">✅</span> <b>API Gateway</b>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
