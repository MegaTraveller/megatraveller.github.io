# Handbuch zum Redesign (2026)

Dieses Handbuch erklaert den Aufbau der Website nach dem modernen Redesign und
zeigt **konkret, wo man was anpasst**. Es richtet sich an dich als Betreiber –
auch ohne tiefe Programmierkenntnisse.

> Kurzfassung: Das Aussehen steckt fast komplett in **`assets/css/custom.css`**,
> die Interaktivitaet/Animationen in **`assets/js/custom.js`**. Wer Farben
> aendern will, aendert nur den oberen Block in `custom.css`.

---

## 1. Wie die Website technisch funktioniert

Die Seite ist eine **Jekyll**-Website (statischer Seitengenerator) und liegt auf
**GitHub Pages**. Sie nutzt das fertige Design-Theme **„Yat"** als *Remote-Theme*
(`remote_theme: "jeffreytse/jekyll-theme-yat"` in `_config.yml`). Das heisst:

- Das Grundgeruest (Kopfzeile, Seitenleiste, Blog-Liste …) kommt aus dem Theme.
- Eigene Dateien im Projekt **ueberschreiben** Theme-Dateien gleichen Namens
  (z. B. liegt eine eigene Version von `_includes/views/footer.html` vor).

### Das Schichtenmodell des Designs

Damit das Theme erhalten bleibt und trotzdem modern aussieht, arbeitet das
Redesign in **Schichten**, die in dieser Reihenfolge geladen werden
(siehe `_includes/head.html`):

1. `assets/css/main.css` – das kompilierte Yat-Theme (Grundgeruest)
2. `assets/css/my.css` – kleine Altlasten
3. **`assets/css/custom.css`** – die neue Design-Schicht. Laedt **zuletzt** und
   „gewinnt" daher gegen das Theme, ohne dessen Struktur zu zerstoeren.

Dazu kommt **`assets/js/custom.js`** (mit `defer` geladen) fuer Animationen,
mobile Navigation, den Mastodon-Feed und PeerTube.

---

## 2. Die wichtigste Reparatur: `assets/css/main.scss`

**Problem vorher:** Die Datei hatte keinen „Front-Matter" (die zwei `---`-Zeilen
ganz oben) und kein `@import "yat";`. Dadurch hat Jekyll sie **gar nicht zu CSS
verarbeitet** – das Basis-Design war unzuverlaessig.

**Jetzt:** Front-Matter vorhanden, `@import "yat";` zieht das komplette Theme ein,
und die Markenfarbe ist auf ein modernes Indigo gesetzt. Daraus entsteht beim
Build wieder ein vollstaendiges `assets/css/main.css`.

> Wenn die Seite „unformatiert" aussieht, ist fast immer hier etwas kaputt
> (z. B. der `---`-Block oben versehentlich geloescht).

---

## 3. Alle geaenderten / neuen Dateien auf einen Blick

| Datei | Status | Zweck |
|---|---|---|
| `assets/css/main.scss` | repariert | kompiliert das Yat-Theme + setzt Markenfarbe |
| `assets/css/custom.css` | **neu** | komplettes modernes Design (Apple-Stil) |
| `assets/js/custom.js` | **neu** | Animationen, Mobile-Nav, Mastodon, PeerTube |
| `_includes/head.html` | erweitert | bindet `custom.css`/`custom.js` ein, Animations-Schalter |
| `_includes/views/footer.html` | ueberarbeitet | moderner Footer, Social-Leiste, Feed (Startseite) |
| `_includes/mastodon-feed.html` | **neu** | Markup fuer die beiden Mastodon-Feeds |
| `_includes/peertube-embed.html` | **neu** | wiederverwendbares PeerTube-Video (click-to-load) |
| `_includes/cookie-consent.html` | erweitert | neuer Zustimmungs-Schluessel `socialMedia` |
| `cookie-settings.html` | erweitert | Checkbox „Social Media" |
| `index.html` | ueberarbeitet | moderner Intro-Bereich + Service-Karten |

In allen Dateien sind die Aenderungen mit Kommentaren markiert
(Stichwort **„Redesign 2026"** bzw. „AENDERUNG/NEU").

---

## 4. Anpassungen – Schritt fuer Schritt

### 4.1 Farben aendern (am wichtigsten)

Alle Farben sind **Variablen** ganz oben in `assets/css/custom.css`
(Abschnitt **„SECTION 1 — DESIGN-TOKENS"**).

- Heller Modus: Block `:root { … }`
- Dunkler Modus: Block `html[data-theme="dark"] { … }`

Beispiel – Akzentfarbe (das Indigo) aendern:

```css
:root {
  --accent: #6366f1;        /* <- hier neue Farbe eintragen */
  --accent-strong: #4f46e5; /* Hover-Variante */
  --accent-2: #06b6d4;      /* zweiter Akzent (Cyan) */
}
```

Der Farbverlauf (Buttons, Badges, Hover) steckt in `--gradient`. Mehr muss man
in der Regel nicht anfassen – der Rest des Designs zieht automatisch nach.

> Tipp: Wenn das kompilierte Basis-Theme dieselbe Markenfarbe nutzen soll,
> kann man sie zusaetzlich in `assets/css/main.scss` setzen (Variable
> `modernindigo` bzw. die Zeile `$brand-color: …`).

### 4.2 Animationen steuern

Elemente, die beim Hereinscrollen sanft einblenden, bekommen einfach eine
CSS-Klasse:

- `reveal` – Element blendet von unten ein
- `reveal reveal-left` / `reveal-right` – aus der Seite
- `reveal reveal-scale` – leichtes Hineinzoomen
- `reveal-stagger` – Kinder (z. B. Karten) erscheinen nacheinander gestaffelt

Beispiel:

```html
<section class="section reveal">…</section>
```

Technik dahinter: `assets/js/custom.js` (Modul 1) blendet diese Elemente ein,
sobald sie sichtbar werden. Das funktioniert **auf Desktop und Mobil gleich**.

**Barrierefreiheit:** Wer im System „Bewegung reduzieren" aktiviert hat, sieht
**keine** Animationen – alles ist sofort da. Das ist Absicht und sollte so
bleiben.

### 4.3 Texte und Startseite aendern

Die Startseite ist `index.html`. Dort kannst du gefahrlos die Texte im
Intro-Bereich und in den vier **Service-Karten** bearbeiten.

Eine Karte sieht so aus (Icon, Titel, Text):

```html
<a class="feature-card" href="/services.html">
  <span class="icon"><i class="fa fa-shield"></i></span>
  <h3>Risikomanagement</h3>
  <p>Kurzer Beschreibungstext …</p>
</a>
```

- **Icons:** Es ist Font Awesome **4.7** eingebunden. Verfuegbare Icons z. B.
  `fa-shield`, `fa-search`, `fa-certificate`, `fa-sitemap`, `fa-lock`,
  `fa-cogs`, `fa-line-chart`. (Achtung: neuere FA-Icons wie `fa-mastodon`
  funktionieren **nicht**.) Liste: https://fontawesome.com/v4/icons/
- **Karte hinzufuegen:** einfach den `<a class="feature-card">…</a>`-Block
  kopieren. Das Raster passt sich automatisch an.

### 4.4 Die Hero-Ueberschrift / das Titelbild

- Titelbild der Startseite: `index.html`, Zeile `banner: "/assets/images/banners/home.jpeg"`.
  Neues Bild in `assets/images/banners/` ablegen und Pfad anpassen.
- Ueberschrift/Unterzeile des Heros: `_data/defaults.yml` unter `home: heading / subheading`.

### 4.5 Mastodon-Feed (zwei Konten)

Der Feed erscheint **am Ende der Startseite** (oberhalb des Footers). Die Daten
werden direkt und datenschutzfreundlich von den Mastodon-Servern geladen – **kein**
fremdes Widget/Skript.

**Konto aendern / hinzufuegen:** in `_includes/mastodon-feed.html` einen
`masto-column`-Block bearbeiten oder kopieren:

```html
<div class="masto-column"
     data-instance="mastodon.social"  <!-- Server ohne https:// -->
     data-acct="MKrzyzanski"          <!-- Benutzername ohne @ und Server -->
     data-id="307238"                 <!-- numerische Konto-ID (empfohlen) -->
     data-limit="10">                 <!-- Anzahl Beitraege -->
  …
</div>
```

> **`data-id` (empfohlen):** Die feste, numerische Konto-ID ist zuverlaessiger
> als der Umweg ueber den Benutzernamen. So findest du sie: im Browser die
> Adresse `https://<instanz>/api/v1/accounts/lookup?acct=<benutzername>`
> oeffnen (z. B. `https://mastodon.social/api/v1/accounts/lookup?acct=MKrzyzanski`)
> und den Wert hinter `"id"` uebernehmen. Laesst du `data-id` weg, wird die ID
> automatisch ermittelt (kann aber im Browser haeufiger scheitern).

Aktuell eingebunden:
`@MKrzyzanski@mastodon.social` und `@MegaTraveller@chaos.social`.

**Datenschutz / Zustimmung:** Der Feed laedt erst, wenn
- der Besucher Cookies inkl. „Social Media" akzeptiert hat, **oder**
- er im Feed-Bereich auf **„Beitraege laden"** klickt (2-Klick-Loesung).

Die rel="me"-Verifikation (damit Mastodon den Haken setzt) steckt im Footer
(`_includes/views/footer.html`) und – unsichtbar – in `index.html`.

**Feed auch auf anderen Seiten zeigen?** In `_includes/views/footer.html` die
Bedingung `{% raw %}{% if page.url == '/' … %}{% endraw %}` anpassen, oder an
beliebiger Stelle `{% raw %}{% include mastodon-feed.html %}{% endraw %}` einsetzen.

### 4.6 PeerTube-Videos einbinden (fuer spaeter)

Es gibt einen fertigen, datenschutzfreundlichen Baustein. Das Video wird erst
**nach Klick** geladen (vorher nur ein Vorschaubild – keine Verbindung zum
Video-Server).

In einer Seite oder einem Blog-Beitrag einsetzen:

```liquid
{% raw %}{% include peertube-embed.html
     instance="tube.example.org"
     id="DEINE-VIDEO-ID"
     title="Titel des Videos"
     thumbnail="https://tube.example.org/.../preview.jpg" %}{% endraw %}
```

- `instance` = Domain deiner PeerTube-Instanz (ohne `https://`)
- `id` = die Video-ID/UUID aus der Video-Adresse
- `title` (optional) und `thumbnail` (optional) verbessern Darstellung/Barrierefreiheit

Mehrere Videos nebeneinander? In einen `<div class="video-grid"> … </div>`
mehrere Includes setzen. Das Laden ist – wie der Mastodon-Feed – an die
Cookie-Kategorie „Social Media" gekoppelt.

### 4.7 Footer & Social-Links

`_includes/views/footer.html` enthaelt die Social-Leiste (beide Mastodon-Konten
mit `rel="me"`, RSS, GPG-Schluessel, E-Mail) und die rechtlichen Links.
Icons/Links dort einfach bearbeiten.

### 4.8 Cookie-Zustimmung

Neu ist die Kategorie **`socialMedia`** (steuert Mastodon-Feed & PeerTube):
- Banner-Logik: `_includes/cookie-consent.html`
- Einstellungsseite (Checkbox): `cookie-settings.html`

Alle bisherigen Kategorien (Statistik, Google Analytics, PhotoSwipe …) bleiben
unveraendert erhalten.

---

## 5. Lokal testen & veroeffentlichen

**Veroeffentlichen:** Aenderungen committen und nach GitHub pushen – GitHub Pages
baut die Seite automatisch neu. (Das mitgelieferte `_site/`-Verzeichnis ist nur
ein altes Build-Ergebnis und wird auf GitHub ohnehin neu erzeugt.)

**Lokal in der Vorschau ansehen** (optional, benoetigt Ruby):

```bash
bundle install
bundle exec jekyll serve
# danach im Browser: http://localhost:4000
```

---

## 6. Was wurde an der Funktionalitaet verbessert?

- **Basis-CSS repariert** (siehe Abschnitt 2) – das Design baut jetzt zuverlaessig.
- **Sicherere Einbettungen:** Mastodon & PeerTube laden erst nach Zustimmung
  bzw. Klick (DSGVO-freundlich), ohne fremde Tracking-Skripte.
- **Mastodon-Inhalte werden bereinigt** (kein fremdes JavaScript, Links oeffnen
  sicher in neuem Tab) – siehe `sanitizeTootHtml` in `custom.js`.
- **Sauberes Footer-Markup** (vorher `<li>` ohne `<ul>`).
- **Barrierefreiheit:** klare Fokus-Rahmen, Respektieren von „Bewegung reduzieren".
- Alle bisherigen Funktionen (Hell/Dunkel-Umschalter, Cookie-Consent,
  Google-Translate, PhotoSwipe, Code-Highlighting, Kontaktformular,
  „nach oben"-Button) bleiben erhalten.

---

## 7. Problemloesung (kurz)

- **Seite sieht unformatiert aus:** `assets/css/main.scss` pruefen – stehen die
  zwei `---`-Zeilen ganz oben und `@import "yat";` drin?
- **Animationen laufen nicht:** kein Fehler – evtl. ist im System/Browser
  „Bewegung reduzieren" aktiv (gewollt). Sonst pruefen, ob `custom.js` laedt.
- **Mastodon-Feed bleibt leer:** Zustimmung „Social Media" erteilt? Konto-Name
  (`data-acct`) und Server (`data-instance`) korrekt? Bei Fehlern zeigt der
  Block einen Link direkt zum Mastodon-Profil.
- **Neue Texte erscheinen nicht:** Browser-Cache leeren / hart neu laden.

---

## 8. Korrekturen Juni 2026 (Wartung)

Nach dem Redesign wurden folgende Punkte nachgebessert. Alle Aenderungen sind im
Code mit „AENDERUNG 2026" kommentiert.

### 8.1 Richtige Domain in `_config.yml`
`url:` stand auf `https://megatraveller.github.io`, die Seite laeuft aber unter
der eigenen Domain **`michael.krzyzanski.de`** (Datei `CNAME`). Dadurch zeigten
die automatisch erzeugten **Canonical-Links, der RSS-Feed (`feed.xml`) und die
`sitemap.xml`** auf die falsche Adresse (schlecht fuer Google & Co.).

- **Geaendert:** `url: "https://michael.krzyzanski.de"` in `_config.yml`.
- Merke: Diese `url` muss immer zur Domain in der Datei `CNAME` passen.

### 8.2 Canonical-Link pro Seite
In `_includes/head.html` stand ein fester Canonical-Link, der auf **jeder**
Unterseite auf die Startseite zeigte. Suchmaschinen koennen dann Unterseiten
faelschlich als Dubletten werten.

- **Geaendert:** Der manuelle Link wurde entfernt. Das Plugin `jekyll-seo-tag`
  (ueber `{% raw %}{%- seo -%}{% endraw %}`) erzeugt bereits automatisch den
  korrekten Canonical **pro Seite**.

### 8.3 Navigation auf Deutsch
Die Menuepunkte „Archives/Categories/About" waren englisch. Der angezeigte Text
kommt aus dem `title:` im Kopf (Front-Matter) der jeweiligen Datei.

| Datei | vorher | jetzt |
|---|---|---|
| `archives.html` | Archives | **Archiv** |
| `categories.html` | Categories | **Kategorien** |
| `about.html` | About | **Über mich** |

> So aendert man einen Menuepunkt-Namen: in der jeweiligen Datei die Zeile
> `title: …` anpassen. Die Reihenfolge im Menue steht in `_config.yml` unter
> `header_pages`.

### 8.4 Ungueltiger Kommentar in `assets/css/my.css`
Die Datei begann mit `// my.css`. In CSS gibt es **keine** `//`-Kommentare –
dadurch wurde die nachfolgende Regel verschluckt. Jetzt korrekt als
`/* … */`-Kommentar. (Merke: in `.css`-Dateien immer `/* … */` verwenden,
niemals `//`.)

### 8.5 `_site/` nicht mehr im Repository
Der Ordner `_site/` ist nur das **Build-Ergebnis** und wird von GitHub Pages bei
jedem Push automatisch neu erzeugt. Er wurde aus der Versionsverwaltung genommen
(`git rm --cached`) und steht jetzt in `.gitignore`. Die Dateien auf der Platte
bleiben erhalten; sie werden nur nicht mehr mitversioniert.

### 8.6 Hinweis: `jekyll-spaceship` laeuft auf GitHub Pages nicht
Das in `_config.yml` gelistete Plugin `jekyll-spaceship` gehoert **nicht** zur
erlaubten Plugin-Liste von GitHub Pages und wird beim Build dort schlicht
ignoriert (es verursacht aber auch keinen Fehler). Wer dessen Funktionen
(z. B. erweiterte Tabellen, Video-/Mermaid-Einbettungen direkt in Markdown)
wirklich braucht, muesste den Build auf **GitHub Actions** umstellen. Fuer die
aktuelle Seite ist das nicht noetig.

### 8.7 Arbeitsordner des Agenten
Ein Hilfs-/Arbeitsordner `_agent-work/` ist via `.gitignore` ausgeschlossen und
landet nicht im Repository.

### 8.8 Zwei CodeQL-Sicherheitswarnungen behoben (`assets/js/custom.js`)
GitHub meldete zwei „DOM text reinterpreted as HTML"-Warnungen (CodeQL). Beide
entstanden, weil Werte aus `data-`-Attributen (also aus dem DOM) direkt in einen
HTML- bzw. URL-Kontext geschrieben wurden. Risiko hier gering (die Werte stammen
aus eigenen Vorlagen), aber sauber behoben:

- **Mastodon-Fehlermeldung (Alert #24):** Die Fehlerbox wird nicht mehr per
  `innerHTML` aus Text zusammengesetzt, sondern sicher per DOM-Befehlen
  (`createElement`/`textContent`) aufgebaut. `instance`/`acct` werden zusaetzlich
  per `encodeURIComponent` abgesichert.
- **PeerTube-Einbettung (Alert #25):** Bevor die `data-embed`-URL ins `<iframe>`
  gesetzt wird, wird geprueft, dass sie mit `https://` beginnt. So kann keine
  gefaehrliche URL (z. B. `javascript:`) verwendet werden.

> Nach dem Push erkennt CodeQL die Korrekturen beim naechsten Scan automatisch
> und schliesst die beiden Alerts. Faustregel fuer die Zukunft: Werte aus dem DOM
> oder aus dem Netz NIE direkt in `innerHTML` schreiben – entweder `textContent`
> verwenden oder vorher escapen (wie `sanitizeTootHtml`/`escapeText` in `custom.js`).

### 8.9 Mastodon-Feed lädt jetzt über feste Konto-IDs
Die Feeds luden im Browser nicht. Der Code holte zuerst per
`/api/v1/accounts/lookup` die Konto-ID und dann die Beitraege – dieser
`lookup`-Schritt ist client-seitig eine haeufige Fehlerquelle.

- **Geaendert:** In `_includes/mastodon-feed.html` ist jetzt pro Konto die feste
  `data-id` hinterlegt (`307238` fuer mastodon.social, `48364` fuer chaos.social).
  `assets/js/custom.js` laedt die Beitraege damit **direkt**, ohne `lookup`.
  Ist keine `data-id` gesetzt, wird der alte Lookup-Weg als Rueckfallebene genutzt.
- Wie man eine Konto-ID findet, steht in Abschnitt 4.5.

> Falls ein Feed trotzdem leer bleibt: Das liegt dann meist am Browser (z. B.
> „Schutz vor Aktivitaetenverfolgung"/Tracking-Schutz in Firefox/Zen oder ein
> Werbeblocker), der die Anfrage an den Mastodon-Server blockiert. Test: Seite im
> privaten Fenster ohne Add-ons oeffnen. Die genaue Ursache steht in der
> **Web-Konsole** des Browsers (F12 → Konsole) als Zeile mit „Mastodon-Feed:".

### 8.10 Wichtige Lehre: Liquid-Tags nicht in HTML-Kommentare
Ein von mir zunaechst gesetzter Erklaer-Kommentar in `_includes/head.html`
enthielt den Liquid-Tag `{% raw %}{%- seo -%}{% endraw %}`. Jekyll fuehrt
Liquid **auch innerhalb von HTML-Kommentaren** aus; die Ausgabe des seo-Tags
enthaelt ein `--` bzw. `>` und beendete den Kommentar vorzeitig, wodurch
Kommentartext sichtbar auf allen Seiten erschien. **Merke:** In Layouts/Includes
keine Liquid-Tags in `<!-- … -->` schreiben.

### 8.11 Sprachauswahl-Menü abgerundet
Das Google-Translate-Sprachmenü (`.ct-language-dropdown`) hatte eckige Ecken.
In `assets/css/custom.css` (neuer **Abschnitt 16**) sind der Auslöser (Globus-
Icon) und das Flaggen-Menü jetzt abgerundet und bekommen Rahmen + Schatten wie
die übrigen Karten. Den Rundungsgrad steuert dort die Zeile
`border-radius: var(--radius);` – fuer staerker/schwaecher z. B. `var(--radius-lg)`
bzw. `var(--radius-sm)` einsetzen.
