import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [donaciones, setDonaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Llamamos al BFF de Node.js, NO directo al Gateway
  const BFF_URL = 'http://localhost:3001/api/donaciones';

  useEffect(() => {
    fetchDonaciones();
  }, []);

  const fetchDonaciones = async () => {
    try {
      const response = await axios.get(BFF_URL);
      setDonaciones(response.data);
    } catch (error) {
      console.error('Error al cargar donaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Donaton - Frontend con BFF</h1>
      <p>Este frontend de React se conecta a Node.js (BFF), el cual se conecta a Spring Boot.</p>
      
      {loading ? (
        <p>Cargando donaciones...</p>
      ) : (
        <div className="card-container">
          {donaciones.length === 0 ? (
            <p>No hay donaciones registradas aún.</p>
          ) : (
            donaciones.map((d) => (
              <div key={d.id} className="card">
                <h3>{d.nombreDonante}</h3>
                <p><strong>Tipo:</strong> {d.tipoDonacion}</p>
                <p><strong>Detalle:</strong> {d.detalle}</p>
                <p><strong>Cantidad:</strong> {d.cantidad} {d.unidadMedida}</p>
                <p><strong>Fecha:</strong> {new Date(d.fechaDonacion).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default App;
