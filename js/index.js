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

  /* --- the tour: the step under the middle of the screen picks the panel */

  const tour = document.querySelector(".tour");
  const steps = tour ? [...tour.querySelectorAll(".tour__step")] : [];

  if (steps.length && "IntersectionObserver" in window) {
    const panels = [...tour.querySelectorAll(".tour__panel")];
    const shots = [...tour.querySelectorAll(".tour__shot")];
    const dots = [...tour.querySelectorAll(".tour__dot")];

    const activate = (index) => {
      log("panel", index, steps[index]?.id);
      panels.forEach((el, i) => el.classList.toggle("is-active", i === index));
      shots.forEach((el, i) => el.classList.toggle("is-active", i === index));
      dots.forEach((el, i) => {
        el.classList.toggle("is-active", i === index);
        if (i === index) el.setAttribute("aria-current", "true");
        else el.removeAttribute("aria-current");
      });
    };

    // A one-pixel band right under the header — the line where the stage is
    // pinned. Whichever step crosses it owns the stage, so a panel lasts
    // exactly its own step of scrolling, the first one included. The band
    // depends on the window height, so it is rebuilt when that changes.
    let observer;
    const observe = () => {
      const header = document.querySelector(".header").offsetHeight;
      const below = Math.max(0, window.innerHeight - header - 1);
      log("trigger band under", header, "px of header");
      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) activate(steps.indexOf(entry.target));
          }
        },
        { rootMargin: `-${header}px 0px -${below}px 0px`, threshold: 0 },
      );
      steps.forEach((step) => observer.observe(step));
    };

    observe();
    let resizing;
    window.addEventListener("resize", () => {
      clearTimeout(resizing);
      resizing = setTimeout(observe, 200);
    });
  } else {
    log("tour not enhanced", { tour: !!tour, steps: steps.length });
  }
})();
