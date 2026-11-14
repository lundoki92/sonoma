import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Button from "../../components/common/Button.jsx";
import ExplanationText from "../../components/common/ExplanationText.jsx";
import { getServiceIcon, getServiceLabel } from "./services.js";
import "./PlaylistShare.css";

export default function PlaylistShare() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  const copyTimer = useRef(null);

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
      clearTimeout(copyTimer.current);
    };
  }, [id]);

  if (loading) {
    return <p className="creation-status">Chargement de la soirée…</p>;
  }

  if (!playlist) {
    return (
      <p className="creation-status">{error || "Soirée introuvable"}</p>
    );
  }

  const inviteLink = `${window.location.origin}/join/${playlist.invite_code}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteLink);

      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Impossible de copier le lien.");
    }
  }

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
        <span className="creation-chip">
          <i className="fa-solid fa-calendar" aria-hidden="true"></i>
          {new Date(playlist.date_time).toLocaleString("fr-FR", {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </span>

        <span className="creation-chip">
          <i
            className={getServiceIcon(playlist.streaming_service)}
            aria-hidden="true"
          ></i>
          {getServiceLabel(playlist.streaming_service)}
        </span>
      </div>

      <section className="share-card">
        <p className="share-label">Lien d'invitation</p>

        <a className="share-link" href={inviteLink}>
          {inviteLink}
        </a>

        <button
          type="button"
          className={`share-copy${copied ? " is-copied" : ""}`}
          onClick={handleCopy}
        >
          <i
            className={`fa-solid ${copied ? "fa-check" : "fa-copy"}`}
            aria-hidden="true"
          ></i>
          {copied ? "Lien copié !" : "Copier le lien"}
        </button>
      </section>

      <div className="share-qr" aria-label="QR code bientôt disponible">
        <i className="fa-solid fa-qrcode" aria-hidden="true"></i>
        <span>Le QR code de la soirée arrive bientôt.</span>
      </div>

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
