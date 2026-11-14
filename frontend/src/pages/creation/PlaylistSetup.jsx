import { useEffect, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import SearchMusic from "../../components/SearchMusic";
import TrackList from "../../components/TrackList.jsx";
import Button from "../../components/common/Button.jsx";
import ExplanationText from "../../components/common/ExplanationText.jsx";
import { getServiceIcon, getServiceLabel } from "./services.js";
import { normalizeTrack } from "../../utils/tracks.js";
import {
  addHostTrack,
  getPlaylist,
  listHostTracks,
  removeHostTrack,
} from "../../api/playlists.js";
import { readWizardState, saveWizardState } from "./wizardState.js";
import "./PlaylistSetup.css";

export default function PlaylistSetup() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Sans id, on est dans le parcours de création : rien n'est encore écrit
  // en base, les morceaux restent en mémoire jusqu'à la dernière étape.
  // Avec un id, cette écran ajoute des morceaux à une soirée déjà ouverte.
  const isCreating = !id;

  const [storedState] = useState(() =>
    isCreating ? readWizardState() : null,
  );
  const wizard = location.state?.wizard ?? storedState?.wizard ?? null;
  const initialTracks = location.state?.tracks ?? storedState?.tracks ?? [];

  const [playlist, setPlaylist] = useState(() =>
    isCreating ? wizard : null,
  );
  const [tracks, setTracks] = useState(isCreating ? initialTracks : []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!isCreating);
  const [removingKey, setRemovingKey] = useState(null);

  // Le state du wizard est recopié en session storage pour que le bouton
  // retour du header, ou un refresh, ramène exactement au même endroit.
  useEffect(() => {
    if (!isCreating || !wizard) return;

    saveWizardState({ wizard, tracks });
  }, [isCreating, wizard, tracks]);

  // Soirée déjà ouverte : on charge ses morceaux depuis l'API.
  useEffect(() => {
    if (isCreating) return undefined;

    let cancelled = false;

    async function fetchPlaylist() {
      try {
        const [playlistData, tracksData] = await Promise.all([
          getPlaylist(id),
          listHostTracks(id),
        ]);

        if (!cancelled) {
          setPlaylist(playlistData);
          setTracks(Array.isArray(tracksData) ? tracksData : []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPlaylist();

    return () => {
      cancelled = true;
    };
  }, [id, isCreating]);

  // En création, un morceau s'ajoute localement. Sur une soirée ouverte, il
  // rejoint directement le vote.
  async function handleAddTrack(spotifyTrack) {
    const normalized = normalizeTrack(spotifyTrack);

    if (isCreating) {
      setTracks((previousTracks) => {
        const alreadyAdded = previousTracks.some(
          (track) =>
            track.external_track_id === normalized.external_track_id,
        );

        return alreadyAdded ? previousTracks : [normalized, ...previousTracks];
      });

      return;
    }

    setError("");

    try {
      const track = await addHostTrack(id, normalized);

      setTracks((previousTracks) => [track, ...previousTracks]);
    } catch (err) {
      setError(err.message);
      // SearchMusic affiche l'\u00e9chec sur le bouton : on le laisse remonter.
      throw err;
    }
  }

  async function handleRemoveTrack(track) {
    const trackKey = track.id ?? track.external_track_id;

    if (isCreating) {
      setTracks((previousTracks) =>
        previousTracks.filter(
          (item) => (item.id ?? item.external_track_id) !== trackKey,
        ),
      );

      return;
    }

    setRemovingKey(trackKey);
    setError("");

    try {
      await removeHostTrack(id, track.id);

      setTracks((previousTracks) =>
        previousTracks.filter((item) => item.id !== track.id),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setRemovingKey(null);
    }
  }

  // Dernière étape de la création : on passe le nom, la date, le service et
  // les morceaux choisis. La soirée n'existera en base qu'au clic final.
  function handleNext() {
    if (isCreating) {
      if (!wizard) return;

      navigate("/createplaylist/invite", {
        replace: true,
        state: { wizard, tracks },
      });
      return;
    }

    navigate(`/playlist/${id}/propose`);
  }

  if (isCreating && !wizard) {
    return <Navigate to="/createplaylist" replace />;
  }

  if (loading) {
    return <p className="app-status">Chargement de la soirée…</p>;
  }

  if (!playlist) {
    return (
      <p className="app-status">{error || "Soirée introuvable"}</p>
    );
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
          {playlist.name}
        </span>

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

      <SearchMusic onAddTrack={handleAddTrack} tracks={tracks} />

      {error && (
        <p className="app-error" role="alert">
          {error}
        </p>
      )}

      <TrackList
        heading={`Morceaux de la soirée (${tracks.length})`}
        tracks={tracks}
        emptyText="Aucun morceau pour le moment. Tu pourras en ajouter plus tard, depuis l'app de la soirée."
        onRemove={handleRemoveTrack}
        removingKey={removingKey}
      />

      <Button
        type="button"
        onClick={handleNext}
        text={isCreating ? "Continuer" : "Entrer dans la soirée"}
      />
    </div>
  );
}
