// Streaming services exposed in the creation flow.
// Only Spotify is available for now. The other ones are displayed so the
// upcoming integrations are visible, but their radio stays disabled.
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
