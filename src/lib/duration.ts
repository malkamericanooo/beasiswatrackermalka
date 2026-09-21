/**
 * `durationPerSession` is free text entered by hand — the seeds alone use
 * "45 mins", "30 mins" and "1h 30m" — so the timer has to read all of those
 * shapes rather than assume one.
 */
export function parseDurationMinutes(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const s = String(raw).toLowerCase();

  const hourMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours|jam)\b/);
  const minMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes|menit)\b/);

  let total = 0;
  if (hourMatch) total += parseFloat(hourMatch[1]) * 60;
  if (minMatch) total += parseFloat(minMatch[1]);

  // A bare number ("90") is read as minutes.
  if (!hourMatch && !minMatch) {
    const bare = s.match(/(\d+(?:\.\d+)?)/);
    if (bare) total = parseFloat(bare[1]);
  }

  if (!Number.isFinite(total) || total <= 0) return null;
  return Math.round(total);
}

/** mm:ss, or h:mm:ss once the session is an hour or longer. */
export function formatClock(ms: number): string {
  const safe = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const sec = safe % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}
