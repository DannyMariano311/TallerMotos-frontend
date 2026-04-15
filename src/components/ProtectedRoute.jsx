import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute: Protege rutas que requieren autenticación
 * @param {React.Component} element - Componente a renderizar si está autenticado
 * @param {Array<string>} allowedRoles - Roles permitidos (ej: ['ADMIN', 'MECANICO'])
 */
export const ProtectedRoute = ({ element: Element, allowedRoles = [] }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando...</div>;
  }

  // No autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Autenticado pero sin permiso de rol
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          color: '#f44336',
          fontSize: '18px',
        }}
      >
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta sección.</p>
        <p>
          Tu rol actual es: <strong>{user?.role}</strong>
        </p>
      </div>
    );
  }

  // Todo bien, renderizar el componente
  return <Element />;
};
