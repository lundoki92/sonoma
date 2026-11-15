// Catalogue des services de streaming.
//
// Seul Spotify est branché pour l'instant. Les autres sont affichés pour que
// les intégrations à venir soient visibles, mais leur radio reste désactivée.
// Partagé par le wizard de création et l'app de la soirée.
export const STREAMING_SERVICES = [
  {
    value: "spotify",
    label: "Spotify",
    icon: "fa-brands fa-spotify",
    available: true,
  },
  {
    value: "deezer",
    label: "Deezer",
    icon: "fa-brands fa-deezer",
    available: false,
  },
  {
    value: "apple_music",
    label: "Apple Music",
    icon: "fa-brands fa-apple",
    available: false,
  },
];

export function getServiceLabel(value) {
  return (
    STREAMING_SERVICES.find((service) => service.value === value)?.label ?? value
  );
}

export function getServiceIcon(value) {
  return (
    STREAMING_SERVICES.find((service) => service.value === value)?.icon ??
    "fa-solid fa-music"
  );
}
