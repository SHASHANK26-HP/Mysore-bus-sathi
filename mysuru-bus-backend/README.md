## MysuruBus Saathi — Backend (Node.js + Express + SQLite)

### Setup

```bash
cd mysuru-bus-backend
npm install
```

### Run (development)

```bash
npm run dev
```

Server runs on `PORT` from `.env` (default `3000`) and uses SQLite DB file from `DB_FILE` (default `./mysuru_bus.db`).

### Run seed manually (optional)

```bash
npm run seed
```

On first start, the server auto-seeds if the `stops` table is empty.

---

## API Endpoints + curl examples

### Root health

```bash
curl http://localhost:3000/
```

### GET /api/stops

```bash
curl http://localhost:3000/api/stops
```

### GET /api/routes/all

```bash
curl http://localhost:3000/api/routes/all
```

### GET /api/routes/search?from=...&to=...

```bash
curl "http://localhost:3000/api/routes/search?from=CBS%20(City%20Bus%20Stand)&to=Chamundi%20Betta"
```

### GET /api/timings/:route_no

```bash
curl http://localhost:3000/api/timings/101
```

### GET /api/crowd

```bash
curl http://localhost:3000/api/crowd
```

### POST /api/crowd/report

```bash
curl -X POST http://localhost:3000/api/crowd/report ^
  -H "Content-Type: application/json" ^
  -d "{\"route_no\":\"101\",\"taken\":18,\"total\":40}"
```

### GET /api/nextbus?from=...&to=...

```bash
curl "http://localhost:3000/api/nextbus?from=CBS%20(City%20Bus%20Stand)&to=Chamundi%20Betta"
```

### GET /api/fares?from=...&to=...

```bash
curl "http://localhost:3000/api/fares?from=CBS%20(City%20Bus%20Stand)&to=Chamundi%20Betta"
```

### GET /api/lostfound

```bash
curl http://localhost:3000/api/lostfound
```

### POST /api/lostfound

```bash
curl -X POST http://localhost:3000/api/lostfound ^
  -H "Content-Type: application/json" ^
  -d "{\"item_name\":\"Wallet\",\"description\":\"Black leather wallet\",\"route_no\":\"102\",\"date_found\":\"2026-04-30\",\"contact\":\"+91-90000-00000\"}"
```

### PUT /api/lostfound/:id

```bash
curl -X PUT http://localhost:3000/api/lostfound/1 ^
  -H "Content-Type: application/json" ^
  -d "{\"status\":\"claimed\"}"
```

