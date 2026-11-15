import { useEffect, useState } from "react";
import { useParams } from "react-router";
import SearchMusic from "../components/SearchMusic";
import Header from "../components/common/Header";
import BottomNav from "../components/common/BottomNav";
import { PARTY_STATUS, TRACK_STATUS } from "../utils/statusLabels.js";
import "./Playlist.css";

function GuestPlaylistPage() {
  const { code } = useParams();

  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pseudo, setPseudo] = useState("");

  // Le pseudo choisi à l'arrivée est gardé en stockage local.
  useEffect(() => {
    setPseudo(localStorage.getItem("guest_name") ?? "");
  }, [code]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [playlistResponse, tracksResponse] = await Promise.all([
          fetch(`/api/invite/${code}`),
          fetch(`/api/invite/${code}/tracks`),
        ]);

        if (!playlistResponse.ok || !tracksResponse.ok) {
          throw new Error("Cette soirée est introuvable");
        }

        const playlistData = await playlistResponse.json();
        const tracksData = await tracksResponse.json();

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

  async function handleAddTrack(spotifyTrack) {
    try {
      setError("");

      const response = await fetch(`/api/invite/${code}/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          external_track_id: spotifyTrack.spotifyId,
          spotify_uri: `spotify:track:${spotifyTrack.spotifyId}`,
          title: spotifyTrack.title,
          artist: spotifyTrack.artist,
          image_url: spotifyTrack.cover,
          duration_ms: spotifyTrack.durationMs,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Impossible d'ajouter le morceau");
      }

      setTracks((previous) => [data, ...previous]);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  if (loading) {
    return (
      <main className="playlist-page">
        <p className="app-status">Chargement de la soirée...</p>
      </main>
    );
  }

  if (!playlist) {
    return (
      <main className="playlist-page">
        <p className="app-status">{error || "Soirée introuvable"}</p>
      </main>
    );
  }

  const status = PARTY_STATUS[playlist.status] ?? {
    label: "Inconnue",
    className: "unknown",
  };

  const date = new Date(playlist.date_time).toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="playlist-page">
      <Header variant="guest" sessionTitle={playlist.name} userPseudo={pseudo} backTo={`/join/${code}`} />

      <main className="playlist-content playlist-content--with-nav">
        <div className="app-meta-row">
          <span className={`app-chip status-${status.className}`}>
            {status.label}
          </span>

          <span className="app-chip">{date}</span>

          <span className="app-chip">
            <i className="fa-solid fa-music" aria-hidden="true"></i>
            {tracks.length} morceau{tracks.length > 1 ? "x" : ""}
          </span>
        </div>

        {playlist.status === "finished" ? (
          <p className="app-status">Cette soirée est terminée.</p>
        ) : (
          <section className="playlist-section">
            <h2 className="section-title">Propose un morceau</h2>

            <SearchMusic onAddTrack={handleAddTrack} tracks={tracks} />
          </section>
        )}

        {error && (
          <p className="app-error" role="alert">
            {error}
          </p>
        )}

        <section className="playlist-section">
          <h2 className="section-title">
            Morceaux de la soirée
            <span className="section-count">({tracks.length})</span>
          </h2>

          {tracks.length === 0 ? (
            <p className="app-status">Aucun morceau pour le moment.</p>
          ) : (
            <ul className="track-list">
              {tracks.map((track) => (
                <li className="track-item" key={track.id}>
                  {track.image_url ? (
                    <img className="track-cover" src={track.image_url} alt="" />
                  ) : (
                    <span
                      className="track-cover track-cover--empty"
                      aria-hidden="true"
                    >
                      <i className="fa-solid fa-music"></i>
                    </span>
                  )}

                  <div className="track-info">
                    <strong>{track.title}</strong>
                    <span>{track.artist}</span>
                  </div>

                  <span
                    className={`track-status track-status--${track.status}`}
                  >
                    {TRACK_STATUS[track.status] ?? track.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* Mêmes onglets que chez l'hôte ; leurs routes arrivent plus tard. */}
      <BottomNav playlistId={playlist.id} />
    </div>
  );
}

export default GuestPlaylistPage;
