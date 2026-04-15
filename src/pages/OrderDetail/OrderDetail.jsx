import { getOrderById, addItemToOrder, deleteItemFromOrder, updateOrderStatus } from '../../services/orders';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { OrderHistory } from '../../components/OrderHistory/OrderHistory';

export const OrderDetail = () => {
    const { isAdmin } = useAuth();
    const [orderDetail, setOrderDetail] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [refreshHistoryKey, setRefreshHistoryKey] = useState(0);
    const [formData, setFormData] = useState({
        type: '',
        description: '',
        count: '',
        unitValue: '',
    });

    const { id } = useParams();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getOrderById(id);
                setOrderDetail(data);
            } catch (err) {
                setError('No se pudo cargar la orden. Intenta de nuevo.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [id]);

    if (isLoading) return <h3>Cargando detalle de la órden...</h3>;

    if (error) return <h3 style={{ color: 'red' }}>{error}</h3>;

    const client = orderDetail?.motorcycle?.client || {};
    const motorcycle = orderDetail?.motorcycle || {};
    const items = orderDetail?.items || [];

    const formatMoney = (value) =>
        new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
        }).format(value || 0);

    const formatDate = (date) =>
        date ? new Date(date).toLocaleDateString() : '-';

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({ type: '', description: '', count: '', unitValue: '' });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddItem = async (e) => {
        e.preventDefault();

        if (!formData.type || !formData.description || !formData.count || !formData.unitValue) {
            alert('Por favor completa todos los campos');
            return;
        }

        setIsSubmitting(true);
        try {
            const itemPayload = {
                type: formData.type,
                description: formData.description,
                count: Number(formData.count),
                unitValue: Number(formData.unitValue),
            };

            await addItemToOrder(id, itemPayload);

            // Recargar la orden después de agregar el item
            const updatedOrder = await getOrderById(id);
            setOrderDetail(updatedOrder);

            handleCloseModal();
        } catch (err) {
            alert('Error al agregar el item: ' + (err.message || 'Intenta de nuevo'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este item?')) {
            return;
        }

        try {
            await deleteItemFromOrder(id, itemId);
            // Recargar la orden después de eliminar el item
            const updatedOrder = await getOrderById(id);
            setOrderDetail(updatedOrder);
        } catch (err) {
            alert('Error al eliminar el item: ' + (err.message || 'Intenta de nuevo'));
        }
    };

    const getValidTransitions = (currentStatus) => {
        let stateFlow = {};
        if (!isAdmin) {
            stateFlow = {
                RECIBIDA: ['DIAGNOSTICO'],
                DIAGNOSTICO: ['EN_PROCESO'],
                EN_PROCESO: ['LISTA'],
                LISTA: [],
                ENTREGADA: [],
                CANCELADA: []
            };
            return stateFlow[currentStatus] || [];
        }

        stateFlow = {
            RECIBIDA: ['DIAGNOSTICO', 'EN_PROCESO', 'LISTA', 'ENTREGADA', 'CANCELADA'],
            DIAGNOSTICO: ['RECIBIDA', 'EN_PROCESO', 'LISTA', 'ENTREGADA', 'CANCELADA'],
            EN_PROCESO: ['RECIBIDA', 'DIAGNOSTICO', 'LISTA', 'ENTREGADA', 'CANCELADA'],
            LISTA: ['RECIBIDA', 'DIAGNOSTICO', 'EN_PROCESO', 'ENTREGADA', 'CANCELADA'],
            ENTREGADA: ['RECIBIDA', 'DIAGNOSTICO', 'EN_PROCESO', 'LISTA', 'CANCELADA'],
            CANCELADA: ['RECIBIDA', 'DIAGNOSTICO', 'EN_PROCESO', 'LISTA', 'ENTREGADA']
        };
        return stateFlow[currentStatus] || [];
    };

    const handleChangeStatus = async (newStatus) => {
        // Solicitar nota al usuario
        const note = prompt(`Ingresa una nota para el cambio a ${newStatus}:\n\n(Deja vacío si no deseas agregar una nota)`);
        
        if (note === null) {
            return; // Usuario canceló
        }

        setIsUpdatingStatus(true);
        try {
            await updateOrderStatus(id, newStatus, note);
            // Recargar la orden después de cambiar el estado
            const updatedOrder = await getOrderById(id);
            setOrderDetail(updatedOrder);
            // Refrescar el historial
            setRefreshHistoryKey(prev => prev + 1);
        } catch (err) {
            alert('Error al cambiar el estado: ' + (err.response?.data?.message || err.message || 'Intenta de nuevo'));
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h2>Detalle de Orden de Trabajo</h2>
                    <p style={{ margin: '4px 0' }}><strong>Id:</strong> {orderDetail.id}</p>
                    <p style={{ margin: '4px 0' }}><strong>Estado:</strong> <span style={{ fontWeight: 'bold', color: '#2196F3', fontSize: '16px' }}>{orderDetail.status}</span></p>
                    <p style={{ margin: '4px 0' }}><strong>Fecha:</strong> {formatDate(orderDetail.entryDate)}</p>
                    <p style={{ margin: '4px 0' }}><strong>Total:</strong> {formatMoney(orderDetail.total)}</p>
                </div>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <button style={{ padding: '10px 16px', cursor: 'pointer' }}>Volver a órdenes</button>
                </Link>
            </div>

            {/* Botones para cambiar estado */}
            {getValidTransitions(orderDetail.status).length > 0 && (
                <div style={{ marginBottom: '20px', padding: '16px', background: '#f5f5f5', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                    <p style={{ margin: '0 0 12px 0', fontWeight: 'bold' }}>Cambiar estado a:</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {getValidTransitions(orderDetail.status).map((status) => (
                            <button
                                key={status}
                                onClick={() => handleChangeStatus(status)}
                                disabled={isUpdatingStatus}
                                style={{
                                    padding: '10px 16px',
                                    background: status === 'CANCELADA' ? '#f44336' : '#2196F3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isUpdatingStatus ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    opacity: isUpdatingStatus ? 0.6 : 1
                                }}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', background: '#fafafa' }}>
                    <h3 style={{ marginTop: 0 }}>Información del Cliente</h3>
                    {client.id && <p><strong>ID:</strong> {client.id}</p>}
                    <p><strong>Nombre:</strong> {client.name || '-'}</p>
                    {client.phone && <p><strong>Teléfono:</strong> {client.phone}</p>}
                    {client.email && <p><strong>Correo:</strong> {client.email}</p>}
                </div>

                <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', background: '#fafafa' }}>
                    <h3 style={{ marginTop: 0 }}>Información de la Motocicleta</h3>
                    {motorcycle.id && <p><strong>ID:</strong> {motorcycle.id}</p>}
                    <p><strong>Placa:</strong> {motorcycle.plate || '-'}</p>
                    {motorcycle.brand && <p><strong>Marca:</strong> {motorcycle.brand}</p>}
                    {motorcycle.model && <p><strong>Modelo:</strong> {motorcycle.model}</p>}
                    {motorcycle.cylinder && <p><strong>Cilindrada:</strong> {motorcycle.cylinder}</p>}
                </div>
            </div>

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3>Ítems de la Orden</h3>
                    <button
                        onClick={handleOpenModal}
                        style={{
                            padding: '8px 16px',
                            cursor: 'pointer',
                            background: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                    >
                        + Agregar Item
                    </button>
                </div>
                {items.length === 0 ? (
                    <p>No hay ítems registrados para esta orden.</p>
                ) : (
                    <table border="1" width="100%" style={{ borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f2f2f2' }}>
                            <tr>
                                <th style={{ padding: '10px' }}>ID</th>
                                <th style={{ padding: '10px' }}>Tipo de Ítem</th>
                                <th style={{ padding: '10px' }}>Descripción</th>
                                <th style={{ padding: '10px' }}>Cantidad</th>
                                <th style={{ padding: '10px' }}>Valor Unitario</th>
                                <th style={{ padding: '10px' }}>Subtotal</th>
                                {isAdmin && (
                                    <th style={{ padding: '10px' }}>Acciones</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => {
                                const subtotal = item.subtotal ?? (item.count && item.unitValue ? item.count * item.unitValue : 0);
                                return (
                                    <tr key={index}>
                                        <td style={{ padding: '10px' }}>{item.id || '-'}</td>
                                        <td style={{ padding: '10px' }}>{item.type || '-'}</td>
                                        <td style={{ padding: '10px' }}>{item.description || '-'}</td>
                                        <td style={{ padding: '10px' }}>{item.count ?? '-'}</td>
                                        <td style={{ padding: '10px' }}>{formatMoney(item.unitValue)}</td>
                                        <td style={{ padding: '10px' }}>{formatMoney(subtotal)}</td>
                                        {isAdmin && (
                                            <td style={{ padding: '10px' }}>
                                                <button
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#f44336',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal para agregar item */}
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
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '8px',
                        padding: '24px',
                        width: '90%',
                        maxWidth: '500px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h2 style={{ marginTop: 0 }}>Agregar Item a la Orden</h2>
                        <form onSubmit={handleAddItem}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                                    Tipo de Ítem
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleFormChange}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <option value="">Selecciona un tipo</option>
                                    <option value="REPUESTO">Repuesto</option>
                                    <option value="MANO_OBRA">Mano de obra</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                                    Descripción
                                </label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    placeholder="Ej: Cambio de aceite"
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                                        Cantidad
                                    </label>
                                    <input
                                        type="number"
                                        name="count"
                                        value={formData.count}
                                        onChange={handleFormChange}
                                        placeholder="1"
                                        min="1"
                                        step="1"
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                                        Valor Unitario
                                    </label>
                                    <input
                                        type="number"
                                        name="unitValue"
                                        value={formData.unitValue}
                                        onChange={handleFormChange}
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={isSubmitting}
                                    style={{
                                        padding: '10px 16px',
                                        background: '#f0f0f0',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{
                                        padding: '10px 16px',
                                        background: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        opacity: isSubmitting ? 0.7 : 1
                                    }}
                                >
                                    {isSubmitting ? 'Guardando...' : 'Agregar Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Historial de cambios de estado */}
            <OrderHistory orderId={id} refreshKey={refreshHistoryKey} />
        </div>
    );
};