import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../../../backend/userService';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Token inválido. Por favor, solicita un nuevo enlace de recuperación.');
        }
    }, [token]);

    const validate = () => {
        const newFieldErrors = {};

        if (newPassword.length < 6) {
            newFieldErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
        }
        if (newPassword !== confirmPassword) {
            newFieldErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setFieldErrors(newFieldErrors);
        return Object.keys(newFieldErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!newPassword || !confirmPassword) return;

        if (!validate()) return;

        setError(null);
        setLoading(true);

        resetPassword(
            token,
            newPassword,
            () => {
                setLoading(false);
                setSuccess(true);
                setTimeout(() => navigate('/users/login'), 2000);
            },
            (backendErrors) => {
                setLoading(false);
                setError('El enlace de recuperación es inválido o ha expirado.');
            }
        );
    };

    return (
        <div className="min-h-screen bg-smoke flex flex-col items-center justify-center px-5 py-8">
            <div className="w-full max-w-sm">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-gray mb-5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cambridge" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                            <path d="M8 10h8" />
                            <path d="M8 14h4" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-gray tracking-tight">
                        Nueva contraseña
                    </h1>
                    <p className="text-cambridge font-sans mt-1.5 text-sm">
                        Establece tu nueva contraseña
                    </p>
                </div>

                {/* Success message */}
                {success && (
                    <div className="card mb-6 bg-viridian/10 border-viridian/30">
                        <div className="flex gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-viridian flex-shrink-0 mt-0.5" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <div>
                                <p className="text-sm font-semibold text-viridian">Contraseña actualizada</p>
                                <p className="text-sm text-viridian/80 mt-1 font-sans">
                                    Tu contraseña ha sido cambiada. Redirigiendo a login...
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form card */}
                {!success && (
                    <div className="card">
                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-melon/10 border border-melon/30 text-sm text-melon font-sans">
                                {error}
                            </div>
                        )}

                        <form className="space-y-4" onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit();
                        }}>
                            <div>
                                <label htmlFor="newPassword" className="input-label">
                                    Nueva contraseña *
                                </label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    className="input-field"
                                    placeholder="Mínimo 6 caracteres"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    autoFocus
                                    required
                                />
                                {fieldErrors.newPassword && (
                                    <p className="input-error">{fieldErrors.newPassword}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="input-label">
                                    Confirmar contraseña *
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    className="input-field"
                                    placeholder="Repite la contraseña"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                {fieldErrors.confirmPassword && (
                                    <p className="input-error">{fieldErrors.confirmPassword}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn-primary w-full mt-2"
                                disabled={loading || !token}
                            >
                                {loading ? (
                                    <span className="inline-flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10"
                              stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Cambiando contraseña...
                  </span>
                                ) : (
                                    'Cambiar contraseña'
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* Back to login */}
                <p className="text-center mt-8 text-sm text-cambridge font-sans">
                    <Link
                        to="/users/login"
                        className="text-myrtle font-semibold hover:text-viridian transition-colors"
                    >
                        Volver a iniciar sesión
                    </Link>
                </p>

            </div>
        </div>
    );
};

export default ResetPassword;