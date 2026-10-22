(function () {
  "use strict";

  // Créditos del proyecto — mantener sincronizado con quorum-frontend/lib/quorumCreditos.ts
  var QUORUM_CREDIT_LINE =
    "Andrés Felipe Orozco P. · Ficha 2929061 · SENA CPIC · QUORUM v1.0";

  var nav = document.querySelector(".doc-nav");
  var toggle = document.querySelector(".doc-nav-toggle");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      var open = nav.classList.contains("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
      });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = anchor.getAttribute("href").slice(1);
      if (!id) return;
      var el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  var themeBtn = document.querySelector("[data-theme-toggle]");
  if (themeBtn) {
    var stored = null;
    try {
      stored = localStorage.getItem("quorum-docs-theme");
    } catch (err) {}
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
    }
    themeBtn.addEventListener("click", function () {
      document.documentElement.classList.toggle("dark");
      try {
        localStorage.setItem(
          "quorum-docs-theme",
          document.documentElement.classList.contains("dark") ? "dark" : "light"
        );
      } catch (err) {}
    });
  }

  (function initManualTocMobile() {
    var toc = document.querySelector(".manual-toc");
    if (!toc || toc.querySelector(".manual-toc-panel")) return;

    var label = toc.querySelector("strong");
    var list = toc.querySelector("ul");
    if (!label || !list) return;

    var panel = document.createElement("details");
    panel.className = "manual-toc-panel";

    var summary = document.createElement("summary");
    summary.className = "manual-toc-summary";
    summary.textContent = label.textContent.trim() || "Índice";

    var inner = document.createElement("div");
    inner.className = "manual-toc-inner";
    label.classList.add("manual-toc-desktop-label");
    inner.appendChild(list);
    panel.appendChild(summary);
    panel.appendChild(inner);
    toc.appendChild(label);
    toc.appendChild(panel);

    var mq = window.matchMedia("(max-width: 900px)");

    function syncTocPanel() {
      if (mq.matches) {
        panel.removeAttribute("open");
      } else {
        panel.setAttribute("open", "");
      }
    }

    syncTocPanel();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", syncTocPanel);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(syncTocPanel);
    }

    panel.querySelectorAll("a[href^='#']").forEach(function (link) {
      link.addEventListener("click", function () {
        if (mq.matches) {
          panel.removeAttribute("open");
        }
      });
    });
  })();

  var tocLinks = document.querySelectorAll(".manual-toc a[href^='#']");
  var sections = [];
  tocLinks.forEach(function (link) {
    var id = link.getAttribute("href").slice(1);
    var sec = document.getElementById(id);
    if (sec) sections.push({ id: id, el: sec, link: link });
  });

  if (sections.length && "IntersectionObserver" in window) {
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          tocLinks.forEach(function (l) {
            l.classList.toggle("is-active", l.getAttribute("href") === "#" + id);
          });
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      obs.observe(s.el);
    });
  }

  document.querySelectorAll(".doc-footer").forEach(function (footer) {
    if (footer.querySelector(".doc-footer-credit")) return;
    var p = document.createElement("p");
    p.className = "doc-footer-credit";
    p.textContent = QUORUM_CREDIT_LINE;
    footer.appendChild(p);
  });
})();
