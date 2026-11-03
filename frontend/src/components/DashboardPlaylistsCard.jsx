import React from "react";
import "./DashboardPlaylistsCard.css";

export default function DashboardPlaylistsCard({ playlist }) {
  if (!playlist) return null;

  const {
    name,
    title,
    status,
    is_active,
    guestsCount,
    guests_count,
    tracksCount,
    tracks_count,
    date_time,
    date,
  } = playlist;

  const currentStatus = is_active ? "active" : status;

  const statusConfig = {
    preparing: {
      label: "EN PRÉPARATION",
      className: "preparing",
    },
    active: {
      label: "EN DIRECT",
      className: "live",
    },
    finished: {
      label: "ARCHIVÉE",
      className: "archived",
    },
  };

  const config = statusConfig[currentStatus] || {
    label: "INCONNU",
    className: "unknown",
  };

  const playlistName = name || title || "Soirée sans nom";
  const guests = guestsCount ?? guests_count ?? 0;
  const tracks = tracksCount ?? tracks_count ?? 0;

  const playlistDate = date_time
    ? new Date(date_time).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : date || "Date inconnue";

  const isLive = currentStatus === "active";
  const isArchived = currentStatus === "finished";

  return (
    <article className={`dashboard-playlist-card card-${config.className}`}>
      {/* BADGE EN DIRECT */}
      {isLive && (
        <div className="card-header">
          <span className="badge badge-live">{config.label}</span>
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <div className="card-body">
        <div className="card-info">
          {/* NOM ET BADGE ARCHIVÉE */}
          <div className="card-title-row">
            <h3 className="card-title">{playlistName}</h3>

            {(isArchived || currentStatus === "preparing") && (
              <span className={`badge badge-${config.className}`}>
                {config.label}
              </span>
            )}
          </div>

          {/* INFORMATIONS */}
          <p className="card-subtitle">
            {isLive ? (
              <>
                <span>{guests} invités</span>
                <span className="dot">•</span>
                <span>{tracks} morceaux</span>
              </>
            ) : (
              <>
                <span>{playlistDate}</span>
                <span className="dot">•</span>
                <span>{guests} invités</span>
              </>
            )}
          </p>
        </div>

        {/* FLÈCHE POUR LES SOIRÉES EN DIRECT */}
        {isLive && (
          <div className="card-action">
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
          </div>
        )}
      </div>
    </article>
  );
}
