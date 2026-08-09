import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    tryLoginFromServiceToken,
    updateProfile,
} from '../../../../backend/userService';
import '../../../../styles/profile.css';

export default function EditProfile() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        profilePicture: null,
    });

    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                if (authenticatedUser && authenticatedUser.user) {
                    const userData = authenticatedUser.user;

                    if (userData.id === Number(id)) {
                        setFormData({
                            id: userData.id,
                            firstName: userData.firstName || '',
                            lastName: userData.lastName || '',
                            email: userData.email || '',
                            profilePicture: userData.profilePicture || null,
                        });

                        if (userData.profilePicture) {
                            setPreview(
                                `data:image/jpeg;base64,${userData.profilePicture}`
                            );
                        }

                        setInitialLoading(false);
                    } else {
                        setError('No tienes permiso para editar este perfil');
                        setInitialLoading(false);
                    }
                } else {
                    setError('Usuario no autenticado');
                    setInitialLoading(false);
                }
            },
            () => {
                setError('Sesión expirada. Por favor inicia sesión nuevamente.');
                setInitialLoading(false);
                setTimeout(() => navigate('/users/login'), 2000);
            }
        );
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (error) {
            setError('');
        }
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        // Optional client-side validation
        if (!file.type.startsWith('image/')) {
            setError('El archivo seleccionado debe ser una imagen');
            return;
        }

        const reader = new FileReader();

        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];

            setFormData((prev) => ({
                ...prev,
                profilePicture: base64,
            }));

            setPreview(reader.result);
            setError('');
        };

        reader.readAsDataURL(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setLoading(true);
        setError('');
        setSuccess('');

        if (
            !formData.firstName.trim() ||
            !formData.lastName.trim() ||
            !formData.email.trim()
        ) {
            setError('Todos los campos son requeridos');
            setLoading(false);
            return;
        }

        updateProfile(
            formData,
            (response) => {
                setSuccess('Perfil actualizado correctamente');
                setLoading(false);

                setTimeout(() => {
                    navigate(`/profile/${response.id || formData.id}`);
                }, 1500);
            },
            (errors) => {
                setError(errors.message || 'Error al actualizar el perfil');
                setLoading(false);
            }
        );
    };

    const handleCancel = () => {
        navigate(`/profile/${id}`);
    };

    if (initialLoading) {
        return (
            <div className="profile-state">
                <div className="profile-loading">
                    Cargando...
                </div>
            </div>
        );
    }

    if (error && !formData.id) {
        return (
            <div className="profile-state">
                <div className="profile-error">
                    <div className="profile-error-message">
                        {error}
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
                        Editar perfil
                    </h1>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-card">
                    <form
                        onSubmit={handleSubmit}
                        className="profile-form"
                    >
                        {error && (
                            <div className="profile-alert profile-alert-error">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="profile-alert profile-alert-success">
                                {success}
                            </div>
                        )}

                        {/* Profile picture */}
                        <div className="profile-picture-editor">
                            <div className="profile-picture-preview">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Foto de perfil"
                                        className="profile-picture-image"
                                    />
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="profile-picture-placeholder"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                )}
                            </div>

                            <label className="profile-picture-upload">
                                Cambiar foto
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfilePictureChange}
                                    disabled={loading}
                                    className="profile-picture-input"
                                />
                            </label>
                        </div>

                        {/* First Name */}
                        <div className="profile-form-group">
                            <label
                                htmlFor="firstName"
                                className="profile-form-label"
                            >
                                Nombre *
                            </label>

                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                disabled={loading}
                                className="profile-form-input"
                                placeholder="Tu nombre"
                            />
                        </div>

                        {/* Last Name */}
                        <div className="profile-form-group">
                            <label
                                htmlFor="lastName"
                                className="profile-form-label"
                            >
                                Apellido *
                            </label>

                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                disabled={loading}
                                className="profile-form-input"
                                placeholder="Tu apellido"
                            />
                        </div>

                        {/* Email */}
                        <div className="profile-form-group">
                            <label
                                htmlFor="email"
                                className="profile-form-label"
                            >
                                Correo electrónico *
                            </label>

                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                                className="profile-form-input"
                                placeholder="tu@email.com"
                            />
                        </div>

                        <div className="profile-form-divider" />

                        <div className="profile-form-actions">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={loading}
                                className="profile-cancel-button"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="profile-save-button"
                            >
                                {loading ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}