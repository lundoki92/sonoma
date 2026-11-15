import "./TrackList.css";

// Ce que le regard doit comprendre d'un morceau déjà en base. `proposed`
// n'a pas de libellé ici : chez l'hôte, ces morceaux-là sont présentés dans
// leur propre groupe. Conséquence à connaître pour l'écran invité : une
// proposition d'invité faite avant l'ouverture sera classée dans « Tes
// propositions », sans badge — c'est là qu'il faudra lui donner un libellé
// (« la soirée n'est pas encore ouverte »), pas ici.
const STATUS_LABELS = {
  voting: "En vote",
  selected: "Sélectionné",
  played: "Joué",
};

// Seule une chanson pas encore écrite en base est retirable : le retrait
// existe pendant la création, le temps que le choix soit encore entirely le
// sien. Dès que la soirée existe, le lancement est programmé et une
// proposition appartient déjà au vote de tout le monde.
function isRetirable(track) {
  return !track.status;
}

// Liste de morceaux partagée par l'étape de création et l'écran « Proposer ».
// Un groupe = un état. La note, le badge d'état et la croix de retrait
// s'activent selon ce que l'appelant fournit.
export default function TrackList({
  tracks = [],
  heading,
  note,
  emptyText,
  onRemove,
  removingKey,
}) {
  return (
    <section className="track-list-section">
      <h2>{heading}</h2>

      {note && <p className="track-list-note">{note}</p>}

      {tracks.length === 0 ? (
        emptyText && <p className="track-list-empty">{emptyText}</p>
      ) : (
        <ul className="track-list">
          {tracks.map((track) => {
            const trackKey = track.id ?? track.external_track_id;
            const isRemoving = removingKey === trackKey;

            return (
              <li className="track-item" key={trackKey}>
                {track.image_url && (
                  <img src={track.image_url} alt="" width="44" height="44" />
                )}

                <div className="track-item-info">
                  <span className="track-item-title">{track.title}</span>
                  <span className="track-item-artist">{track.artist}</span>
                </div>

                {STATUS_LABELS[track.status] && (
                  <span
                    className={`track-item-status${
                      track.status === "selected" ? " is-selected" : ""
                    }`}
                  >
                    {STATUS_LABELS[track.status]}
                  </span>
                )}

                {onRemove && isRetirable(track) && (
                  <button
                    type="button"
                    className="track-item-remove"
                    onClick={() => onRemove(track)}
                    disabled={isRemoving}
                    aria-label={`Retirer ${track.title} de la soirée`}
                    title="Retirer le morceau"
                  >
                    <i
                      className={`fa-solid ${
                        isRemoving ? "fa-spinner fa-spin" : "fa-xmark"
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
