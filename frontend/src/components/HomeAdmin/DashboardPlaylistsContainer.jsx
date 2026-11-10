import "./DashboardPlaylistsContainer.css";
import { Link } from "react-router";
import DashboardPlaylistsCard from "./DashboardPlaylistsCard";

export default function DashboardPlaylistsContainer({ playlists = [] }) {
  return (
    <section className="dashboard-playlists-container">
      <div className="dashboard-playlists-header">
        <h2 className="dashboard-playlists-heading">Soirées récentes</h2>
        <span className="dashboard-playlists-count">
          {playlists.length} {playlists.length > 1 ? "soirées" : "soirée"}
        </span>
      </div>

      <div className="dashboard-playlists-list">
        {playlists.length === 0 ? (
          <p className="dashboard-playlists-empty">
            Tu n'as pas encore de soirée. Crée ta première playlist !
          </p>
        ) : (
          playlists.map((playlist) => (
            <Link key={playlist.id} to={`/playlist/${playlist.id}`}>
              <DashboardPlaylistsCard playlist={playlist} />
            </Link>
          ))
        )}
      </div>
    </section>
  );
}