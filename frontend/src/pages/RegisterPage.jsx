import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('https://option-laden-investigator-careful.trycloudflare.com/api/auth/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, clave })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Error al registrar');
      }

      // Registro exitoso, redirigir a login
      navigate('/login');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '75vh', 
      borderRadius: '24px', 
      overflow: 'hidden', 
      boxShadow: '0 20px 50px rgba(0,0,0,0.4)', 
      background: 'rgba(30, 41, 59, 0.4)', 
      backdropFilter: 'blur(20px)', 
      border: '1px solid var(--surface-border)', 
      margin: '2rem 0',
      flexDirection: 'row-reverse'
    }}>
      
      <div className="auth-image" style={{ 
        flex: 1, 
        background: 'url(/images/team-image.png) center/cover no-repeat', 
        position: 'relative',
        minWidth: '300px'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(15, 23, 42, 0.1), rgba(15, 23, 42, 0.95))' }}></div>
        <div style={{ position: 'absolute', bottom: '3rem', left: '3rem', right: '3rem', color: 'white', textAlign: 'left' }}>
          <h2 style={{ fontSize: '2.5rem', fontFamily: 'Outfit', margin: '0 0 1rem 0' }}>Súmate al Equipo</h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, margin: 0 }}>Crea tu cuenta hoy y comienza a realizar donaciones rastreables y transparentes.</p>
        </div>
      </div>

      <div style={{ flex: 1, padding: '4rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--surface-color)' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2.2rem', fontFamily: 'Outfit, sans-serif' }}>Crear Cuenta</h2>
          
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Nombre Completo</label>
              <input 
                type="text" 
                placeholder="Juan Pérez" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                style={{ width: '100%', padding: '1rem', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', fontSize: '1rem' }}
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Correo Electrónico</label>
              <input 
                type="email" 
                placeholder="donante@ejemplo.com" 
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                style={{ width: '100%', padding: '1rem', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', fontSize: '1rem' }}
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                required
                minLength={6}
                style={{ width: '100%', padding: '1rem', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', fontSize: '1rem' }}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                color: 'white', 
                padding: '1.2rem', 
                border: 'none', 
                borderRadius: '10px', 
                fontWeight: 'bold', 
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '1rem',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.3s ease',
                fontSize: '1.1rem',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
              }}
              onMouseOver={(e) => { if(!loading) e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseOut={(e) => { if(!loading) e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {loading ? 'Creando cuenta...' : 'Comenzar ahora'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            ¿Ya tienes una cuenta? <br/><Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block', marginTop: '0.5rem' }}>Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
