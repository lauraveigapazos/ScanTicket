import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import '../../../../styles/statistics.css';

const AXIS_TICK = { fontSize: 12, fill: '#32433DB3' };

const DailySpendingChart = ({ dailySpending }) => {
    if (!dailySpending || dailySpending.length === 0) {
        return null;
    }

    const maxAmount = Math.round(Math.max(...dailySpending.map(d => d.amount), 100));

    return (
        <div className="chart-card">
            <h3 className="chart-title">Gastos por día</h3>

            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dailySpending} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke="#CFD5D1" strokeOpacity={0.6} />
                    <XAxis
                        dataKey="day"
                        height={20}
                        tick={AXIS_TICK}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                        minTickGap={20}
                    />
                    <YAxis
                        domain={[0, maxAmount]}
                        ticks={[0, Math.round(maxAmount / 2), maxAmount]}
                        tickFormatter={(value) => `€${value}`}
                        width={40}
                        tick={AXIS_TICK}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        isAnimationActive={false}
                        formatter={(value) => [`€${value.toFixed(2)}`, 'Gasto']}
                        labelFormatter={(day) => `Día ${day}`}
                    />
                    <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#7AA89D"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#7AA89D', stroke: 'none' }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DailySpendingChart;
