import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  // Credenciales hardcodeadas para facilitar la presentación
  const [correo, setCorreo] = useState('admin@administrador.cl');
  const [clave, setClave] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('https://option-laden-investigator-careful.trycloudflare.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, clave })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Credenciales inválidas');
      }

      // Decodificar el token para obtener el rol, nombre y correo reales
      const base64Url = data.token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decodedToken = JSON.parse(jsonPayload);

      // Guardar token y estado
      login(data.token, { 
        correo: decodedToken.sub, 
        rol: decodedToken.rol,
        nombre: decodedToken.nombre
      });
      
      // Redirigir al inicio
      navigate('/');
      
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
      margin: '2rem 0' 
    }}>
      
      <div className="auth-image" style={{ 
        flex: 1, 
        background: 'url(/images/hero-image.png) center/cover no-repeat', 
        position: 'relative',
        minWidth: '300px'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(15, 23, 42, 0.1), rgba(15, 23, 42, 0.95))' }}></div>
        <div style={{ position: 'absolute', bottom: '3rem', left: '3rem', right: '3rem', color: 'white', textAlign: 'right' }}>
          <h2 style={{ fontSize: '2.5rem', fontFamily: 'Outfit', margin: '0 0 1rem 0' }}>Bienvenido de Vuelta</h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, margin: 0 }}>Tu ayuda sigue haciendo la diferencia. Ingresa para continuar impactando vidas.</p>
        </div>
      </div>

      <div style={{ flex: 1, padding: '4rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--surface-color)' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2.2rem', fontFamily: 'Outfit, sans-serif' }}>Iniciar Sesión</h2>
          
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
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
                style={{ width: '100%', padding: '1rem', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', fontSize: '1rem' }}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)', 
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
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
              }}
              onMouseOver={(e) => { if(!loading) e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseOut={(e) => { if(!loading) e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {loading ? 'Verificando...' : 'Ingresar a mi cuenta'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            ¿Aún no eres parte de Donatón? <br/><Link to="/register" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block', marginTop: '0.5rem' }}>Crea tu cuenta gratuita aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
