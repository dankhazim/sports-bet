const TZ = 'Europe/Budapest';

export function formatKickoff(iso: string): string {
  return new Date(iso).toLocaleString('hu-HU', {
    timeZone: TZ,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('hu-HU', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString('hu-HU', {
    timeZone: TZ,
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

/** Naponkénti csoportosításhoz stabil kulcs (budapesti nap szerint). */
export function dayKey(iso: string): string {
  return new Date(iso).toLocaleDateString('sv-SE', { timeZone: TZ });
}
