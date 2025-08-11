# Zero to Convex Migration Guide

This document outlines the migration from Zero + PostgreSQL to Convex for the Didrace typing race application.

## Overview

The migration involves:
1. **Database**: Zero Cache + PostgreSQL → Convex (schema + real-time)
2. **Backend**: Hono API endpoints → Convex functions
3. **Frontend**: Zero queries → Convex queries
4. **Authentication**: JWT logic preserved, integrated with Convex

## Schema Changes

### Table Mapping
- `player` → `players`
- `quote` → `quotes` 
- `race` → `races`
- `player_race` → `playerRaces`
- `typed_word` → `typedWords`

### Key Differences
- IDs are now Convex `Id<"tableName">` instead of strings
- Indexes explicitly defined for query performance
- Relationships handled via queries rather than schema relationships
- Enums preserved as union types

## API Endpoints Migration

### Authentication Endpoints
- `/api/discord` → `convex/http.ts` Discord OAuth flow
- `/api/guest` → `convex/http.ts` Guest login flow
- JWT creation/validation logic preserved in `convex/auth.ts`

### Database Operations
- Player management → `convex/players.ts`
- Race operations → `convex/races.ts`
- Quote queries → `convex/quotes.ts`
- Analytics data → `convex/analytics.ts`

## Frontend Changes

### Client Setup
```typescript
// Old (Zero)
import { createZero } from "@rocicorp/zero/solid";
const z = createZero({ userID, auth: () => jwt, server, schema });

// New (Convex)
import { ConvexContext } from "./convex-solid";
import { ConvexClient } from "convex/browser";
const convex = new ConvexClient(import.meta.env.VITE_CONVEX_URL!);
<ConvexContext.Provider value={convex}>
```

### Query Patterns
```typescript
// Old (Zero)
const [races] = useQuery(() => props.z.query.race.where('status', 'ready'));

// New (Convex)  
import { createQuery } from "./convex-solid";
const races = createQuery(api.races.getRacesByStatus, { status: "ready", token });
```

### Mutations
```typescript
// Old (Zero)
z.mutate.race.insert({ id, status: "ready", authorID: z.userID });

// New (Convex)
import { createMutation } from "./convex-solid";
const createRace = createMutation(api.races.createRace);
await createRace({ quoteID, token });
```

## Files Created/Updated

### New Convex Files
- `convex/schema.ts` - Database schema
- `convex/auth.ts` - Authentication helpers
- `convex/players.ts` - Player queries/mutations
- `convex/races.ts` - Race operations
- `convex/quotes.ts` - Quote management
- `convex/analytics.ts` - Typed words analytics
- `convex/authentication.ts` - OAuth endpoints
- `convex/http.ts` - HTTP route configuration

### Updated Frontend Files
- `src/convex.ts` - Convex client setup
- `src/convex-solid.ts` - SolidJS-Convex integration hooks
- `src/types.ts` - Type definitions for Convex
- `src/main.tsx` - Updated app entry point (now uses Convex)
- `src/components/CreateRace-convex.tsx` - Example component
- `src/routes/race/Race-convex.tsx` - Example race component
- `src/domain/race-convex.ts` - Domain logic for Convex

## Development Workflow

### Commands
```bash
# Start development (both Convex and UI)
bun run dev

# Start Convex backend only
bun run dev:convex

# Start UI only
bun run dev:ui  

# Deploy Convex functions
bun run deploy:convex
```

### Environment Variables
```bash
# .env.local
VITE_CONVEX_URL=http://127.0.0.1:3210  # Local development
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
ZERO_AUTH_SECRET=your_jwt_secret  # Preserved for JWT compatibility
```

## Authentication Preservation

The JWT-based authentication flow is preserved:
1. Discord OAuth/guest login still sets JWT cookies
2. JWT validation logic moved to `convex/auth.ts`
3. User ID extraction from JWT remains the same
4. 30-day token expiration maintained

## Real-time Features

Convex provides built-in real-time subscriptions:
- Race progress updates propagate automatically
- Player join/leave events sync in real-time
- No need for manual WebSocket management
- Optimistic updates handled by Convex client

## Next Steps

1. Test Convex functions individually
2. Update remaining components to use Convex queries
3. Migrate domain logic completely
4. Add missing mutations (leaveRace, setNextRaceID, etc.)
5. Deploy to Convex cloud when ready
6. Remove old Zero/Hono files