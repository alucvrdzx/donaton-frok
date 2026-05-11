import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import './index.css';

function App() {
  return (
    <>
      <Navbar />
      <div className="app-container">
        <main>
          {/* Aquí se renderizarán las páginas según la ruta */}
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default App;
