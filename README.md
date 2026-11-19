# truethingsapp.com

Website der App TrueThings: statisches HTML auf Vercel. Jeder Push auf `main` geht sofort live, Vercel baut dabei nichts. Die Seiten erzeugt `src/build.py` (Python 3, ohne Abhängigkeiten) lokal. Die erzeugten `.html`-Dateien im Repo nicht von Hand ändern, der nächste Build überschreibt sie. Ausnahme ist `admin.html`, das Dashboard unter `/admin`: Es ist handgeschrieben und gehört nicht zum Build.

## Bauen und ansehen

```
python3 src/tools/export-app-data.py   # Spiele und Fragen aus dem App-Code nach src/data/app.json
python3 src/build.py --check      # alle Seiten, sitemap.xml und robots.txt; prüft Links, Titel und Längen
src/tools/render-og.sh            # fehlende Vorschaubilder (og:image) rendern, --all für alle
python3 src/tools/serve.py        # Vorschau auf http://localhost:8080, mit cleanUrls wie bei Vercel
```

`render-og.sh` braucht Google Chrome und ImageMagick. `src/tools/prepare-images.sh` holt Screenshots, Things und App-Icon aus dem App-Repo (`../truethings`). Der Build ist erst fertig, wenn `--check` 0 Probleme meldet.

Die Screenshots stammen aus den App-Store-Aufnahmen (`truethings/Design/AppStore/Quellcode/captures`). Aufnahmen nur für die Website liegen in `truethings/Design/Website/captures/<de|en>/` und haben Vorrang. Dort liegt seit 2026-11-18 der Startbildschirm mit neun Spielen (`home.png`), aufgenommen wie in `Design/AppStore/Quellcode/LIESMICH.md` beschrieben. Die zwei Pärchenfotos darin sind von Pexels, Quelle und Lizenz stehen in `videos/public/photos/SOURCES.md`.

## Wo was steht

| Datei | Inhalt |
|---|---|
| `src/content.py` | alle Texte auf Deutsch und Englisch: Startseite, die neun Spiele, die sieben Fragen-Decks (Slugs, SEO-Titel, Intro, Spielanleitung), Support, 404 |
| `src/data/app.json` | Spiele und die 500 Fragen aus der App (Stand App 2.1.0). `src/tools/export-app-data.py` erzeugt die Datei aus dem Swift-Code neu, wenn sich Spiele oder Decks ändern |
| `src/content/blog/<de\|en>/*.html` | Blogposts auf Deutsch und Englisch. Oben JSON in einem HTML-Kommentar, darunter der Artikel |
| `src/content/legal/*.html` | Impressum, Privacy, Terms, unverändert von der alten Seite übernommen |
| `src/og/og.html` | Vorlage der Vorschaubilder (1200 × 630). `jobs.json` daneben schreibt der Build |
| `assets/css/site.css`, `assets/js/` | Design (Farben und Radien aus dem Design-System der App) und Skripte: Menü, Cookie-Einwilligung, Kartenspieler |
| `admin.html` | Dashboard unter `/admin` mit drei Seiten: „Funnel“, „Screens“ (`/admin#screens`, jeder Onboarding-Schritt als Screenshot mit Zahlen) und „Content“ (`/admin#videos`, Aufrufe der Marketing-Videos aus der Warteschlange und der Slideshows vom Slideshow-Server, nur Anzeige). Ohne Backend ansehen: `admin.html?demo` |
| `assets/admin/onboarding/<de\|en>/` | Screenshots für die Seite „Screens“. Erzeugt `truethings/Design/Onboarding/capture-screens.sh`; danach `SHOT_VERSION` in `admin.html` erhöhen (`/assets` wird ein Jahr gecacht) |

## Fragen-Decks

Jedes Deck der App hat eine Seite pro Sprache. Sechs Decks zeigen alle 50 Karten. „Deep Talk“ zeigt 100 der 200 Karten (jede zweite, `"web_step": 2` in `content.py`), der Rest bleibt als Grund für die App; `"sections"` gliedert die Liste dort nach Themen. Wer alle 200 zeigen will, löscht `web_step` und passt Titel und Texte des Decks an.

## Neuer Blogpost

1. **Datei anlegen:** `src/content/blog/<de|en>/<slug>.html`, Format wie die vorhandenen Posts. Das JSON-Kopfstück enthält `slug`, `title` (H1), `seo_title` (höchstens 60 Zeichen), `description` (140–155), `excerpt`, `date`, `og_kicker`, `og_title` und `faq`. Optional: `updated` (Datum einer Überarbeitung, erscheint neben dem Datum), `og_art` (Motiv des Vorschaubilds, z. B. `pair-sleeping`) und `nav_title` (kurzer Name im Footer).
2. **Übersetzung:** Gibt es den Artikel in beiden Sprachen, nennt `translation` jeweils den Slug der anderen Fassung. Der Build verknüpft die zwei Seiten dann per hreflang und im Sprachumschalter.
3. **Erlaubte Tags im Text:** `p`, `h2` (mit `id`), `h3`, `ul`, `ol`, `li`, `strong`, `em`, `a`, `blockquote`, `table`. Dazu kommen `<ol class="questions">` und `<aside class="tip">`.
4. **Platzhalter:** `<!-- cta:app -->` setzt eine App-Box, `<!-- cta:deck:<id> -->` eine Deck-Box. Gültige IDs: `get-to-know`, `deep-questions`, `never-have-i-ever`, `partner-choice`, `is-it-cheating`, `green-red-flag`, `who-is-more-likely`.
5. **Bauen und rendern:** `python3 src/build.py --check`, dann `src/tools/render-og.sh`. Blogübersicht, Footer, Sitemap und die Links unter den Decks ergänzt der Build selbst. Startseite, Deck-Seiten und Artikel zeigen die drei neuesten Posts.
6. **Zahlen und Studien:** Nur geprüfte Angaben verwenden. Stand der Belege in den Artikeln vom 2026-11-18: Aron et al. 2000 sowie Avni-Babad & Ritov 2003 im Original gelesen. Tsapelas et al. 2009 über die Mitteilung der University of Michigan und Zusammenfassungen. Reissman et al. 1993, Harasymchuk et al. 2022, Scheibehenne et al. 2011 (deshalb ohne Zahlen zitiert) und Gottman nur über Zusammenfassungen. Mehr dazu in `videos/README.md`.

## SEO

Diese Punkte erledigt der Build:

- **Domain:** Canonical immer auf `https://www.truethingsapp.com` (die Domain ohne www leitet dorthin weiter).
- **Sprachen:** hreflang für jedes Paar aus deutscher und englischer Seite, auch für übersetzte Blogposts.
- **Strukturierte Daten** (JSON-LD):
  - MobileApplication (mit `featureList` aus Spielen und Decks) und WebSite auf den Startseiten
  - BlogPosting in Artikeln, Blog auf den Übersichten
  - BreadcrumbList auf allen anderen Seiten
- **Vorschau in Suchergebnissen:** `max-image-preview:large` auf allen indexierbaren Seiten.
- **Sitemap:** `lastmod` kommt bei Artikeln aus `updated` oder `date`, sonst aus `SITE_UPDATED` in `build.py`. Nach inhaltlichen Änderungen an Start- oder Deck-Seiten das Datum dort anheben.
- **App-Banner:** Smart-App-Banner (`apple-itunes-app`) auf jeder Seite.

Bewusst ohne FAQPage-Markup: Google zeigt FAQ-Ergebnisse nur noch für Behörden- und Gesundheitsseiten.

Google Analytics lädt erst nach Zustimmung im Cookie-Banner. Die Search Console deshalb per DNS-Eintrag (Domain-Property) bestätigen und dort `https://www.truethingsapp.com/sitemap.xml` einreichen.
