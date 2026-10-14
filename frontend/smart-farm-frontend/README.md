# Smart Farm frontend

Vite, React 18, TypeScript and Material UI. Data comes from the NestJS backend over GraphQL (queries, mutations and subscriptions through Apollo Client) and Socket.io for live sensor readings.

## Running locally

```bash
npm install
cp .env.example .env
npm run dev
```

The backend has to be running first. `.env.example` points at `http://localhost:3010` for GraphQL, the GraphQL WebSocket, Socket.io and the OAuth redirects. `VITE_DEMO_MODE` and the `VITE_FEATURE_*` flags switch the demo account and the camera, NDVI and social login screens on or off.

## Why Material UI

The UI started on Tailwind CSS with shadcn/ui. The custom color tokens grew hard to follow, and the config format changed between Tailwind v3 and v4. Material UI gave tested components, one `ThemeProvider` for light and dark mode, and typed props.

## Theme

`src/theme/theme.ts` maps the Figma tokens to the MUI palette and typography:

| Figma token | MUI value |
|---|---|
| `text/strong-950` (#333) | `palette.text.primary` |
| `text/sub-500` (#a4a4a4) | `palette.text.secondary` |
| `background/sub-300` (#ececec) | `palette.background.paper` |
| `base/neutral-200` (#eaeaea) | `palette.action.hover` |
| Green gradient | `GRADIENT_GREEN`, `GRADIENT_GREEN_DARK` |
| Dark gradient | `GRADIENT_DARK`, `GRADIENT_DARK_MODE` |

`useThemeMode()` from `src/theme/ThemeModeContext.tsx` reads and toggles the mode anywhere in the tree.

## Layout

```
src/
├── components/   icons and layout (Sidebar, Header, AppLayout, ProtectedRoute)
├── i18n/         ko, en and uz messages
├── lib/          apollo-client.ts (HTTP + WS split link), socket.ts (/monitoring namespace), feature flags
├── modules/      admin, auth, automation, camera, dashboard, device, irrigation,
│                 map-area, pipeline, plant-health, profile, report, settings, task
├── theme/        theme.ts, ThemeModeContext.tsx
└── App.tsx
```

Each module keeps its own `graphql/`, `components/` and `pages/`.
