/* ============================================================================
   custom.js  —  Interaktivität & Animationen für das Redesign
   ----------------------------------------------------------------------------
   Wird in _includes/head.html mit "defer" geladen, läuft also erst, wenn das
   HTML geparst ist. Kein externes Framework, reines Vanilla-JavaScript.

   INHALT (nach "MODUL" suchen):
     MODUL 1 — Scroll-Reveal-Animationen (IntersectionObserver)
     MODUL 2 — Mobile-Navigation (Menü schließen bei Klick/Escape)
     MODUL 3 — Mastodon-Feed (datenschutzfreundlich, Consent/2-Klick)
     MODUL 4 — PeerTube "click-to-load" (Video erst nach Klick laden)

   Alle Module sind voneinander unabhängig und prüfen vorher, ob die nötigen
   Elemente überhaupt existieren -> bricht nie eine Seite, auf der es sie nicht
   gibt.
   ============================================================================ */
(function () {
  "use strict";

  /* Kleine Helfer ---------------------------------------------------------- */

  // Liest einen Cookie aus (gleiche Logik wie im restlichen Projekt).
  function readCookie(name) {
    var nameEQ = name + "=";
    var parts = document.cookie.split(";");
    for (var i = 0; i < parts.length; i++) {
      var c = parts[i].trim();
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
  }

  // Liefert das gespeicherte Cookie-Einstellungs-Objekt (oder {}).
  function getConsentSettings() {
    try {
      return JSON.parse(readCookie("cookie-settings") || "{}");
    } catch (e) {
      return {};
    }
  }

  // Prüft, ob der Nutzer externen Social-Media-Einbettungen zugestimmt hat.
  // Schlüssel "socialMedia" wird im Cookie-Banner / in den Cookie-Einstellungen
  // gesetzt (siehe _includes/cookie-consent.html & cookie-settings.html).
  function hasSocialConsent() {
    return getConsentSettings().socialMedia === true;
  }


  /* ==========================================================================
     MODUL 1 — SCROLL-REVEAL
     Blendet Elemente mit class="reveal" / "reveal-stagger" sanft ein, sobald
     sie in den sichtbaren Bereich scrollen. Funktioniert auf Desktop UND Mobil.
     Die <html>-Klasse "reveal-enabled" wird bereits im <head> gesetzt (nur wenn
     keine "reduzierte Bewegung" gewünscht ist), damit es kein Aufblitzen gibt.
     ========================================================================== */
  function initScrollReveal() {
    var root = document.documentElement;
    // Wenn der Browser keine "reveal-enabled"-Klasse hat (reduced-motion oder
    // kein JS im Head), zeigen wir einfach alles – nichts zu tun.
    if (!root.classList.contains("reveal-enabled")) return;

    var targets = document.querySelectorAll(".reveal, .reveal-stagger");
    if (!targets.length) return;

    // Fallback für sehr alte Browser ohne IntersectionObserver: alles zeigen.
    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // einmal einblenden reicht
          }
        });
      },
      {
        threshold: 0.12,             // ~12 % sichtbar -> auslösen
        rootMargin: "0px 0px -8% 0px" // etwas früher auslösen
      }
    );

    targets.forEach(function (el) { observer.observe(el); });
  }


  /* ==========================================================================
     MODUL 2 — MOBILE-NAVIGATION
     Das Theme nutzt eine Checkbox (#nav-trigger) zum Auf-/Zuklappen. Wir
     verbessern nur die Bedienung: Menü schließt beim Klick auf einen Link
     und mit der Escape-Taste.
     ========================================================================== */
  function initMobileNav() {
    var trigger = document.getElementById("nav-trigger");
    if (!trigger) return;

    var nav = document.querySelector(".site-nav");
    if (nav) {
      nav.addEventListener("click", function (e) {
        // Klick auf einen Navigationslink -> Menü schließen.
        if (e.target.closest(".page-link")) trigger.checked = false;
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") trigger.checked = false;
    });
  }


  /* ==========================================================================
     MODUL 3 — MASTODON-FEED (datenschutzfreundlich)
     Liest die öffentlichen Beiträge eines Kontos über die offizielle
     Mastodon-API (keine Drittanbieter-Skripte). Geladen wird erst, wenn:
       a) der Nutzer Social-Media-Cookies erlaubt hat ODER
       b) er im jeweiligen Block auf "Beiträge laden" klickt (2-Klick-Lösung).

     HTML dazu liefert _includes/mastodon-feed.html:
       <div class="masto-column" data-instance="mastodon.social"
            data-acct="MKrzyzanski" data-limit="10"> ... </div>
     ========================================================================== */
  function initMastodonFeeds() {
    var columns = document.querySelectorAll(".masto-column");
    if (!columns.length) return;

    var consent = hasSocialConsent();

    columns.forEach(function (col) {
      var listEl = col.querySelector(".masto-list");
      if (!listEl) return;

      if (consent) {
        loadMastodonColumn(col, listEl);          // direkt laden
      } else {
        showConsentFacade(col, listEl);           // erst Zustimmung einholen
      }
    });
  }

  // Zeigt einen Hinweis mit "Beiträge laden"-Button (2-Klick-Lösung).
  function showConsentFacade(col, listEl) {
    listEl.innerHTML =
      '<div class="masto-consent">' +
      '<p>Hier werden öffentliche Mastodon-Beiträge von einem externen Server geladen. ' +
      'Dabei wird Ihre IP-Adresse an den jeweiligen Mastodon-Server übertragen.</p>' +
      '<button type="button" class="btn btn-primary masto-load-btn">' +
      '<i class="fa fa-comments"></i>&nbsp;Beiträge laden</button>' +
      '<p style="margin-top:10px"><a href="/cookie-settings.html">Dauerhaft erlauben (Cookie-Einstellungen)</a></p>' +
      "</div>";

    var btn = listEl.querySelector(".masto-load-btn");
    if (btn) {
      btn.addEventListener("click", function () {
        loadMastodonColumn(col, listEl);
      });
    }
  }

  // Holt & rendert die Beiträge einer Spalte.
  function loadMastodonColumn(col, listEl) {
    var instance = col.getAttribute("data-instance");
    var acct = col.getAttribute("data-acct");
    var limit = parseInt(col.getAttribute("data-limit"), 10) || 10;
    var base = "https://" + instance + "/api/v1";

    // Ladeanzeige.
    listEl.innerHTML =
      '<div class="masto-note"><div class="masto-spinner"></div>Beiträge werden geladen …</div>';

    // 1) Konto-ID per Lookup ermitteln, 2) dann die Statuses abrufen.
    fetch(base + "/accounts/lookup?acct=" + encodeURIComponent(acct))
      .then(function (r) {
        if (!r.ok) throw new Error("Konto nicht gefunden (HTTP " + r.status + ")");
        return r.json();
      })
      .then(function (account) {
        var url =
          base + "/accounts/" + account.id + "/statuses" +
          "?limit=" + limit + "&exclude_replies=true";
        return fetch(url).then(function (r) {
          if (!r.ok) throw new Error("Beiträge nicht abrufbar (HTTP " + r.status + ")");
          return r.json();
        });
      })
      .then(function (statuses) {
        renderToots(listEl, statuses, instance, acct);
      })
      .catch(function (err) {
        // AENDERUNG 2026 (Security/CodeQL #24): instance/acct stammen aus
        // data-Attributen (DOM). Daher NICHT per innerHTML zusammensetzen,
        // sondern die Elemente sicher per DOM-API mit textContent aufbauen
        // ("DOM text reinterpreted as HTML" vermeiden).
        var note = document.createElement("div");
        note.className = "masto-note";
        note.appendChild(document.createTextNode("Beiträge konnten nicht geladen werden."));
        note.appendChild(document.createElement("br"));
        var profileLink = document.createElement("a");
        profileLink.href = "https://" + encodeURIComponent(instance) + "/@" + encodeURIComponent(acct);
        profileLink.target = "_blank";
        profileLink.rel = "noopener";
        profileLink.textContent = "Profil direkt auf Mastodon öffnen";
        note.appendChild(profileLink);
        listEl.innerHTML = "";
        listEl.appendChild(note);
        if (window.console) console.warn("Mastodon-Feed:", err);
      });
  }

  // Wandelt das (bereits serverseitig bereinigte) Mastodon-HTML in sicheres
  // HTML um: entfernt Skripte/Event-Handler und erzwingt sichere Links.
  function sanitizeTootHtml(html) {
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    // gefährliche Elemente entfernen
    tmp.querySelectorAll("script, style, iframe, object, embed, link").forEach(
      function (el) { el.remove(); }
    );
    // alle on*-Attribute und javascript:-URLs entfernen
    tmp.querySelectorAll("*").forEach(function (el) {
      Array.prototype.slice.call(el.attributes).forEach(function (attr) {
        var n = attr.name.toLowerCase();
        if (n.indexOf("on") === 0) el.removeAttribute(attr.name);
        if ((n === "href" || n === "src") && /^\s*javascript:/i.test(attr.value)) {
          el.removeAttribute(attr.name);
        }
      });
    });
    // Links sicher in neuem Tab öffnen
    tmp.querySelectorAll("a").forEach(function (a) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener nofollow");
    });
    return tmp.innerHTML;
  }

  // Baut die Liste der Beiträge.
  function renderToots(listEl, statuses, instance, acct) {
    if (!Array.isArray(statuses) || statuses.length === 0) {
      listEl.innerHTML = '<div class="masto-note">Noch keine Beiträge vorhanden.</div>';
      return;
    }

    var dateFmt;
    try {
      dateFmt = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" });
    } catch (e) { dateFmt = null; }

    var html = "";
    statuses.forEach(function (status) {
      // Bei "Boosts" (Reblogs) den Originalbeitrag anzeigen + Hinweis.
      var isBoost = !!status.reblog;
      var s = isBoost ? status.reblog : status;
      var author = s.account || {};
      var when = "";
      try { when = dateFmt ? dateFmt.format(new Date(s.created_at)) : s.created_at.substring(0, 10); }
      catch (e) { when = ""; }

      var boostLabel = isBoost
        ? '<div class="masto-boost-label"><i class="fa fa-retweet"></i> geteilt von @' +
          escapeText((status.account || {}).username || acct) + "</div>"
        : "";

      // Medien (nur Bilder/GIFs als Vorschau).
      var media = "";
      if (s.media_attachments && s.media_attachments.length) {
        var imgs = s.media_attachments.filter(function (m) {
          return m.type === "image" || m.type === "gifv";
        });
        if (imgs.length) {
          media = '<div class="masto-media">';
          imgs.slice(0, 4).forEach(function (m) {
            media +=
              '<a href="' + escapeAttr(m.url || m.remote_url || s.url) +
              '" target="_blank" rel="noopener"><img loading="lazy" src="' +
              escapeAttr(m.preview_url || m.url) + '" alt="' +
              escapeAttr(m.description || "Medienanhang") + '"></a>';
          });
          media += "</div>";
        }
      }

      html +=
        '<article class="masto-toot">' +
        boostLabel +
        '<div class="masto-toot-head">' +
        '<img loading="lazy" src="' + escapeAttr(author.avatar) + '" alt="">' +
        '<div><span class="name">' + escapeText(author.display_name || author.username) + "</span>" +
        '<span class="acct">@' + escapeText(author.acct || author.username) + "</span></div>" +
        "</div>" +
        '<div class="masto-toot-content">' + sanitizeTootHtml(s.content || "") + "</div>" +
        media +
        '<div class="masto-toot-foot"><span>' + when + "</span>" +
        '<a href="' + escapeAttr(s.url) + '" target="_blank" rel="noopener">Auf Mastodon ansehen →</a></div>' +
        "</article>";
    });

    listEl.innerHTML = html;
  }

  // Text/Attribut-Escaping gegen kaputtes Markup.
  function escapeText(str) {
    var d = document.createElement("div");
    d.textContent = str == null ? "" : String(str);
    return d.innerHTML;
  }
  function escapeAttr(str) {
    return escapeText(str).replace(/"/g, "&quot;");
  }


  /* ==========================================================================
     MODUL 4 — PEERTUBE "CLICK-TO-LOAD"
     Tauscht beim Klick das Vorschaltbild gegen das echte PeerTube-iframe.
     Bis dahin wird KEINE Verbindung zum Video-Server aufgebaut (Datenschutz).
     HTML dazu liefert _includes/peertube-embed.html.
     ========================================================================== */
  function initPeerTube() {
    var facades = document.querySelectorAll(".pt-facade");
    if (!facades.length) return;

    facades.forEach(function (facade) {
      facade.addEventListener("click", function () {
        var src = facade.getAttribute("data-embed");
        var title = facade.getAttribute("data-title") || "PeerTube-Video";
        // AENDERUNG 2026 (Security/CodeQL #25): src kommt aus einem
        // data-Attribut (DOM). Nur echte https-URLs zulassen, damit keine
        // gefaehrliche URL (z. B. "javascript:") in das iframe-src gelangt.
        if (!src || !/^https:\/\//i.test(src)) return;

        var iframe = document.createElement("iframe");
        iframe.setAttribute("src", src);
        iframe.setAttribute("title", title);
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
        iframe.setAttribute("sandbox", "allow-same-origin allow-scripts allow-popups allow-forms");

        facade.replaceWith(iframe);
      });
    });
  }


  /* ==========================================================================
     START — alle Module nach dem Laden des DOM initialisieren.
     ========================================================================== */
  function init() {
    initScrollReveal();
    initMobileNav();
    initMastodonFeeds();
    initPeerTube();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init(); // DOM ist schon bereit (z. B. bei defer nach dem Parsen)
  }
})();
