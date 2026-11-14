import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Button from "../../components/common/Button.jsx";
import ExplanationText from "../../components/common/ExplanationText.jsx";
import InviteCard from "../../components/common/InviteCard.jsx";
import { getServiceIcon, getServiceLabel } from "./services.js";
import "./PlaylistShare.css";

export default function PlaylistShare() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPlaylist() {
      try {
        const response = await fetch(`/api/playlists/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Impossible de charger la soirée");
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
  }, [id]);

  // Start the party: the playlist becomes active and the host enters the
  // party application. A playlist that is already started only needs the
  // navigation, so the button always leads to the app.
  async function handleStart() {
    setStarting(true);
    setError("");

    try {
      if (playlist.status === "preparing") {
        const response = await fetch(`/api/playlists/${id}/start`, {
          method: "PATCH",
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error || "Impossible de démarrer la soirée");
        }
      }

      navigate(`/playlist/${id}/propose`);
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  }

  if (loading) {
    return <p className="creation-status">Chargement de la soirée…</p>;
  }

  if (!playlist) {
    return (
      <p className="creation-status">{error || "Soirée introuvable"}</p>
    );
  }

  const inviteLink = `${window.location.origin}/join/${playlist.invite_code}`;

  return (
    <div className="share-step">
      <div className="creation-intro">
        <ExplanationText
          hasAppTitle={false}
          title="Ta soirée est prête"
          text={`Partage ce lien à tes invités pour qu'ils rejoignent la playlist de ${playlist.name}.`}
        />
      </div>

      <div className="share-meta">
        <span className="app-chip">
          <i className="fa-solid fa-calendar" aria-hidden="true"></i>
          {new Date(playlist.date_time).toLocaleString("fr-FR", {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </span>

        <span className="app-chip">
          <i
            className={getServiceIcon(playlist.streaming_service)}
            aria-hidden="true"
          ></i>
          {getServiceLabel(playlist.streaming_service)}
        </span>
      </div>

      <InviteCard inviteLink={inviteLink} />

      {error && (
        <p className="creation-error" role="alert">
          {error}
        </p>
      )}

      <Button
        type="button"
        onClick={handleStart}
        disabled={starting}
        text={starting ? "Démarrage…" : "Démarrer la soirée"}
      />

      <p className="creation-hint">
        Le vote sera disponible dès que la soirée sera lancée.
      </p>

      <Link className="share-back-home" to="/">
        Retour au tableau de bord
      </Link>
    </div>
  );
}
