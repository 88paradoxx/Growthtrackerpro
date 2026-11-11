import React, { useState } from 'react';
import { BellRing, CalendarPlus, Download } from 'lucide-react';

/*
 * Calendar reminders without a server.
 * Builds an iCalendar (.ics) file the user adds to their own phone/computer
 * calendar, which then delivers the notifications. Nothing leaves the device.
 *
 * Dates in this app are UTC-midnight Date objects that represent local
 * calendar days, so all-day events use their UTC Y/M/D.
 * Alarm triggers are relative to the start of the all-day event (00:00):
 *   -PT15H  = 9:00 am the day before
 *   PT8H    = 8:00 am on the day
 */

const pad = (n) => String(n).padStart(2, '0');
export const ymd = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
const plusDays = (d, n) => { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; };

const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
// RFC 5545: lines longer than 75 octets are folded with CRLF + space
const fold = (line) => {
  const out = []; let rest = line;
  while (new TextEncoder().encode(rest).length > 75) {
    let cut = 75; while (new TextEncoder().encode(rest.slice(0, cut)).length > 75) cut--;
    out.push(rest.slice(0, cut)); rest = ' ' + rest.slice(cut);
  }
  out.push(rest); return out.join('\r\n');
};

export const ALARM = {
  dayBefore: { trigger: '-PT15H', label: '9 am the day before' },
  morningOf: { trigger: 'PT8H', label: '8 am on the day' }
};

/** events: [{ uid, date, title, description, alarms: [ALARM.x, ...] }] */
export function buildIcs(events, calName = 'GrowVita reminders') {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//GrowVita//Reminders//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    `X-WR-CALNAME:${esc(calName)}`
  ];
  for (const e of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.uid}@growvita.app`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${ymd(e.date)}`,
      `DTEND;VALUE=DATE:${ymd(plusDays(e.date, 1))}`,
      `SUMMARY:${esc(e.title)}`,
      `DESCRIPTION:${esc(e.description)}`,
      'TRANSP:TRANSPARENT'
    );
    for (const a of e.alarms) {
      lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(e.title)}`, `TRIGGER:${a.trigger}`, 'END:VALARM');
    }
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}

export function downloadIcs(filename, text) {
  const blob = new Blob([text], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function googleCalendarLink(e) {
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${ymd(e.date)}/${ymd(plusDays(e.date, 1))}`,
    details: e.description
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

const fmt = (d) => new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(d);

/**
 * events: reminder events (already filtered to today or later)
 * primary: the one event offered as a Google Calendar link
 */
export function ReminderCard({ heading, intro, events, primary, filename, note }) {
  const [done, setDone] = useState(false);
  if (!events.length) return null;
  return (
    <section className="panel reminder-card" aria-labelledby={`${filename}-h`}>
      <div className="reminder-head">
        <span className="reminder-icon" aria-hidden="true"><BellRing size={20} /></span>
        <div>
          <span className="eyebrow">REMINDERS</span>
          <h2 id={`${filename}-h`}>{heading}</h2>
          <p>{intro}</p>
        </div>
      </div>

      <ul className="reminder-list">
        {events.map((e) => (
          <li key={e.uid}>
            <b>{fmt(e.date)}</b>
            <span>{e.title}</span>
            <small>Alert: {e.alarms.map((a) => a.label).join(' and ')}</small>
          </li>
        ))}
      </ul>

      <div className="reminder-actions">
        <button
          type="button"
          className="primary"
          onClick={() => { downloadIcs(`${filename}.ics`, buildIcs(events)); setDone(true); }}
        >
          <Download size={17} /> Add {events.length > 1 ? `all ${events.length}` : ''} to my calendar
        </button>
        {primary && (
          <a className="secondary-action" href={googleCalendarLink(primary)} target="_blank" rel="noopener noreferrer">
            <CalendarPlus size={15} /> Google Calendar ({fmt(primary.date)} only)
          </a>
        )}
      </div>

      <p className="reminder-note" role="status">
        {done
          ? 'Calendar file downloaded — open it and tap “Add” to save the reminders.'
          : 'Works with iPhone, Samsung and Outlook calendars. The reminders are saved in your own calendar — nothing is sent to GrowVita.'}
      </p>
      <p className="reminder-note">
        {note} Google Calendar imports these files without the custom alerts and uses your default notification instead.
      </p>
    </section>
  );
}
