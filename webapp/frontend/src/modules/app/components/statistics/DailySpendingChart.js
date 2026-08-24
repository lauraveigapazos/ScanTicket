import React from 'react';
import '../../../../styles/statistics.css';

const DailySpendingChart = ({ dailySpending }) => {
    if (!dailySpending || dailySpending.length === 0) {
        return null;
    }

    //find max value for scaling
    const maxAmount = Math.max(...dailySpending.map(d => d.amount), 100);
    const scale = 100 / maxAmount;

    return (
        <div className="chart-card">
            <h3 className="chart-title">Gastos por día</h3>

            <div className="chart-container">
                <div className="chart-y-axis">
                    <div className="chart-y-label">€{Math.round(maxAmount)}</div>
                    <div className="chart-y-label">€{Math.round(maxAmount / 2)}</div>
                    <div className="chart-y-label">€0</div>
                </div>

                <div className="chart-plot">
                    <svg viewBox={`0 0 ${dailySpending.length * 20} 120`} className="chart-svg" preserveAspectRatio="xMidYMid meet">
                        {/* grid lines */}
                        <line x1="0" y1="100" x2={dailySpending.length * 20} y2="100" className="chart-grid-line" />
                        <line x1="0" y1="50" x2={dailySpending.length * 20} y2="50" className="chart-grid-line" />

                        {/* line path */}
                        <polyline
                            points={dailySpending
                                .map((d, i) => {
                                    const x = i * 20 + 10;
                                    const y = 100 - (d.amount * scale);
                                    return `${x},${y}`;
                                })
                                .join(' ')}
                            className="chart-line"
                            fill="none"
                        />

                        {/* area under line */}
                        <polygon
                            points={`0,100 ${dailySpending
                                .map((d, i) => {
                                    const x = i * 20 + 10;
                                    const y = 100 - (d.amount * scale);
                                    return `${x},${y}`;
                                })
                                .join(' ')} ${dailySpending.length * 20},100`}
                            className="chart-area"
                        />

                        {/* dots */}
                        {dailySpending.map((d, i) => {
                            const x = i * 20 + 10;
                            const y = 100 - (d.amount * scale);
                            return (
                                <circle
                                    key={i}
                                    cx={x}
                                    cy={y}
                                    r="2.5"
                                    className="chart-dot"
                                />
                            );
                        })}
                    </svg>

                    {/* X-axis labels */}
                    <div className="chart-x-axis">
                        {[0, Math.floor(dailySpending.length / 2), dailySpending.length - 1].map(
                            (idx) => {
                                if (idx >= dailySpending.length) return null;
                                return (
                                    <span key={idx} className="chart-x-label" style={{marginLeft: idx === 0 ? 0 : 'auto', marginRight: idx === dailySpending.length - 1 ? 0 : 'auto'}}>
                                        {dailySpending[idx].day}
                                    </span>
                                );
                            }
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailySpendingChart;