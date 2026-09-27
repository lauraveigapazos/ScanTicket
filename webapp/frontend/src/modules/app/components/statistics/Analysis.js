import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getStatisticsByDateRange} from '../../../../backend/statisticsService';
import StatisticCard from "./StatisticCard";
import DailySpendingChart from "./DailySpendingChart";
import CategorySpendingWheel from "./CategorySpendingWheel";
import Header from "../ui/Header";

// ponytail: fixed window of selectable months; derive it from the oldest receipt if users need more history
const MONTHS_LISTED = 36;

//"YYYY-MM" of a date's month
const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

//"Septiembre 2026"; built by hand because es-ES formats month + year as "septiembre de 2026"
const monthLabel = (key) => {
    const [year, month] = key.split('-').map(Number);
    const name = new Date(year, month - 1).toLocaleDateString('es-ES', { month: 'long' });
    return `${name[0].toUpperCase()}${name.slice(1)} ${year}`;
};

const Analysis = () => {
    const { sidebarOpen, setSidebarOpen } = useOutletContext() || {};
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    //default current month
    const [selectedMonth, setSelectedMonth] = useState(() => monthKey(new Date()));

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

    //newest first: current month, then back MONTHS_LISTED - 1 months
    const today = new Date();
    const months = Array.from({ length: MONTHS_LISTED },
        (_, i) => monthKey(new Date(today.getFullYear(), today.getMonth() - i)));
    const selectedIndex = months.indexOf(selectedMonth);

    const formatCurrency = (value) => {
        if (!value) return '0,00€';
        return `${parseFloat(value).toFixed(2).replace('.', ',')}€`;
    };

    return (
        <div className="min-h-screen bg-smoke pb-20">
            <Header title="Análisis" onMenuClick={() => setSidebarOpen(!sidebarOpen)}/>

            {/* content */}
            <div className="px-5 py-6 max-w-6xl mx-auto">
                {/* month selector */}
                <div className="flex justify-center md:justify-end mb-6">
                    <div className="inline-flex items-center gap-1 rounded-full bg-white border border-timberwolf p-1 shadow-sm">
                        <button
                            type="button"
                            onClick={() => setSelectedMonth(months[selectedIndex + 1])}
                            disabled={selectedIndex === months.length - 1}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-full text-myrtle hover:bg-cambridge/15 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            aria-label="Mes anterior"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m15 18-6-6 6-6"/>
                            </svg>
                        </button>
                        {/* invisible native select over the label: opens the platform's month list */}
                        <label className="relative min-w-[8rem] px-2 py-1 rounded-full text-center text-sm font-semibold font-heading text-slate-gray cursor-pointer hover:bg-cambridge/15 focus-within:ring-2 focus-within:ring-cambridge transition-colors">
                            {monthLabel(selectedMonth)}
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="absolute inset-0 w-full opacity-0 cursor-pointer"
                                aria-label="Mes"
                            >
                                {months.map((month) => (
                                    <option key={month} value={month}>{monthLabel(month)}</option>
                                ))}
                            </select>
                        </label>
                        <button
                            type="button"
                            onClick={() => setSelectedMonth(months[selectedIndex - 1])}
                            disabled={selectedIndex === 0}
                            className="w-8 h-8 inline-flex items-center justify-center rounded-full text-myrtle hover:bg-cambridge/15 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            aria-label="Mes siguiente"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m9 18 6-6-6-6"/>
                            </svg>
                        </button>
                    </div>
                </div>

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