import {
  fetchConfig,
  appFetch,
  setServiceToken,
  getServiceToken,
  removeServiceToken,
} from "./appFetch";

const processLoginSignUp = (authenticatedUser, onSuccess) => {
  setServiceToken(authenticatedUser.serviceToken);
  onSuccess(authenticatedUser);
}

export const login = (
  userName,
  password,
  onSuccess,
  onErrors
) =>
  appFetch(
    "/users/login",
    fetchConfig("POST", { userName, password }),
    (authenticatedUser) => {
      processLoginSignUp(authenticatedUser, onSuccess);
    },
    onErrors
  );

export const tryLoginFromServiceToken = (onSuccess) => {
  const serviceToken = getServiceToken();

  if (!serviceToken) {
    onSuccess();
    return;
  }

  appFetch(
    "/users/loginFromServiceToken",
    fetchConfig("POST"),
    (authenticatedUser) => onSuccess(authenticatedUser),
    () => removeServiceToken()
  );
};

export const signUp = (user, onSuccess, onErrors) => {
  appFetch(
    "/users/signUp",
    fetchConfig("POST", user),
    (authenticatedUser) => {
      processLoginSignUp(authenticatedUser, onSuccess);
    },
    onErrors
  );
};

export const logout = () => removeServiceToken();

export const updateProfile = (user, onSuccess, onErrors) =>
  appFetch(`/users/${user.id}`, fetchConfig("PUT", user), onSuccess, onErrors);

export const changePassword = (
  id,
  oldPassword,
  newPassword,
  onSuccess,
  onErrors
) =>
  appFetch(
    `/users/${id}/changePassword`,
    fetchConfig("POST", { oldPassword, newPassword }),
    onSuccess,
    onErrors
  );

export const forgotPassword = (email, onSuccess, onErrors) =>
    appFetch(
        "/users/forgotPassword",
        fetchConfig("POST", { email }),
        onSuccess,
        onErrors
    );

export const resetPassword = (token, newPassword, onSuccess, onErrors) =>
    appFetch(
        "/users/resetPassword",
        fetchConfig("POST", { token, newPassword }),
        onSuccess,
        onErrors
    );
