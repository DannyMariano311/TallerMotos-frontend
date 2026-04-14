import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../../services/orders';

export const Orders = () => {
    const [orders, setOrders] = useState({ orders: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para filtros
    const [filters, setFilters] = useState({
        status: '',
        plate: ''
    });

    // Estados para paginación
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 0
    });

    const fetchOrders = async (currentFilters = filters, currentPage = pagination.page, currentPageSize = pagination.pageSize) => {
        setIsLoading(true);
        setError(null);

        try {
            const params = {
                page: currentPage,
                pageSize: currentPageSize,
                ...currentFilters
            };

            // Solo incluir parámetros no vacíos
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            const data = await getOrders(params);
            setOrders(data);

            // Actualizar información de paginación si viene del backend
            if (data.totalPages !== undefined && data.totalItems !== undefined) {
                setPagination(prev => ({
                    ...prev,
                    totalPages: Math.max(1, data.totalPages),
                    totalItems: data.totalItems,
                    page: currentPage,
                    pageSize: currentPageSize
                }));
            } else {
                // Si el backend no devuelve info completa de paginación, calcularla localmente
                const actualResults = data.orders ? data.orders.length : 0;
                const totalItems = data.totalItems || actualResults;
                const calculatedTotalPages = totalItems <= currentPageSize ? 1 : Math.ceil(totalItems / currentPageSize);

                setPagination(prev => ({
                    ...prev,
                    totalPages: calculatedTotalPages,
                    totalItems: totalItems,
                    page: currentPage,
                    pageSize: currentPageSize
                }));
            }
        } catch (err) {
            setError('No se pudieron cargar las órdenes. Intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []); // Solo se ejecuta al montar el componente

    // Efecto para recargar cuando cambie el pageSize
    useEffect(() => {
        if (pagination.pageSize !== 10) { // Evitar recarga inicial
            fetchOrders(filters, 1, pagination.pageSize);
        }
    }, [pagination.pageSize]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleApplyFilters = () => {
        setPagination(prev => ({ ...prev, page: 1 })); // Resetear a página 1 al aplicar filtros
        fetchOrders(filters, 1, pagination.pageSize);
    };

    const handleClearFilters = () => {
        const emptyFilters = { status: '', plate: '' };
        setFilters(emptyFilters);
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchOrders(emptyFilters, 1, pagination.pageSize);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
            fetchOrders(filters, newPage, pagination.pageSize);
        }
    };

    const handlePageSizeChange = (newPageSize) => {
        const newPage = 1; // Siempre resetear a página 1 al cambiar tamaño
        setPagination(prev => ({
            ...prev,
            pageSize: newPageSize,
            page: newPage
        }));
        fetchOrders(filters, newPage, newPageSize);
    };

    const handleRefresh = () => {
        fetchOrders(filters, pagination.page, pagination.pageSize);
    };

    if (isLoading) return <h3>Cargando órdenes...</h3>;

    if (error) return <h3 style={{ color: 'red' }}>{error}</h3>;

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Listado de Órdenes de Trabajo</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        style={{
                            padding: '8px 12px',
                            background: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        {isLoading ? 'Cargando...' : '🔄 Refrescar'}
                    </button>
                    {/* Botón para ir a crear una nueva orden */}
                    <Link to="/orders/new">
                        <button style={{ padding: '10px', cursor: 'pointer', background: '#2196F3', color: 'white', border: 'none', borderRadius: '4px' }}>
                            + Nueva Orden
                        </button>
                    </Link>
                </div>
            </div>

            {/* Filtros */}
            <div style={{
                background: '#f5f5f5',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #ddd'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Filtros</h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'end', flexWrap: 'wrap' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                            Estado
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            style={{
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                minWidth: '120px'
                            }}
                        >
                            <option value="">Todos los estados</option>
                            <option value="RECIBIDA">Recibida</option>
                            <option value="DIAGNOSTICO">Diagnóstico</option>
                            <option value="EN_PROCESO">En Proceso</option>
                            <option value="LISTA">Lista</option>
                            <option value="ENTREGADA">Entregada</option>
                            <option value="CANCELADA">Cancelada</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                            Placa
                        </label>
                        <input
                            type="text"
                            placeholder="Buscar por placa..."
                            value={filters.plate}
                            onChange={(e) => handleFilterChange('plate', e.target.value.toUpperCase())}
                            style={{
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                minWidth: '150px'
                            }}
                        />
                    </div>

                    <button
                        onClick={handleApplyFilters}
                        style={{
                            padding: '8px 16px',
                            background: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Aplicar Filtros
                    </button>

                    <button
                        onClick={handleClearFilters}
                        style={{
                            padding: '8px 16px',
                            background: '#757575',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Limpiar Filtros
                    </button>
                </div>
            </div>

            {/* Información de resultados */}
            <div style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
                Mostrando {Math.min(orders.orders?.length || 0, pagination.pageSize)} órdenes
                {pagination.totalItems > 0 && ` de ${pagination.totalItems} totales`}
                {filters.status && ` filtradas por estado: ${filters.status}`}
                {filters.plate && ` y placa: ${filters.plate}`}
                {(orders.orders?.length || 0) > pagination.pageSize && (
                    <div style={{ color: '#f44336', fontWeight: 'bold', marginTop: '4px' }}>
                        ⚠️ El backend devolvió más registros de los solicitados. Mostrando solo los primeros {pagination.pageSize}.
                    </div>
                )}
            </div>

            {/* Tabla HTML para mostrar los datos rápidamente */}
            <table border="1" width="100%" style={{ marginTop: '20px', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f5f5f5' }}>
                    <tr>
                        <th style={{ padding: '12px' }}>Placa</th>
                        <th style={{ padding: '12px' }}>Cliente</th>
                        <th style={{ padding: '12px' }}>Estado</th>
                        <th style={{ padding: '12px' }}>Fecha</th>
                        <th style={{ padding: '12px' }}>Total</th>
                        <th style={{ padding: '12px' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Si no hay órdenes, mostramos un mensaje */}
                    {orders.orders?.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                No hay órdenes registradas con los filtros aplicados.
                            </td>
                        </tr>
                    ) : (
                        /* Recorremos el arreglo de órdenes y creamos una fila por cada una */
                        orders.orders.slice(0, pagination.pageSize).map((order) => (
                            <tr key={order.id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '12px' }}>{order.motorcycle?.plate || '-'}</td>
                                <td style={{ padding: '12px' }}>{order.motorcycle?.client?.name || '-'}</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        background: order.status === 'ENTREGADA' ? '#4CAF50' :
                                                   order.status === 'CANCELADA' ? '#f44336' :
                                                   order.status === 'LISTA' ? '#FF9800' :
                                                   order.status === 'EN_PROCESO' ? '#2196F3' :
                                                   order.status === 'DIAGNOSTICO' ? '#9C27B0' : '#757575',
                                        color: 'white'
                                    }}>
                                        {order.status}
                                    </span>
                                </td>
                                {/* Formateamos la fecha para que se vea legible */}
                                <td style={{ padding: '12px' }}>
                                    {order.entryDate ? new Date(order.entryDate).toLocaleDateString('es-CO') : '-'}
                                </td>
                                {/* Formateamos el total a Pesos Colombianos (COP) */}
                                <td style={{ padding: '12px' }}>
                                    {new Intl.NumberFormat('es-CO', {
                                        style: 'currency',
                                        currency: 'COP',
                                        maximumFractionDigits: 0
                                    }).format(order.total || 0)}
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <Link
                                        to={`/orders/${order.id}`}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#2196F3',
                                            color: 'white',
                                            textDecoration: 'none',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Ver Detalle
                                    </Link>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: '20px',
                    padding: '16px',
                    background: '#f9f9f9',
                    borderRadius: '8px'
                }}>
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        style={{
                            padding: '8px 12px',
                            background: pagination.page <= 1 ? '#ccc' : '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Anterior
                    </button>

                    <span style={{ fontWeight: 'bold' }}>
                        Página {pagination.page} de {pagination.totalPages}
                    </span>

                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        style={{
                            padding: '8px 12px',
                            background: pagination.page >= pagination.totalPages ? '#ccc' : '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Siguiente
                    </button>

                    <div style={{ marginLeft: '20px' }}>
                        <label style={{ marginRight: '8px', fontSize: '14px' }}>
                            Ítems por página:
                        </label>
                        <select
                            value={pagination.pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            style={{
                                padding: '4px 8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};