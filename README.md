# Smart Farm

ESP32 센서 데이터를 MQTT로 받아 저장하고, 웹 대시보드에서 실시간으로 보여주는 온실 모니터링 프로젝트입니다.
토양 수분이 낮아지면 자동화 규칙으로 펌프를 켜고, 물 사용량도 같이 기록합니다.

## 주요 기능

- MQTT 수집: 디바이스 API 키 인증, Redis 메시지 버퍼, 레이트 리밋, 센서 보정
- MongoDB time-series 컬렉션 저장 (90일 TTL), 시간/일/월 집계
- Z-score 기반 이상 탐지, Socket.IO 실시간 알림 (JWT 인증)
- 자동 관수 규칙 (예: `SOIL_MOISTURE < 35`)
- 식물 건강 지수, Open-Meteo 날씨
- 리포트: 건강 지수, 토양 수분 추이, 물 사용량, 알림 요약
- 한국어(기본), English, O'zbekcha UI

## 기술 스택

- Backend: NestJS 11, GraphQL (Apollo), Mongoose 8, Socket.IO, BullMQ, Redis, MQTT.js
- Frontend: React 18, Vite, MUI 6, Apollo Client, Leaflet
- IoT: ESP32, Mosquitto
- Infra: Docker Compose, Caddy

## 로컬 실행

```powershell
docker run -d --name mosquitto-dev -p 1883:1883 eclipse-mosquitto:2 mosquitto -c /mosquitto-no-auth.conf

cd backend
npm install
npm run start:dev

cd ..\frontend\smart-farm-frontend
npm install
npm run dev
```

Redis(6379)가 필요합니다. 백엔드 `.env`에 MongoDB 접속 정보와 `MQTT_BROKER_URL=mqtt://127.0.0.1:1883`을 넣어 주세요.

## 시뮬레이터

실제 디바이스가 없을 때는 `backend/scripts/simulate-device.js`로 같은 MQTT 경로에 센서 데이터를 보냅니다.

```powershell
cd backend
$env:DEVICE_ID = "<devices._id>"
$env:API_KEY = "<device API key>"
$env:SENSORS = "<sensorId>:TEMPERATURE:°C,<sensorId>:SOIL_MOISTURE:%"
node scripts\simulate-device.js
```

`VITE_DEMO_MODE`, `VITE_FEATURE_CAMERA`, `VITE_FEATURE_NDVI`로 데모 배지와 카메라, NDVI 화면을 켜고 끌 수 있습니다.
