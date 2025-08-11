# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Didrace is a real-time multiplayer typing race application built with:
- **Frontend**: Vite + SolidJS + TailwindCSS + DaisyUI
- **Backend**: Hono API server 
- **Database**: Zero Cache for real-time synchronization with PostgreSQL upstream
- **Authentication**: Discord OAuth with JWT cookies
- **Deployment**: Fly.io with Docker

## Development Commands

### Setup
```bash
npm install
```

### Development Server
```bash
# Start UI with local Zero Cache/database connection
npm run dev:ui

# Start Zero Cache development server
npm run dev:zero-cache

# Start local database (Docker)
npm run dev:db-up

# Stop local database
npm run dev:db-down

# Clean database and cache files
npm run dev:clean
```

### Build & Quality
```bash
# Build for production
npm run build

# Lint code
npm run lint

# Generate permissions SQL from schema
npm run permissions
```

## Architecture

### Real-time Data Layer
The app uses **Zero Cache** for real-time synchronization:
- Schema defined in `src/schema.ts` with tables for players, races, quotes, and typed words
- Permissions system controls data access based on JWT authentication
- Zero instance created in `src/main.tsx` with user authentication

### Frontend Structure
- **Routes**: Home (`/`), Race (`/races/:id`), Profile (`/profile`)
- **Components**: Reusable UI components in `src/components/`
- **Race Logic**: Complex race management in `src/routes/race/` with real-time progress tracking
- **Domain Models**: TypeScript types in `src/domain/` for business logic

### Backend API (`api/index.js`)
- Discord OAuth authentication endpoints (`/api/discord`, `/api/guest`)
- JWT token management with 30-day expiration
- Direct PostgreSQL queries for user management
- Hono server integrated with Vite dev server

### Database Schema
Core tables:
- `player`: User accounts with Discord integration
- `race`: Race instances with status tracking
- `quote`: Text content for typing races  
- `player_race`: Join table with progress and game effects
- `typed_word`: Analytics data for performance tracking

## Environment Variables Required

```bash
ZERO_UPSTREAM_DB=          # PostgreSQL connection string
ZERO_AUTH_SECRET=          # JWT signing secret
VITE_PUBLIC_SERVER=        # Zero Cache server URL
DISCORD_CLIENT_ID=         # Discord app client ID
DISCORD_CLIENT_SECRET=     # Discord app client secret
```

## Key Development Patterns

### Data Fetching
Use Zero queries for reactive data:
```typescript
const races = z.query.race.where('status', 'ready');
```

### Real-time Updates
Components automatically re-render when Zero data changes. Race progress updates propagate instantly to all participants.

### Authentication Flow
1. Discord OAuth or guest login sets JWT cookie
2. JWT decoded in `main.tsx` to get user ID
3. User ID passed to Zero instance for permissions
4. Components receive authenticated Zero instance via props

### Race State Management
Race status flows: `ready` → `starting` → `started` → `finished`/`cancelled`
Player progress tracked in `player_race.progress` (0-100)

## Testing & Deployment

- No specific test commands defined - check for test frameworks if adding tests
- Uses TypeScript strict mode with ESLint
- Fly.io deployment configured via `fly.toml`
- Database seeding via `docker/seed.sql`