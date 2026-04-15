import { useState, useEffect } from 'react';
import { getOrderHistory } from '../../services/orders';

export const OrderHistory = ({ orderId, refreshKey = 0 }) => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        userId: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchHistory();
    }, [orderId, filters, refreshKey]);

    const fetchHistory = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getOrderHistory(orderId, {
                page: 1,
                pageSize: 100,
                userId: filters.userId || undefined,
                startDate: filters.startDate || undefined,
                endDate: filters.endDate || undefined
            });
            setHistory(data.history || []);
        } catch (err) {
            setError('No se pudo cargar el historial: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleClearFilters = () => {
        setFilters({ userId: '', startDate: '', endDate: '' });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            'RECIBIDA': '#2196F3',
            'DIAGNOSTICO': '#FF9800',
            'EN_PROCESO': '#FF5722',
            'LISTA': '#4CAF50',
            'ENTREGADA': '#388E3C',
            'CANCELADA': '#F44336'
        };
        return colors[status] || '#757575';
    };

    if (isLoading && history.length === 0) {
        return <div style={{ padding: '16px', textAlign: 'center' }}>Cargando historial...</div>;
    }

    return (
        <div style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '16px',
            background: '#fafafa',
            marginTop: '20px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>
                    Historial de Cambios {history.length > 0 && `(${history.length} evento${history.length !== 1 ? 's' : ''})`}
                </h3>
            </div>

            {error && (
                <div style={{
                    background: '#ffebee',
                    color: '#c62828',
                    padding: '12px',
                    borderRadius: '4px',
                    marginBottom: '16px'
                }}>
                    {error}
                </div>
            )}

            {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    No hay eventos en el historial
                </div>
            ) : (
                <div style={{ position: 'relative' }}>
                    {history.map((event, index) => (
                        <div key={event.id || index} style={{ display: 'flex', marginBottom: '24px' }}>
                            {/* Línea conectora */}
                            {index < history.length - 1 && (
                                <div style={{
                                    position: 'absolute',
                                    left: '15px',
                                    top: '40px',
                                    width: '2px',
                                    height: 'calc(100% + 24px)',
                                    background: '#e0e0e0'
                                }} />
                            )}

                            {/* Punto de la timeline */}
                            <div style={{
                                minWidth: '32px',
                                height: '32px',
                                background: getStatusColor(event.newStatus || event.status),
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: '4px',
                                zIndex: 1,
                                flexShrink: 0,
                                position: 'relative',
                                left: 0
                            }}>
                                <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                                    ✓
                                </span>
                            </div>

                            {/* Contenido del evento */}
                            <div style={{ marginLeft: '16px', flex: 1 }}>
                                <div style={{
                                    background: 'white',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    padding: '12px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                        <div>
                                            <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold' }}>
                                                {event.fromStatus} → {event.toStatus}
                                            </p>
                                            <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                                                👤 {event.user.name || event.user.id || 'Sistema'} • {formatDate(event.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {event.note && (
                                        <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#333', fontStyle: 'italic' }}>
                                            📝 {event.note}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
