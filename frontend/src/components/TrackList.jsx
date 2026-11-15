import "./TrackList.css";

// Track list shared by the creation step and the party "Propose" screen.
// The remove button only appears when `onRemove` is provided.
export default function TrackList({
  tracks = [],
  heading,
  emptyText,
  onRemove,
  removingKey,
}) {
  return (
    <section className="track-list-section">
      <h2>{heading}</h2>

      {tracks.length === 0 ? (
        <p className="track-list-empty">{emptyText}</p>
      ) : (
        <ul className="track-list">
          {tracks.map((track) => {
            const trackKey = track.id ?? track.external_track_id;

            return (
              <li className="track-item" key={trackKey}>
                {track.image_url && (
                  <img src={track.image_url} alt="" width="44" height="44" />
                )}

                <div className="track-item-info">
                  <span className="track-item-title">{track.title}</span>
                  <span className="track-item-artist">{track.artist}</span>
                </div>

                {onRemove && (
                  <button
                    type="button"
                    className="track-item-remove"
                    onClick={() => onRemove(track)}
                    disabled={removingKey === trackKey}
                    aria-label={`Retirer ${track.title} de la soirée`}
                    title="Retirer le morceau"
                  >
                    <i
                      className={`fa-solid ${
                        removingKey === trackKey
                          ? "fa-spinner fa-spin"
                          : "fa-xmark"
                      }`}
                      aria-hidden="true"
                    ></i>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
