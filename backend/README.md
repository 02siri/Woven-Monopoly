# Backend

## Purpose
The backend owns the rules engine and persisted game state for Woven Monopoly. It exposes HTTP endpoints for starting games, reading game state, resolving turns, confirming pending actions, simulating complete games, and managing lifecycle actions such as exit, resume, restart, and abandon.

The backend is intentionally responsible for rule enforcement. The frontend can request actions, but it does not decide the game outcome.

## Stack
- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- Vitest for automated tests

## Current Structure
```text
backend/
├── README.md
├── package.json
├── tsconfig.json
├── src/
│   ├── app.ts
│   ├── config/
│   ├── controllers/
│   ├── data/
│   ├── lib/
│   ├── loaders/
│   ├── models/
│   ├── routes/
│   └── services/games/
└── tests/
    └── turn-resolution.shared.test.ts
```

## Architectural Approach
The backend follows a layered modular style:

- `routes`: HTTP route definitions
- `controllers`: request parsing and response shaping
- `services`: application use cases and core game flow
- `models`: persistence layer definitions
- `loaders`: board and roll-set bootstrap logic

This structure keeps domain-heavy game rules out of controllers and concentrated in the service layer.

## Core Domain Decisions
### 1. Deterministic roll sets
The game uses two fixed roll sets loaded from JSON. The backend assigns them automatically based on the game number:

- odd game numbers -> `rolls_1`
- even game numbers -> `rolls_2`

This keeps game execution reproducible and easy to test.

### 2. Persisted game lifecycle
Each game is stored with metadata such as:

- `gameNumber`
- `rollSetUsed`
- `status`
- `currentTurn`
- `currentPlayerId`
- `winnerPlayerId`
- pending action state for multi-step turns

Supported statuses include:

- `IN_PROGRESS`
- `COMPLETED`
- `BANKRUPT_END`
- `EXITED`
- `ABANDONED`

### 3. Split collections for gameplay state
Instead of embedding everything inside one document, the backend stores:

- `boards`
- `games`
- `players`
- `properties`
- `turns`

This makes turn history, player state, and property ownership easier to query and reason about independently.

### 4. Pending action workflow
Some turns require confirmation after the roll is resolved. The backend persists:

- `pendingActionType`
- `pendingActionData`
- `pendingTurnData`

That allows the UI to display a modal and resume the same turn safely without re-running the roll logic.

## Main Backend Flows
### Create game
- choose the next game number
- derive the roll set
- load the seeded board
- create the game document
- create four default players
- create per-game property records

### Resolve turn
- validate that the game is still active
- load the next deterministic dice roll
- move the current player
- generate any pending actions such as `COLLECT_GO`, `BUY_PROPERTY`, or `PAY_RENT`
- either persist pending action state or finalize the turn immediately

### Confirm action
- apply the currently pending action
- continue through remaining queued actions if present
- finalize the turn once the queue is empty

### Simulate game
- run the full deterministic sequence until completion or bankruptcy
- persist turns and final state

### Lifecycle actions
- `exit`: mark in-progress games as exited
- `resume`: restore exited games to active play
- `restart`: reset balances, positions, ownership, and turn history
- `abandon`: close an unfinished game

## API Surface
Routes are mounted under `/v1`, with a separate health check under `/api/v1/health`.

Main endpoints:

- `GET /api/v1/health`
- `GET /v1/games`
- `GET /v1/games/:gameId`
- `GET /v1/games/:gameId/players`
- `GET /v1/games/:gameId/properties`
- `GET /v1/games/:gameId/turns`
- `POST /v1/games`
- `POST /v1/games/:gameId/turns/resolve`
- `POST /v1/games/:gameId/actions/confirm`
- `POST /v1/games/:gameId/simulate`
- `POST /v1/games/:gameId/exit`
- `POST /v1/games/:gameId/resume`
- `POST /v1/games/:gameId/restart`
- `POST /v1/games/:gameId/abandon`

## Environment Variables
The backend expects:

```text
MONGODB_URI=<mongodb connection string>
PORT=7777
```

`PORT` is optional in local development because the app already defaults to `7777`.

## Running Locally
Install dependencies:

```bash
cd backend
npm install
```

Start the development server:

```bash
MONGODB_URI=<your_mongodb_connection_string> npm run dev
```

Build production output:

```bash
npm run build
```

Start the built server:

```bash
npm start
```

## Testing
Run automated backend tests with:

```bash
cd backend
npm test
```

The current automated suite focuses on the most important rule engine behavior:

- monopoly detection and doubled rent
- pass-GO action generation
- property purchase flow
- turn progression to the next player
- bankruptcy ending the game and selecting a winner

## Notes
- The board is seeded from `src/data/board.json` on startup if it does not already exist in MongoDB.
- Roll sets are loaded from `src/data/rolls_1.json` and `src/data/rolls_2.json`.
- The backend is designed to keep gameplay state transitions explicit and debuggable rather than hiding them behind generic CRUD endpoints.
