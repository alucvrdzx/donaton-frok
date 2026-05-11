import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

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
    </nav>
  );
};

export default Navbar;
