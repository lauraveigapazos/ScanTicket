import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../../../../backend/userService';

const SignUp = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const newFieldErrors = {};

        if (password.length < 6) {
            newFieldErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }
        if (password !== confirmPassword) {
            newFieldErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setFieldErrors(newFieldErrors);
        return Object.keys(newFieldErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!userName.trim() || !password || !firstName.trim() || !lastName.trim() || !email.trim()) return;

        if (!validate()) return;

        setError(null);
        setLoading(true);

        signUp(
            {
                userName: userName.trim(),
                password,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
            },
            () => {
                setLoading(false);
                navigate('/home');
            },
            (backendErrors) => {
                setLoading(false);
                if (backendErrors.globalError) {
                    setError(backendErrors.globalError);
                } else {
                    setError('El nombre de usuario ya existe.');
                }
            },
            () => {
                navigate('/users/login');
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
                        Crear cuenta
                    </h1>
                    <p className="text-cambridge font-sans mt-1.5 text-sm">
                        Únete a ScanTicket
                    </p>
                </div>

                {/* Form card */}
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
                            <label htmlFor="userName" className="input-label">
                                Nombre de usuario *
                            </label>
                            <input
                                id="userName"
                                type="text"
                                className="input-field"
                                placeholder="Elige un nombre de usuario"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                autoFocus
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="firstName" className="input-label">
                                    Nombre *
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    className="input-field"
                                    placeholder="Nombre"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="input-label">
                                    Apellidos *
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    className="input-field"
                                    placeholder="Apellidos"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

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
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="input-label">
                                Contraseña *
                            </label>
                            <input
                                id="password"
                                type="password"
                                className="input-field"
                                placeholder="Mínimo 6 caracteres"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {fieldErrors.password && (
                                <p className="input-error">{fieldErrors.password}</p>
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
                  Creando cuenta...
                </span>
                            ) : (
                                'Crear cuenta'
                            )}
                        </button>
                    </form>
                </div>

                {/* Login link */}
                <p className="text-center mt-8 text-sm text-cambridge font-sans">
                    ¿Ya tienes cuenta?{' '}
                    <Link
                        to="/users/login"
                        className="text-myrtle font-semibold hover:text-viridian transition-colors"
                    >
                        Inicia sesión
                    </Link>
                </p>

            </div>
        </div>
    );
};

export default SignUp;