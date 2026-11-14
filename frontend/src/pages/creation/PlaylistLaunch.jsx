import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import Button from "../../components/common/Button.jsx";
import ExplanationText from "../../components/common/ExplanationText.jsx";
import { getServiceIcon, getServiceLabel } from "./services.js";
import { normalizeTrack } from "../../utils/tracks.js";
import { clearWizardState, readWizardState } from "./wizardState.js";
import "./PlaylistLaunch.css";

// Dernière étape du parcours. C'est ici, et nulle part avant, que la soirée
// est écrite : le nom et la date d'abord, puis les morceaux un par un.
export default function PlaylistLaunch() {
  const location = useLocation();
  const navigate = useNavigate();

  // Le state du routeur porte le wizard ; le session storage le remplace en
  // cas de refresh ou d'arrivée par le bouton retour.
  const storedState = readWizardState();
  const wizard = location.state?.wizard ?? storedState?.wizard ?? null;
  const tracks = location.state?.tracks ?? storedState?.tracks ?? [];

  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState(null);
  const [launching, setLaunching] = useState(false);

  if (!wizard) return <Navigate to="/createplaylist" replace />;

  const { name, date_time: dateTime, streaming_service: service } = wizard;

  // Une fois la soirée créée, on peut toujours l'ouvrir, même si un morceau
  // n'a pas pu être enregistré.
  function openParty() {
    if (!createdId) return;

    clearWizardState();
    navigate(`/playlist/${createdId}`, { replace: true });
  }

  async function handleLaunch() {
    setLaunching(true);
    setError("");

    try {
      // La soirée naît en statut "preparing" : les invités peuvent déjà la
      // rejoindre, seul l'écran de vote attend le démarrage.
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          date_time: dateTime,
          streaming_service: service,
        }),
      });

      const playlist = await response.json();

      if (!response.ok) {
        throw new Error(
          playlist.error || playlist.message || "Impossible de créer la soirée",
        );
      }

      // Les morceaux sont envoyés un par un : l'API n'a pas de route
      // groupée. Un échec isolé ne doit pas annuler la soirée déjà créée.
      let failedTracks = 0;

      for (const track of tracks.map(normalizeTrack)) {
        const trackResponse = await fetch(
          `/api/playlists/${playlist.id}/tracks`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(track),
          },
        );

        if (!trackResponse.ok) {
          failedTracks += 1;
        }
      }

      if (failedTracks > 0) {
        setCreatedId(playlist.id);
        setError(
          failedTracks === 1
            ? "La soirée est créée, mais 1 morceau n'a pas pu être ajouté. Tu pourras le reprendre depuis la soirée."
            : `La soirée est créée, mais ${failedTracks} morceaux n'ont pas pu être ajoutés. Tu pourras les reprendre depuis la soirée.`,
        );
        return;
      }

      clearWizardState();
      navigate(`/playlist/${playlist.id}`, { replace: true });
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
          text="Rien n'est encore enregistré : la soirée sera créée au dernier clic, avec son lien d'invitation."
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
        <i className="fa-solid fa-link" aria-hidden="true"></i>
        Une fois créée, ta soirée affichera son lien d&apos;invitation : tu
        pourras le copier et l&apos;envoyer à tes invités.
      </p>

      {error && (
        <p className="app-error" role="alert">
          {error}
        </p>
      )}

      {createdId ? (
        <Button
          type="button"
          onClick={openParty}
          text="Ouvrir la soirée"
        />
      ) : (
        <Button
          type="button"
          onClick={handleLaunch}
          disabled={launching}
          text={launching ? "Création…" : "Créer la soirée"}
        />
      )}
    </div>
  );
}
