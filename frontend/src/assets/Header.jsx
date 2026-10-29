import React from "react";
import "./Header.css";

export default function Header({ sessionTitle, userPseudo }) {
  return (
    <header className="app-header">
      <div className="header-info">
        <span className="header-subtitle">Soirée en cours</span>
        <h1 className="header-title">{sessionTitle}</h1>
      </div>

      <div className="header-badge">
        <div className="avatar">
          {userPseudo ? userPseudo[0].toUpperCase() : "G"}
        </div>
        <span className="pseudo">{userPseudo || "Invité"}</span>
      </div>
    </header>
  );
}