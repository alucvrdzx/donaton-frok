import { Toaster } from 'sonner';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminSidebar from './components/AdminSidebar';
import { useAuth } from './context/AuthContext';
import './index.css';

function App() {
  const { user } = useAuth();
  const rol = user ? user.rol : 'GUEST';
  const location = useLocation();

  const isLaboral = (rol === 'ADMIN' || rol === 'TRABAJADOR');

  if (isLaboral) {
    return (
      <div className="admin-layout">
        <Toaster richColors position="top-right" />
        <AdminSidebar rol={rol} />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster richColors position="top-right" />
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
