export function getDate() {
  const date = new Date();
  return date.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function bitrateToKB(bitrate: number) {
  return Math.floor(bitrate / 10000) * 10
}

export function formatSize(bytes: number) {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(1000));
  const value = (bytes / Math.pow(1000, i)).toFixed(2);
  return `${parseFloat(value)} ${units[i]}`;
}
