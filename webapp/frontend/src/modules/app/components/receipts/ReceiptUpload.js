import { useNavigate } from 'react-router-dom';
import ReceiptUploadCard from "./ReceiptUploadCard";

const ReceiptUpload = () => {
    const navigate = useNavigate();

    const handleUploadSuccess = (response) => {
        //redirect home
        setTimeout(() => {
            navigate('/home');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-smoke pb-20">
            {/* header */}
            <div className="bg-white border-b-2 border-timberwolf px-5 py-4 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-smoke rounded-lg transition-colors"
                        aria-label="Volver"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-slate-gray"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                    </button>
                    <h1 className="text-lg font-bold text-slate-gray font-heading">Subir ticket</h1>
                </div>
            </div>

            <div className="px-5 py-6 max-w-2xl mx-auto">
                <div className="card">
                    <h2 className="form-section-title mb-4">Añadir nuevo recibo</h2>
                    <ReceiptUploadCard onUploadSuccess={handleUploadSuccess} />
                </div>

                {/* tips */}
                <div className="card bg-sunset/5 border-sunset/30 mt-6">
                    <h3 className="text-sm font-semibold text-slate-gray mb-3 font-heading">
                        Para mejores resultados:
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-gray/70 font-sans">
                        <li className="flex gap-2">
                            <span className="flex-shrink-0">•</span>
                            <span>Asegúrate de que el recibo sea legible y esté bien iluminado.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="flex-shrink-0">•</span>
                            <span>Incluye todo el recibo en la foto, especialmente los totales.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="flex-shrink-0">•</span>
                            <span>Evita fotos borrosas o con sombras.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ReceiptUpload;