import React from "react";

import {Navigate, Route, Routes} from "react-router-dom";

import Home from "./Home";
import Login from "./users/Login";
import SignUp from "./users/SignUp";
import RequiresLogout from "../common/RequiresLogout";
import RequiresLogin from "../common/RequiresLogin";
import ForgotPassword from "./users/ForgotPassword";
import ResetPassword from "./users/ResetPassword";

const Body = () => {
  return (
    <Routes>
      <Route path="/">
          <Route path="/" element={<Navigate to="/users/login" />} />

          {/* public routes  */}
          <Route element={<RequiresLogout />}>
              <Route path="users/login" element={<Login />} />
              <Route path="users/signUp" element={<SignUp />} />
              <Route path="users/forgotPassword" element={<ForgotPassword />} />
          </Route>

          <Route path="reset-password" element={<ResetPassword />} />

          {/* protected routes */}
          <Route element={<RequiresLogin />}>
              <Route path="home" element={<Home />} />
          </Route>

          {/* catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default Body;
