import './Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h3>🌟 Donatón</h3>
          <p>Mejorando la gestión humanitaria desde nuestra fundación. Entregando recursos a quienes más lo necesitan, de manera transparente y eficiente.</p>
        </div>

        <div className="footer-links">
          <h4>Enlaces Rápidos</h4>
          <ul>
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/donaciones">Donaciones</Link></li>
            <li><Link to="/inventario">Inventario</Link></li>
            <li><Link to="/logistica">Logística</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contacto</h4>
          <p>📍 Santiago, Chile</p>
          <p>📧 contacto@donaton.cl</p>
          <p>📞 +56 9 1234 5678</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Donatón. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
