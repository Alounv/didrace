# Didrace

A real-time typing race application built with SolidJS and Convex.

## Architecture

- **Frontend**: SolidJS + Vite + TailwindCSS v4 + DaisyUI
- **Backend**: Convex (serverless backend with real-time sync)
- **Authentication**: Discord OAuth + JWT + Guest login
- **Database**: Convex real-time database
- **Code Quality**: Biome (linting + formatting) + Husky pre-commit hooks
- **Testing**: Playwright for E2E testing

## Features

- 🏃‍♂️ Real-time multiplayer typing races
- 🔐 Discord OAuth authentication + Guest mode
- 📊 Typing analytics and performance tracking
- ⚡ Real-time synchronization between players
- 🎨 Modern UI with dark/light themes
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js 22.19.0 (see `package.json` engines)
- Bun package manager (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd didrace
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file:
   ```bash
   # Convex Configuration
   VITE_CONVEX_URL=http://127.0.0.1:3210
   CONVEX_DEPLOYMENT=                      # Set automatically by npx convex dev

   # Authentication
   AUTH_SECRET=your_jwt_secret_key

   # Discord OAuth (optional)
   DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_CLIENT_SECRET=your_discord_client_secret
   ```

4. **Start the development servers**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

   This starts both Convex backend (port 3210) and Vite frontend (port 5173).
   Convex dashboard will be available at http://127.0.0.1:6790

5. **Initialize the database**

   Visit `http://localhost:5173` and log in as guest. If no quotes are found, click "Initialize Quotes Database" to populate sample quotes.

## Development Scripts

### Development
- `bun run dev` - Start both Convex and Vite dev servers
- `bun run dev:ui` - Start only the frontend dev server  
- `bun run dev:convex` - Start only the Convex backend

### Code Quality
- `bun run lint` - Run Biome linting
- `bun run lint:fix` - Run Biome linting with auto-fix
- `bun run format` - Format code with Biome

### Testing
- `bun run test` - Run Playwright tests
- `bun run test:ui` - Run Playwright tests with UI

### Build & Deploy
- `bun run build` - Build the frontend for production
- `bun run build:convex` - Deploy Convex functions

## Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or use existing one
3. In OAuth2 settings, add redirect URI: `http://localhost:5173/api/discord`
4. Copy Client ID and Client Secret to your `.env` and `.env.local` files

## Project Structure

```
src/
├── components/         # Reusable UI components
├── routes/            # Page components and routing
├── auth/              # Authentication utilities
├── data/              # Static data (quotes)
├── domain/            # Business logic (Convex-based)
├── utils/             # Utility functions
└── convex-solid.ts    # SolidJS-Convex integration

convex/
├── schema.ts          # Database schema
├── auth.ts            # Authentication helpers
├── players.ts         # Player management
├── races.ts           # Race management
├── quotes.ts          # Quotes management
└── analytics.ts       # Analytics queries
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request
