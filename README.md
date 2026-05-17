# Dealr
South Africa's smartest deals and promotions platform.
Live at: https://dealr.simmico.co.za

## Structure

```
dealr/
  index.html, deals.html, birthdays.html, subscriptions.html, banking.html, about.html
  css/
    base.css        — variables, reset, typography
    layout.css      — nav, footer, grid, page structure
    components.css  — cards, buttons, badges, forms, accordions
    animations.css  — all transitions and scroll animations
    pages.css       — page-specific styles
  js/
    utils.js        — shared helpers
    main.js         — deal rendering and filtering
    scroll.js       — scroll-driven animations
    vitality.js     — Vitality calculator
    banking.js      — banking quiz and comparison
    bot.js          — AI chat widget
  data/
    dealr.json      — all deal data
    banking.json    — banking tiers data
  icons/
    icon-192.svg, icon-512.svg
  manifest.json     — PWA manifest
  sw.js             — service worker
  robots.txt
  sitemap.xml
  config.js         — API key (git-ignored)
```

## Updating deals
Edit `data/dealr.json`. See the deals guide document for full instructions.

## Deployment
Push to the `main` branch. Cloudflare Pages deploys automatically.

## Config
Copy `config.js` and add your Anthropic API key. Never commit `config.js` — it is listed in `.gitignore`.
