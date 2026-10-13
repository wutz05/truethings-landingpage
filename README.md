# truethingsapp.com

Website der App TrueThings: statisches HTML auf Vercel. Jeder Push auf `main` geht sofort live, Vercel baut dabei nichts. Die Seiten erzeugt `src/build.py` (Python 3, ohne Abhängigkeiten) lokal. Die erzeugten `.html`-Dateien im Repo nicht von Hand ändern, der nächste Build überschreibt sie. Ausnahme ist `admin.html`, das Dashboard unter `/admin`: Es ist handgeschrieben und gehört nicht zum Build.

## Bauen und ansehen

```
python3 src/build.py --check      # alle Seiten, sitemap.xml und robots.txt; prüft Links, Titel und Längen
src/tools/render-og.sh            # fehlende Vorschaubilder (og:image) rendern, --all für alle
python3 src/tools/serve.py        # Vorschau auf http://localhost:8080, mit cleanUrls wie bei Vercel
```

`render-og.sh` braucht Google Chrome und ImageMagick. `src/tools/prepare-images.sh` holt Screenshots, Things und App-Icon aus dem App-Repo (`../truethings`). Der Build ist erst fertig, wenn `--check` 0 Probleme meldet.

## Wo was steht

| Datei | Inhalt |
|---|---|
| `src/content.py` | alle Texte auf Deutsch und Englisch: Startseite, Spiele, die sechs Fragen-Decks (Slugs, SEO-Titel, Intro, Spielanleitung), Support, 404 |
| `src/data/app.json` | Spiele und die 300 Fragen aus der App (Stand App 2.0.5). Neu erzeugen, wenn sich Decks in der App ändern |
| `src/content/blog/de/*.html` | Blogposts. Oben JSON in einem HTML-Kommentar, darunter der Artikel |
| `src/content/legal/*.html` | Impressum, Privacy, Terms, unverändert von der alten Seite übernommen |
| `src/og/og.html` | Vorlage der Vorschaubilder (1200 × 630). `jobs.json` daneben schreibt der Build |
| `assets/css/site.css`, `assets/js/` | Design (Farben und Radien aus dem Design-System der App) und Skripte: Menü, Cookie-Einwilligung, Kartenspieler |

## Neuer Blogpost

1. **Datei anlegen:** `src/content/blog/de/<slug>.html`, Format wie die vorhandenen Posts. Das JSON-Kopfstück enthält `slug`, `title` (H1), `seo_title` (höchstens 60 Zeichen), `description` (140–155), `excerpt`, `date`, `og_kicker`, `og_title` und `faq`.
2. **Erlaubte Tags im Text:** `p`, `h2` (mit `id`), `h3`, `ul`, `ol`, `li`, `strong`, `em`, `a`, `blockquote`, `table`. Dazu kommen `<ol class="questions">` und `<aside class="tip">`.
3. **Platzhalter:** `<!-- cta:app -->` setzt eine App-Box, `<!-- cta:deck:<id> -->` eine Deck-Box. Gültige IDs: `get-to-know`, `never-have-i-ever`, `partner-choice`, `is-it-cheating`, `green-red-flag`, `who-is-more-likely`.
4. **Bauen und rendern:** `python3 src/build.py --check`, dann `src/tools/render-og.sh`. Blogübersicht, Footer, Sitemap und die Links unter den Decks ergänzt der Build selbst.

## SEO

Diese Punkte erledigt der Build:

- **Domain:** Canonical immer auf `https://www.truethingsapp.com` (die Domain ohne www leitet dorthin weiter).
- **Sprachen:** hreflang für jedes Paar aus deutscher und englischer Seite.
- **Strukturierte Daten** (JSON-LD):
  - MobileApplication und WebSite auf den Startseiten
  - BlogPosting in Artikeln
  - BreadcrumbList auf allen anderen Seiten
- **App-Banner:** Smart-App-Banner (`apple-itunes-app`) auf jeder Seite.

Bewusst ohne FAQPage-Markup: Google zeigt FAQ-Ergebnisse nur noch für Behörden- und Gesundheitsseiten.

Google Analytics lädt erst nach Zustimmung im Cookie-Banner. Die Search Console deshalb per DNS-Eintrag (Domain-Property) bestätigen und dort `https://www.truethingsapp.com/sitemap.xml` einreichen.
