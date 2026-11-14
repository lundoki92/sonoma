import "./DashboardPlaylistsCard.css";
import { getPartyState, isPartyActionable } from "../../utils/partyState.js";

export default function DashboardPlaylistsCard({ playlist, now }) {
  const { name, date_time, track_count = 0, guest_count = 0 } = playlist;

  const state = getPartyState(playlist, now ?? new Date());
  // La flèche reprend la règle du clic : une soirée jouée ne s'ouvre plus.
  const isOpen = isPartyActionable(playlist, now ?? new Date());

  const date = new Date(date_time).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className={`dashboard-playlist-card card-${state.badge}`}>
      <div className="card-body">
        <div className="card-info">
          <h3 className="card-title">{name}</h3>

          <p className="card-subtitle">{date}</p>

          <p className="card-counts">
            <span className="card-count">
              <i className="fa-solid fa-music" aria-hidden="true"></i>
              {track_count} morceau{track_count > 1 ? "x" : ""}
            </span>

            <span className="card-count">
              <i className="fa-solid fa-user-group" aria-hidden="true"></i>
              {guest_count} invité{guest_count > 1 ? "s" : ""}
            </span>
          </p>
        </div>

        <div className="card-end">
          <span className={`badge badge-${state.badge}`}>{state.label}</span>

          {isOpen && (
            <span className="arrow-btn" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
