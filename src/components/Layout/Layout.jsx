// src/components/Layout/Layout.jsx
import React from "react";
import Sidebar from "../Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import "./Layout.css";

function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <Outlet /> {/* Aquí se carga el contenido dinámico */}
      </main>
    </div>
  );
}

export default Layout;
