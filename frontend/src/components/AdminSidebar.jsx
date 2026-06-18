import { Link, useLocation, useNavigate } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = ({ rol }) => {
  const location = useLocation();
  const navigate = useNavigate();
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
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">🌟</span>
        <span className="brand-text">Donatón</span>
        <span className="badge-role">{rol}</span>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{user?.nombre?.charAt(0).toUpperCase() || 'U'}</div>
        <div className="user-info">
          <p className="user-name">{user?.nombre || 'Usuario'}</p>
          <p className="user-email">{user?.correo}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link to="/" className={isActive('/')}>
              <span className="nav-icon">🏠</span> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/donaciones" className={isActive('/donaciones')}>
              <span className="nav-icon">📦</span> Donaciones
            </Link>
          </li>
          <li>
            <Link to="/inventario" className={isActive('/inventario')}>
              <span className="nav-icon">🗄️</span> Inventario
            </Link>
          </li>
          <li>
            <Link to="/logistica" className={isActive('/logistica')}>
              <span className="nav-icon">🚚</span> Logística
            </Link>
          </li>
          <li>
            <Link to="/necesidades" className={isActive('/necesidades')}>
              <span className="nav-icon">🆘</span> Necesidades
            </Link>
          </li>
          {rol === 'ADMIN' && (
            <li>
              <Link to="/usuarios" className={isActive('/usuarios')}>
                <span className="nav-icon">👥</span> Usuarios
              </Link>
            </li>
          )}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="btn-sidebar-logout">
          🚪 Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
