// src/components/Sidebar/Sidebar.jsx
import React from "react";
import "./Sidebar.css";

export default function Sidebar({ onNavigate, modules = [], mobileOpen, setMobileOpen }) {
  return (
    <aside className={`sidebar ${mobileOpen ? "open" : ""}`} aria-hidden={!mobileOpen && window.innerWidth < 800}>
      <div className="sidebar-top">
        <h2>Mi_Casa</h2>
        <button className="close-btn" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú">×</button>
      </div>

      <nav>
        <ul className="menu-list">
          <li><button className="menu-btn" onClick={() => onNavigate("home")}>Inicio</button></li>
          <li><button className="menu-btn" onClick={() => onNavigate("proyectos")}>Proyectos</button></li>
          <li><button className="menu-btn" onClick={() => onNavigate("modulos")}>Módulos</button></li>
          <li><button className="menu-btn" onClick={() => onNavigate("tareas")}>Tareas</button></li>

          <li className="divider">Categorías</li>
          {modules.map((m) => (
            <li key={m}>
              <button
                className="menu-btn"
                onClick={() => onNavigate("moduloDetalle", { moduleName: m })}
                onTouchStart={() => onNavigate("moduloDetalle", { moduleName: m })}
              >
                {m}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
