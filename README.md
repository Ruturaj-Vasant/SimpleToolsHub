# Simple Tools Hub

A lightweight set of everyday web tools (timers, calculators, converters) built as a static site. No logins, no databases, and minimal assets so it stays fast on desktop and mobile. Ideal for zero-cost hosting (GitHub Pages, Vercel, Netlify) and future organic search traffic.

## Included tools
- Home overview
- Countdown Timer
- Stopwatch with laps
- Pomodoro timer (25/5, 50/10, custom)
- GPA calculator (credits + letter grades)
- Percentage calculator (percent-of, reverse percent, change, grades)
- Age calculator with next-birthday countdown
- Date difference calculator (days, weeks, months)
- Unit converter (length, weight, temperature, volume)
- Tip & discount calculator (bill split + sale price)
- About / Privacy page

## Why this exists
- Simple, no-login utilities people search for often
- Static HTML/CSS/JS only—no backend or environment variables
- Easy to host for free and keep maintenance close to zero
- SEO-ready basics: meta tags, sensible headings, sitemap/robots, internal links

## Running locally
1. Clone or download this folder.
2. Open `index.html` directly in a browser **or** start a tiny server (prevents any browser security quirks with local files):
   ```bash
   python3 -m http.server 8000
   # then open http://localhost:8000
   ```
   Any static server (e.g., `npx serve`) also works.

## Deploying
- **GitHub Pages**: push to a repo, enable Pages for the main branch (root). `index.html` is already at the root.
- **Vercel**: create a new project, import the repo, framework = “Other”, output directory = `/`. Deploy.
- **Netlify**: drag-and-drop the folder in the Netlify UI or connect the repo with “build command: none” and “publish directory: /”.

## Analytics hooks
- Each HTML page includes commented placeholders near the top of the `<head>` for Google Analytics and Search Console verification. Paste your GA snippet or verification meta tag there.

## Sitemap and robots
- `sitemap.xml` and `robots.txt` are included. Update the domain in both files after you know your live URL (currently set to `https://simpletoolshub.com`).

## Tech stack
- Plain HTML + CSS + vanilla JavaScript
- Shared styles in `assets/css/styles.css`
- Page-specific logic in `assets/js/`

## Notes
- Everything runs client-side; no personal data is stored. GPA rows save locally in your browser so you don't lose entries on refresh.
- Calculators and converters update live as you type; buttons remain for explicit recalculations if needed. Timer and percentage pages can be pre-filled and shared via URL parameters (`?h=0&m=25&s=0` on timer, `?po=20&pb=50...` on percentage).
- Theme toggle (light/dark) is built-in and remembered locally.
- Basic PWA support: `manifest.json` + `sw.js` cache static assets so the tools are available offline once visited.
- Keep file names/URLs as-is for the sitemap links to stay valid.
