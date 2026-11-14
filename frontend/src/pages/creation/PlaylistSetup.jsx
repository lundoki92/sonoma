import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import SearchMusic from "../../components/SearchMusic";
import TrackList from "../../components/TrackList.jsx";
import Button from "../../components/common/Button.jsx";
import ExplanationText from "../../components/common/ExplanationText.jsx";
import { getServiceIcon, getServiceLabel } from "./services.js";
import { normalizeTrack } from "../../utils/tracks.js";
import { readWizardState, saveWizardState } from "./wizardState.js";
import "./PlaylistSetup.css";

// Étape 2 : les morceaux restent en mémoire, rien n'est encore écrit en base.
// La soirée naîtra à l'étape 3, avec les morceaux choisis ici.
export default function PlaylistSetup() {
  const navigate = useNavigate();
  const location = useLocation();

  const [storedState] = useState(() => readWizardState());
  const wizard = location.state?.wizard ?? storedState?.wizard ?? null;
  const initialTracks = location.state?.tracks ?? storedState?.tracks ?? [];

  const [tracks, setTracks] = useState(initialTracks);

  // Le state du wizard est recopié en session storage pour que le bouton
  // retour du header, ou un refresh, ramène exactement au même endroit.
  useEffect(() => {
    if (!wizard) return;

    saveWizardState({ wizard, tracks });
  }, [wizard, tracks]);

  function handleAddTrack(spotifyTrack) {
    const normalized = normalizeTrack(spotifyTrack);

    setTracks((previousTracks) => {
      const alreadyAdded = previousTracks.some(
        (track) => track.external_track_id === normalized.external_track_id,
      );

      return alreadyAdded ? previousTracks : [normalized, ...previousTracks];
    });
  }

  function handleRemoveTrack(track) {
    const trackKey = track.id ?? track.external_track_id;

    setTracks((previousTracks) =>
      previousTracks.filter(
        (item) => (item.id ?? item.external_track_id) !== trackKey,
      ),
    );
  }

  function handleNext() {
    if (!wizard) return;

    navigate("/createplaylist/launch", {
      replace: true,
      state: { wizard, tracks },
    });
  }

  if (!wizard) {
    return <Navigate to="/createplaylist" replace />;
  }

  return (
    <div className="setup-step">
      <div className="creation-intro">
        <ExplanationText
          hasAppTitle={false}
          title="Ajoute les premiers morceaux"
          text="Recherche dans le catalogue Spotify et prépare l'ambiance de ta soirée. Tu peux passer cette étape : une soirée peut démarrer sans morceau."
        />
      </div>

      <div className="app-meta-row">
        <span className="app-chip">
          <i className="fa-solid fa-compact-disc" aria-hidden="true"></i>
          {wizard.name}
        </span>

        <span className="app-chip">
          <i className="fa-solid fa-calendar" aria-hidden="true"></i>
          {new Date(wizard.date_time).toLocaleString("fr-FR", {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </span>

        <span className="app-chip">
          <i
            className={getServiceIcon(wizard.streaming_service)}
            aria-hidden="true"
          ></i>
          {getServiceLabel(wizard.streaming_service)}
        </span>
      </div>

      <SearchMusic onAddTrack={handleAddTrack} tracks={tracks} />

      <TrackList
        heading={`Morceaux de la soirée (${tracks.length})`}
        tracks={tracks}
        emptyText="Aucun morceau pour le moment. Tu pourras en ajouter plus tard, depuis l'app de la soirée."
        onRemove={handleRemoveTrack}
      />

      <Button type="button" onClick={handleNext} text="Continuer" />
    </div>
  );
}
