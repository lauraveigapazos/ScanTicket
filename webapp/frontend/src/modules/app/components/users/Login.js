import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../../../backend/userService';
import {useState} from "react";

const Login = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = () => {

        if (!userName.trim() || !password) return;

        setError(null);
        setLoading(true);

        login(
            userName.trim(),
            password,
            () => {
                setLoading(false);
                navigate('/home');
            },
            (error) => {
                setLoading(false);
                setError('Usuario o contraseña incorrectos.');
            },
            () => {
                navigate('/users/login');
            }
        );
    };

    return (

        <div className="min-h-screen bg-smoke flex flex-col items-center justify-center px-5">
            <div className="w-full max-w-sm">

                {/* logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-gray mb-5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cambridge" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                             strokeLinejoin="round">
                            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
                            <path d="M8 10h8"/>
                            <path d="M8 14h4"/>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-gray tracking-tight">
                        ScanTicket
                    </h1>
                    <p className="text-cambridge font-sans mt-1.5 text-sm">
                        Controla tus gastos de supermercado
                    </p>
                </div>

                {/* form */}
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
                            <label htmlFor="userName" className="input-label">
                                Nombre de usuario
                            </label>
                            <input
                                id="userName"
                                type="text"
                                className="input-field"
                                placeholder="Tu nombre de usuario"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                autoFocus
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="input-label">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                className="input-field"
                                placeholder="Tu contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary w-full" disabled={loading}>
                            {loading ? (
                                <span className="inline-flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10"
                                            stroke="currentColor" strokeWidth="4" fill="none" />
                                     <path className="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Iniciando sesión...
                                </span>
                            ) : (
                                'Iniciar sesión'
                            )}
                        </button>
                    </form>
                </div>

                {/* sign up */}
                <p className="text-center mt-8 text-sm text-cambridge font-sans">
                    ¿No tienes cuenta?{' '}
                    <Link
                        to="/users/signUp"
                        className="text-myrtle font-semibold hover:text-viridian transition-colors"
                    >
                        Regístrate
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;