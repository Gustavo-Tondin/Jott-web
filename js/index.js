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

  /* --- the tour: the panel crossing the middle of the screen picks the plate */

  const tour = document.querySelector(".tour");
  const panels = tour ? [...tour.querySelectorAll(".tour__panel")] : [];

  if (panels.length && "IntersectionObserver" in window) {
    const shots = [...tour.querySelectorAll(".tour__shot")];
    const dots = [...tour.querySelectorAll(".tour__dot")];

    const activate = (index) => {
      log("panel", index, panels[index]?.id);
      shots.forEach((el, i) => el.classList.toggle("is-active", i === index));
      dots.forEach((el, i) => {
        el.classList.toggle("is-active", i === index);
        if (i === index) el.setAttribute("aria-current", "true");
        else el.removeAttribute("aria-current");
      });
    };

    // A band across the middle of the screen — where the figure is. Whichever
    // panel crosses it owns the plate. No scroll listener, no maths.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) activate(panels.indexOf(entry.target));
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    panels.forEach((panel) => observer.observe(panel));
  } else {
    log("tour not enhanced", { tour: !!tour, panels: panels.length });
  }
})();
