import React from "react";
import { NavLink } from "react-router";
import "./BottomNav.css";

export default function BottomNav({ playlistId }) {
  return (
    <nav className="bottom-nav">
      <NavLink
        to={`/playlist/${playlistId}/propose`}
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <div className="nav-icon-wrapper">
          <i className="fa-solid fa-plus nav-icon"></i>
        </div>
        <span className="nav-label">Proposer</span>
      </NavLink>

      <NavLink
        to={`/playlist/${playlistId}/vote`}
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <div className="nav-icon-wrapper">
          <i className="fa-solid fa-fire nav-icon"></i>
        </div>
        <span className="nav-label">Voter</span>
      </NavLink>

      <NavLink
        to={`/playlist/${playlistId}/playlist`}
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <div className="nav-icon-wrapper">
          <i className="fa-solid fa-music nav-icon"></i>
        </div>
        <span className="nav-label">En écoute</span>
      </NavLink>
    </nav>
  );
}
