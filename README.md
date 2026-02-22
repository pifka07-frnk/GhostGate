# GhostGate Landing Page

Moderne, dark-mode Landingpage im Cyberpunk-Minimalismus (Schwarz, Anthrazit, Neon-Grün) mit Glasmorphismus.

## Tech-Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Lucide Icons**

## Starten

```bash
npm install
npm run dev
```

Dann im Browser: [http://localhost:3000](http://localhost:3000)

## Struktur

- `app/page.tsx` – Hauptseite (Hero, Mockup, Features, Tech, Waitlist)
- `app/globals.css` – Globale Styles, Grid-Pattern, Glass-Cards
- `components/Hero.tsx` – Headline & Subheadline
- `components/WorldMapMockup.tsx` – Weltkarte mit springendem Ghost-Icon
- `components/Features.tsx` – Drei Feature-Karten (Data Obfuscation, Location Spoofing, Identity Shields)
- `components/TechFocus.tsx` – Local On-Device VPN Hinweis
- `components/WaitlistForm.tsx` – E-Mail-Waitlist (Erfolg beim Absenden simuliert)

## Build

```bash
npm run build
npm start
```
