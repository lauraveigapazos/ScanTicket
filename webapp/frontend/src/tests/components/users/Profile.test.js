import React from "react";
import { fireEvent, screen } from "@testing-library/react";
import Profile from "../../../modules/app/components/users/Profile";
import EditProfile from "../../../modules/app/components/users/EditProfile";
import { logout, tryLoginFromServiceToken, updateProfile } from "../../../backend/userService";
import { renderWithRouter } from "../../renderWithRouter";

jest.mock("../../../backend/userService", () => ({
  tryLoginFromServiceToken: jest.fn(),
  updateProfile: jest.fn(),
  logout: jest.fn(),
}));

const user = { id: 1, firstName: "Laura", lastName: "Veiga", email: "laura@email.com" };

beforeEach(() => {
  jest.clearAllMocks();
  tryLoginFromServiceToken.mockImplementation((onSuccess) => onSuccess({ user }));
});

describe("Profile", () => {
  it("shows the logged-in user's own profile", () => {
    renderWithRouter(<Profile />, { path: "/profile/:id", route: "/profile/1" });

    expect(screen.getByText("Laura Veiga")).toBeInTheDocument();
  });

  it("refuses to show another user's profile", () => {
    renderWithRouter(<Profile />, { path: "/profile/:id", route: "/profile/2" });

    expect(screen.getByText("No tienes permiso para ver este perfil")).toBeInTheDocument();
  });

  it("logs out and goes to login", () => {
    renderWithRouter(<Profile />, { path: "/profile/:id", route: "/profile/1" });

    fireEvent.click(screen.getByTitle("Cerrar sesión"));

    expect(logout).toHaveBeenCalled();
    expect(screen.getByTestId("location")).toHaveTextContent("/users/login");
  });
});

describe("EditProfile", () => {
  const renderEdit = () => renderWithRouter(<EditProfile />, { path: "/profile/:id/edit", route: "/profile/1/edit" });

  it("saves the edited fields", () => {
    renderEdit();

    fireEvent.change(screen.getByLabelText(/Nombre/), { target: { name: "firstName", value: "Laurita" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(updateProfile.mock.calls[0][0]).toEqual({ ...user, firstName: "Laurita", profilePicture: null });
  });

  it("requires every field", () => {
    renderEdit();

    fireEvent.change(screen.getByLabelText(/Correo electrónico/), { target: { name: "email", value: " " } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(screen.getByText("Todos los campos son requeridos")).toBeInTheDocument();
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it("rejects profile pictures that are not images", () => {
    renderEdit();

    fireEvent.change(screen.getByLabelText("Cambiar foto"), {
      target: { files: [new File(["x"], "notes.txt", { type: "text/plain" })] },
    });

    expect(screen.getByText("El archivo seleccionado debe ser una imagen")).toBeInTheDocument();
  });
});
