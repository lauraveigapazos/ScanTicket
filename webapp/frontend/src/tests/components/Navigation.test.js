import React from "react";
import { fireEvent, screen } from "@testing-library/react";
import Header from "../../modules/app/components/ui/Header";
import Sidebar from "../../modules/app/components/ui/Sidebar";
import { logout, tryLoginFromServiceToken } from "../../backend/userService";
import { renderWithRouter } from "../renderWithRouter";

jest.mock("../../backend/userService", () => ({ tryLoginFromServiceToken: jest.fn(), logout: jest.fn() }));

beforeEach(() => jest.clearAllMocks());

describe("Header", () => {
  it("shows the title and opens the user's profile", () => {
    renderWithRouter(<Header user={{ id: 7 }} title="Historial" />);

    expect(screen.getAllByText("Historial").length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByLabelText("Profile")[0]);
    expect(screen.getByTestId("location")).toHaveTextContent("/profile/7");
  });

  it("hides the profile button without a user", () => {
    renderWithRouter(<Header />);

    expect(screen.queryByLabelText("Profile")).not.toBeInTheDocument();
  });

  it("shows a back button instead of the menu on sub-pages", () => {
    const onBack = jest.fn();
    renderWithRouter(<Header title="Recibo" onBack={onBack} />);

    expect(screen.queryByLabelText("Toggle menu")).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Volver"));
    expect(onBack).toHaveBeenCalled();
  });

  it("puts page actions in place of the profile button", () => {
    renderWithRouter(<Header user={{ id: 7 }}><button>Acción</button></Header>);

    expect(screen.getByRole("button", { name: "Acción" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Profile")).not.toBeInTheDocument();
  });
});

describe("Sidebar", () => {
  const mountSidebar = () => {
    const setIsOpen = jest.fn();
    tryLoginFromServiceToken.mockImplementation((onSuccess) => onSuccess({ user: { id: 1 } }));
    renderWithRouter(<Sidebar isOpen setIsOpen={setIsOpen} />);
    return setIsOpen;
  };

  it("navigates to a section and closes the menu", () => {
    const setIsOpen = mountSidebar();

    fireEvent.click(screen.getByRole("button", { name: "Análisis" }));

    expect(screen.getByTestId("location")).toHaveTextContent("/statistics");
    expect(setIsOpen).toHaveBeenCalledWith(false);
  });

  it("logs out and goes to login", () => {
    mountSidebar();

    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(logout).toHaveBeenCalled();
    expect(screen.getByTestId("location")).toHaveTextContent("/users/login");
  });
});
