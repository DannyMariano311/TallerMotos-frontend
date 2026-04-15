import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';

// Páginas
import { Login } from './pages/Login/Login';
import { Orders } from './pages/Orders/Orders';
import { CreateOrder } from './pages/CreateOrder/CreateOrder';
import { OrderDetail } from './pages/OrderDetail/OrderDetail';
import { UserManagement } from './pages/UserManagement/UserManagement';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Ruta pública: Login */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas: Accesibles solo autenticados */}
          <Route
            path="/"
            element={<ProtectedRoute element={Orders} />}
          />

          <Route
            path="/orders/new"
            element={<ProtectedRoute element={CreateOrder} allowedRoles={['ADMIN']} />}
          />

          <Route
            path="/orders/:id"
            element={<ProtectedRoute element={OrderDetail} />}
          />

          {/* Ruta protegida: Solo ADMIN */}
          <Route
            path="/users"
            element={<ProtectedRoute element={UserManagement} allowedRoles={['ADMIN']} />}
          />

          {/* Ruta wildcard: Redirigir a inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;