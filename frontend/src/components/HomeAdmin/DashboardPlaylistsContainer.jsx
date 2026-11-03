
import React from "react";
import "./DashboardPlaylistsContainer.css";
import DashboardPlaylistsCard from "./DashboardPlaylistsCard";

export default function DashboardPlaylistsContainer({ playlists = [] }) {

  return (
    <section className="dashboard-playlists-container">

      {/* HEADER DE LA SECTION */}
      <div className="dashboard-playlists-header">
        <h2 className="dashboard-playlists-heading">
          Soirées récentes
        </h2>

        <span className="dashboard-playlists-count">
          {playlists.length} {playlists.length > 1 ? "soirées" : "soirée"}
        </span>
      </div>

      {/* LISTE DES PLAYLISTS */}
      <div className="dashboard-playlists-list">
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <DashboardPlaylistsCard
              key={playlist.id}
              playlist={playlist}
            />
          ))
        ) : (
          <p className="dashboard-playlists-empty">
            Tu n'as pas encore de soirée. Crée ta première playlist !
          </p>
        )}
      </div>

    </section>
  );
}
