import { useMemo, useState } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { categoryLabel } from '../../../../config/categories';
import '../../../../styles/statistics.css';

const COLORS = [
    '#5E8F84', // viridian
    '#7AA89D', // cambridge
    '#3D6F68', // myrtle
    '#E8C48D', // sunset
    '#EBAA9A', // melon
    '#D47F72', // coral
    '#CFD5D1', // timberwolf
    '#32433D', // slate-gray
];

const CATEGORY_SOURCES = [
    { value: 'preferred', label: 'Automáticas y mías (prioridad a las mías)' },
    { value: 'automatic', label: 'Solo automáticas' },
    { value: 'user', label: 'Solo mías' },
];

const CategorySourceMenu = ({ source, onChange }) => {
    const [open, setOpen] = useState(false);

    const closeWhenFocusLeaves = (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setOpen(false);
        }
    };

    return (
        <div className="category-source" onBlur={closeWhenFocusLeaves}>
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="category-source-button"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                Categorías mostradas
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 6h16"/>
                    <path d="M7 12h10"/>
                    <path d="M10 18h4"/>
                </svg>
            </button>

            {open && (
                <div role="menu" className="category-source-menu">
                    {CATEGORY_SOURCES.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            role="menuitemradio"
                            aria-checked={option.value === source}
                            onClick={() => {
                                onChange(option.value);
                                setOpen(false);
                            }}
                            className="category-source-option"
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const CategorySpendingWheel = ({ spendingByCategory, spendingByAutomaticCategory, spendingByUserCategory }) => {

    const [source, setSource] = useState('preferred');
    const [hidden, setHidden] = useState(new Set());

    const toggleHidden = (name) => setHidden((current) => {
        const next = new Set(current);
        next.has(name) ? next.delete(name) : next.add(name);
        return next;
    });

    const spending = {
        preferred: spendingByCategory,
        automatic: spendingByAutomaticCategory,
        user: spendingByUserCategory,
    }[source];

    const data = useMemo(() => {
        if (!spending || spending.length === 0) {
            return [];
        }

        return spending.map((item, index) => ({
            name: categoryLabel(item.category),
            value: parseFloat(item.amount),
            color: COLORS[index % COLORS.length]
        }));
    }, [spending]);

    const header = (
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-gray/60 uppercase tracking-widest font-heading">
                Gasto por categoría
            </h3>
            <CategorySourceMenu source={source} onChange={setSource} />
        </div>
    );

    if (!data || data.length === 0) {
        return (
            <div className="card">
                {header}
                <div className="text-center py-8">
                    <p className="text-sm text-slate-gray/60">
                        No hay datos de categorías disponibles
                    </p>
                </div>
            </div>
        );
    }

    const visibleData = data.filter((item) => !hidden.has(item.name));
    const total = visibleData.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = ((data.value / total) * 100).toFixed(1);
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-timberwolf">
                    <p className="font-semibold text-slate-gray text-sm">{data.name}</p>
                    <p className="text-myrtle text-sm">
                        €{data.value.toFixed(2)} ({percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="card">
            {header}

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* chart */}
                <div className="w-full sm:w-1/2">
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={visibleData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={85}
                                paddingAngle={2}
                                dataKey="value"
                                label={false}
                            >
                                {visibleData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* legend */}
                <ul className="w-full sm:w-1/2 space-y-1.5">
                    {data.map((item, index) => {
                        const isHidden = hidden.has(item.name);
                        return (
                            <li key={`legend-${index}`}>
                                <button
                                    type="button"
                                    onClick={() => toggleHidden(item.name)}
                                    aria-pressed={!isHidden}
                                    title={isHidden ? 'Mostrar en el gráfico' : 'Ocultar del gráfico'}
                                    className={`w-full flex items-center gap-2 text-xs text-left cursor-pointer ${isHidden ? 'opacity-40' : ''}`}
                                >
                                    <span
                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="flex-1 truncate font-medium text-slate-gray">
                                        {item.name}
                                    </span>
                                    <span className="font-bold text-slate-gray">
                                        €{item.value.toFixed(2)}
                                    </span>
                                    <span className="w-10 text-right text-slate-gray/60">
                                        {isHidden ? '' : `${((item.value / total) * 100).toFixed(1)}%`}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default CategorySpendingWheel