import React from "react";
import "./Header.css";

export default function Header({
  sessionTitle,
  userPseudo,
  variant = "default",
  greeting = "Hello,",
}) {
  // Gets initials from host's username
  const initials = userPseudo
    ? userPseudo
        .trim()
        .split(/\s+/)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "G";

  // Variant for dashboard
  if (variant === "greeting") {
    return (
      <header className="app-header app-header--greeting">
        <div className="header-avatar">{initials}</div>

        <div className="header-greeting-info">
          <span className="header-greeting">{greeting}</span>

          <h1 className="header-title">{userPseudo || "Invité"}</h1>
        </div>
      </header>
    );
  }

  // Variant for playlist
  return (
    <header className="app-header">
      <div className="header-info">
        <span className="header-subtitle">Soirée en cours</span>

        <h1 className="header-title">{sessionTitle}</h1>
      </div>

      <div className="header-badge">
        <div className="avatar">{initials}</div>

        <span className="pseudo">{userPseudo || "Invité"}</span>
      </div>
    </header>
  );
}
