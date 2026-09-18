# Seidenberg Scholars Website

This is the website for the Seidenberg Scholars cohort at Pace University. It's a
plain static site — no build tools, no server, no login required to edit it.
You just edit files directly on GitHub and the live site updates automatically.

**You do not need to know how to code to keep this running.** The two tasks
you'll do regularly (adding an event, adding a professional development link)
are both just editing a simple text file. Instructions below.

## Viewing the live site

Once this is pushed to a GitHub repository with GitHub Pages turned on, the
site is live at whatever URL GitHub Pages gives you (Settings → Pages in the
repo). Bookmark that link — it's what you'll share with current Scholars and
with prospective students.

## How to add an upcoming event

1. In the GitHub repo, open `data/events.json`.
2. Click the pencil icon (top right) to edit the file directly in your browser.
3. Copy one of the existing entries (everything between one `{` and the
   matching `}`) and paste a new one in, then change the details:

```json
{
  "id": "unique-id-for-this-event",
  "title": "Event Name",
  "date": "2027-02-10",
  "startTime": "18:00",
  "endTime": "20:00",
  "location": "15 Beekman St, Room 1010, NYC Campus",
  "audience": "All Scholars",
  "description": "A short description of the event."
}
```

- `id` — any short unique text, no spaces (e.g. `"spring-mixer-2027"`). Used
  internally, not shown on the site.
- `date` — always in `YYYY-MM-DD` format.
- `startTime` / `endTime` — 24-hour format, `"HH:MM"`. If you don't know the
  time yet, set both to `null` (no quotes) and the site will show "TBA" and
  hide the calendar buttons until you fill them in.
- Don't forget the comma between events (every `}` except the very last one
  needs a `,` right after it).
4. Scroll down, add a short commit message like "Add spring mixer event", and
   click **Commit changes**. The live site updates within a minute or two.

To remove a past event, delete its whole `{ ... }` block (and the comma with
it) the same way.

## How to add a professional development link

Same idea, in `data/prof-dev.json`:

```json
{
  "title": "Name of the conference or opportunity",
  "source": "Optional short note, e.g. dates or organizer",
  "url": "https://example.com"
}
```

There's a placeholder "Example" entry in that file — delete it once you've
added a real one.

## How to update contact info

Open `contact.html` and edit the text directly (names, titles, emails, phone
numbers). Each coordinator is inside a `<div class="contact-card">` block —
easy to find and edit even without coding experience.

## How to change site-wide text (About page, homepage copy, colors)

- Wording lives directly in each `.html` file (`index.html`, `about.html`,
  `events.html`, `professional-development.html`, `contact.html`).
- Colors, fonts, and spacing live in `css/style.css`, controlled by the
  variables at the very top of the file (`--navy`, `--gold`, etc.) — change
  those to retheme the whole site at once.

## Previewing changes before they go live

Editing directly on GitHub is easiest for quick updates, but if you want to
preview a bigger change first:
1. Download or clone the repo to your computer.
2. Open `index.html` directly in a browser to look at layout/wording.
   (Note: the Events and Professional Development pages won't load their
   data this way — browsers block that for local files. To test those, use
   a GitHub Pages preview branch, or run a simple local server, e.g.
   `python3 -m http.server` from inside the folder, then visit
   `http://localhost:8000`.)

## File structure

```
index.html                    Homepage / hub
events.html                   Full events list
about.html                    Program info, benefits, requirements
professional-development.html Conference/opportunity links
contact.html                  Coordinator & Dean contact info
css/style.css                 All styling (colors, fonts, layout)
js/events.js                  Renders events.json into event cards + calendar buttons
js/prof-dev.js                Renders prof-dev.json into a link list
data/events.json              ← edit this to add/remove events
data/prof-dev.json            ← edit this to add/remove PD links
```
