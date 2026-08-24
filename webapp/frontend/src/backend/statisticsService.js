import {
    fetchConfig,
    appFetch,
} from "./appFetch";

export const getCurrentMonthStatistics = (onSuccess, onErrors) =>
    appFetch(
        "/statistics",
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );

export const getStatisticsByDateRange = (startDate, endDate, onSuccess, onErrors) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    return appFetch(
        `/statistics?${params}`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );
};