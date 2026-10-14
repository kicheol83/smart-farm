# Smart Farm Frontend

Vite, React 18, TypeScript, MUI, Apollo Client, Socket.io

## 실행

```bash
npm install
cp .env.example .env
npm run dev
```

백엔드(`http://localhost:3010`)가 먼저 실행되어 있어야 합니다.
`VITE_DEMO_MODE`, `VITE_FEATURE_*` 값으로 데모 모드와 카메라, NDVI, 소셜 로그인 화면을 켜고 끕니다.

## 구조

```
src/
├── components/
├── i18n/        ko, en, uz
├── lib/         apollo-client.ts, socket.ts, feature flags
├── modules/
├── theme/
└── App.tsx
```
