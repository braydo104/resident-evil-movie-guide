# Resident Evil Movie Guide (Fan App)

A small offline, fan-made movie guide for the Resident Evil screen releases.

## What’s included

- Live-action films (Anderson series + 2021 reboot)
- CGI animated feature films
- Short/series entries (listed separately in the filter)

## Run it

### Option A: Just open it

Double-click `index.html`.

> Note: Some browsers are stricter about loading ES modules from `file://` URLs. If you see a blank page, use Option B.

### Option B: Run a tiny local web server

**Node (recommended on your machine):**

```bash
npx --yes serve . -l 5173
```

Then open:

- http://localhost:5173/

**Python (if installed):**

```bash
python -m http.server 5173
```

If `python` isn’t found, use the Node option above.

## Disclaimer

This is an unofficial fan project. Resident Evil / Biohazard and all related trademarks are property of their respective owners.
