import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../../../backend/userService';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = () => {
        if (!email.trim()) return;

        setError(null);
        setSuccess(false);
        setLoading(true);

        forgotPassword(
            email.trim(),
            () => {
                setLoading(false);
                setSuccess(true);
                setEmail('');
            },
            (backendErrors) => {
                setLoading(false);
                setError('No encontramos una cuenta con ese email.');
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
                        Recuperar contraseña
                    </h1>
                    <p className="text-cambridge font-sans mt-1.5 text-sm">
                        Ingresa tu email para recibir instrucciones
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
                                <p className="text-sm font-semibold text-viridian">Email enviado</p>
                                <p className="text-sm text-viridian/80 mt-1 font-sans">
                                    Revisa tu bandeja de entrada para el enlace de recuperación.
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

                        <form className="space-y-5" onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit();
                        }}>
                            <div>
                                <label htmlFor="email" className="input-label">
                                    Email *
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    className="input-field"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-primary w-full"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="inline-flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10"
                              stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Enviando...
                  </span>
                                ) : (
                                    'Enviar instrucciones'
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

export default ForgotPassword;