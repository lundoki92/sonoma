import "./Header.css";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router";

export default function Header({
  sessionTitle,
  userPseudo,
  variant = "default",
  greeting = "Hello,",
}) {
  const { logout } = useAuth();
  const navigate = useNavigate();

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

  // Variant for dashboard
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
          title="Se déconnecter"
        >
          <i className="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
        </button>
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

      {/* La déconnexion reste sur la home : ici, seul le retour au
          tableau de bord est proposé. */}
      <div className="header-actions">
        <button
          type="button"
          className="header-action"
          onClick={() => navigate("/")}
          aria-label="Tableau de bord"
          title="Tableau de bord"
        >
          <i className="fa-solid fa-house" aria-hidden="true"></i>
        </button>
      </div>
    </header>
  );
}
