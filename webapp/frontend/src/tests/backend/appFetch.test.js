import {
  appFetch,
  fetchConfig,
  getServiceToken,
  init,
  setReauthenticationCallback,
  setServiceToken,
} from "../../backend/appFetch";

const response = (status, body, contentType = "application/json") => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: () => contentType },
  json: () => Promise.resolve(body),
  blob: () => Promise.resolve("blob"),
});

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("fetchConfig", () => {
  beforeEach(() => sessionStorage.clear());

  it("serializes JSON bodies and adds the bearer token", () => {
    setServiceToken("abc");

    expect(fetchConfig("POST", { a: 1 })).toEqual({
      method: "POST",
      body: '{"a":1}',
      headers: { "Content-Type": "application/json", Authorization: "Bearer abc" },
    });
  });

  it("sends FormData untouched so the browser sets the multipart boundary", () => {
    const formData = new FormData();

    const result = fetchConfig("POST", formData);

    expect(result.body).toBe(formData);
    expect(result.headers).toBeUndefined();
  });
});

describe("appFetch", () => {
  const onSuccess = jest.fn();
  const onErrors = jest.fn();
  const onNetworkError = jest.fn();
  const onReauthenticate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    init(onNetworkError);
    setReauthenticationCallback(onReauthenticate);
  });

  const call = async (res) => {
    global.fetch = jest.fn(() => Promise.resolve(res));
    await appFetch("/path", {}, onSuccess, onErrors);
    await flush();
  };

  it("prefixes the API base path", async () => {
    await call(response(204));

    expect(global.fetch).toHaveBeenCalledWith("/scanticket/api/path", {});
  });

  it("passes JSON payloads to onSuccess", async () => {
    await call(response(200, { id: 1 }));

    expect(onSuccess).toHaveBeenCalledWith({ id: 1 });
  });

  it("passes non-JSON payloads as blobs", async () => {
    await call(response(200, null, "image/jpeg"));

    expect(onSuccess).toHaveBeenCalledWith("blob");
  });

  it("calls onErrors with backend validation errors", async () => {
    await call(response(400, { globalError: "bad" }));

    expect(onErrors).toHaveBeenCalledWith({ globalError: "bad" });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("asks to reauthenticate on 401", async () => {
    await call(response(401, {}));

    expect(onReauthenticate).toHaveBeenCalled();
    expect(onErrors).not.toHaveBeenCalled();
  });

  it("reports server errors as network errors", async () => {
    await call(response(500, {}));

    expect(onNetworkError).toHaveBeenCalled();
  });

  it("passes server errors with a message to onErrors", async () => {
    await call(response(500, { globalError: "No se ha podido procesar el ticket." }));

    expect(onErrors).toHaveBeenCalledWith({ globalError: "No se ha podido procesar el ticket." });
    expect(onNetworkError).not.toHaveBeenCalled();
  });

  it("clears the stored token on 401", async () => {
    setServiceToken("expired");

    await call(response(401, {}));

    expect(getServiceToken()).toBeNull();
  });

  describe("without a global network error handler", () => {
    beforeEach(() => init(undefined));

    it("gives the component a generic message for unexpected server errors", async () => {
      await call(response(500, {}));

      expect(onErrors).toHaveBeenCalledWith({ globalError: expect.stringContaining("error inesperado") });
    });

    it("gives the component a connection message when the request fails", async () => {
      global.fetch = jest.fn(() => Promise.reject(new TypeError("Failed to fetch")));
      await appFetch("/path", {}, onSuccess, onErrors);
      await flush();

      expect(onErrors).toHaveBeenCalledWith({ globalError: expect.stringContaining("conectar con el servidor") });
    });
  });
});
