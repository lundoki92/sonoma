import "./DashboardPlaylistsCard.css";

const STATUS = {
  preparing: { label: "EN PRÉPARATION", className: "preparing" },
  active: { label: "EN DIRECT", className: "live" },
  finished: { label: "ARCHIVÉE", className: "archived" },
};

export default function DashboardPlaylistsCard({ playlist }) {
  const { name, status, date_time } = playlist;

  const config = STATUS[status] ?? { label: "INCONNU", className: "unknown" };
  const isLive = status === "active";

  const date = new Date(date_time).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className={`dashboard-playlist-card card-${config.className}`}>
      {isLive && (
        <div className="card-header">
          <span className="badge badge-live">{config.label}</span>
        </div>
      )}

      <div className="card-body">
        <div className="card-info">
          <div className="card-title-row">
            <h3 className="card-title">{name}</h3>
            {!isLive && (
              <span className={`badge badge-${config.className}`}>
                {config.label}
              </span>
            )}
          </div>

          <p className="card-subtitle">{date}</p>
        </div>

        {isLive && (
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
    </article>
  );
}