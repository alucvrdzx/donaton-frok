import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-header">
        <div className="navbar-brand">
          <Link to="/" onClick={closeMenu}>
            <span className="brand-icon">🌟</span>
            <span className="brand-text">Donatón</span>
          </Link>
        </div>
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✖' : '☰'}
        </button>
      </div>
      
      <div className={`navbar-collapse ${isMenuOpen ? 'open' : ''}`}>
        <ul className="navbar-links">
          <li>
            <Link to="/" className={isActive('/')} onClick={closeMenu}>
              🏠 Dashboard
            </Link>
          </li>
          <li>
            <Link to="/donaciones" className={isActive('/donaciones')} onClick={closeMenu}>
              📦 Donaciones
            </Link>
          </li>
          <li>
            <Link to="/inventario" className={isActive('/inventario')} onClick={closeMenu}>
              🗄️ Inventario
            </Link>
          </li>
          <li>
            <Link to="/logistica" className={isActive('/logistica')} onClick={closeMenu}>
              🚚 Logística
            </Link>
          </li>
        </ul>

        <div className="navbar-auth">
          {token ? (
            <div className="auth-user-section">
              <span className="user-greeting">Hola, <b>{user?.correo?.split('@')[0]}</b></span>
              <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
            </div>
          ) : (
            <div className="auth-buttons-section">
              <Link to="/login" className="btn-login" onClick={closeMenu}>Ingresar</Link>
              <Link to="/register" className="btn-register" onClick={closeMenu}>Registrarse</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
