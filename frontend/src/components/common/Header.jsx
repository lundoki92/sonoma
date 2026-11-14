import "./Header.css";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLocation, useNavigate } from "react-router";

export default function Header({
  sessionTitle,
  userPseudo,
  variant = "host",
  greeting = "Hello,",
  playlistId,
  onLeave,
}) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initials = userPseudo
    ? userPseudo
        .trim()
        .split(/\s+/)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "G";

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  }

  // Variant for the host dashboard
  if (variant === "greeting") {
    return (
      <header className="app-header app-header--greeting">
        <div className="header-avatar">{initials}</div>

        <div className="header-greeting-info">
          <span className="header-greeting">{greeting}</span>

          <h1 className="header-title">{userPseudo || "Invité"}</h1>
        </div>

        <button
          type="button"
          className="header-logout"
          onClick={handleLogout}
          aria-label="Se déconnecter"
        >
          Déconnexion
        </button>
      </header>
    );
  }

  // Variant for a guest inside a party: no account, so no logout
  if (variant === "guest") {
    return (
      <header className="app-header">
        <div className="header-info">
          <span className="header-subtitle">Invité</span>

          <h1 className="header-title">{sessionTitle}</h1>
        </div>

        <div className="header-badge">
          <div className="avatar">{initials}</div>

          <span className="pseudo">{userPseudo || "Invité"}</span>
        </div>

        <button
          type="button"
          className="header-logout"
          onClick={onLeave}
          aria-label="Quitter la soirée"
        >
          Quitter
        </button>
      </header>
    );
  }

  // Variant for the host inside a party: the host is already connected, so
  // the header only offers ways to move around. Going back to the dashboard
  // is enough to log out later on, and the pseudo would only take space.
  const invitePath = `/playlist/${playlistId}/invite`;
  const isOnInvitePage = location.pathname === invitePath;

  return (
    <header className="app-header">
      <div className="header-info">
        <span className="header-subtitle">Soirée en cours</span>

        <h1 className="header-title">{sessionTitle}</h1>
      </div>

      <div className="header-actions">
        <button
          type="button"
          className="header-action"
          onClick={() => navigate("/")}
          title="Mes soirées"
          aria-label="Mes soirées"
        >
          <i className="fa-solid fa-layer-group" aria-hidden="true"></i>
        </button>

        {!isOnInvitePage && (
          <button
            type="button"
            className="header-action"
            onClick={() => navigate(invitePath)}
            title="Inviter des amis"
            aria-label="Inviter des amis"
          >
            <i className="fa-solid fa-qrcode" aria-hidden="true"></i>
          </button>
        )}
      </div>
    </header>
  );
}
