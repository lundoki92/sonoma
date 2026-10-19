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
        <span className="nav-icon">➕</span>
        <span className="nav-label">Proposer</span>
      </NavLink>

      <NavLink
        to={`/playlist/${playlistId}/vote`}
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <span className="nav-icon">🔥</span>
        <span className="nav-label">Voter</span>
      </NavLink>

      <NavLink
        to={`/playlist/${playlistId}/playlist`}
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <span className="nav-icon">🎵</span>
        <span className="nav-label">Playlist</span>
      </NavLink>
    </nav>
  );
}