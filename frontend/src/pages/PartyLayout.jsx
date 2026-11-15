import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router";
import Header from "../components/common/Header";
import BottomNav from "../components/common/BottomNav";
import InviteModal from "./party/InviteModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import "./PartyLayout.css";

// Coquille de l'app de la soirée : un header avec le vrai nom de la soirée,
// un menu bas d'écran, et les écrans en dessous via l'Outlet.
export default function PartyLayout({ role = "host" }) {
  const { id: playlistId } = useParams();
  const { user } = useAuth();

  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  // Le nom et le statut de la soirée intéressent tous les onglets : on les
  // charge une fois ici et on les passe en contexte aux écrans.
  useEffect(() => {
    let cancelled = false;

    async function loadPlaylist() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/playlists/${playlistId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(getLoadError(response.status, data));
        }

        if (!cancelled) setPlaylist(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPlaylist();

    return () => {
      cancelled = true;
    };
  }, [playlistId]);

  const isClosed = playlist?.status === "finished";

  return (
    <div className="party-layout">
      <Header
        variant={role}
        sessionTitle={playlist?.name ?? "Ta soirée"}
        sessionSubtitle={getPartySubtitle(playlist)}
        userPseudo={user?.username ?? ""}
        // Une soirée terminée n'accepte plus d'invité : on retire l'action.
        onInvite={isClosed ? undefined : () => setInviteOpen(true)}
      />

      <main className="party-content">
        {loading && <p className="app-status">Chargement de la soirée…</p>}

        {error && (
          <p className="app-status" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && (
          <Outlet context={{ playlist, playlistId }} />
        )}
      </main>

      <BottomNav playlistId={playlistId} />

      {inviteOpen && (
        <InviteModal playlist={playlist} onClose={() => setInviteOpen(false)} />
      )}
    </div>
  );
}

// Le sous-titre du header suit l'état de la soirée, pas seulement son nom.
function getPartySubtitle(playlist) {
  if (!playlist) return "Soirée";

  if (playlist.status === "preparing") return "Soirée en préparation";
  if (playlist.status === "finished") return "Soirée terminée";

  return "Soirée en cours";
}

// L'API répond en anglais : on traduit les seuls cas que l'hôte peut comprendre.
function getLoadError(status, data) {
  if (status === 404) {
    return "Cette soirée n'existe plus, ou elle n'est pas à toi.";
  }

  if (status === 401 || status === 403) {
    return "Tu dois être connecté à son hôte pour ouvrir cette soirée.";
  }

  return data.error || data.message || "Impossible de charger la soirée.";
}
