import { getServiceToken, setServiceToken } from "../../backend/appFetch";
import { login, logout, tryLoginFromServiceToken } from "../../backend/userService";

const jsonResponse = (body) => ({
  ok: true,
  status: 200,
  headers: { get: () => "application/json" },
  json: () => Promise.resolve(body),
});

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("userService", () => {
  beforeEach(() => {
    sessionStorage.clear();
    global.fetch = jest.fn();
  });

  it("login stores the service token and returns the user", async () => {
    const authenticatedUser = { serviceToken: "token", user: { id: 1 } };
    global.fetch.mockResolvedValue(jsonResponse(authenticatedUser));
    const onSuccess = jest.fn();

    login("laura", "secret", onSuccess, jest.fn(), jest.fn());
    await flush();

    expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({ userName: "laura", password: "secret" });
    expect(getServiceToken()).toBe("token");
    expect(onSuccess).toHaveBeenCalledWith(authenticatedUser);
  });

  it("tryLoginFromServiceToken skips the request when there is no token", () => {
    const onSuccess = jest.fn();

    tryLoginFromServiceToken(onSuccess, jest.fn());

    expect(onSuccess).toHaveBeenCalledWith();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("logout removes the service token", () => {
    setServiceToken("token");

    logout();

    expect(getServiceToken()).toBeNull();
  });
});
