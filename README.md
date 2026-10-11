# JanAwaaz — Samasya Se Samadhaan Tak

Smart civic complaint platform prototype by **Team PENTABYTE**.
Next.js 14 · React 18 · TypeScript · Tailwind CSS · English + Hindi · all data is demo/mock (stored in the browser).

## Run

```bash
npm install
npm run dev      # http://localhost:3000
```

## Demo accounts
| Role | Email | Password |
|---|---|---|
| Citizen | citizen@janawaaz.demo | demo123 |
| Official | admin@janawaaz.demo | admin123 |

(The login page also has one-click demo buttons.)

## 5–10 minute demo script
Turn on **Demo Mode** (orange button in the top bar). A guide panel lists the 16 steps and has a "Take me there" button.

1. Login as Citizen → 2. Report Issue, choose **Pothole** → 3. "Use sample photo" (or upload) →
4. **Use Current Location** (demo GPS, Sector 62) → type or use the voice button → **Submit**
5. Watch the AI analysis → **Possible Duplicate Found** (8 reports within 150 m) → choose
   *Confirm Existing Issue* or *Submit as New Issue* → see priority and department routing
6. **Track Complaint** → timeline updates by itself (Verified → Assigned)
7. Switch to **Admin** (top-right menu) → Complaints → open the new complaint
8. Set **In Progress** → upload evidence → **Mark Resolved**
9. Switch back to Citizen → Track → compare before/after → **Yes, Issue Resolved** (or Reopen)

## Structure
- `src/app/` pages: `/`, `/login`, `/report`, `/dashboard`, `/track`, `/notifications`, `/profile`, `/admin/*`
- `src/lib/store.tsx` app state (localStorage), `src/lib/ai.ts` simulated AI, `src/lib/data.ts` demo data
- `database/schema.sql` PostgreSQL schema for the future Node.js + Express backend

## Connecting a backend later
Replace the actions in `src/lib/store.tsx` with REST calls, e.g. `POST /api/complaints`,
`GET /api/complaints?mine=1`, `PATCH /api/complaints/:id/status`, `POST /api/complaints/:id/evidence`,
`POST /api/complaints/:id/confirm`, `POST /api/complaints/:id/reopen`, `POST /api/auth/login`.
Move the role checks in `src/lib/guard.ts` to the server (JWT/session). Hash passwords.

All locations, numbers and users are demo data.
