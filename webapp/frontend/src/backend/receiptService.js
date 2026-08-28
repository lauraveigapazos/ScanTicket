import {
    fetchConfig,
    appFetch,
} from "./appFetch";

export const uploadReceipt = (formData, onSuccess, onErrors) =>
    appFetch(
        "/receipts",
        fetchConfig("POST", formData),
        onSuccess,
        onErrors
    );

export const getReceipt = (receiptId, onSuccess, onErrors) =>
    appFetch(
        `/receipts/${receiptId}`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );

export const getReceiptImage = (receiptId, onSuccess, onErrors) =>
    appFetch(
        `/receipts/${receiptId}/image`,
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );

export const getUserReceipts = (onSuccess, onErrors) =>
    appFetch(
        "/receipts",
        fetchConfig("GET"),
        onSuccess,
        onErrors
    );

export const updateReceipt = (receiptId, receipt, onSuccess, onErrors) =>
    appFetch(
        `/receipts/${receiptId}`,
        fetchConfig("PUT", receipt),
        onSuccess,
        onErrors
    );

export const deleteReceipt = (receiptId, onSuccess, onErrors) => appFetch(
    `/receipts/${receiptId}`,
    fetchConfig("DELETE"),
    onSuccess,
    onErrors
)