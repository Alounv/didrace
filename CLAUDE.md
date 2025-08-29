# Warp Terminal Configuration

This file provides Warp terminal-specific configurations and workflows for the Didrace project.

## Quick Start Commands

### Setup & Development
```bash
# Install dependencies
bun install

# Start development servers
bun run dev

# View Convex dashboard
open http://127.0.0.1:6790
```

### Code Quality
```bash
# Lint and format
bun run lint:fix && bun run format

# Run tests
bun run test
```

### Build & Deploy
```bash
# Build frontend
bun run build

# Deploy Convex functions  
bun run build:convex
```

## Warp Workflows

### Development Workflow
1. **Start Development**
   ```bash
   bun run dev
   ```
   - Starts Convex backend (port 3210)
   - Starts Vite frontend (port 5173)
   - Opens Convex dashboard (port 6790)

2. **Code Quality Check**
   ```bash
   bun run lint && bun run test
   ```

3. **Pre-commit Hook**
   - Husky automatically runs linting/formatting on commit
   - Files are auto-formatted with Biome

### Debugging Commands
```bash
# Check Convex connection
curl http://127.0.0.1:3210

# View logs
bun run dev:convex --verbose

# TypeScript check
bun run build
```

## Environment Setup

### Required Variables (.env.local)
```bash
VITE_CONVEX_URL=http://127.0.0.1:3210
AUTH_SECRET=your_jwt_secret
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
CONVEX_DEPLOYMENT=dev:project-name-123
```

## Common Tasks

### Database Operations
- **View Schema**: Check `convex/schema.ts`
- **Dashboard**: http://127.0.0.1:6790
- **Reset Data**: Clear tables in Convex dashboard

### Testing
- **E2E Tests**: `bun run test`
- **Interactive**: `bun run test:ui`
- **Debug**: Add `--headed` flag to see browser

### Deployment
- **Frontend**: Any static host (Vercel, Netlify)
- **Backend**: `bun run build:convex` (automatic via Convex)

## Project Structure Quick Reference

```
├── src/
│   ├── routes/home/     # Home page & race creation
│   ├── routes/race/     # Race gameplay & components  
│   ├── routes/analytics/# Performance analytics
│   ├── components/      # Reusable UI components
│   ├── auth/           # JWT & Discord auth
│   └── domain/         # Business logic (Convex)
├── convex/
│   ├── schema.ts       # Database schema
│   ├── auth.ts         # JWT validation
│   ├── players.ts      # User management
│   ├── races.ts        # Race operations
│   ├── quotes.ts       # Quote management
│   └── analytics.ts    # Performance tracking
```

## Troubleshooting

### Common Issues
- **Port 3210 in use**: Kill Convex process and restart
- **JWT errors**: Check AUTH_SECRET in .env.local
- **Discord OAuth**: Verify redirect URI in Discord app settings
- **Build fails**: Run `bun run lint:fix` first

### Logs & Debugging
- **Convex logs**: Available in dashboard at http://127.0.0.1:6790
- **Frontend logs**: Browser dev tools console
- **Network requests**: Dev tools Network tab