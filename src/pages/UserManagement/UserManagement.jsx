import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { registerUser } from '../../services/auth';
import { Link } from 'react-router-dom';
import './UserManagement.css';

export const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MECANICO',
  });

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name: '', email: '', password: '', role: 'MECANICO' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      await registerUser(formData);
      alert('Usuario creado correctamente');
      handleCloseModal();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Mi Perfil</h2>
        <div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '10px 16px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px',
              fontSize: '14px',
            }}
          >
            + Crear Usuario
          </button>
          <Link to="/">
            <button
              style={{
                padding: '10px 16px',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Volver
            </button>
          </Link>
        </div>
      </div>

      {/* Información del usuario en sesión */}
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        background: '#fafafa',
        maxWidth: '500px',
      }}>
        <h3 style={{ marginTop: 0 }}>Información de la Sesión</h3>
        <div style={{ marginBottom: '12px' }}>
          <strong>Nombre:</strong> {currentUser?.name}
        </div>
        <div style={{ marginBottom: '12px' }}>
          <strong>Email:</strong> {currentUser?.email}
        </div>
        <div style={{ marginBottom: '12px' }}>
          <strong>Rol:</strong> <span style={{
            padding: '4px 12px',
            borderRadius: '12px',
            background: currentUser?.role === 'ADMIN' ? '#FF9800' : '#2196F3',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
          }}>
            {currentUser?.role}
          </span>
        </div>
        <div>
          <strong>Estado:</strong> <span style={{
            padding: '4px 12px',
            borderRadius: '12px',
            background: Boolean(currentUser?.active) ? '#4CAF50' : '#f44336',
            color: 'white',
            fontSize: '12px',
          }}>
            {Boolean(currentUser?.active) ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* Modal para crear usuario */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}>
            <h2 style={{ marginTop: 0 }}>Crear Nuevo Usuario</h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Juan García"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="juan@example.com"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                  Rol
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="MECANICO">MECANICO</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: '10px 16px',
                    background: '#f0f0f0',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 16px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
