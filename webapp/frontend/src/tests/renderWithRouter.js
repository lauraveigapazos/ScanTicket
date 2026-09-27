import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

const CurrentLocation = () => <div data-testid="location">{useLocation().pathname}</div>;

//renders `ui` at `route`; navigating anywhere else shows the new path in the "location" test id
export const renderWithRouter = (ui, { path = "/", route = path } = {}) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={path} element={ui} />
        <Route path="*" element={<CurrentLocation />} />
      </Routes>
    </MemoryRouter>
  );
