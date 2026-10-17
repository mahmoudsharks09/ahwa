/**
 * The opening_hours library reads a plain Date as wall-clock time. To judge "open now" in Cairo
 * wherever the visitor is, build a Date whose wall-clock fields are Cairo's current time.
 */
export function cairoNow(d = new Date()): Date {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Cairo', hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(d).map((p) => [p.type, p.value]),
  )
  return new Date(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second)
}
