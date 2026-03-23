# Woven Monopoly

Live app: [https://woven-monopoly.vercel.app/](https://woven-monopoly.vercel.app/)

Walkthrough video: [https://drive.google.com/file/d/1a8QNfBL85wHdQPEaSRQpvCrZtH9UE6Pn/view?usp=sharing](https://drive.google.com/file/d/1a8QNfBL85wHdQPEaSRQpvCrZtH9UE6Pn/view?usp=sharing)

## Overview
Woven Monopoly is a full-stack Monopoly simulation built around a deterministic rules engine. The backend loads a fixed board and fixed roll sets, creates persisted game sessions, resolves turns, enforces purchases and rent, and stores turn history. The frontend presents that state as a playable and reviewable game room with board visuals, player status cards, property ownership, pending action modals, and historical game summaries.

The project is intentionally built as a modular monolith:

- `frontend`: React + TypeScript + Vite
- `backend`: Node.js + Express + TypeScript
- `database`: MongoDB via Mongoose
- `deployment`: Vercel for the frontend and backend

Detailed module documentation:

- Backend README: (Woven-Monopoly/backend/README.md)
- Frontend README: (Woven-Monopoly/frontend/README.md)

## Gameplay Summary
The game is driven by known dice rolls, so every move is reproducible. That allows the application to:

- keep game results deterministic
- preserve full turn history
- replay and inspect game state safely
- test core game rules reliably

Each new game is assigned a roll set automatically by the backend:

- odd-numbered games use `rolls_1`
- even-numbered games use `rolls_2`

## Architecture
The application uses a layered modular structure with a strong separation between transport, orchestration, persistence, and UI.

### Backend
The backend is the source of truth for all game rules and lifecycle state.

- `src/routes`: Express route definitions
- `src/controllers`: HTTP request/response handling
- `src/services/games`: game creation, read flows, turn resolution, pending action confirmation, lifecycle actions, and simulation
- `src/models`: Mongoose models for boards, games, players, properties, and turns
- `src/loaders`: bootstrap logic for seeded board data and deterministic roll sets

Important design choices:

- Game rules live on the server so the client cannot bypass invariants.
- Board data is seeded once into MongoDB and reused by all games.
- Players, properties, and turns are stored separately for clearer querying and replay.
- Pending actions are persisted on the game document so multi-step turns remain recoverable.

### Frontend
The frontend focuses on rendering the current game state clearly and driving the user through each turn.

- `src/api`: typed API wrappers around the backend
- `src/context` and `src/reducers`: global state via Context + reducer
- `src/pages/HomePage.tsx`: orchestration for game history, game loading, and user actions
- `src/components/game/GameRoom.tsx`: main experience shell
- `src/components/board`: board rendering
- `src/components/cards`: player, property, and turn summary UI
- `src/components/common`: dice display, modals, and game log

Important design choices:

- `useContext` + reducer was chosen over Redux to keep shared state predictable without extra boilerplate.
- The backend selects the roll set so the UI stays focused on gameplay.
- Pending turn actions are surfaced with explicit confirmation modals to mirror the backend state machine.
- History remains visible so completed and interrupted games can be revisited.

## Key Design Decisions
This implementation reflects a few deliberate architectural decisions:

- `Modular monolith over microservices`: the domain is focused, and a single deployable unit keeps the code easier to reason about.
- `Backend-owned rules`: purchase, rent, pass-GO, monopoly rent, and bankruptcy are enforced server-side.
- `Deterministic inputs`: fixed roll sets make debugging, walkthroughs, and testing substantially easier.
- `Separate collections for game state`: `games`, `players`, `properties`, and `turns` are modeled independently so reads stay simple and turn history remains explicit.
- `React component composition`: the interface is assembled from reusable UI units rather than one large page component.

## Project Structure
```text
.
├── README.md
├── backend/
│   ├── README.md
│   ├── package.json
│   ├── src/
│   └── tests/
├── frontend/
│   ├── README.md
│   ├── package.json
│   └── src/
└── woven-monopoly-walkthrough-script.md
```

## Running Locally
### Backend
```bash
cd backend
npm install
MONGODB_URI=<your_mongodb_connection_string> npm run dev
```

The backend defaults to port `7777`. Local API base URL:

```text
http://localhost:7777/v1
```

Health check:

```text
http://localhost:7777/api/v1/health
```

### Frontend
```bash
cd frontend
npm install
VITE_API_BASE_URL=http://localhost:7777/v1 npm run dev
```

The frontend runs on Vite's default development port unless overridden.

## Testing
The project includes both automated code tests and API testing via Postman.

### Automated Tests
Backend:

```bash
cd backend
npm test
```

Frontend:

```bash
cd frontend
npm test
```

Current automated coverage focuses on the highest-value flows:

- backend rule tests for turn resolution, pass GO, monopoly rent, property purchase, and bankruptcy
- frontend request-layer tests for successful API parsing and surfaced API errors

### Postman API Testing
Postman was used for end-to-end API verification against the deployed backend.

Deployed API base URL:

```text
https://woven-monopoly-be.vercel.app/api/v1
```

Recommended approach for the exported Postman files:

- keep request URLs parameterized with `{{baseUrl}}`
- define `baseUrl` in the Postman environment
- import the collection and environment, then run via Postman Collection Runner or Newman

Typical routes covered in Postman:

- `GET /health`
- `POST /games`
- `GET /games`
- `GET /games/:gameId`
- `GET /games/:gameId/players`
- `GET /games/:gameId/properties`
- `GET /games/:gameId/turns`
- `POST /games/:gameId/turns/resolve`
- `POST /games/:gameId/actions/confirm`
- `POST /games/:gameId/simulate`
- `POST /games/:gameId/exit`
- `POST /games/:gameId/resume`
- `POST /games/:gameId/restart`
- `POST /games/:gameId/abandon`

## Deployment
- Frontend: [https://woven-monopoly.vercel.app/](https://woven-monopoly.vercel.app/)
- Backend API: [https://woven-monopoly-be.vercel.app/api/v1](https://woven-monopoly-be.vercel.app/api/v1)

## Notes
- The backend seeds the board into MongoDB on startup if it does not already exist.
- Game history is persisted, so interrupted and completed sessions remain visible.
- The app is designed for clarity of rules and state transitions rather than maximum feature breadth.
