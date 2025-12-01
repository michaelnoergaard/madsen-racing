# 🏎️ Madsen Racing Website

Personlig website for **Anton Madsen** - 14-årig dansk karting-kører fra Madsen Racing.

## 🎨 Brand Colors

| Farve | Hex | Anvendelse |
|-------|-----|------------|
| Sort | `#0A0A0A` | Primær baggrund |
| Gul | `#FFD600` | Accent, CTA, Energy |
| Lilla | `#7B2D8E` | Sekundær accent |
| Hvid | `#FFFFFF` | Tekst, kontrast |

## 🛠️ Tech Stack

- **Framework:** [Astro](https://astro.build/) v4
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) v3
- **CMS:** [Contentful](https://www.contentful.com/)
- **Language:** TypeScript
- **Hosting:** Simply.com / Netlify

## 📁 Projektstruktur

```
madsen-racing/
├── src/
│   ├── pages/          # Astro sider
│   ├── components/     # Genbrugelige komponenter
│   ├── layouts/        # Side-layouts
│   ├── lib/            # Utilities og API-klienter
│   └── styles/         # Global CSS
├── public/             # Statiske assets
│   └── images/
└── .github/workflows/  # CI/CD
```

## 🚀 Kom i gang

### 1. Installer dependencies

```bash
npm install
```

### 2. Opret `.env` fil

```bash
cp .env.example .env
```

Udfyld Contentful credentials fra [app.contentful.com](https://app.contentful.com).

### 3. Start udviklings-server

```bash
npm run dev
```

Åbn [http://localhost:4321](http://localhost:4321)

### 4. Build til produktion

```bash
npm run build
```

Output gemmes i `/dist` mappen.

## 📄 Sider

| Side | URL | Beskrivelse |
|------|-----|-------------|
| Hjem | `/` | Hero, countdown, stats, Instagram feed |
| Om Anton | `/om-anton` | Personlig historie og fakta |
| Kalender 2026 | `/kalender` | Løbskalender med events |
| Resultater | `/resultater` | Karrierestatistik og resultater |
| Galleri | `/galleri` | Billeder og video |
| Sponsorer | `/sponsorer` | Partnere og sponsormuligheder |

## 🔗 Social Media

- **Instagram:** [@madsenracing22](https://instagram.com/madsenracing22)
- **Facebook:** [Madsen Racing](https://facebook.com/madsenracing)

## 📞 Kontakt

- **Email:** kontakt@madsenracing.dk
- **Manager:** Per Madsen

---

*Built with ❤️ for racing*
