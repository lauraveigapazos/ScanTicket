import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserReceipts } from '../../../../backend/receiptService';
import ReceiptCard from './/ReceiptCard';
import '../../../../styles/history.css';
import '../../../../styles/receipts.css';

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

    return (
        <div className="min-h-screen bg-smoke pb-20">

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

                {loading && (
                    <div className="flex justify-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-cambridge border-t-myrtle" />
                    </div>
                )}

                {!loading && !error && receipts.length === 0 && (
                    <div className="history-empty">
                        {/* empty state */}
                    </div>
                )}

                {!loading && !error && receipts.length > 0 && (
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

                        {/* receipt list */}
                        <div className="space-y-3">
                            {receipts.map((receipt) => (
                                <ReceiptCard
                                    key={receipt.id}
                                    receipt={receipt}
                                    onDeleted={(deletedId) => {
                                        setReceipts((currentReceipts) =>
                                            currentReceipts.filter(
                                                (item) => item.id !== deletedId
                                            )
                                        );
                                    }}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default History;