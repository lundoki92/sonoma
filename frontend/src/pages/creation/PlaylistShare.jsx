import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { getServiceIcon, getServiceLabel } from "./services.js";
import "./PlaylistShare.css";

export default function PlaylistShare() {
  const { id } = useParams();

  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="share-step">
      <header className="creation-intro">
        <h1>Ta soirée est prête</h1>
        <p>
          Partage ce lien à tes invités pour qu'ils rejoignent la playlist de{" "}
          <strong>{playlist.name}</strong>.
        </p>
      </header>

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

      <button
        type="button"
        className="creation-submit"
        disabled
        title="Le démarrage de la soirée arrive dans une prochaine version."
      >
        Démarrer la soirée
      </button>

      <p className="creation-hint">
        Le démarrage et le vote seront disponibles dans une prochaine version.
      </p>

      <Link className="share-open-party" to={`/playlist/${id}/propose`}>
        Ouvrir l'app de la soirée
      </Link>

      <Link className="share-back-home" to="/">
        Retour au tableau de bord
      </Link>
    </div>
  );
}
