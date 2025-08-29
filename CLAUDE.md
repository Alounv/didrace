# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Didrace is a real-time multiplayer typing race application built with:
- **Frontend**: Vite + SolidJS + TailwindCSS + DaisyUI
- **Backend**: Convex functions (replaces Hono API)
- **Database**: Convex (real-time database with built-in subscriptions)
- **Authentication**: Discord OAuth with JWT cookies (preserved from Zero migration)
- **Development**: Bun package manager

## Development Commands

### Setup
```bash
bun install
```

### Development Server
```bash
# Start both Convex backend and UI (recommended)
bun run dev

# Start Convex functions only
bun run dev:convex

# Start UI only
bun run dev:ui
```

### Build & Deployment
```bash
# Build for production
bun run build

# Lint code
bun run lint

# Deploy Convex functions
bun run deploy:convex
```

## Architecture

### Real-time Data Layer
The app uses **Convex** for real-time synchronization:
- Schema defined in `convex/schema.ts` with tables: players, races, quotes, playerRaces, typedWords
- Built-in real-time subscriptions - no manual WebSocket management needed
- Convex client configured in `src/convex.ts`

### Frontend Structure
- **Routes**: Home (`/`), Race (`/races/:id`), Profile (`/profile`)
- **Components**: Reusable UI components in `src/components/`
- **Race Logic**: Complex race management in `src/routes/race/` with real-time progress tracking
- **Domain Models**: Business logic in `src/domain/` (both Zero and Convex versions exist)
- **Types**: TypeScript definitions in `src/types.ts`

### Backend Functions (`convex/`)
- **Authentication**: `authentication.ts` - Discord OAuth and guest login endpoints
- **Players**: `players.ts` - User management queries and mutations
- **Races**: `races.ts` - Race operations (create, join, update status, progress)
- **Quotes**: `quotes.ts` - Quote management
- **Analytics**: `analytics.ts` - Typed words tracking for performance metrics
- **HTTP Routes**: `http.ts` - HTTP endpoint configuration

### Database Schema (Convex)
Core tables:
- `players`: User accounts with Discord integration
- `races`: Race instances with status tracking  
- `quotes`: Text content for typing races
- `playerRaces`: Join table with progress and game effects
- `typedWords`: Analytics data for performance tracking

## Environment Variables Required

```bash
# .env.local
VITE_CONVEX_URL=http://127.0.0.1:3210  # Local Convex development
DISCORD_CLIENT_ID=                      # Discord app client ID
DISCORD_CLIENT_SECRET=                  # Discord app client secret
AUTH_SECRET=                       # JWT signing secret (preserved)
CONVEX_DEPLOYMENT=                      # Set automatically by npx convex dev
```

## Key Development Patterns

### Data Fetching (Convex)
```typescript
import { useQuery, useMutation } from "convex/solid";
import { api } from "../convex/_generated/api";
import { getCurrentUser } from "./convex";

const { token } = getCurrentUser();
const races = useQuery(api.races.getRacesByStatus, { status: "ready", token });
const createRace = useMutation(api.races.createRace);
```

### Real-time Updates
Components automatically re-render when Convex data changes. All race updates propagate instantly to participants via built-in subscriptions.

### Authentication Flow (Preserved from Zero)
1. Discord OAuth or guest login sets JWT cookie via HTTP actions
2. JWT decoded in components using `getCurrentUser()` helper
3. Token passed to Convex functions for authorization
4. Functions validate JWT and extract user ID for permissions

### Race State Management
Race status flows: `ready` → `starting` → `started` → `finished`/`cancelled`
Player progress tracked in `playerRaces.progress` (0-100)

## Migration Status

The codebase contains both Zero and Convex implementations:
- **Current**: Zero-based components (existing)
- **New**: Convex-based examples (`*-convex.tsx` files)
- **Main entry**: Updated to use Convex (`src/main.tsx`)

To complete migration: Replace remaining Zero components with Convex equivalents using the example files as templates.

## Testing & Deployment

- Uses TypeScript strict mode with ESLint
- Convex provides built-in dashboard at http://127.0.0.1:6790 for local development
- Deploy Convex functions with `bun run deploy:convex`
- Frontend can be deployed to any static hosting (Vercel, Netlify, etc.)