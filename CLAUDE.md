# CLAUDE.md — Projektkontext & Übergabe für den Agenten

> Diese Datei ist eine **Übergabe** für einen Claude-Agenten, der an diesem
> Projekt weiterarbeitet. Sie fasst Architektur, das Redesign 2026, wichtige
> Stolperfallen und nächste Schritte zusammen. Endnutzer-Anleitung („wie ändere
> ich X") steht ausführlich in **`HANDBUCH.md`** — bei Detailfragen dort nachsehen.

---

## 1. Was ist das hier?

- **Persönliche Business-Website** von Michael Krzyzanski (freiberuflicher
  Berater/Auditor für Informationssicherheit & Qualitätsmanagement, ISO 27001 /
  ISO 9001). Sprache: **Deutsch**. Seriöser, vertrauenswürdiger Auftritt.
- **Tech-Stack:** Jekyll (statischer Generator) + **Remote-Theme „Yat"**
  (`remote_theme: "jeffreytse/jekyll-theme-yat"`), gehostet auf **GitHub Pages**
  unter `https://megatraveller.github.io` (CNAME vorhanden).
- Eigene Dateien im Repo **überschreiben** gleichnamige Theme-Dateien.

## 2. Repository-Überblick (relevante Teile)

```
_config.yml                 Jekyll-Konfiguration (remote_theme, plugins, exclude)
_data/defaults.yml          Hero-Überschrift/Unterzeile + Banner der Startseite
_layouts/                   home -> articles -> framework -> default (Kette)
_includes/
  head.html                 <head>: bindet CSS/JS ein (LOKAL überschrieben)
  views/header.html         Kopfzeile/Navigation
  views/footer.html         Footer + Social-Leiste + Mastodon-Feed (Startseite)
  views/banner.html         Hero/Banner
  mastodon-feed.html        NEU: Markup der zwei Mastodon-Feeds
  peertube-embed.html       NEU: wiederverwendbares PeerTube-Embed (click-to-load)
  cookie-consent.html       Cookie-Banner-Logik (+ Schlüssel socialMedia)
_sass/                      lokale Kopie des Yat-Theme-SCSS (yat.scss, yat/_*.scss)
assets/css/main.scss        kompiliert das Theme zu main.css  (WICHTIG, s.u.)
assets/css/custom.css       NEU: komplette moderne Design-Schicht
assets/css/my.css           kleine Altlast (rounded-image)
assets/js/main.js           Theme-JS (Scroll/SmoothScroll Helper) — unangetastet
assets/js/custom.js         NEU: Animationen, Mobile-Nav, Mastodon, PeerTube
index.html                  Startseite (Intro + Service-Karten)
about.html / services.html  Inhaltsseiten
cookie-settings.html        Cookie-Einstellungsseite (+ Checkbox socialMedia)
HANDBUCH.md                 Endnutzer-Handbuch (Anpassungen)
_site/                      ALTES Build-Ergebnis — ignorieren, wird neu erzeugt
```

## 3. Das Redesign 2026 — Architekturprinzip

Das Design ist eine **additive Schicht über dem Theme**, nicht-destruktiv:

1. `assets/css/main.css` (aus `main.scss`) = Yat-Theme = Grundgerüst/Layout.
2. `assets/css/my.css` = Altlast.
3. **`assets/css/custom.css`** = neues Design, lädt **zuletzt** in `head.html` und
   gewinnt per Lade-Reihenfolge/Spezifität. **Hier steckt fast das gesamte Aussehen.**
4. **`assets/js/custom.js`** (mit `defer`) = Verhalten/Animationen.

**Konvention:** Alle Änderungen sind im Code mit `Redesign 2026` bzw.
`AENDERUNG` / `NEU` kommentiert. Bitte beibehalten.

**Design-Tokens:** Farben/Schatten/Radien sind CSS-Variablen ganz oben in
`custom.css` (SECTION 1) — heller Modus in `:root`, dunkler in
`html[data-theme="dark"]`. Farbänderungen nur dort vornehmen.

**Animationen:** Klassen `reveal`, `reveal-left/right/scale`, `reveal-stagger`.
`custom.js` (Modul 1, IntersectionObserver) blendet sie beim Scrollen ein.
`html.reveal-enabled` wird früh in `head.html` gesetzt (nur wenn KEINE
„reduzierte Bewegung"). Ohne JS / bei reduced-motion ist alles sofort sichtbar
(Progressive Enhancement). Bitte dieses Prinzip wahren.

## 4. WICHTIGE Stolperfallen (vor dem Arbeiten lesen)

- **`assets/css/main.scss` braucht zwingend:** den Front-Matter (`---`-Block
  oben) **und** `@import "yat";`. Fehlt eins, kompiliert Jekyll die Datei NICHT
  → die ganze Seite ist unformatiert. (Das war der Originalfehler vor dem Redesign.)
  Die Markenfarbe wird dort über die Map `modernindigo` + `$brand-color: …` gesetzt.
- **Build braucht Netzwerk:** `remote_theme` lädt das Theme von GitHub. Ein
  Offline-Build schlägt fehl. Lokal: `bundle install && bundle exec jekyll serve`
  (mit Netz). GitHub Pages baut beim Push automatisch.
- **Font Awesome ist Version 4.7** (im `head.html` per CDN). NUR 4.7-Icons
  verwenden (z. B. `fa-shield`, `fa-search`, `fa-certificate`, `fa-sitemap`,
  `fa-rss`, `fa-key`, `fa-play`, `fa-retweet`). Neuere Icons wie `fa-mastodon`
  existieren NICHT → Mastodon-Logo ist als Inline-SVG eingebunden.
- **`_site/` nicht von Hand bearbeiten** — ist ein (veraltetes) Build-Artefakt.
- **DSGVO:** Externe Einbettungen (Mastodon-Feed, PeerTube) laden erst nach
  Zustimmung (Cookie-Kategorie `socialMedia`) bzw. nach Klick (2-Klick-Lösung).
  Dieses Verhalten bei Erweiterungen beibehalten.
- **Schreib-Hinweis (maschinenspezifisch):** Auf der Maschine, auf der das
  Redesign erstellt wurde, hat ein OneDrive-Sync mehrfach Datei-Schreibvorgänge
  *abgeschnitten*. Falls so etwas auftritt: nach größeren Schreibvorgängen mit
  `wc -l` / Endmarker prüfen, ggf. via Shell-Heredoc schreiben. Auf einer
  normalen (Nicht-OneDrive-)Maschine ist das vermutlich kein Thema.

## 5. Mastodon-Feed (Self-Hosted, ohne Fremd-Skript)

- Markup: `_includes/mastodon-feed.html` (zwei `div.masto-column` mit
  `data-instance`, `data-acct`, `data-limit`).
- Logik: `custom.js` Modul 3 — ruft die öffentliche Mastodon-API auf
  (`/api/v1/accounts/lookup` → `/api/v1/accounts/:id/statuses`), bereinigt das
  Toot-HTML (`sanitizeTootHtml`) und rendert Karten.
- Konten aktuell: `@MKrzyzanski@mastodon.social`, `@MegaTraveller@chaos.social`.
- Eingebunden am Ende der **Startseite** (Bedingung in `footer.html`).
- Läuft nur im Browser (CORS der Instanzen erlaubt das); im Sandbox/Offline
  nicht testbar.

## 6. PeerTube (für Blog-Posts)

- Baustein: `_includes/peertube-embed.html` (click-to-load, lädt iframe erst bei
  Klick). Der Betreiber bindet Videos **selbst in Markdown-Blogposts** ein:
  `{% raw %}{% include peertube-embed.html instance="tube.example.org" id="VIDEO-ID" title="…" thumbnail="…" %}{% endraw %}`
- An die Cookie-Kategorie `socialMedia` gekoppelt (über das Vorschaltbild-Prinzip).

## 7. Cookie-Consent

- Neuer Schlüssel **`socialMedia`** in `_includes/cookie-consent.html`
  (accept/decline) und `cookie-settings.html` (Checkbox + Speichern + Laden).
- Alle bisherigen Kategorien (statistics, googleAnalytics, photoswipe, mathjax,
  …) unverändert. Beim Hinzufügen neuer externer Dienste neuen Schlüssel anlegen.

## 8. Erhaltene Funktionen (nicht kaputt machen)

Hell/Dunkel-Umschalter (theme-toggle, `data-theme`), Cookie-Consent,
Google-Translate, PhotoSwipe, Code-Highlighting, Kontaktformular (about.html,
Formspree, an `freeform`-Consent gekoppelt), „nach oben"-Button, Blog/Pagination/
Kategorien/Tags/Archiv, Mastodon-`rel="me"`-Verifikation (Footer + versteckt in index.html).

## 9. Build & Deploy

```bash
bundle install
bundle exec jekyll serve        # lokale Vorschau: http://localhost:4000
# Deploy: committen + nach GitHub pushen -> GitHub Pages baut automatisch.
```

## 10. Stand der Übergabe / mögliche nächste Schritte

- Geändert/neu in diesem Redesign: `main.scss` (repariert), `custom.css` (neu),
  `custom.js` (neu), `head.html`, `views/footer.html`, `mastodon-feed.html` (neu),
  `peertube-embed.html` (neu), `cookie-consent.html`, `cookie-settings.html`,
  `index.html`, `HANDBUCH.md` (neu), `_config.yml` (exclude erweitert).
- **Noch nicht verifiziert:** echter Jekyll-Build (war offline nicht möglich) und
  Live-Laden der Mastodon-Posts. Bitte einmal `bundle exec jekyll serve` laufen
  lassen und im Browser prüfen (Hell/Dunkel, Mobile-Menü, Feed nach Consent).
- **Ideen, falls gewünscht:** eigene Unterseite für die Feeds; About-/Services-
  Seiten mit `reveal`-Animationen aufwerten; Hero-CTA „Kontakt"; Lighthouse-Check.
