
import React from "react";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-szalty-offWhite">
      <div className="container mx-auto max-w-lg px-4 sm:px-6">
        <main className="pb-20 pt-4">
          <Outlet />
        </main>
      </div>
      <Navbar />
    </div>
  );
};

export default MainLayout;
