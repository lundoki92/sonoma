import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import SearchMusic from "../components/SearchMusic";

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

  if (loading) return <p>Chargement de la soirée...</p>;
  if (!playlist) return <p>{error || "Soirée introuvable"}</p>;

  return (
    <main>
      <h1>{playlist.name}</h1>
      <p>Date : {new Date(playlist.date_time).toLocaleString("fr-FR")}</p>

      {playlist.status === "finished" ? (
        <p>Cette soirée est terminée.</p>
      ) : (
        <>
          <h2>Propose un morceau</h2>
          <SearchMusic onAddTrack={handleAddTrack} tracks={tracks} />
        </>
      )}

      {error && <p role="alert">{error}</p>}

      <h2>Morceaux de la soirée ({tracks.length})</h2>
      {tracks.length === 0 ? (
        <p>Aucun morceau pour le moment.</p>
      ) : (
        <ul>
          {tracks.map((track) => (
            <li key={track.id}>
              {track.image_url && <img src={track.image_url} alt="" width="50" />}
              <span>{track.title} — {track.artist}</span>
            </li>
          ))}
        </ul>
      )}

      <p>
        <Link to={`/join/${code}/party/propose`}>
          Ouvrir l'app de la soirée
        </Link>
      </p>
    </main>
  );
}

export default GuestPlaylistPage;