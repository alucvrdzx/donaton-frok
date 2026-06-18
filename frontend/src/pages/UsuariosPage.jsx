import { toast } from 'sonner';
import { useState, useEffect } from 'react';

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsuarios = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/usuarios', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      } else {
        console.error("Error al cargar usuarios", response.status);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const cambiarRol = async (id, nuevoRol) => {
    if (!window.confirm(`¿Seguro que deseas cambiar el rol de este usuario a ${nuevoRol}?`)) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3001/api/usuarios/${id}/rol`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rol: nuevoRol })
      });
      
      if (response.ok) {
        toast.success("Rol actualizado exitosamente.");
        fetchUsuarios();
      } else {
        toast.error("Error al actualizar rol.");
      }
    } catch (error) {
      toast.error("Error de conexión.");
    }
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este usuario? ¡Esta acción es irreversible!")) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3001/api/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchUsuarios();
      } else {
        toast.error("Error al eliminar el usuario.");
      }
    } catch (error) {
      toast.error("Error de conexión.");
    }
  };

  return (
    <div className="page-container" style={{ padding: '0 2rem' }}>
      <header className="header" style={{ marginBottom: '2rem', textAlign: 'left' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Gestión de Personal y Usuarios</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Administra los roles y accesos a la plataforma Donatón.</p>
      </header>

      <div className="stat-card" style={{ marginBottom: '2rem' }}>
        <h3>Listado de Usuarios Registrados</h3>
        {loading ? <p>Cargando usuarios...</p> : (
          <div className="data-table-container" style={{ marginTop: '1rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol Actual</th>
                  <th>Cambiar Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td style={{ fontWeight: '500' }}>{u.nombre}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.correo}</td>
                    <td>
                      <span className={`badge ${
                        u.rol === 'ADMIN' ? 'badge-ropa' : 
                        u.rol === 'TRABAJADOR' ? 'badge-monetaria' : 'badge-default'
                      }`}>
                        {u.rol}
                      </span>
                    </td>
                    <td>
                      <select 
                        value={u.rol}
                        onChange={(e) => cambiarRol(u.id, e.target.value)}
                        style={{ padding: '0.4rem', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        <option value="USER">USER (Donante)</option>
                        <option value="TRABAJADOR">TRABAJADOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td>
                      <button 
                        onClick={() => eliminarUsuario(u.id)}
                        className="action-btn btn-danger"
                        disabled={u.rol === 'ADMIN'}
                        style={{ opacity: u.rol === 'ADMIN' ? 0.5 : 1 }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsuariosPage;
