import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getReceipt } from '../../../../backend/receiptService';

const ReceiptDetails = () => {
    const { receiptId } = useParams();
    const navigate = useNavigate();

    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        getReceipt(
            receiptId,
            (data) => {
                setReceipt(data);
                setLoading(false);
            },
            (errors) => {
                setError(
                    errors?.message ||
                    errors?.error ||
                    'No se pudo cargar el recibo'
                );
                setLoading(false);
            }
        );
    }, [receiptId]);

    const formatMoney = (value) => {
        if (value === null || value === undefined || value === '') {
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

    const formatDate = () => {
        if (!receipt) {
            return 'Fecha no disponible';
        }

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
                return new Date(receipt.date).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            }

            if (receipt.createdAt) {
                return new Date(receipt.createdAt).toLocaleDateString(
                    'es-ES',
                    {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }
                );
            }
        } catch (e) {
            return 'Fecha no disponible';
        }

        return 'Fecha no disponible';
    };

    const formatQuantity = (quantity) => {
        if (quantity === null || quantity === undefined) {
            return '';
        }

        const number = Number(quantity);

        if (Number.isNaN(number)) {
            return quantity;
        }

        return number % 1 === 0
            ? number.toString()
            : number.toFixed(2);
    };

    const handleBack = () => {
        navigate(-1);
    };

    /* =========================
       Loading
       ========================= */

    if (loading) {
        return (
            <div className="min-h-screen bg-smoke">
                <header className="page-header">
                    <div className="page-header-content">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="page-header-back"
                            aria-label="Volver"
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
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>

                        <h1 className="page-header-title">
                            Recibo
                        </h1>

                        <div className="w-10" />
                    </div>
                </header>

                <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-cambridge border-t-myrtle" />
                </div>
            </div>
        );
    }

    /* =========================
       Error
       ========================= */

    if (error || !receipt) {
        return (
            <div className="min-h-screen bg-smoke">
                <header className="page-header">
                    <div className="page-header-content">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="page-header-back"
                            aria-label="Volver"
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
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>

                        <h1 className="page-header-title">
                            Recibo
                        </h1>

                        <div className="w-10" />
                    </div>
                </header>

                <main className="px-5 py-6">
                    <div className="alert alert-error">
                        {error || 'Recibo no encontrado'}
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/home')}
                        className="btn-primary w-full mt-4"
                    >
                        Volver al inicio
                    </button>
                </main>
            </div>
        );
    }

    const items = receipt.items || [];

    return (
        <div className="min-h-screen bg-smoke pb-20">

            {/* =========================
                Header
                ========================= */}

            <header className="page-header">
                <div className="page-header-content">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="page-header-back"
                        aria-label="Volver"
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
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </button>

                    <h1 className="page-header-title">
                        Recibo
                    </h1>

                    <div className="w-10" />
                </div>
            </header>

            <main className="px-5 py-6 space-y-5">

                {/* =========================
                    Receipt summary
                    ========================= */}

                <section className="receipt-detail-hero">

                    <div className="receipt-detail-icon">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-7 w-7"
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

                    <h2 className="receipt-detail-store">
                        {receipt.store || 'Tienda desconocida'}
                    </h2>

                    <p className="receipt-detail-date">
                        {formatDate()}
                    </p>

                    <p className="receipt-detail-total">
                        {formatMoney(receipt.total)}
                    </p>

                    <div className="receipt-detail-meta">
                        {items.length}{' '}
                        {items.length === 1
                            ? 'producto'
                            : 'productos'}
                    </div>
                </section>

                {/* =========================
                    Store information
                    ========================= */}

                {(receipt.address ||
                    receipt.phoneNumber ||
                    receipt.storeCif) && (
                    <section className="card">
                        <h2 className="form-section-title mb-4">
                            Establecimiento
                        </h2>

                        <div className="space-y-3">
                            {receipt.address && (
                                <div className="receipt-info-row">
                                    <span>Dirección</span>
                                    <strong>{receipt.address}</strong>
                                </div>
                            )}

                            {receipt.phoneNumber && (
                                <div className="receipt-info-row">
                                    <span>Teléfono</span>
                                    <strong>
                                        {receipt.phoneNumber}
                                    </strong>
                                </div>
                            )}

                            {receipt.storeCif && (
                                <div className="receipt-info-row">
                                    <span>CIF</span>
                                    <strong>{receipt.storeCif}</strong>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* =========================
                    Products
                    ========================= */}

                <section className="card p-0 overflow-hidden">

                    <div className="px-5 py-4 border-b border-timberwolf">
                        <h2 className="form-section-title">
                            Productos
                        </h2>
                    </div>

                    {items.length === 0 ? (
                        <div className="px-5 py-8 text-center">
                            <p className="text-sm text-slate-gray/60">
                                No hay productos disponibles
                                para este recibo.
                            </p>
                        </div>
                    ) : (
                        <div>
                            {items.map((item, index) => (
                                <div
                                    key={item.id || index}
                                    className="receipt-item"
                                >
                                    <div className="flex items-start justify-between gap-4">

                                        <div className="min-w-0 flex-1">

                                            <p className="receipt-item-name">
                                                {item.name || 'Producto'}
                                            </p>

                                            <div className="receipt-item-info">

                                                {item.quantity !== null &&
                                                    item.quantity !== undefined && (
                                                        <span>
                                                            {formatQuantity(
                                                                item.quantity
                                                            )}

                                                            {item.unit &&
                                                                ` ${item.unit}`}
                                                        </span>
                                                    )}

                                                {item.unitPrice !== null &&
                                                    item.unitPrice !== undefined && (
                                                        <>
                                                            <span>·</span>

                                                            <span>
                                                                {formatMoney(
                                                                    item.unitPrice
                                                                )}
                                                                {item.unit &&
                                                                    ` / ${item.unit}`}
                                                            </span>
                                                        </>
                                                    )}
                                            </div>

                                            {(item.category ||
                                                item.userCategory ||
                                                item.tax) && (
                                                <div className="flex flex-wrap gap-2 mt-2">

                                                    {item.category && (
                                                        <span className="badge badge-primary">
                                                            {item.category}
                                                        </span>
                                                    )}

                                                    {item.userCategory && (
                                                        <span className="badge-category">
                                                            {item.userCategory}
                                                        </span>
                                                    )}

                                                    {item.tax && (
                                                        <span className="badge-tax">
                                                            IVA {item.tax}
                                                        </span>
                                                    )}

                                                </div>
                                            )}
                                        </div>

                                        <p className="receipt-item-total">
                                            {formatMoney(
                                                item.totalPrice
                                            )}
                                        </p>

                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* =========================
                    Payment / totals
                    ========================= */}

                <section className="card">

                    <h2 className="form-section-title mb-4">
                        Resumen
                    </h2>

                    <div className="space-y-3">

                        {receipt.subtotal !== null &&
                            receipt.subtotal !== undefined && (
                                <div className="receipt-total-row">
                                    <span>Subtotal</span>
                                    <strong>
                                        {formatMoney(
                                            receipt.subtotal
                                        )}
                                    </strong>
                                </div>
                            )}

                        {receipt.taxAmount !== null &&
                            receipt.taxAmount !== undefined && (
                                <div className="receipt-total-row">
                                    <span>Impuestos</span>
                                    <strong>
                                        {formatMoney(
                                            receipt.taxAmount
                                        )}
                                    </strong>
                                </div>
                            )}

                        {receipt.paymentMethod && (
                            <div className="receipt-total-row">
                                <span>Forma de pago</span>
                                <strong>
                                    {receipt.paymentMethod}
                                </strong>
                            </div>
                        )}

                        <div className="divider" />

                        <div className="receipt-total-row receipt-total-final">
                            <span>Total</span>

                            <strong>
                                {formatMoney(receipt.total)}
                            </strong>
                        </div>

                    </div>
                </section>

            </main>
        </div>
    );
};

export default ReceiptDetails;