import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {logout, tryLoginFromServiceToken} from '../../../backend/userService';
import { getUserReceipts } from '../../../backend/receiptService';
import ReceiptUpload from '../components/receipts/ReceiptUpload';
import ReceiptCard from '../components/receipts/ReceiptCard';
import '../../../styles/profile.css';
import '../../../styles/receipts.css';

const Home = () => {
    const navigate = useNavigate();
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState(null);

    //load user profile
    useEffect(() => {
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                if (authenticatedUser?.user) {
                    setProfile(authenticatedUser.user);
                }
            },
            (error) => {
                console.error("Failed to authenticate:", error);
            }
        );
    }, []);

    //load receipts
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

    const handleProfileClick = () => {
        if (profile?.id) {
            navigate(`/profile/${profile.id}`);
        }
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
                            onClick={handleProfileClick}
                            className="home-profile-button"
                            title="Ver perfil"
                            aria-label="Ver perfil"
                        >
                            {profile?.profilePicture ? (
                                <img
                                    src={`data:image/jpeg;base64,${profile.profilePicture}`}
                                    alt={`${profile.firstName} ${profile.lastName}`}
                                    className="home-profile-image"
                                />
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="home-profile-icon"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <div className="px-5 py-6 space-y-6 pb-20">
                    {/* upload */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-slate-gray mb-4">
                            Añadir nuevo recibo
                        </h2>
                        <ReceiptUpload onUploadSuccess={handleUploadSuccess}/>
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