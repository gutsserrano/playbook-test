# Playbook

A video analysis platform for amateur sports teams. Coaches can upload game videos or link YouTube recordings, mark key plays, create highlight clips, associate them with players, and browse a highlights library.

---

## What It Does

Playbook helps teams analyze game footage and build a searchable library of highlights:

- **Upload or link videos** — Upload local videos (MP4, WebM, MOV) or link YouTube videos to avoid storing large files
- **Mark events** — Add events (goals, assists, saves, fouls, etc.) at specific timestamps
- **Create clips** — Define highlight segments with start/end times and optional player association
- **Browse highlights** — View all clips in a dedicated Highlights Library
- **Analytics** — See event distribution and plays per player on the dashboard

All events and clips are stored locally. For YouTube games, clips are defined by timestamps and played via YouTube embeds—no local clip files are generated.

---

## Technologies

| Layer | Stack |
|-------|-------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide React |
| **Backend** | ASP.NET Core 8, REST API |
| **Database** | PostgreSQL (or InMemory for quick prototyping) |
| **ORM** | Entity Framework Core 8 |
| **Video processing** | FFmpeg (for clip extraction from local videos) |
| **YouTube** | YouTube IFrame API (embed, playback, duration fetch) |

---

## Prerequisites

- **.NET 8 SDK** — [Download](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **FFmpeg** — Required for generating clips from uploaded videos. Must be on your `PATH`.  
  - [Windows](https://ffmpeg.org/download.html) | [macOS: `brew install ffmpeg`](https://formulae.brew.sh/formula/ffmpeg)
- **PostgreSQL 14+** (optional) — For persistent storage. If not used, the app runs with InMemory database.

---

## Quick Start

### 1. Clone and install

```bash
# Frontend
cd frontend
npm install

# Backend (from project root)
cd backend/Playbook.Api
dotnet restore
```

### 2. Configure the backend

Edit `backend/Playbook.Api/appsettings.json`:

**Option A — InMemory (no database required)**

```json
"Database": {
  "Provider": "InMemory"
}
```

**Option B — PostgreSQL**

```json
"Database": {
  "Provider": "PostgreSQL"
},
"ConnectionStrings": {
  "Default": "Host=localhost;Port=5432;Database=playbook;Username=postgres;Password=YOUR_PASSWORD"
}
```

Create the database if using PostgreSQL:

```powershell
# Windows
.\scripts\create-database.ps1
```

```bash
# Linux / macOS
psql -U postgres -c "CREATE DATABASE playbook;"
```

### 3. Run the backend

```bash
cd backend/Playbook.Api
dotnet run
```

API: **http://localhost:5000**  
Swagger UI: **http://localhost:5000/swagger**

### 4. Configure and run the frontend

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local if the API runs on a different port:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

npm run dev
```

Frontend: **http://localhost:3000**

---

## Project Structure

```
playbook-test/
├── backend/
│   ├── Playbook.Api/           # API controllers, services, DTOs
│   ├── Playbook.Domain/        # Entities (Game, Clip, Event, etc.)
│   ├── Playbook.Infrastructure/# DbContext, EF Core, migrations
│   └── Playbook.sln
├── frontend/
│   └── src/
│       ├── app/                # Next.js App Router pages
│       ├── components/         # React components
│       └── lib/                # API client, utilities
├── scripts/                    # DB setup scripts
└── README.md
```

---

## Features

| Feature | Description |
|---------|-------------|
| **Video upload** | MP4, WebM, MOV up to 500MB. Filenames preserved (e.g. `My_Game.mp4`). |
| **YouTube link** | Paste a URL; duration is fetched automatically. |
| **Events** | Mark goals, assists, saves, fouls, etc. at the current timestamp. |
| **Clips** | Create highlight segments with start time (m:ss format), duration, title, optional player. |
| **Timeline** | Seek by clicking the timeline; white marker follows playback. |
| **Clip loop** | Selected clips loop within their time range. |
| **Highlights Library** | Browse all clips; YouTube clips play via embed with start/end params. |
| **Delete game** | Remove a game and all related events, clips, and videos (with confirmation). |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Teams** |
| GET | `/api/teams` | List teams |
| POST | `/api/teams` | Create team |
| GET | `/api/teams/{id}` | Get team |
| **Players** |
| GET | `/api/players` | List players (optional `?teamId=`) |
| POST | `/api/players` | Create player |
| GET | `/api/players/{id}` | Get player |
| **Games** |
| GET | `/api/games` | List games (optional `?teamId=`) |
| POST | `/api/games` | Create game |
| GET | `/api/games/{id}` | Get game with video info |
| DELETE | `/api/games/{id}` | Delete game and all related data |
| **Videos** |
| POST | `/api/games/{id}/videos` | Upload video (multipart: file, duration) |
| POST | `/api/games/{id}/videos/youtube` | Link YouTube video (body: url, duration) |
| **Events** |
| GET | `/api/games/{id}/events` | List game events |
| POST | `/api/games/{id}/events` | Create event |
| PUT | `/api/games/{id}/events/{eventId}` | Update event |
| DELETE | `/api/games/{id}/events/{eventId}` | Delete event |
| **Clips** |
| GET | `/api/clips` | List clips (optional `?gameId=`, `?playerId=`) |
| POST | `/api/clips` | Create clip |
| PUT | `/api/clips/{id}` | Update clip |
| DELETE | `/api/clips/{id}` | Delete clip |
| **YouTube** |
| GET | `/api/youtube/duration?url=...` | Get video duration from YouTube URL |
| **Analytics** |
| GET | `/api/analytics/plays-per-player` | Plays per player |
| GET | `/api/analytics/event-distribution` | Event distribution |

---

## Configuration Reference

### Backend (`appsettings.json`)

| Key | Description | Default |
|-----|-------------|---------|
| `Database:Provider` | `"InMemory"` or `"PostgreSQL"` | `"InMemory"` |
| `ConnectionStrings:Default` | PostgreSQL connection string | — |
| `Storage:AllowedExtensions` | Allowed video extensions | `[".mp4", ".webm", ".mov"]` |
| `Storage:MaxFileSizeBytes` | Max upload size | 500MB |

### Frontend (`.env.local`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## Storage

- **Uploaded videos**: `backend/Playbook.Api/uploads/videos/`
- **Generated clips**: `backend/Playbook.Api/uploads/clips/`

Clips from YouTube-linked games are not stored as files; they are played via YouTube embeds with `?start=X&end=Y`.

---

## License

MIT
