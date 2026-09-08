import { useState } from 'react';
import { uploadReceipt } from '../../../../backend/receiptService';

const ReceiptUploadCard = ({ onUploadSuccess }) => {
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validate file type
        if (!selectedFile.type.startsWith('image/')) {
            setError('Por favor selecciona una imagen válida');
            return;
        }

        // Validate file size (max 5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('La imagen no puede exceder 5MB');
            return;
        }

        setFile(selectedFile);
        setError(null);
        setSuccess(null);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target.result);
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', file);

        console.log('Uploading file:', file.name, file.size, file.type);

        uploadReceipt(
            formData,
            (response) => {
                setSuccess('Recibo subido correctamente');

                // Reset form after short delay
                setTimeout(() => {
                    setFile(null);
                    setPreview(null);
                    setSuccess(null);

                    if (onUploadSuccess) {
                        onUploadSuccess(response);
                    }
                }, 1500);

                setLoading(false);
            },
            (errors) => {
                setError(
                    errors.globalError ||
                    'Error al subir la imagen. Intenta de nuevo.'
                );
                setLoading(false);
            }
        );
    };

    const handleClear = () => {
        setFile(null);
        setPreview(null);
        setError(null);
        setSuccess(null);
    };

    return (
        <div className="w-full">
            {!preview ? (
                // Upload area
                <label className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-cambridge rounded-lg cursor-pointer hover:bg-smoke transition-colors duration-200">
                    <div className="flex flex-col items-center justify-center">
                        {/* Camera Icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-cambridge mb-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                        </svg>
                        <p className="text-sm font-semibold text-slate-gray mb-1">
                            Toca para cargar foto del recibo
                        </p>
                        <p className="text-xs text-cambridge font-sans">
                            PNG, JPG, GIF hasta 5MB
                        </p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={loading}
                    />
                </label>
            ) : (
                // Preview
                <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden bg-gray-100">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-auto max-h-96 object-cover"
                        />
                        {loading && (
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-myrtle"></div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleClear}
                            disabled={loading}
                            className="flex-1 btn-secondary"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={loading}
                            className="flex-1 btn-primary"
                        >
                            {loading ? 'Subiendo...' : 'Subir recibo'}
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-4 p-3 rounded-lg bg-melon/10 border border-melon/30 text-sm text-melon font-sans">
                    {error}
                </div>
            )}

            {success && (
                <div className="mt-4 p-3 rounded-lg bg-myrtle/10 border border-myrtle/30 text-sm text-myrtle font-sans">
                    ✓ {success}
                </div>
            )}
        </div>
    );
};

export default ReceiptUploadCard;