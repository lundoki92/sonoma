import { useState } from "react";
import { Link, useNavigate } from "react-router";
import ExplanationText from "../components/common/ExplanationText";
import Button from "../components/common/Button";
import { Champ } from "../components/Champ.jsx";
import "./Auth.css";


function CreatePlaylist() {

  const navigate = useNavigate();
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
      const response = await fetch("/api/playlists", {
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
      navigate(`/playlist/${data.id}`);
    } catch (err) {
      console.error("Error creating playlist:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="carte-form">
      <div className="auth-card">
        <ExplanationText
          title="Create a playlist"
          text="Name your party and choose when it starts."
        />

        <form onSubmit={handleSubmit}>
          <Champ
            id="playlist-name"
            label="Playlist name"
            type="text"
            placeholder="My birthday party"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            required
          />

          <Champ
            id="playlist-date"
            label="Date and time"
            type="datetime-local"
            value={dateTime}
            onChange={(event) => setDateTime(event.target.value)}
            required
          />

          <Button
            type="submit"
            disabled={loading}
            text={loading ? "Creating..." : "Create playlist"}
          />
        </form>

        {error && (
          <p className="alerte" role="alert">
            {error}
          </p>
        )}

        {playlist && (
          <div className="succes">
            <h2>Playlist created successfully!</h2>
            <p>Name: {playlist.name}</p>
            <p>Playlist ID: {playlist.id}</p>
            <p>Status: {playlist.status}</p>
          </div>
        )}

        <p className="form-back">
          <Link to="/">← Back to the dashboard</Link>
        </p>
      </div>
    </main>
  );
}

export default CreatePlaylist;
