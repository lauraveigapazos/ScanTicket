// src/modules/app/components/profile/Profile.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tryLoginFromServiceToken, logout } from '../../../../backend/userService';
import '../../../../styles/profile.css';

export default function Profile() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                if (authenticatedUser && authenticatedUser.user) {
                    const userData = authenticatedUser.user;

                    // Verify that the URL id matches the authenticated user id
                    if (userData.id === parseInt(id)) {
                        setUser(userData);
                        setLoading(false);
                    } else {
                        setError('No tienes permiso para ver este perfil');
                        setLoading(false);
                    }
                } else {
                    setError('Usuario no autenticado');
                    setLoading(false);
                }
            },
            (reauthError) => {
                setError('Sesión expirada. Por favor inicia sesión nuevamente.');
                setLoading(false);
                setTimeout(() =>navigate('/users/login'), 2000);
            }
        );
    }, [id, navigate]);

    const handleEdit = () => {
        navigate(`/profile/${user.id}/edit`);
    };

    const handleLogout = () => {
        logout();
        navigate('/users/login');
    };

    if (loading) {
        return (
            <div className="profile-state">
                <div className="profile-loading">
                    Cargando...
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="profile-state">
                <div className="profile-error">
                    <div className="profile-error-message">
                        {error || 'Usuario no encontrado'}
                    </div>

                    <button
                        onClick={() => navigate('/home')}
                        className="profile-back-button"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-header-content">
                    <h1 className="profile-header-title">
                        Perfil
                    </h1>

                    <button
                        onClick={handleLogout}
                        className="profile-logout-button"
                        title="Cerrar sesión"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-melon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-card">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar">
                            {user.profilePicture ? (
                                <img
                                    src={`data:image/jpeg;base64,${user.profilePicture}`}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="profile-avatar-image"
                                />
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="profile-avatar-icon"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            )}
                        </div>

                        <h2 className="profile-name">
                            {user.firstName} {user.lastName}
                        </h2>

                        <p className="profile-email">
                            {user.email}
                        </p>
                    </div>

                    <div className="profile-divider"/>

                    <div className="profile-information">
                        <div className="profile-field">
                            <label className="profile-field-label">
                                Nombre
                            </label>
                            <p className="profile-field-value">
                                {user.firstName}
                            </p>
                        </div>

                        <div className="profile-field">
                            <label className="profile-field-label">
                                Apellido
                            </label>
                            <p className="profile-field-value">
                                {user.lastName}
                            </p>
                        </div>

                        <div className="profile-field">
                            <label className="profile-field-label">
                                Correo electrónico
                            </label>
                            <p className="profile-field-value">
                                {user.email}
                            </p>
                        </div>

                        {user.createdAt && (
                            <div className="profile-field">
                                <label className="profile-field-label">
                                    Miembro desde
                                </label>
                                <p className="profile-field-value">
                                    {new Date(user.createdAt).toLocaleDateString('es-ES')}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="profile-divider-lg" />

                    <div className="profile-actions">
                        <button
                            onClick={handleEdit}
                            className="profile-edit-button"
                        >
                            Editar perfil
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}