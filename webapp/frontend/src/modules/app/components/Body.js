import React from "react";

import {Navigate, Outlet, Route, Routes} from "react-router-dom";

import Home from "./Home";
import Login from "./users/Login";
import SignUp from "./users/SignUp";
import RequiresLogout from "../common/RequiresLogout";
import RequiresLogin from "../common/RequiresLogin";
import ForgotPassword from "./users/ForgotPassword";
import ResetPassword from "./users/ResetPassword";
import Sidebar from "./ui/Sidebar";
import Profile from "./users/Profile";
import EditProfile from "./users/EditProfile";
import ReceiptDetails from "./receipts/ReceiptDetails";
import ReceiptHistory from "./receipts/ReceiptHistory";
import EditReceipt from "./receipts/EditReceipt";

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
              <Route
                  element={
                      <div className="flex min-h-screen bg-viridian">
                          <Sidebar />
                          <main className="flex-1 md:ml-64">
                              <Outlet />
                          </main>
                      </div>
                  }
              >
                  <Route path="home" element={<Home />} />
                  <Route path="profile/:id" element={<Profile />} />
                  <Route path="profile/:id/edit" element={<EditProfile />} />
                  <Route path="/receipts" element={<ReceiptHistory />} />
                  <Route path="receipts/:receiptId" element={<ReceiptDetails />} />
                  <Route path="receipts/:receiptId/edit" element={<EditReceipt />} />
              </Route>
          </Route>

          {/* catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default Body;
