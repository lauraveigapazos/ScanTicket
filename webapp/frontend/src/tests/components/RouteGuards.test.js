import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RequiresLogin from "../../modules/app/common/RequiresLogin";
import RequiresLogout from "../../modules/app/common/RequiresLogout";

const renderAt = (route) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route element={<RequiresLogin />}>
          <Route path="/home" element={<p>home page</p>} />
        </Route>
        <Route element={<RequiresLogout />}>
          <Route path="/users/login" element={<p>login page</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe("route guards", () => {
  beforeEach(() => sessionStorage.clear());

  it("sends anonymous users from protected pages to login", () => {
    renderAt("/home");

    expect(screen.getByText("login page")).toBeInTheDocument();
  });

  it("sends logged-in users from login to home", () => {
    sessionStorage.setItem("serviceToken", "token");

    renderAt("/users/login");

    expect(screen.getByText("home page")).toBeInTheDocument();
  });
});
