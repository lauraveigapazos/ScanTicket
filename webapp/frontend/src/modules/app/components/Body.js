import React, {useEffect, useState} from "react";

import {Navigate, Outlet, Route, Routes, useNavigate} from "react-router-dom";

import {setReauthenticationCallback} from "../../../backend/appFetch";

import Home from "./Home";
import Login from "./users/Login";
import SignUp from "./users/SignUp";
import RequiresLogout from "../common/RequiresLogout";
import RequiresLogin from "../common/RequiresLogin";
import Sidebar from "./ui/Sidebar";
import Profile from "./users/Profile";
import EditProfile from "./users/EditProfile";
import ReceiptDetails from "./receipts/ReceiptDetails";
import ReceiptHistory from "./receipts/ReceiptHistory";
import EditReceipt from "./receipts/EditReceipt";
import ReceiptUpload from "./receipts/ReceiptUpload";
import Analysis from "./statistics/Analysis";

const Body = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    //any request rejected with 401 (expired or invalid token) sends the user back to the login page
    useEffect(() => {
        setReauthenticationCallback(() => navigate('/users/login', {replace: true}));
    }, [navigate]);

  return (
    <Routes>
      <Route path="/">
          <Route path="/" element={<Navigate to="/users/login" />} />

          {/* public routes  */}
          <Route element={<RequiresLogout />}>
              <Route path="users/login" element={<Login />} />
              <Route path="users/signUp" element={<SignUp />} />
          </Route>

          {/* protected routes */}
          <Route element={<RequiresLogin />}>
              <Route
                  element={
                      <div className="flex min-h-screen bg-viridian">
                          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen}/>
                          <main className="flex-1 md:ml-64">
                              <Outlet context={{ sidebarOpen, setSidebarOpen }} />
                          </main>
                      </div>
                  }
              >
                  <Route path="home" element={<Home />} />
                  <Route path="profile/:id" element={<Profile />} />
                  <Route path="profile/:id/edit" element={<EditProfile />} />
                  <Route path="/receipts" element={<ReceiptHistory />} />
                  <Route path="/receipts/upload" element={<ReceiptUpload />} />
                  <Route path="receipts/:receiptId" element={<ReceiptDetails />} />
                  <Route path="receipts/:receiptId/edit" element={<EditReceipt />} />
                  <Route path="/statistics" element={<Analysis />} />
              </Route>
          </Route>

          {/* catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default Body;
