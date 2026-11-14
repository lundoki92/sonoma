import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import SearchMusic from "../components/SearchMusic";
import TrackList from "../components/TrackList";
import { normalizeTrack } from "../utils/tracks.js";
import {
  addInvitationTrack,
  getInvitation,
  listInvitationTracks,
} from "../api/invites.js";
import "./guest.css";

function GuestPlaylistPage() {
  const { code } = useParams();

  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [playlistData, tracksData] = await Promise.all([
          getInvitation(code),
          listInvitationTracks(code),
        ]);

        if (!cancelled) {
          setPlaylist(playlistData);
          setTracks(tracksData);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [code]);

  // SearchMusic réaffiche l'erreur sur le bouton : on la laisse remonter.
  async function handleAddTrack(spotifyTrack) {
    setError("");

    try {
      const track = await addInvitationTrack(code, normalizeTrack(spotifyTrack));

      setTracks((previous) => [track, ...previous]);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  if (loading) {
    return (
      <div className="guest-screen">
        <main className="guest-screen-inner">
          <p className="app-status">Chargement de la soirée…</p>
        </main>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="guest-screen">
        <main className="guest-screen-inner">
          <p className="app-error" role="alert">
            {error || "Soirée introuvable"}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="guest-screen">
      <main className="guest-screen-inner">
        <h1>{playlist.name}</h1>

        <div className="guest-meta">
          <span className="app-chip">
            <i className="fa-solid fa-calendar" aria-hidden="true"></i>
            {new Date(playlist.date_time).toLocaleString("fr-FR", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </span>
        </div>

        {playlist.status === "finished" ? (
          <p className="app-error">Cette soirée est terminée.</p>
        ) : (
          <>
            <h2>Propose un morceau</h2>
            <SearchMusic onAddTrack={handleAddTrack} tracks={tracks} />
          </>
        )}

        {error && (
          <p className="app-error" role="alert">
            {error}
          </p>
        )}

        <TrackList
          heading={`Morceaux de la soirée (${tracks.length})`}
          tracks={tracks}
          emptyText="Aucun morceau pour le moment."
        />

        <p>
          <Link className="guest-link" to={`/join/${code}/party/propose`}>
            Ouvrir l'app de la soirée
          </Link>
        </p>
      </main>
    </div>
  );
}

export default GuestPlaylistPage;
