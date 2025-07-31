export function generateTrackingId(): string {
  const date = new Date().toISOString().slice(0,10).replace(/-/g, '');
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `TRK-${date}-${rand}`;
}
