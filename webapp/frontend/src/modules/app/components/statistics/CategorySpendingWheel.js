import { useMemo } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { categoryLabel } from '../../../../config/categories';

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

const CategorySpendingWheel = ({ spendingByCategory }) => {

    const data = useMemo(() => {
        if (!spendingByCategory || spendingByCategory.length === 0) {
            return [];
        }

        return spendingByCategory.map((item, index) => ({
            name: categoryLabel(item.category),
            value: parseFloat(item.amount),
            color: COLORS[index % COLORS.length]
        }));
    }, [spendingByCategory]);

    if (!data || data.length === 0) {
        return (
            <div className="card">
                <h3 className="text-xs font-semibold text-slate-gray/60 uppercase tracking-widest mb-4 font-heading">
                    Gasto por categoría
                </h3>
                <div className="text-center py-8">
                    <p className="text-sm text-slate-gray/60">
                        No hay datos de categorías disponibles
                    </p>
                </div>
            </div>
        );
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);

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
            <h3 className="text-xs font-semibold text-slate-gray/60 uppercase tracking-widest mb-4 font-heading">
                Gasto por categoría
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* chart */}
                <div className="w-full sm:w-1/2">
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={85}
                                paddingAngle={2}
                                dataKey="value"
                                label={false}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* legend */}
                <ul className="w-full sm:w-1/2 space-y-1.5">
                    {data.map((item, index) => (
                        <li key={`legend-${index}`} className="flex items-center gap-2 text-xs">
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
                                {((item.value / total) * 100).toFixed(1)}%
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CategorySpendingWheel