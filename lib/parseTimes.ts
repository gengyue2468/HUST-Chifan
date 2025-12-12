export function parseTimes(text: string) {
  const timeRegex = /(\d{1,2}:\d{2})\s*[—\-~]\s*(\d{1,2}:\d{2})/g;
  const times = [];
  let m;

  while ((m = timeRegex.exec(text)) !== null) {
    times.push({ start: m[1], end: m[2] });
  }

  return times;
}
