/* Loads /data/prof-dev.json and renders it as a simple linked list.
   You should never need to edit this file — edit data/prof-dev.json instead. */
(function () {
  async function loadProfDev(targetSelector) {
    const target = document.querySelector(targetSelector);
    if (!target) return;
    try {
      const res = await fetch("data/prof-dev.json", { cache: "no-store" });
      const links = await res.json();
      if (!links.length) {
        target.innerHTML = `<div class="empty-state">No professional development links posted yet.</div>`;
        return;
      }
      target.innerHTML = `<ul class="pill-links">${links
        .map(
          l => `<li><a href="${l.url}" target="_blank" rel="noopener">${l.title}${
            l.source ? `<span class="src">${l.source}</span>` : ""
          }</a></li>`
        )
        .join("")}</ul>`;
    } catch (err) {
      target.innerHTML = `<div class="empty-state">Links couldn't be loaded. If you're viewing this file locally (not on the live GitHub Pages URL), that's expected — browsers block local file loading. It works once pushed to GitHub Pages.</div>`;
      console.error("Failed to load prof-dev.json", err);
    }
  }
  window.ScholarsProfDev = { loadProfDev };
})();
