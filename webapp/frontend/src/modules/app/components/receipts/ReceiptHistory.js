import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserReceipts } from '../../../../backend/receiptService';
import '../../../../styles/history.css';

const History = () => {
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
            (data) => {
                //newest first
                const sortedReceipts = [...(data || [])].sort(
                    (a, b) => getReceiptDate(b) - getReceiptDate(a)
                );

                setReceipts(sortedReceipts);
                setLoading(false);
            },
            (errors) => {
                setError(
                    errors?.message ||
                    errors?.error ||
                    'No se pudo cargar el historial de recibos'
                );
                setLoading(false);
            }
        );
    };

    const getReceiptDate = (receipt) => {
        try {
            if (receipt.date && receipt.time) {
                return new Date(
                    `${receipt.date}T${receipt.time}`
                ).getTime();
            }

            if (receipt.date) {
                return new Date(receipt.date).getTime();
            }

            if (receipt.createdAt) {
                return new Date(receipt.createdAt).getTime();
            }
        } catch (e) {
            return 0;
        }

        return 0;
    };

    const formatDate = (receipt) => {
        try {
            if (receipt.date && receipt.time) {
                return new Date(
                    `${receipt.date}T${receipt.time}`
                ).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }

            if (receipt.date) {
                return new Date(receipt.date).toLocaleDateString(
                    'es-ES',
                    {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }
                );
            }

            if (receipt.createdAt) {
                return new Date(
                    receipt.createdAt
                ).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        } catch (e) {
            return 'Fecha no disponible';
        }

        return 'Fecha no disponible';
    };

    const formatMoney = (value) => {
        if (
            value === null ||
            value === undefined ||
            value === ''
        ) {
            return '-';
        }

        const number = Number(value);

        if (Number.isNaN(number)) {
            return '-';
        }

        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(number);
    };

    const handleReceiptClick = (receiptId) => {
        navigate(`/receipts/${receiptId}`);
    };

    return (
        <div className="min-h-screen bg-smoke pb-20">
            {/* header */}
            <header className="page-header">
                <div className="page-header-content">
                    <h1 className="page-header-title">
                        Historial
                    </h1>

                    <button
                        type="button"
                        onClick={() => navigate('/receipts/upload')}
                        className="history-add-button"
                        aria-label="Subir recibo"
                        title="Subir recibo"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 5v14" />
                            <path d="M5 12h14" />
                        </svg>
                    </button>
                </div>
            </header>

            <main className="px-5 py-6">

                {/* error */}
                {error && (
                    <div className="space-y-4">
                        <div className="alert alert-error">
                            {error}
                        </div>

                        <button
                            type="button"
                            onClick={loadReceipts}
                            className="btn-secondary w-full"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {/* loading */}
                {loading && (
                    <div className="flex justify-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-cambridge border-t-myrtle" />
                    </div>
                )}

                {/* empty */}
                {!loading &&
                    !error &&
                    receipts.length === 0 && (
                        <div className="history-empty">
                            <div className="history-empty-icon">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                                    <path d="M8 10h8" />
                                    <path d="M8 14h4" />
                                </svg>
                            </div>

                            <h2 className="history-empty-title">
                                No hay recibos todavía
                            </h2>

                            <p className="history-empty-text">
                                Sube tu primer recibo para empezar
                                a guardar tu historial.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate('/receipts/upload')
                                }
                                className="btn-primary mt-5"
                            >
                                Subir recibo
                            </button>
                        </div>
                    )}

                {/* receipts */}
                {!loading &&
                    !error &&
                    receipts.length > 0 && (
                        <section>
                            <div className="history-heading">
                                <div>
                                    <h2 className="text-sm font-bold text-slate-gray uppercase tracking-widest font-heading">
                                        Tus recibos
                                    </h2>

                                    <p className="text-xs text-slate-gray/60 mt-1">
                                        {receipts.length}{' '}
                                        {receipts.length === 1
                                            ? 'recibo'
                                            : 'recibos'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {receipts.map((receipt) => (
                                    <button
                                        key={receipt.id}
                                        type="button"
                                        onClick={() =>
                                            handleReceiptClick(
                                                receipt.id
                                            )
                                        }
                                        className="receipt-card history-receipt-card w-full text-left"
                                    >
                                        <div className="flex items-center gap-3">

                                            <div className="receipt-card-icon">
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
                                                    <circle
                                                        cx="9"
                                                        cy="21"
                                                        r="1"
                                                    />
                                                    <circle
                                                        cx="20"
                                                        cy="21"
                                                        r="1"
                                                    />
                                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                                </svg>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="receipt-card-store truncate">
                                                    {receipt.store ||
                                                        'Tienda desconocida'}
                                                </p>

                                                <p className="receipt-card-date">
                                                    {formatDate(receipt)}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <p className="receipt-card-amount">
                                                    {formatMoney(
                                                        receipt.total
                                                    )}
                                                </p>

                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4 text-cambridge flex-shrink-0"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="m9 18 6-6-6-6" />
                                                </svg>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

            </main>
        </div>
    );
};

export default History;