import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteReceipt } from '../../../../backend/receiptService';
import '../../../../styles/receipts.css';

const ReceiptCard = ({ receipt, onDeleted }) => {
    const navigate = useNavigate();

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    const formatDate = () => {
        if (receipt.date && receipt.time) {
            return new Date(`${receipt.date}T${receipt.time}`)
                .toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
        }

        if (receipt.createdAt) {
            return new Date(receipt.createdAt)
                .toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
        }

        return 'Fecha no disponible';
    };

    const formattedTotal =
        receipt.total && receipt.total > 0
            ? `€${parseFloat(receipt.total).toFixed(2)}`
            : '-';

    const handleCardClick = () => {
        navigate(`/receipts/${receipt.id}`);
    };

    const handleDeleteClick = (event) => {
        event.stopPropagation();
        setShowConfirmation(true);
        setError(null);
    };

    const handleConfirmDelete = () => {
        setDeleting(true);
        setError(null);

        deleteReceipt(
            receipt.id,
            () => {
                setDeleting(false);
                setShowConfirmation(false);

                if (onDeleted) {
                    onDeleted(receipt.id);
                }
            },
            (error) => {
                setDeleting(false);
                setError(error);
            }
        );
    };

    const handleCancelDelete = () => {
        if (!deleting) {
            setShowConfirmation(false);
            setError(null);
        }
    };

    return (
        <>
            <div
                className="receipt-card"
                onClick={handleCardClick}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleCardClick();
                    }
                }}
            >
                <div className="receipt-card-info">
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
                            <circle cx="9" cy="21" r="1"/>
                            <circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                    </div>

                    <div className="receipt-card-details">
                        <p className="receipt-card-store">
                            {receipt.store || 'Tienda desconocida'}
                        </p>

                        <p className="receipt-card-date">
                            {formatDate()}
                        </p>
                    </div>
                </div>

                <div className="receipt-card-actions">
                    <button
                        type="button"
                        className="receipt-card-delete"
                        onClick={handleDeleteClick}
                        aria-label="Eliminar recibo"
                        title="Eliminar recibo"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>

                    <div className="receipt-card-bottom-right">
                        <p className="receipt-card-amount">
                            {formattedTotal}
                        </p>

                        <span className="receipt-card-arrow">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
            </span>
                    </div>
                </div>
            </div>

            {/* popup */}
            {showConfirmation && (
                <div
                    className="receipt-modal-backdrop"
                    onClick={handleCancelDelete}
                >
                    <div
                        className="receipt-confirmation-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={`delete-receipt-title-${receipt.id}`}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="receipt-confirmation-icon">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14H6L4 6"/>
                                <path d="M10 11v6"/>
                                <path d="M14 11v6"/>
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                        </div>

                        <h2
                            id={`delete-receipt-title-${receipt.id}`}
                            className="receipt-confirmation-title"
                        >
                            ¿Eliminar recibo?
                        </h2>

                        <p className="receipt-confirmation-text">
                            ¿Seguro que quieres eliminar el recibo de{' '}
                            <strong>
                                {receipt.store || 'tienda desconocida'}
                            </strong>
                            ? Esta acción no se puede deshacer.
                        </p>

                        {error && (
                            <div className="alert alert-error mt-4">
                                {error}
                            </div>
                        )}

                        <div className="receipt-confirmation-actions">
                            <button
                                type="button"
                                className="receipt-confirmation-cancel"
                                onClick={handleCancelDelete}
                                disabled={deleting}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="receipt-delete-confirm-button"
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                            >
                                {deleting && (
                                    <span className="receipt-delete-spinner"/>
                                )}

                                {deleting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReceiptCard;