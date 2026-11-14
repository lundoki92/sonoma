import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import Button from "../../components/common/Button.jsx";
import ExplanationText from "../../components/common/ExplanationText.jsx";
import { getServiceIcon, getServiceLabel } from "./services.js";
import { normalizeTrack } from "../../utils/tracks.js";
import { createPlaylist } from "../../api/playlists.js";
import { clearWizardState, readWizardState } from "./wizardState.js";
import "./PlaylistLaunch.css";

// Dernière étape du parcours. C'est ici, et nulle part avant, que la soirée
// existe : la même requête la crée et l'ouvre, donc le lien d'invitation est
// vivant dès l'arrivée dans l'application.
export default function PlaylistLaunch() {
  const location = useLocation();
  const navigate = useNavigate();

  // Le state du routeur porte le wizard ; le session storage le remplace en
  // cas de refresh ou d'arrivée par le bouton retour.
  const stored = readWizardState();
  const wizard = location.state?.wizard ?? stored?.wizard ?? null;
  const tracks = location.state?.tracks ?? stored?.tracks ?? [];

  const [error, setError] = useState("");
  const [launching, setLaunching] = useState(false);

  if (!wizard) return <Navigate to="/createplaylist" replace />;

  const { name, date_time: dateTime, streaming_service: service } = wizard;

  async function handleLaunch() {
    setLaunching(true);
    setError("");

    try {
      // Une seule écriture : la soirée naît ouverte, avec ses morceaux
      // déjà en phase de vote.
      const playlist = await createPlaylist({
        name,
        date_time: dateTime,
        streaming_service: service,
        tracks: tracks.map(normalizeTrack),
      });

      clearWizardState();

      navigate(`/playlist/${playlist.id}/propose`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLaunching(false);
    }
  }

  return (
    <div className="launch-step">
      <div className="creation-intro">
        <ExplanationText
          hasAppTitle={false}
          title="Dernière vérification"
          text="Rien n'est encore enregistré : le lien d'invitation naîtra au moment où tu lanceras la soirée, et il sera ouvert immédiatement."
        />
      </div>

      <div className="app-meta-row">
        <span className="app-chip">
          <i className="fa-solid fa-compact-disc" aria-hidden="true"></i>
          {name}
        </span>

        <span className="app-chip">
          <i className="fa-solid fa-calendar" aria-hidden="true"></i>
          {new Date(dateTime).toLocaleString("fr-FR", {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </span>

        <span className="app-chip">
          <i className={getServiceIcon(service)} aria-hidden="true"></i>
          {getServiceLabel(service)}
        </span>

        <span className="app-chip">
          <i className="fa-solid fa-music" aria-hidden="true"></i>
          {tracks.length} morceau{tracks.length > 1 ? "x" : ""}
        </span>
      </div>

      <p className="launch-note">
        <i className="fa-solid fa-qrcode" aria-hidden="true"></i>
        Une fois lancée, ton lien et ton QR t&apos;attendront dans l&apos;app, en
        haut à droite.
      </p>

      {error && (
        <p className="app-error" role="alert">
          {error}
        </p>
      )}

      <Button
        type="button"
        onClick={handleLaunch}
        disabled={launching}
        text={launching ? "Ouverture…" : "Créer et démarrer la soirée"}
      />
    </div>
  );
}
