import { useNavigate, useOutletContext } from 'react-router-dom';
import ReceiptUploadCard from "./ReceiptUploadCard";
import Header from "../ui/Header";

const ReceiptUpload = () => {
    const navigate = useNavigate();
    const { sidebarOpen, setSidebarOpen } = useOutletContext() || {};

    const handleUploadSuccess = (response) => {
        navigate(`/receipts/${response.id}`, { replace: true });
    };

    return (
        <div className="min-h-screen bg-smoke pb-20">
            <Header title="Subir ticket" onMenuClick={() => setSidebarOpen(!sidebarOpen)}/>

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