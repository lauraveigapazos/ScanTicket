import React from "react";
import { fireEvent, screen } from "@testing-library/react";
import Login from "../../../modules/app/components/users/Login";
import SignUp from "../../../modules/app/components/users/SignUp";
import { login, signUp } from "../../../backend/userService";
import { renderWithRouter } from "../../renderWithRouter";

jest.mock("../../../backend/userService", () => ({
  login: jest.fn(),
  signUp: jest.fn(),
}));

const type = (placeholder, value) =>
  fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });

const click = (name) => fireEvent.click(screen.getByRole("button", { name }));

beforeEach(() => jest.clearAllMocks());

describe("Login", () => {
  const fillAndSubmit = () => {
    renderWithRouter(<Login />);
    type("Tu nombre de usuario", "  laura  ");
    type("Tu contraseña", "secret");
    click("Iniciar sesión");
  };

  it("logs in with the trimmed user name and goes home", () => {
    login.mockImplementation((userName, password, onSuccess) => onSuccess());

    fillAndSubmit();

    expect(login.mock.calls[0].slice(0, 2)).toEqual(["laura", "secret"]);
    expect(screen.getByTestId("location")).toHaveTextContent("/home");
  });

  it("shows a generic error when the credentials are wrong", () => {
    login.mockImplementation((userName, password, onSuccess, onErrors) => onErrors({ globalError: "x" }));

    fillAndSubmit();

    expect(screen.getByText("Usuario o contraseña incorrectos.")).toBeInTheDocument();
  });

  it("does not call the backend with empty fields", () => {
    renderWithRouter(<Login />);
    click("Iniciar sesión");

    expect(login).not.toHaveBeenCalled();
  });
});

describe("SignUp", () => {
  const fill = (password, confirmPassword) => {
    renderWithRouter(<SignUp />);
    type("Elige un nombre de usuario", " laura ");
    type("Nombre", "Laura");
    type("Apellidos", "Veiga");
    type("tu@email.com", "laura@email.com");
    type("Mínimo 6 caracteres", password);
    type("Repite la contraseña", confirmPassword);
    click("Crear cuenta");
  };

  it("rejects short and mismatched passwords without calling the backend", () => {
    fill("123", "456");

    expect(screen.getByText("La contraseña debe tener al menos 6 caracteres")).toBeInTheDocument();
    expect(screen.getByText("Las contraseñas no coinciden")).toBeInTheDocument();
    expect(signUp).not.toHaveBeenCalled();
  });

  it("signs up with trimmed data and goes home", () => {
    signUp.mockImplementation((user, onSuccess) => onSuccess());

    fill("secret1", "secret1");

    expect(signUp.mock.calls[0][0]).toEqual({
      userName: "laura",
      password: "secret1",
      firstName: "Laura",
      lastName: "Veiga",
      email: "laura@email.com",
    });
    expect(screen.getByTestId("location")).toHaveTextContent("/home");
  });

  it("shows the backend error when the user already exists", () => {
    signUp.mockImplementation((user, onSuccess, onErrors) => onErrors({ globalError: "Usuario duplicado" }));

    fill("secret1", "secret1");

    expect(screen.getByText("Usuario duplicado")).toBeInTheDocument();
  });
});

