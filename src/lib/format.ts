// Format utilities

export function formatDate(isoString: string | null): string {
  if (!isoString) return "-";
  
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return isoString;
  }
}

export function formatShortDate(isoString: string | null): string {
  if (!isoString) return "-";
  
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return isoString;
  }
}
