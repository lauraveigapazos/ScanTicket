import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../backend/userService';
import { getUserReceipts } from '../../../backend/receiptService';
import ReceiptUpload from '../components/receipts/ReceiptUpload';

const Home = () => {
    const navigate = useNavigate();
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadReceipts();
    }, []);

    const loadReceipts = () => {
        setLoading(true);
        setError(null);

        getUserReceipts(
            (receipts) => {
                setReceipts(receipts);
                setLoading(false);
            },
            (errors) => {
                setError(
                    errors.globalError ||
                    'Error al cargar los recibos'
                );
                setLoading(false);
            }
        );
    };

    const handleLogout = () => {
        logout();
        navigate('/users/login');
    };

    const handleUploadSuccess = (newReceipt) => {
        setReceipts([newReceipt, ...receipts]);
    };

    return (
        <div className="min-h-screen bg-smoke">
            {/* header */}
            <div className="sticky top-0 z-10 bg-white border-b border-timberwolf/30 px-5 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-gray">Este mes</h1>
                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-myrtle/20 hover:bg-myrtle/30 transition-colors"
                        title="Cerrar sesión"
                    >
                        {/* profile icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-myrtle"
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
                    </button>
                </div>
            </div>

            <div className="px-5 py-6 space-y-6 pb-20">
                {/* upload */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-slate-gray mb-4">
                        Añadir nuevo recibo
                    </h2>
                    <ReceiptUpload onUploadSuccess={handleUploadSuccess} />
                </div>

                {error && (
                    <div className="p-4 rounded-lg bg-melon/10 border border-melon/30 text-sm text-melon font-sans">
                        {error}
                    </div>
                )}

                {/* stats placeholder */}
                {!loading && receipts.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-gray uppercase tracking-wide">
                            Estadísticas
                        </h3>
                        {/* stats here */}
                    </div>
                )}

                {/* last receipts */}
                {!loading && receipts.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-gray uppercase tracking-wide">
                            Últimos recibos
                        </h3>
                        <div className="space-y-2">
                            {receipts.map((receipt) => (
                                <div key={receipt.id} className="card">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-myrtle/20">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 text-myrtle"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <circle cx="9" cy="21" r="1" />
                                                    <circle cx="20" cy="21" r="1" />
                                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-gray">
                                                    {receipt.store || 'Tienda desconocida'}
                                                </p>
                                                <p className="text-xs text-cambridge font-sans">
                                                    {receipt.date && receipt.time
                                                        ? new Date(`${receipt.date}T${receipt.time}`).toLocaleDateString('es-ES', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })
                                                        : receipt.createdAt
                                                            ? new Date(receipt.createdAt).toLocaleDateString('es-ES', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })
                                                            : 'Fecha no disponible'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-slate-gray">
                                            {receipt.total && receipt.total > 0
                                                ? `€${parseFloat(receipt.total).toFixed(2)}`
                                                : '-'
                                            }
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* loading */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-cambridge border-t-myrtle"></div>
                        </div>
                    </div>
                )}

                {/* empty */}
                {!loading && receipts.length === 0 && !error && (
                    <div className="text-center py-12">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-cambridge mx-auto mb-3 opacity-50"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                            <path d="M8 10h8" />
                            <path d="M8 14h4" />
                        </svg>
                        <p className="text-cambridge font-sans text-sm">
                            Carga tu primer recibo para comenzar
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;