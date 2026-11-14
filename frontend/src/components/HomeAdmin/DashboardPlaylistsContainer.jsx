import "./DashboardPlaylistsContainer.css";
import { Link } from "react-router";
import DashboardPlaylistsCard from "./DashboardPlaylistsCard";
import {
  STATE_ORDER,
  getPartyState,
  isPartyActionable,
} from "../../utils/partyState.js";

// En direct d'abord, puis les soirées jouées, chacune par date récente.
function sortPlaylists(playlists, now) {
  return [...playlists].sort((a, b) => {
    const byState =
      STATE_ORDER.indexOf(getPartyState(a, now).key) -
      STATE_ORDER.indexOf(getPartyState(b, now).key);

    if (byState !== 0) return byState;

    return new Date(b.date_time) - new Date(a.date_time);
  });
}

export default function DashboardPlaylistsContainer({ playlists = [] }) {
  const now = new Date();
  const sortedPlaylists = sortPlaylists(playlists, now);

  return (
    <section className="dashboard-playlists-container">
      <div className="dashboard-playlists-intro">
        <div className="dashboard-playlists-header">
          <h2 className="dashboard-playlists-heading">Soirées récentes</h2>

          <span className="dashboard-playlists-count">
            {sortedPlaylists.length}{" "}
            {sortedPlaylists.length > 1 ? "soirées" : "soirée"}
          </span>
        </div>

        <p className="dashboard-playlists-hint">
          Passé leur jour, les soirées restent visibles mais ne s'ouvrent plus.
        </p>
      </div>

      {sortedPlaylists.length === 0 ? (
        <p className="dashboard-playlists-empty">
          Tu n'as pas encore de soirée. Crée ta première playlist !
        </p>
      ) : (
        <div className="dashboard-playlists-list">
          {sortedPlaylists.map((playlist) => {
            const state = getPartyState(playlist, now);

            // Une soirée jouée est de l'historique : rien à y faire, donc
            // rien à cliquer.
            if (!isPartyActionable(playlist, now)) {
              return (
                <div
                  key={playlist.id}
                  className="dashboard-playlist-locked"
                  aria-disabled="true"
                  title={`Soirée ${state.label.toLowerCase()}`}
                >
                  <DashboardPlaylistsCard playlist={playlist} now={now} />
                </div>
              );
            }

            return (
              <Link
                key={playlist.id}
                className="dashboard-playlist-link"
                to={`/playlist/${playlist.id}`}
                aria-label={`Ouvrir la soirée « ${playlist.name} »`}
                title={`Ouvrir la soirée « ${playlist.name} »`}
              >
                <DashboardPlaylistsCard playlist={playlist} now={now} />
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
