# TypeScript App Engine

A modern TypeScript application with a framework-agnostic core engine and Next.js 15+ frontend, optimized for Vercel deployment.

## Architecture

- **Core Engine**: Framework-agnostic TypeScript module (`core-engine/`)
- **Frontend**: Next.js 15+ with App Router (`app/`)
- **Hosting**: Vercel with auto builds and CDN

## Features

### Core Engine
- TypeScript-based, framework-agnostic
- Event system for communication
- State management
- Configuration management
- Data storage utilities
- Type-safe interfaces

### Next.js App
- Next.js 15+ with App Router
- TypeScript throughout
- Tailwind CSS for styling
- API routes integration
- Client-side engine integration

### Vercel Integration
- Optimized build configuration
- Automatic deployments
- CDN distribution
- Environment variable support

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended package manager)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Build the core engine:
```bash
pnpm --filter core-engine build
```

3. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3001`.

### Development

- **Core Engine**: Located in `core-engine/` directory
- **Frontend App**: Located in `app/` directory
- **Monorepo**: Uses pnpm workspaces for dependency management

### Building for Production

```bash
pnpm build
```

This will build both the core engine and the Next.js application.

### Deployment to Vercel

1. Connect your repository to Vercel
2. The `vercel.json` configuration will handle the build process
3. Vercel will automatically build and deploy on every push to main

## Project Structure

```
├── core-engine/           # Framework-agnostic TypeScript module
│   ├── src/
│   │   └── index.ts       # Main engine implementation
│   ├── package.json
│   └── tsconfig.json
├── app/                   # Next.js 15+ application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   └── api/           # API routes
│   ├── package.json
│   └── next.config.js
├── package.json           # Root package.json with workspaces
├── vercel.json           # Vercel deployment configuration
└── README.md
```

## API Usage

### Core Engine

```typescript
import { CoreEngine, EngineConfig } from '@app/core-engine'

const config: EngineConfig = {
  name: 'My App',
  version: '1.0.0',
  debug: true
}

const engine = new CoreEngine(config)
await engine.initialize()

// Set data
engine.setData('key', 'value')

// Listen to events
engine.on('dataUpdated', (data) => {
  console.log('Data updated:', data)
})

// Get state
const state = engine.getState()
```

### API Routes

The app includes API routes at `/api/engine` for server-side engine operations:

- `GET /api/engine` - Get engine state
- `POST /api/engine` - Update engine data or configuration

## Technologies Used

- **TypeScript** - Type safety and modern JavaScript features
- **Next.js 15+** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **pnpm** - Fast, disk space efficient package manager
- **Vercel** - Cloud platform for deployment
- **ESLint** - Code linting and formatting

## License

MIT
