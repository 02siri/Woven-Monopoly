# Frontend

## Purpose
The frontend presents Woven Monopoly as an interactive game room backed by the API. It allows the user to:

- create and revisit games
- inspect current player and game status
- view the board and player positions
- review property ownership
- resolve turns and confirm pending actions
- see turn history and game outcomes

The UI is designed to keep the deterministic backend state visible and understandable rather than hiding it behind heavy animation or complex navigation.

## Stack
- React
- TypeScript
- Vite
- plain CSS
- Vitest for automated tests

## Current Structure
```text
frontend/
├── README.md
├── package.json
├── vite.config.ts
└── src/
    ├── api/
    ├── components/
    ├── constants/
    ├── context/
    ├── pages/
    ├── reducers/
    ├── types/
    ├── App.tsx
    ├── main.tsx
    └── styles.css
```

## Architectural Approach
The frontend keeps a relatively small but shared application state and uses Context plus a reducer instead of a larger external state library.

### State management
The central game state includes:

- current game
- game history
- players
- properties
- turns
- loading state
- error state

This is managed through:

- `src/context/GameContext.tsx`
- `src/context/GameProvider.tsx`
- `src/reducers/game.reducer.ts`

This approach was chosen because the application has shared state across many components, but not enough complexity to justify Redux.

### Data access
API communication is centralized in:

- `src/api/client.ts`
- `src/api/games.api.ts`

That keeps request concerns separate from rendering logic and makes the API layer easy to test independently.

### UI composition
The interface is built from focused components:

- `pages/HomePage.tsx`: top-level orchestration
- `components/game/GameRoom.tsx`: main in-game layout
- `components/board/GameBoard.tsx`: board rendering and token placement
- `components/cards/*`: player, property, and turn summary display
- `components/common/*`: dice display, log panel, property modal, and pending action modal
- `components/layout/NavbarInfoStrip.tsx`: game metadata strip

## Main UX Decisions
### 1. Single-screen game room
The core play experience lives inside one main game room so the user can see:

- current controls
- player states
- board layout
- latest turn context
- history log

at the same time.

### 2. Backend-driven turn progression
The frontend does not compute game outcomes. Instead it:

- asks the backend to resolve a turn
- displays any pending action returned by the API
- asks the backend to confirm that action
- refreshes the visible state from the API response

This keeps the UI thin and aligned with the backend's rules engine.

### 3. Explicit game metadata
The navbar info strip surfaces game number, active player, player count, and status so the user always understands the current simulation context.

### 4. Historical visibility
Completed and interrupted games remain accessible from the UI, which makes deterministic replay and comparison easier.

## Configuration
The frontend reads its API base URL from:

```text
VITE_API_BASE_URL
```

If not provided, it falls back to:

```text
http://localhost:7777/v1
```

Example local startup:

```bash
VITE_API_BASE_URL=http://localhost:7777/v1 npm run dev
```

## Running Locally
Install dependencies:

```bash
cd frontend
npm install
```

Start the development server:

```bash
VITE_API_BASE_URL=http://localhost:7777/v1 npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the build:

```bash
npm run preview
```

## Testing
Run the frontend tests with:

```bash
cd frontend
npm test
```

The current automated tests focus on the shared request layer:

- successful API response parsing
- surfaced error handling for failed responses

This protects the most reused integration point in the frontend while keeping the test suite lightweight.

## Notes
- The frontend is deployed separately and consumes the backend through a configurable base URL.
- Styling is intentionally implemented with plain CSS to keep the project approachable and easy to review.
- The UI mirrors the backend's deterministic state transitions instead of duplicating game logic in the browser.
