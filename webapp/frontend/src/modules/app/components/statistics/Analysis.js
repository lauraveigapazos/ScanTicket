import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStatisticsByDateRange} from '../../../../backend/statisticsService';
import StatisticCard from "./StatisticCard";
import DailySpendingChart from "./DailySpendingChart";
import CategorySpendingWheel from "./CategorySpendingWheel";

const Analysis = () => {
    const navigate = useNavigate();
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    //default current month
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    });

    useEffect(() => {
        if (!selectedMonth) return;

        setLoading(true);
        setError(null);

        //built as plain strings: toISOString() converts to UTC and shifts the range by a day
        const [year, month] = selectedMonth.split('-');
        const lastDay = new Date(year, parseInt(month), 0).getDate();

        getStatisticsByDateRange(
            `${year}-${month}-01`,
            `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
            (data) => {
                setStatistics(data);
                setLoading(false);
            },
            (err) => {
                setError('Error al cargar las estadísticas');
                console.error(err);
                setLoading(false);
            }
        );
    }, [selectedMonth]);

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
    };

    const formatCurrency = (value) => {
        if (!value) return '0,00€';
        return `${parseFloat(value).toFixed(2).replace('.', ',')}€`;
    };

    return (
        <div className="min-h-screen bg-smoke pb-20">
            {/* header */}
            <div className="bg-white border-b-2 border-timberwolf px-5 py-4 sticky top-0 z-20">
                <div className="flex items-center justify-between">
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
                        <h1 className="text-lg font-bold text-slate-gray font-heading">Análisis</h1>
                    </div>

                    {/* month selector */}
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={handleMonthChange}
                        className="input-field py-2 text-sm w-40"
                    />
                </div>
            </div>

            {/* content */}
            <div className="px-5 py-6 max-w-6xl mx-auto">
                {error && (
                    <div className="alert alert-error mb-6">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-cambridge border-t-myrtle"></div>
                        </div>
                    </div>
                ) : statistics ? (
                    <div className="space-y-6">
                        {/* stat cards */}
                        <div className="space-y-3">
                            <h2 className="text-sm font-semibold text-slate-gray uppercase tracking-wide">
                                Resumen
                            </h2>
                            <div className="statistics-cards-grid">
                                <StatisticCard
                                    icon={StatisticCard.WalletIcon}
                                    label="Total gastado"
                                    value={formatCurrency(statistics.totalSpent)}
                                />
                                <StatisticCard
                                    icon={StatisticCard.ReceiptIcon}
                                    label="Nº de tickets"
                                    value={statistics.receiptCount}
                                />
                                <StatisticCard
                                    icon={StatisticCard.TrendIcon}
                                    label="Gasto por día (media)"
                                    value={formatCurrency(statistics.averageSpendingPerDay)}
                                />
                            </div>
                        </div>

                        {statistics.receiptCount > 0 ? (
                            <>
                                <DailySpendingChart dailySpending={statistics.dailySpending} />
                                <CategorySpendingWheel spendingByCategory={statistics.spendingByCategory} />
                            </>
                        ) : (
                            <div className="card text-center py-12">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-12 w-12 text-cambridge mx-auto mb-3 opacity-50"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                                    <path d="M8 10h8" />
                                    <path d="M8 14h4" />
                                </svg>
                                <p className="text-cambridge font-sans text-sm">
                                    No hay datos disponibles para este período
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="card text-center py-12">
                        <p className="text-slate-gray/60">
                            No hay estadísticas disponibles
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analysis