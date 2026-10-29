import React, { useState } from "react";
import "./VoteTab.css";

export default function VoteTab() {
  const [tracks, setTracks] = useState([
    { id: 1, title: "Crazy Frog", artist: "Axel F", voted: true },
    { id: 2, title: "Titre 1", artist: "Curren$y", voted: false },
  ]);

  const toggleVote = (id) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === id ? { ...track, voted: !track.voted } : track
      )
    );
  };

  return (
    <div className="vote-container">
      <div className="vote-header">
        <h2>Le grand vote</h2>
        <p>Top 15 qualifié. Tu as voté pour 2 sons.</p>
      </div>

      {/* Timer circulaire */}
      <div className="timer-wrapper">
        <div className="timer-circle">
          <span className="timer-time">03:40</span>
          <span className="timer-label">Vote en cours</span>
        </div>
      </div>

      {/* Grille des morceaux */}
      <div className="tracks-grid">
        {tracks.map((track) => (
          <div key={track.id} className="track-card">
            <div className="track-cover-placeholder">
              <span>Pochette</span>
              <button
                type="button"
                onClick={() => toggleVote(track.id)}
                className={`heart-btn ${track.voted ? "voted" : ""}`}
              >
                ♥
              </button>
            </div>
            <div className="track-details">
              <h3 className="track-title">{track.title}</h3>
              <p className="track-artist">{track.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}