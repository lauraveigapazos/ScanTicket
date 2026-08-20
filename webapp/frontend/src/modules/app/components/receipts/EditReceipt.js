import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getReceipt, updateReceipt } from '../../../../backend/receiptService';
import '../../../../styles/receipts.css';

const EditReceipt = () => {
    const { receiptId } = useParams();
    const navigate = useNavigate();

    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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

    const handleChange = (event) => {
        const { name, value } = event.target;

        setReceipt((current) => ({
            ...current,
            [name]: value
        }));
    };

    const handleItemChange = (index, field, value) => {
        setReceipt((current) => ({
            ...current,
            items: current.items.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        [field]: value
                    }
                    : item
            )
        }));
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleSave = () => {
        setSaving(true);
        setError(null);

        updateReceipt(
            receiptId,
            receipt,
            () => {
                setSaving(false);
                navigate(`/receipts/${receiptId}`);
            },
            (errors) => {
                setError(
                    errors?.message ||
                    errors?.error ||
                    'No se pudo guardar el recibo'
                );
                setSaving(false);
            }
        );
    };

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
                            Editar recibo
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

    if (error && !receipt) {
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
                            Editar recibo
                        </h1>

                        <div className="w-10" />
                    </div>
                </header>

                <main className="px-5 py-6">
                    <div className="alert alert-error">
                        {error}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-smoke pb-24">

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
                        Editar recibo
                    </h1>

                    <div className="w-10" />
                </div>
            </header>

            <main className="px-5 py-6 space-y-5">

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {/* store info */}
                <section className="edit-receipt-section">

                    <h2 className="form-section-title mb-4">
                        Establecimiento
                    </h2>

                    <div className="space-y-4">

                        <div className="edit-receipt-field">
                            <label className="edit-receipt-label">
                                Nombre
                            </label>

                            <input
                                type="text"
                                name="store"
                                value={receipt.store || ''}
                                onChange={handleChange}
                                className="edit-receipt-input"
                            />
                        </div>

                        <div className="edit-receipt-field">
                            <label className="edit-receipt-label">
                                CIF
                            </label>

                            <input
                                type="text"
                                name="storeCif"
                                value={receipt.storeCif || ''}
                                onChange={handleChange}
                                className="edit-receipt-input"
                            />
                        </div>

                        <div className="edit-receipt-field">
                            <label className="edit-receipt-label">
                                Dirección
                            </label>

                            <input
                                type="text"
                                name="address"
                                value={receipt.address || ''}
                                onChange={handleChange}
                                className="edit-receipt-input"
                            />
                        </div>

                        <div className="edit-receipt-field">
                            <label className="edit-receipt-label">
                                Teléfono
                            </label>

                            <input
                                type="text"
                                name="phoneNumber"
                                value={receipt.phoneNumber || ''}
                                onChange={handleChange}
                                className="edit-receipt-input"
                            />
                        </div>

                    </div>
                </section>

                {/* item info */}
                <section className="edit-receipt-section">

                    <div className="edit-receipt-section-header">

                        <div className="edit-receipt-section-icon">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
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

                        <div>
                            <h2 className="edit-receipt-section-title">
                                Productos
                            </h2>

                            <p className="edit-receipt-section-description">
                                Modifica los productos del recibo
                            </p>
                        </div>

                    </div>

                    {(receipt.items || []).length === 0 ? (

                        <div className="py-8 text-center">
                            <p className="text-sm text-slate-gray/60">
                                No hay productos disponibles.
                            </p>
                        </div>

                    ) : (

                        <div className="edit-receipt-products">

                            {receipt.items.map((item, index) => (

                                <div
                                    key={item.id || index}
                                    className="edit-receipt-product"
                                >
                                    <div className="edit-receipt-product-header">

                                        <span className="edit-receipt-product-number">
                                            {index + 1}
                                        </span>

                                        <h3 className="edit-receipt-product-title">
                                            {item.name || 'Producto'}
                                        </h3>

                                    </div>

                                    <div className="edit-receipt-product-grid">

                                        <div className="edit-receipt-field sm:col-span-2">
                                            <label className="edit-receipt-label">
                                                Producto
                                            </label>

                                            <input
                                                type="text"
                                                value={item.name || ''}
                                                onChange={(event) =>
                                                    handleItemChange(
                                                        index,
                                                        'name',
                                                        event.target.value
                                                    )
                                                }
                                                className="edit-receipt-input"
                                            />
                                        </div>

                                        <div className="edit-receipt-field">
                                            <label className="edit-receipt-label">
                                                Cantidad
                                            </label>

                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={item.quantity ?? ''}
                                                onChange={(event) =>
                                                    handleItemChange(
                                                        index,
                                                        'quantity',
                                                        event.target.value
                                                    )
                                                }
                                                className="edit-receipt-input"
                                            />
                                        </div>

                                        <div className="edit-receipt-field">
                                            <label className="edit-receipt-label">
                                                Unidad
                                            </label>

                                            <input
                                                type="text"
                                                value={item.unit || ''}
                                                onChange={(event) =>
                                                    handleItemChange(
                                                        index,
                                                        'unit',
                                                        event.target.value
                                                    )
                                                }
                                                className="edit-receipt-input"
                                            />
                                        </div>

                                        <div className="edit-receipt-field">
                                            <label className="edit-receipt-label">
                                                Precio unitario
                                            </label>

                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={item.unitPrice ?? ''}
                                                onChange={(event) =>
                                                    handleItemChange(
                                                        index,
                                                        'unitPrice',
                                                        event.target.value
                                                    )
                                                }
                                                className="edit-receipt-input"
                                            />
                                        </div>

                                        <div className="edit-receipt-field">
                                            <label className="edit-receipt-label">
                                                Precio total
                                            </label>

                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={item.totalPrice ?? ''}
                                                onChange={(event) =>
                                                    handleItemChange(
                                                        index,
                                                        'totalPrice',
                                                        event.target.value
                                                    )
                                                }
                                                className="edit-receipt-input"
                                            />
                                        </div>

                                        <div className="edit-receipt-field">
                                            <label className="edit-receipt-label">
                                                Categoría
                                            </label>

                                            <input
                                                type="text"
                                                value={item.category || ''}
                                                onChange={(event) =>
                                                    handleItemChange(
                                                        index,
                                                        'category',
                                                        event.target.value
                                                    )
                                                }
                                                className="edit-receipt-input"
                                            />
                                        </div>

                                        <div className="edit-receipt-field">
                                            <label className="edit-receipt-label">
                                                IVA
                                            </label>

                                            <input
                                                type="text"
                                                value={item.tax || ''}
                                                onChange={(event) =>
                                                    handleItemChange(
                                                        index,
                                                        'tax',
                                                        event.target.value
                                                    )
                                                }
                                                className="edit-receipt-input"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* overview */}
                <section className="edit-receipt-section">

                    <div className="edit-receipt-section-header">

                        <div className="edit-receipt-section-icon">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M3 10h18"/>
                                <path d="M7 15h2"/>
                                <path d="M15 15h2"/>
                                <rect
                                    width="20"
                                    height="14"
                                    x="2"
                                    y="5"
                                    rx="2"
                                />
                            </svg>
                        </div>

                        <div>
                            <h2 className="edit-receipt-section-title">
                                Resumen
                            </h2>

                            <p className="edit-receipt-section-description">
                                Totales y forma de pago
                            </p>
                        </div>

                    </div>

                    <div className="edit-receipt-fields">

                        <div className="edit-receipt-field">
                            <label className="edit-receipt-label">
                                Subtotal
                            </label>

                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="subtotal"
                                value={receipt.subtotal ?? ''}
                                onChange={handleChange}
                                className="edit-receipt-input"
                            />
                        </div>

                        <div className="edit-receipt-field">
                            <label className="edit-receipt-label">
                                Impuestos
                            </label>

                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="taxAmount"
                                value={receipt.taxAmount ?? ''}
                                onChange={handleChange}
                                className="edit-receipt-input"
                            />
                        </div>

                        <div className="edit-receipt-field">
                            <label className="edit-receipt-label">
                                Total
                            </label>

                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="total"
                                value={receipt.total ?? ''}
                                onChange={handleChange}
                                className="edit-receipt-input"
                            />
                        </div>

                        <div className="edit-receipt-field">
                            <label className="edit-receipt-label">
                                Forma de pago
                            </label>

                            <input
                                type="text"
                                name="paymentMethod"
                                value={receipt.paymentMethod || ''}
                                onChange={handleChange}
                                className="edit-receipt-input"
                            />
                        </div>

                    </div>

                </section>

                {/* actions */}
                <div className="edit-receipt-actions">

                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={saving}
                        className="edit-receipt-cancel"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="edit-receipt-save"
                    >
                        {saving ? (
                            <>
                                <span className="edit-receipt-spinner"/>
                                Guardando...
                            </>
                        ) : (
                            <>
                                Guardar cambios
                            </>
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default EditReceipt;