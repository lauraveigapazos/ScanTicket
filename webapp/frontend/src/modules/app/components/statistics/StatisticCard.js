import React from 'react';
import '../../../../styles/statistics.css';

const StatisticCard = ({ icon: Icon, label, value }) => {
    return (
        <div className="statistic-card">
            <div className="statistic-card-icon">
                <Icon />
            </div>
            <div className="statistic-card-content">
                <p className="statistic-card-label">{label}</p>
                <p className="statistic-card-value">{value}</p>
            </div>
        </div>
    );
};

//custom icons
StatisticCard.WalletIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="statistic-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="1"/>
        <path d="M12 1v6m0 6v6"/>
        <path d="M4.22 4.22l4.24 4.24m2.12 2.12l4.24 4.24"/>
        <path d="M1 12h6m6 0h6"/>
        <path d="M4.22 19.78l4.24-4.24m-2.12-2.12l-4.24-4.24"/>
        <path d="M19.78 19.78l-4.24-4.24m-2.12-2.12l-4.24-4.24"/>
        <path d="M19.78 4.22l-4.24 4.24m-2.12 2.12l-4.24 4.24"/>
        <path d="M23 12a11 11 0 1 1-22 0 11 11 0 0 1 22 0"/>
    </svg>
);

StatisticCard.ReceiptIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="statistic-icon"
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
);

StatisticCard.TrendIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="statistic-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
);

export default StatisticCard;