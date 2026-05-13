import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <span className="brand-icon">🌟</span>
          <span className="brand-text">Donatón</span>
        </Link>
      </div>
      
      <ul className="navbar-links">
        <li>
          <Link to="/" className={isActive('/')}>
            🏠 Dashboard
          </Link>
        </li>
        <li>
          <Link to="/donaciones" className={isActive('/donaciones')}>
            📦 Donaciones
          </Link>
        </li>
        <li>
          <Link to="/inventario" className={isActive('/inventario')}>
            🗄️ Inventario
          </Link>
        </li>
        <li>
          <Link to="/logistica" className={isActive('/logistica')}>
            🚚 Logística
          </Link>
        </li>
      </ul>

      <div className="navbar-auth">
        {token ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Hola, <b>{user?.correo?.split('@')[0]}</b></span>
            <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login" className="btn-login">Ingresar</Link>
            <Link to="/register" className="btn-register">Registrarse</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
