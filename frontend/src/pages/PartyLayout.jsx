import { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router";
import Header from "../components/common/Header";
import BottomNav from "../components/common/BottomNav";
import { useAuth } from "../context/AuthContext.jsx";
import "./PartyLayout.css";

export default function PartyLayout({ role = "host" }) {
  const { id, code } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  // The guest pseudo is read once on mount. It will be replaced by the
  // guest session endpoint in a later step.
  const [guestName] = useState(() => localStorage.getItem("guest_name") ?? "");

  // The header needs the party name. The host reads it from the protected
  // endpoint, the guest from the public invite endpoint.
  useEffect(() => {
    let cancelled = false;

    async function loadPlaylist() {
      const url =
        role === "guest" ? `/api/invite/${code}` : `/api/playlists/${id}`;

      try {
        const response = await fetch(url);
        if (!response.ok) return;

        const data = await response.json();
        if (!cancelled) setPlaylist(data);
      } catch {
        // The fallback title is enough while the API is unavailable.
      }
    }

    loadPlaylist();
    return () => {
      cancelled = true;
    };
  }, [role, id, code]);

  const basePath = role === "guest" ? `/join/${code}/party` : `/playlist/${id}`;
  const pseudo = role === "guest" ? guestName : user?.username;

  function handleLeave() {
    navigate(role === "guest" ? `/join/${code}` : "/");
  }

  return (
    <div className="party-layout">
      <Header
        variant={role}
        sessionTitle={playlist?.name ?? "Soirée"}
        userPseudo={pseudo}
        onLeave={handleLeave}
      />

      <main className="party-content">
        <Outlet context={{ role, playlist, basePath, pseudo }} />
      </main>

      <BottomNav basePath={basePath} />
    </div>
  );
}
