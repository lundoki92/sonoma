import { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router";
import Header from "../components/common/Header";
import BottomNav from "../components/common/BottomNav";
import InviteModal from "./party/InviteModal.jsx";
import { getPlaylist } from "../api/playlists.js";
import { getInvitation } from "../api/invites.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./PartyLayout.css";

export default function PartyLayout({ role = "host" }) {
  const { id, code } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  // A guest can open a link to a party that has not started yet: the API then
  // answers with a clear message instead of the party content.
  const [loadError, setLoadError] = useState("");
  // The invitation lives in a modal so the host never leaves the party.
  const [inviteOpen, setInviteOpen] = useState(false);
  // The guest pseudo is read once on mount. It will be replaced by the
  // guest session endpoint in a later step.
  const [guestName] = useState(() => localStorage.getItem("guest_name") ?? "");

  // The header needs the party name. The host reads it from the protected
  // endpoint, the guest from the public invite endpoint.
  useEffect(() => {
    let cancelled = false;

    async function loadPlaylist() {
      try {
        const data =
          role === "guest" ? await getInvitation(code) : await getPlaylist(id);

        if (!cancelled) setPlaylist(data);
      } catch (err) {
        // Une soirée qu'un invité ne peut pas encore voir mérite un message,
        // pas une application vide.
        if (!cancelled && role === "guest") {
          setLoadError(err.message);
        }
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
        onInvite={() => setInviteOpen(true)}
      />

      <main className="party-content">
        {loadError ? (
          <div className="party-error">
            <i className="fa-solid fa-clock" aria-hidden="true"></i>
            <p>{loadError}</p>
          </div>
        ) : (
          <Outlet context={{ role, playlist, basePath, pseudo, code }} />
        )}
      </main>

      {loadError ? null : <BottomNav basePath={basePath} />}

      {inviteOpen && (
        <InviteModal
          playlist={playlist}
          onClose={() => setInviteOpen(false)}
        />
      )}
    </div>
  );
}
