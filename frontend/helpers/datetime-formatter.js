export const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatSecondsToTime = (totalSeconds) => {
  if (!totalSeconds && totalSeconds !== 0) return "00:00:00";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60; // Renamed to 'secs' to avoid naming conflicts

  return [hours, minutes, secs]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};
