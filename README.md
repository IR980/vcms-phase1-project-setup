# Vehicle Compliance Management System (VCMS)

**Never Miss Your Vehicle Renewal Again**

VCMS lets fleet operators upload vehicle documents (RC, insurance, permits,
PUC, fitness certificates), automatically extracts expiry dates via AI OCR,
and sends reminders before anything lapses.

## Stack

- **Frontend:** React + TypeScript (Vite)
- **Backend:** Node.js + Express + TypeScript
- **Database:** MongoDB Atlas (via Mongoose)

## Project structure

```
vcms/
├── backend/
│   ├── src/
│   │   ├── config/       # env loading, DB connection
│   │   ├── models/       # Mongoose schemas (added from Phase 2 onward)
│   │   ├── controllers/  # route handlers
│   │   ├── routes/       # Express routers
│   │   ├── middleware/   # auth guards, error handling, upload handling
│   │   ├── utils/        # helpers (OCR parsing, date math, etc.)
│   │   ├── types/        # shared TS types
│   │   ├── app.ts        # Express app config
│   │   └── server.ts     # entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/          # axios client + endpoint wrappers
│   │   ├── components/   # reusable UI components
│   │   ├── pages/        # route-level views
│   │   ├── context/      # React context (auth, etc.)
│   │   ├── hooks/        # custom hooks
│   │   ├── types/        # shared TS types
│   │   └── utils/
│   ├── .env.example
│   └── package.json
└── README.md
```

## Getting started

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env: set MONGODB_URI to your Atlas connection string
npm install
npm run dev
```

The API boots on `http://localhost:5000` and exposes a health check at
`GET /api/health`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The app boots on `http://localhost:5173` and calls the backend health
endpoint to confirm connectivity on load.

## MongoDB Atlas setup (needed before running the backend)

1. Create a free cluster at https://cloud.mongodb.com.
2. Create a database user (Database Access) and note the username/password.
3. Under Network Access, allow your IP (or `0.0.0.0/0` for early development).
4. Copy the connection string from "Connect" → "Drivers", replace
   `<username>`/`<password>`, and paste it into `backend/.env` as
   `MONGODB_URI`.

## Roadmap (build phases)

| Phase | Name                     | Status      |
|-------|---------------------------|-------------|
| 1     | Project Setup              | ✅ Done     |
| 2     | Authentication              | Not started |
| 3     | Company & Fleet             | Not started |
| 4     | Vehicle Management           | Not started |
| 5     | Document Upload             | Not started |
| 6     | AI OCR                      | Not started |
| 7     | Expiry Detection             | Not started |
| 8     | Reminder Engine              | Not started |
| 9     | Dashboard                    | Not started |
| 10    | Reports                      | Not started |
| 11    | AI Assistant                 | Not started |
| 12    | Production Deployment         | Not started |

Each phase will build on this scaffold: new Mongoose models under
`backend/src/models`, new routes/controllers, and matching frontend
pages/API wrappers.
