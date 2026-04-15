import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

export const Navbar = () => {
    const { user, isAuthenticated, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            await logout();
            navigate('/login');
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <Link to="/" className="navbar-logo">
                        🏍️ TallerMotos
                    </Link>
                </div>

                <div className="navbar-menu">
                    {isAuthenticated ? (
                        <>
                            <div className="navbar-links">
                                <Link to="/" className="navbar-link">
                                    📋 Órdenes
                                </Link>
                                {isAdmin && (
                                    <Link to="/orders/new" className="navbar-link">
                                        ➕ Nueva Orden
                                    </Link>
                                )}
                                {isAdmin && (
                                    <Link to="/users" className="navbar-link">
                                        👥 Usuarios
                                    </Link>
                                )}
                            </div>

                            <div className="navbar-user">
                                <div className="user-info">
                                    <span className="user-name">{user?.name}</span>
                                    <span className={`user-role ${user?.role?.toLowerCase()}`}>
                                        {user?.role}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="navbar-logout-btn"
                                >
                                    🚪 Cerrar Sesión
                                </button>
                            </div>
                        </>
                    ) : (
                        <Link to="/login" className="navbar-link navbar-login">
                            Iniciar Sesión
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};
