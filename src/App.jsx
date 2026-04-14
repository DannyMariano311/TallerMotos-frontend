import { BrowserRouter, Routes, Route } from 'react-router-dom';
// Importamos los "cascarones" que creaste en la carpeta pages
import { Orders } from './pages/Orders/Orders';
import { CreateOrder } from './pages/CreateOrder/CreateOrder';
import { OrderDetail } from './pages/OrderDetail/OrderDetail';

function App() {
  return (
    <BrowserRouter>
      {/* Aquí podrías poner un Navbar que sea visible en todas las páginas */}
      <nav style={{ padding: '1rem', borderBottom: '1px solid #f30b0b' }}>
        <a href="/" style={{ marginRight: '1rem' }}>Listado</a>
        <a href="/orders/new">Nueva Orden</a>
      </nav>

      <Routes>
        {/* 1. Listado de órdenes: Es la página principal (la raíz) */}
        <Route path="/" element={<Orders />} />

        {/* 2. Crear orden: Ruta para el formulario de registro */}
        <Route path="/orders/new" element={<CreateOrder />} />

        {/* 3. Detalle de orden: Usamos ":id" porque es una ruta dinámica 
           (ej: /orders/1, /orders/45, etc.) */}
        <Route path="/orders/:id" element={<OrderDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;