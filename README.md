# Didrace

A real-time typing race application built with SolidJS and Convex.

## Architecture

- **Frontend**: SolidJS + Vite + TailwindCSS + DaisyUI
- **Backend**: Convex (serverless backend with real-time sync)
- **Authentication**: Discord OAuth + JWT
- **Styling**: TailwindCSS with DaisyUI components

## Features

- 🏃‍♂️ Real-time multiplayer typing races
- 🔐 Discord OAuth authentication + Guest mode
- 📊 Typing analytics and performance tracking
- ⚡ Real-time synchronization between players
- 🎨 Modern UI with dark/light themes
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js 20.11.1+
- npm or bun package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd didrace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file with:
   ```bash
   # Convex Configuration
   VITE_CONVEX_URL=http://127.0.0.1:3210

   # Authentication
   AUTH_SECRET="secretkey"

   # Discord OAuth (optional)
   DISCORD_CLIENT_ID="your_discord_client_id"
   DISCORD_CLIENT_SECRET="your_discord_client_secret"
   ```

   Create a `.env.local` file for frontend Discord credentials:
   ```bash
   VITE_DISCORD_CLIENT_ID=your_discord_client_id
   VITE_DISCORD_CLIENT_SECRET=your_discord_client_secret
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```
   
   This starts both Convex backend (port 3210) and Vite frontend (port 5173).

5. **Initialize the database**
   
   Visit `http://localhost:5173` and log in as guest. If no quotes are found, click "Initialize Quotes Database" to populate sample quotes.

## Development Scripts

- `npm run dev` - Start both Convex and Vite dev servers
- `npm run dev:ui` - Start only the frontend dev server
- `npm run dev:convex` - Start only the Convex backend
- `npm run build` - Build the frontend for production
- `npm run build:convex` - Deploy Convex functions
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

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
