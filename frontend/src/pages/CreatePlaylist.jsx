import { useState } from "react";

function CreatePlaylist() {
  const [name, setName] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setPlaylist(null);

    try {
      const response = await fetch("http://localhost:3000/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          date_time: new Date(dateTime).toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create playlist");
      }

      setPlaylist(data);
      setName("");
      setDateTime("");
    } catch (err) {
      console.error("Error creating playlist:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create a playlist</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="playlist-name">Playlist name</label>
          <input
            id="playlist-name"
            type="text"
            placeholder="My birthday party"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            required
          />
        </div>

        <div>
          <label htmlFor="playlist-date">Date and time</label>
          <input
            id="playlist-date"
            type="datetime-local"
            value={dateTime}
            onChange={(event) => setDateTime(event.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create playlist"}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      {playlist && (
        <div>
          <h2>Playlist created successfully!</h2>
          <p>Name: {playlist.name}</p>
          <p>Playlist ID: {playlist.id}</p>
          <p>Status: {playlist.status}</p>
        </div>
      )}
    </div>
  );
}

export default CreatePlaylist;