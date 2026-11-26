import NetworkError from "./NetworkError";
import { config } from "../config/constants.js";

let networkErrorCallback;
let reauthenticationCallback;

const UNEXPECTED_ERROR = "Se ha producido un error inesperado. Inténtalo de nuevo.";
const CONNECTION_ERROR = "No se ha podido conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.";

const isJson = (response) => {
  const contentType = response.headers.get("content-type");

  return contentType && contentType.indexOf("application/json") !== -1;
};

const handleOkResponse = (response, onSuccess) => {
  if (!response.ok) {
    return false;
  }

  if (!onSuccess) {
    return true;
  }

  if (response.status === 204) {
    onSuccess();
    return true;
  }

  if (isJson(response)) {
    response.json().then((payload) => onSuccess(payload));
  } else {
    response.blob().then((blob) => onSuccess(blob));
  }

  return true;
};

const hasErrors = (payload) => payload && (payload.globalError || payload.fieldErrors);

const handleErrorResponse = (response, onErrors) => {
  if (response.status === 401) {
    //expired or invalid token: drop the session and let the app send the user to the login page
    removeServiceToken();
    if (reauthenticationCallback) {
      reauthenticationCallback();
    }
    return undefined;
  }

  if (!isJson(response)) {
    throw new NetworkError();
  }

  return response.json().then((payload) => {
    if (hasErrors(payload)) {
      if (onErrors) {
        onErrors(payload);
      }
      return;
    }

    //no app-authored message to show (e.g. an unhandled server error)
    throw new NetworkError();
  });
};

const handleResponse = (response, onSuccess, onErrors) => {
  if (handleOkResponse(response, onSuccess)) {
    return undefined;
  }

  return handleErrorResponse(response, onErrors);
};

//without a global handler, the component still gets a message so it can leave its loading state
const handleFailure = (error, onErrors) => {
  if (networkErrorCallback) {
    networkErrorCallback(error);
  } else if (onErrors) {
    onErrors({ globalError: error instanceof NetworkError ? UNEXPECTED_ERROR : CONNECTION_ERROR });
  }
};

export const init = (callback) => (networkErrorCallback = callback);

export const setReauthenticationCallback = (callback) =>
  (reauthenticationCallback = callback);

export const setServiceToken = (serviceToken) =>
  sessionStorage.setItem(config.SERVICE_TOKEN_NAME, serviceToken);

export const getServiceToken = () =>
  sessionStorage.getItem(config.SERVICE_TOKEN_NAME);

export const removeServiceToken = () =>
  sessionStorage.removeItem(config.SERVICE_TOKEN_NAME);

export const fetchConfig = (method, body) => {
  const fConfig = {
    method: method,
  };

  if (body) {
    if (body instanceof FormData) {
      fConfig.body = body;
    } else {
      fConfig.headers = { "Content-Type": "application/json" };
      fConfig.body = JSON.stringify(body);
    }
  }

  const serviceToken = getServiceToken();

  if (serviceToken) {
    if (fConfig.headers) {
      fConfig.headers["Authorization"] = `Bearer ${serviceToken}`;
    } else {
      fConfig.headers = { Authorization: `Bearer ${serviceToken}` };
    }
  }

  return fConfig;
};

export const appFetch = (path, options, onSuccess, onErrors) =>
  fetch(`${config.BASE_PATH}${path}`, options)
    .then((response) => handleResponse(response, onSuccess, onErrors))
    .catch((error) => handleFailure(error, onErrors));
