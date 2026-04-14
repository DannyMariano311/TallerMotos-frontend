import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMotorcycleByPlate, createMotorcycle } from '../../services/motorcycle';
import { getClientByFilter, createClient } from '../../services/clients';
import { createOrder } from '../../services/orders';

export const CreateOrder = () => {
    const navigate = useNavigate();

    const [plate, setPlate] = useState('');
    const [client, setClient] = useState(null);
    const [motorcycle, setMotorcycle] = useState(null);
    const [isNewClient, setIsNewClient] = useState(false);
    const [isNewMotorcycle, setIsNewMotorcycle] = useState(false);
    const [loadingClient, setLoadingClient] = useState(false);
    const [loadingMotorcycle, setLoadingMotorcycle] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const [formData, setFormData] = useState({
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        brand: '',
        model: '',
        year: '',
        cylinder: '',
        color: '',
        faultDescription: ''
    });

    const handleFormChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        setError(null);
        setMessage(null);
    };

    const handleSearchPlate = async () => {
        if (!plate.trim()) {
            setError('Por favor ingresa una placa');
            return;
        }

        setLoadingMotorcycle(true);
        setError(null);
        setMessage(null);

        try {
            const result = await getMotorcycleByPlate(plate.trim());
            if (result && (Array.isArray(result) ? result.length > 0 : true)) {
                const foundMotorcycle = Array.isArray(result) ? result[0] : result;
                setMotorcycle(foundMotorcycle);
                setIsNewMotorcycle(false);
                setIsNewClient(false);
                if (foundMotorcycle.client) {
                    setClient(foundMotorcycle.client);
                }
                setMessage('Motocicleta encontrada. Ahora puedes crear la orden o actualizar datos si es necesario.');
            } else {
                setMotorcycle(null);
                setIsNewMotorcycle(true);
                setMessage('No se encontró la placa. Puedes crear la moto con los datos del formulario.');
            }
        } catch (err) {
            setError('Error al buscar la placa: ' + (err.response?.data?.message || err.message || 'Intenta de nuevo'));
            setMotorcycle(null);
        } finally {
            setLoadingMotorcycle(false);
        }
    };

    const handleSearchClient = async () => {
        if (!formData.search.trim()) {
            setError('Por favor ingresa el teléfono, email o nombre del cliente para buscarlo');
            return;
        }

        setLoadingClient(true);
        setError(null);
        setMessage(null);

        try {
            let foundClient = await getClientByFilter(formData.search);
            foundClient = Array.isArray(foundClient) ? foundClient[0] : foundClient;
            if (foundClient && (Array.isArray(foundClient) ? foundClient.length > 0 : true)) {
                setClient(foundClient);
                setIsNewClient(false);
                setMessage('Cliente encontrado. Puedes usarlo para crear la moto o registrar la orden.');
                if (foundClient.name) setFormData({ ...formData, clientName: foundClient.name, clientEmail: foundClient.email || '', clientPhone: foundClient.phone || '' });
            } else {
                setClient(null);
                setIsNewClient(true);
                setMessage('No se encontró el cliente. Puedes crearlo con los datos del formulario.');
                setFormData({ ...formData, clientName: '', clientEmail: '', clientPhone: '' });
            }
        } catch (err) {
            setError('Error al buscar el cliente: ' + (err.response?.data?.message || err.message || 'Intenta de nuevo'));
            setClient(null);
        } finally {
            setLoadingClient(false);
        }
    };

    const handleCreateClient = async () => {
        if (!formData.clientName.trim()) {
            setError('El nombre del cliente es requerido');
            return;
        }
        if (!formData.clientPhone.trim()) {
            setError('El teléfono del cliente es requerido');
            return;
        }

        setLoadingClient(true);
        setError(null);
        setMessage(null);

        try {
            const created = await createClient({
                name: formData.clientName.trim(),
                phone: formData.clientPhone.trim(),
                email: formData.clientEmail.trim() || undefined
            });
            setClient(created);
            setIsNewClient(false);
            setMessage('Cliente creado correctamente. Ahora puedes crear la moto o registrar la orden.');
        } catch (err) {
            setError('Error al crear cliente: ' + (err.response?.data?.message || err.message || 'Intenta de nuevo'));
        } finally {
            setLoadingClient(false);
        }
    };

    const handleCreateMotorcycle = async () => {
        if (!plate.trim()) {
            setError('La placa es requerida para crear la motocicleta');
            return;
        }
        if (!client?.id) {
            setError('Primero busca o crea el cliente para asignarlo a la moto');
            return;
        }
        if (!formData.brand.trim()) {
            setError('La marca de la moto es requerida');
            return;
        }
        if (!formData.model.trim()) {
            setError('El modelo de la moto es requerido');
            return;
        }

        setLoadingMotorcycle(true);
        setError(null);
        setMessage(null);

        try {
            const created = await createMotorcycle({
                plate: plate.trim(),
                clientId: client.id,
                brand: formData.brand.trim(),
                model: formData.model.trim(),
                cylinder: formData.cylinder.trim() || undefined
            });
            setMotorcycle(created);
            setIsNewMotorcycle(false);
            setMessage('Motocicleta creada correctamente. Ya puedes registrar la orden.');
        } catch (err) {
            setError('Error al crear la moto: ' + (err.response?.data?.message || err.message || 'Intenta de nuevo'));
        } finally {
            setLoadingMotorcycle(false);
        }
    };

    const handleCreateClientAndMotorcycle = async () => {
        if (!formData.clientName.trim()) {
            setError('El nombre del cliente es requerido para crear cliente y moto');
            return;
        }
        if (!formData.clientPhone.trim()) {
            setError('El teléfono del cliente es requerido para crear cliente y moto');
            return;
        }
        if (!plate.trim()) {
            setError('La placa es requerida para crear la moto');
            return;
        }
        if (!formData.brand.trim()) {
            setError('La marca de la moto es requerida');
            return;
        }
        if (!formData.model.trim()) {
            setError('El modelo de la moto es requerido');
            return;
        }

        setLoadingClient(true);
        setLoadingMotorcycle(true);
        setError(null);
        setMessage(null);

        try {
            const createdClient = await createClient({
                name: formData.clientName.trim(),
                phone: formData.clientPhone.trim(),
                email: formData.clientEmail.trim() || undefined
            });
            setClient(createdClient);
            setIsNewClient(false);

            const createdMotorcycle = await createMotorcycle({
                plate: plate.trim(),
                clientId: createdClient.id,
                brand: formData.brand.trim(),
                model: formData.model.trim(),
                cylinder: formData.cylinder.trim() || undefined
            });
            setMotorcycle(createdMotorcycle);
            setIsNewMotorcycle(false);
            setMessage('Cliente y motocicleta creados correctamente. Ya puedes registrar la orden.');
        } catch (err) {
            setError('Error al crear cliente y moto: ' + (err.response?.data?.message || err.message || 'Intenta de nuevo'));
        } finally {
            setLoadingClient(false);
            setLoadingMotorcycle(false);
        }
    };

    const validateOrder = () => {
        if (!motorcycle?.id) {
            setError('Debes seleccionar o crear una motocicleta antes de registrar la orden');
            return false;
        }
        if (!formData.faultDescription.trim()) {
            setError('La descripción de la falla es requerida');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateOrder()) {
            return;
        }

        setSubmitting(true);
        setError(null);
        setMessage(null);

        try {
            const orderData = {
                motorcycleId: motorcycle.id,
                faultDescription: formData.faultDescription
            };

            const newOrder = await createOrder(orderData);
            if (newOrder && newOrder.id) {
                alert('Orden creada exitosamente');
                navigate(`/orders/${newOrder.id}`);
            } else {
                setError('Error: No se pudo crear la orden');
            }
        } catch (err) {
            setError('Error al crear la orden: ' + (err.response?.data?.message || err.message || 'Intenta de nuevo'));
        } finally {
            setSubmitting(false);
        }
    };

    const motorcycleData = motorcycle ? motorcycle : null;
    const clientData = client ? client : null;

    return (
        <div style={{ padding: '20px', maxWidth: '780px', margin: '0 auto' }}>
            <h2>Crear Nueva Orden de Trabajo</h2>

            {error && (
                <div style={{
                    padding: '12px',
                    background: '#ffebee',
                    color: '#c62828',
                    borderRadius: '4px',
                    marginBottom: '16px',
                    border: '1px solid #ef5350'
                }}>
                    {error}
                </div>
            )}

            {message && (
                <div style={{
                    padding: '12px',
                    background: '#e8f5e9',
                    color: '#2e7d32',
                    borderRadius: '4px',
                    marginBottom: '16px',
                    border: '1px solid #a5d6a7'
                }}>
                    {message}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <h3 style={{ marginTop: 0 }}>Buscar / Crear Cliente</h3>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Campo de busqueda del Cliente</label>
                        <input
                            value={formData.search}
                            onChange={(e) => handleFormChange('search', e.target.value)}
                            placeholder="Ej: abc@dominio.com, Pepito Perez o 3001234567"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={handleSearchClient}
                            disabled={loadingClient}
                            style={{
                                padding: '10px 16px',
                                background: '#1976d2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loadingClient ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loadingClient ? 'Buscando...' : 'Buscar Cliente'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCreateClient}
                            disabled={loadingClient}
                            style={{
                                padding: '10px 16px',
                                background: '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loadingClient ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loadingClient ? 'Creando...' : 'Crear Cliente'}
                        </button>
                    </div>

                    <div style={{ marginTop: '16px' }}>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Nombre Cliente</label>
                            <input
                                value={formData.clientName}
                                onChange={(e) => handleFormChange('clientName', e.target.value)}
                                placeholder="Nombre completo"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Email</label>
                            <input
                                type="email"
                                value={formData.clientEmail}
                                onChange={(e) => handleFormChange('clientEmail', e.target.value)}
                                placeholder="Correo electrónico"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Telefono</label>
                            <input
                                type="tel"
                                value={formData.clientPhone}
                                onChange={(e) => handleFormChange('clientPhone', e.target.value)}
                                placeholder="Número de teléfono"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                        </div>
                    </div>

                    {clientData && (
                        <div style={{ marginTop: '16px', padding: '12px', background: '#f1f8e9', borderRadius: '4px', border: '1px solid #c5e1a5' }}>
                            <strong>Cliente seleccionado:</strong>
                            <p style={{ margin: '6px 0' }}>{clientData.name}</p>
                            <p style={{ margin: '6px 0' }}>{clientData.phone}</p>
                            {clientData.email && <p style={{ margin: '6px 0' }}>{clientData.email}</p>}
                        </div>
                    )}
                </div>

                <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <h3 style={{ marginTop: 0 }}>Buscar / Crear Motocicleta</h3>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Placa</label>
                        <input
                            value={plate}
                            onChange={(e) => setPlate(e.target.value.toUpperCase())}
                            placeholder="Ej: ABC123"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={handleSearchPlate}
                            disabled={loadingMotorcycle}
                            style={{
                                padding: '10px 16px',
                                background: '#1976d2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loadingMotorcycle ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loadingMotorcycle ? 'Buscando...' : 'Buscar Moto'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCreateMotorcycle}
                            disabled={loadingMotorcycle || !clientData}
                            style={{
                                padding: '10px 16px',
                                background: clientData ? '#4caf50' : '#9e9e9e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: clientData ? 'pointer' : 'not-allowed'
                            }}
                        >
                            {loadingMotorcycle ? 'Creando...' : 'Crear Motocicleta'}
                        </button>
                        {!clientData && (
                            <button
                                type="button"
                                onClick={handleCreateClientAndMotorcycle}
                                disabled={loadingMotorcycle || loadingClient}
                                style={{
                                    padding: '10px 16px',
                                    background: '#ff9800',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: loadingMotorcycle || loadingClient ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loadingMotorcycle || loadingClient ? 'Creando...' : 'Crear Cliente y Moto'}
                            </button>
                        )}
                    </div>

                    <div style={{ marginTop: '16px' }}>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Marca</label>
                            <input
                                value={formData.brand}
                                onChange={(e) => handleFormChange('brand', e.target.value)}
                                placeholder="Ej: Honda"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Modelo</label>
                            <input
                                value={formData.model}
                                onChange={(e) => handleFormChange('model', e.target.value)}
                                placeholder="Ej: CB 125R"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Cilindrada</label>
                            <input
                                value={formData.cylinder}
                                onChange={(e) => handleFormChange('cylinder', e.target.value)}
                                placeholder="125cc"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                        </div>

                    </div>

                    {motorcycleData && (
                        <div style={{ marginTop: '16px', padding: '12px', background: '#f1f8e9', borderRadius: '4px', border: '1px solid #c5e1a5' }}>
                            <strong>Motocicleta seleccionada:</strong>
                            <p style={{ margin: '6px 0' }}>{motorcycleData.brand} {motorcycleData.model}</p>
                            <p style={{ margin: '6px 0' }}>Placa: {motorcycleData.plate}</p>
                            {motorcycleData.year && <p style={{ margin: '6px 0' }}>Año: {motorcycleData.year}</p>}
                            {motorcycleData.cylinder && <p style={{ margin: '6px 0' }}>Cilindrada: {motorcycleData.cylinder}</p>}
                        </div>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Descripción de la Falla *</label>
                    <textarea
                        placeholder="Describe el problema o daño de la moto..."
                        required
                        rows="5"
                        value={formData.faultDescription}
                        onChange={(e) => handleFormChange('faultDescription', e.target.value)}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontFamily: 'Arial' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    style={{
                        width: '100%',
                        padding: '12px 20px',
                        background: submitting ? '#ccc' : '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}
                >
                    {submitting ? 'Creando orden...' : 'Registrar Orden de Trabajo'}
                </button>
            </form>
        </div>
    );
};