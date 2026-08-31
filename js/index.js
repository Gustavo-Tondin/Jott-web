/* Jott — the site's only script.
   Two jobs, both progressive enhancement: name the platform on the download
   buttons, and follow the tour's active panel. Without this file the page is
   whole: the buttons read "Download" and lead to the download page, and the
   tour shows the Timeline panel and figure.
   Add ?debug to the URL to trace what it decides. */

(() => {
  "use strict";

  const DEBUG = location.search.includes("debug");
  const log = (...args) =>
    DEBUG && console.info(`[jott ${new Date().toISOString()}]`, ...args);

  /* --- the download buttons: "Download" → "Download for Linux" ----------- */

  // Only the platforms with a build get named; anything else keeps the
  // generic label and still lands on the download page.
  const PLATFORMS = [
    [/android/i, "Android"],
    [/linux|x11|cros/i, "Linux"],
    [/win/i, "Windows"],
  ];

  const platform =
    navigator.userAgentData?.platform || navigator.platform || "";
  const name = PLATFORMS.find(([test]) => test.test(platform))?.[1];
  log("platform string:", platform, "→", name ?? "(unknown)");

  if (name) {
    for (const label of document.querySelectorAll("[data-os-cta] [data-os-label]")) {
      label.textContent = `Download for ${name}`;
    }
  }

  /* --- the tour: mark the panel in view, its figure and its dot ---------- */

  const tour = document.querySelector(".tour");
  const track = tour?.querySelector(".tour__track");

  if (tour && track && "IntersectionObserver" in window) {
    const panels = [...track.querySelectorAll(".tour__panel")];
    const shots = [...tour.querySelectorAll(".tour__shot")];
    const dots = [...tour.querySelectorAll(".tour__dot")];
    const wide = window.matchMedia("(min-width: 48rem)"); // 768px, as the CSS
    let observer;

    const activate = (index) => {
      log("panel", index, panels[index]?.id);
      panels.forEach((el, i) => el.classList.toggle("is-active", i === index));
      shots.forEach((el, i) => el.classList.toggle("is-active", i === index));
      dots.forEach((el, i) => {
        el.classList.toggle("is-active", i === index);
        if (i === index) el.setAttribute("aria-current", "true");
        else el.removeAttribute("aria-current");
      });
    };

    // The scroller is the section when the panels stack, the track when they
    // run sideways — so the observer is rebuilt when the breakpoint flips.
    const observe = () => {
      observer?.disconnect();
      const root = wide.matches ? tour : track;
      log("observing inside", root.className);
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) activate(panels.indexOf(entry.target));
          }
        },
        { root, threshold: 0.6 },
      );
      panels.forEach((panel) => observer.observe(panel));
    };

    observe();
    wide.addEventListener("change", observe);
  } else {
    log("tour not enhanced", { tour: !!tour, track: !!track });
  }
})();
