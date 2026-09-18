/* ==========================================================================
   Seidenberg Scholars — events renderer
   Reads /data/events.json and builds event cards + "Add to calendar" links.
   You should never need to edit this file — edit data/events.json instead.
   ========================================================================== */

(function () {
  const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const WEEKDAYS = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
  const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  // Parses "2026-10-15" as a LOCAL date (avoids UTC-shift-by-a-day bugs).
  function parseLocalDate(dateStr) {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  // Builds a YYYYMMDDTHHMMSS string (local/"floating" time — no timezone
  // conversion — which is what both Google Calendar and .ics expect here).
  function toCalStamp(dateStr, timeStr, fallbackHour) {
    const [y, m, d] = dateStr.split("-").map(Number);
    let hh = fallbackHour, mm = 0;
    if (timeStr) {
      const [h, min] = timeStr.split(":").map(Number);
      hh = h; mm = min;
    }
    return `${y}${pad(m)}${pad(d)}T${pad(hh)}${pad(mm)}00`;
  }

  function googleCalUrl(ev) {
    const start = toCalStamp(ev.date, ev.startTime, 9);
    const end = toCalStamp(ev.date, ev.endTime || ev.startTime, 10);
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: ev.title,
      dates: `${start}/${end}`,
      details: ev.description || "",
      location: ev.location || ""
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  function icsEscape(str) {
    return String(str || "").replace(/[\\;,]/g, m => "\\" + m).replace(/\n/g, "\\n");
  }

  function buildIcs(ev) {
    const start = toCalStamp(ev.date, ev.startTime, 9);
    const end = toCalStamp(ev.date, ev.endTime || ev.startTime, 10);
    const now = new Date();
    const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Seidenberg Scholars//Events//EN",
      "BEGIN:VEVENT",
      `UID:${ev.id}@seidenberg-scholars`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${icsEscape(ev.title)}`,
      `DESCRIPTION:${icsEscape(ev.description)}`,
      `LOCATION:${icsEscape(ev.location)}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
  }

  function downloadIcs(ev) {
    const blob = new Blob([buildIcs(ev)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ev.id}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function formatMeta(ev) {
    const parts = [];
    if (ev.date) {
      const d = parseLocalDate(ev.date);
      parts.push(`${MONTHS_FULL[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`);
    } else {
      parts.push("Date to be announced");
    }
    if (ev.startTime) {
      parts.push(ev.endTime ? `${to12h(ev.startTime)}–${to12h(ev.endTime)}` : to12h(ev.startTime));
    }
    if (ev.location) parts.push(ev.location);
    return parts;
  }

  function to12h(t) {
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = ((h + 11) % 12) + 1;
    return m ? `${hour}:${pad(m)} ${period}` : `${hour} ${period}`;
  }

  function renderDateBlock(ev) {
    if (!ev.date) {
      return `<div class="event-date-block tba"><span class="day">TBA</span></div>`;
    }
    const d = parseLocalDate(ev.date);
    return `
      <div class="event-date-block">
        <span class="month">${MONTHS[d.getMonth()]}</span>
        <span class="day">${d.getDate()}</span>
        <span class="weekday">${WEEKDAYS[d.getDay()]}</span>
      </div>`;
  }

  function renderCard(ev) {
    const meta = formatMeta(ev).map(p => `<span>${p}</span>`).join("");
    const canSchedule = !!ev.date;
    return `
      <article class="event-card">
        ${renderDateBlock(ev)}
        <div class="event-body">
          ${ev.audience ? `<span class="event-audience">${ev.audience}</span>` : ""}
          <h3>${ev.title}</h3>
          <p class="event-meta">${meta}</p>
          <p class="event-desc">${ev.description || ""}</p>
          <div class="event-actions">
            ${canSchedule ? `<a class="btn btn-line btn-small" target="_blank" rel="noopener" href="${googleCalUrl(ev)}">Add to Google Calendar</a>` : ""}
            ${canSchedule ? `<button type="button" class="btn btn-line btn-small" data-ics-id="${ev.id}">Add to Outlook (.ics)</button>` : `<span class="note-box" style="padding:7px 12px;">Calendar links open once a date is set</span>`}
          </div>
        </div>
      </article>`;
  }

  async function loadEvents(targetSelector, options) {
    options = options || {};
    const target = document.querySelector(targetSelector);
    if (!target) return;
    try {
      const res = await fetch("data/events.json", { cache: "no-store" });
      let events = await res.json();

      // Sort: dated events chronologically first, undated ("TBA") events last.
      events.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date.localeCompare(b.date);
      });

      if (options.upcomingOnly) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        events = events.filter(ev => !ev.date || parseLocalDate(ev.date) >= today);
      }
      if (options.limit) events = events.slice(0, options.limit);

      if (!events.length) {
        target.innerHTML = `<div class="empty-state">No events posted right now — check back soon.</div>`;
        return;
      }

      target.innerHTML = `<div class="event-list">${events.map(renderCard).join("")}</div>`;
      window.__scholarsEvents = window.__scholarsEvents || {};
      events.forEach(ev => (window.__scholarsEvents[ev.id] = ev));

      target.addEventListener("click", e => {
        const btn = e.target.closest("[data-ics-id]");
        if (!btn) return;
        const ev = window.__scholarsEvents[btn.getAttribute("data-ics-id")];
        if (ev) downloadIcs(ev);
      });
    } catch (err) {
      target.innerHTML = `<div class="empty-state">Events couldn't be loaded. If you're viewing this file locally (not on the live GitHub Pages URL), that's expected — browsers block local file loading. It works once pushed to GitHub Pages.</div>`;
      console.error("Failed to load events.json", err);
    }
  }

  window.ScholarsEvents = { loadEvents };
})();
