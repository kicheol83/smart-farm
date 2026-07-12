# Smart Farm — Frontend

Vite + React + TypeScript + **Material UI (MUI)** + Apollo Client (GraphQL + Subscription) + Socket.io.

## O'rnatish

```bash
npm install
cp .env.example .env
# .env dagi backend manzillarini o'zingizga moslang
npm run dev
```

Backend `http://localhost:3000` da ishlab turgan bo'lishi kerak (GraphQL, WebSocket, Socket.io).

## Nega Material UI?

Loyiha boshida Tailwind CSS + shadcn/ui bilan boshlangan edi, lekin:
- Custom rang tokenlar (`text-text-strong-950` kabi) chalkash bo'lib qoldi
- Tailwind versiyalari (v3 → v4) orasida config formati farq qiladi, xato ehtimoli yuqori

**Material UI** ga o'tildi, chunki:
- Tayyor, sinovdan o'tgan komponentlar (`Card`, `Button`, `TextField`, `BottomNavigation`)
- `ThemeProvider` orqali dark/light rejim bir joyda, ishonchli boshqariladi
- Prop-based API — TypeScript IDE yordami to'liq ishlaydi
- Backend dasturchi uchun frontendni tez va barqaror qurish imkonini beradi

## Package versiyalari

**Barcha versiyalar ANIQ pinlangan** (`^` yoki `~` belgisiz) — bu `npm install` har safar bir xil natija berishini kafolatlaydi. Versiyalarni o'zgartirmoqchi bo'lsangiz:

```bash
# Muayyan paketni yangilash (versiyani tekshirib, keyin package.json da qo'lda o'zgartiring)
npm outdated

# Reproducible install (CI/CD yoki jamoada ishlashda tavsiya etiladi)
npm ci
```

## Dizayn tizimi

`src/theme/theme.ts` — Figma dan olingan haqiqiy tokenlar MUI `palette`/`typography` ga aylantirilgan:

| Figma token | MUI qiymati |
|---|---|
| `text/strong-950` (#333) | `palette.text.primary` |
| `text/sub-500` (#a4a4a4) | `palette.text.secondary` |
| `background/sub-300` (#ececec) | `palette.background.paper` |
| `base/neutral-200` (#eaeaea) | `palette.action.hover` |
| Gradient green | `GRADIENT_GREEN` / `GRADIENT_GREEN_DARK` (eksport qilingan) |
| Gradient dark | `GRADIENT_DARK` / `GRADIENT_DARK_MODE` |

Dark mode: `src/theme/ThemeModeContext.tsx` — `useThemeMode()` hook orqali istalgan komponentda mode ni o'qish/almashtirish mumkin.

## Papka strukturasi

```
src/
├── components/layout/    ← Sidebar, Header, AppLayout, ProtectedRoute, ThemeToggle
├── theme/                 ← theme.ts (palette/typography), ThemeModeContext.tsx
├── lib/
│   ├── apollo-client.ts   ← GraphQL HTTP + WS split link
│   └── socket.ts           ← Socket.io client (/monitoring namespace)
├── modules/
│   ├── auth/              ← Login (✅ tayyor), Signup/Forgot Password (stub)
│   ├── dashboard/          ← ✅ TO'LIQ TAYYOR
│   ├── device/, settings/, profile/, task/, camera/,
│   │   plant-health/, map-area/, report/, irrigation/, admin/  ← stub
└── App.tsx
```

## Holat

| Modul | Holat |
|---|---|
| Auth (Login) | ✅ Tayyor, backend bilan ulangan, MUI |
| Dashboard | ✅ Tayyor, backend bilan ulangan, responsive, dark mode |
| Boshqa barcha modullar | ⏳ Stub — navbat bilan to'ldiriladi |

## Keyingi qadam

Modullarni tartib bilan to'ldiramiz — har birida:
1. `graphql/queries.ts` — backend bilan mos query/mutation
2. `components/` — MUI komponentlar (Figma asosida)
3. `pages/` — to'liq sahifa
