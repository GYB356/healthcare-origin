export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return formatDate(date);
  } else if (days > 0) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  } else {
    return "Just now";
  }
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? "1 year ago" : `${interval} years ago`;
  }

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? "1 month ago" : `${interval} months ago`;
  }

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? "1 day ago" : `${interval} days ago`;
  }

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? "1 hour ago" : `${interval} hours ago`;
  }

  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? "1 minute ago" : `${interval} minutes ago`;
  }

  return seconds < 10 ? "just now" : `${Math.floor(seconds)} seconds ago`;
}
