import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminSidebar from './components/AdminSidebar';
import './index.css';

function App() {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const rol = user ? user.rol : 'GUEST';
  const location = useLocation();

  const isLaboral = (rol === 'ADMIN' || rol === 'TRABAJADOR');

  if (isLaboral) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
        <AdminSidebar rol={rol} />
        <div style={{ flex: 1, marginLeft: '260px', padding: '2rem', width: 'calc(100% - 260px)' }}>
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="app-container">
        <main>
          {/* Aquí se renderizarán las páginas según la ruta */}
          <Outlet />
        </main>
      </div>
      <Footer />
    </>
  );
}

export default App;
