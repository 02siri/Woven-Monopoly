import {
  createGame,
  fetchGames,
  simulateGame,
} from '../api/games.api';
import { useGameDispatch, useGameState } from '../context/GameContext';

const HomePage = () => {
  const { game, games, loading, error, players, turns } = useGameState();
  const dispatch = useGameDispatch();

  const loadGameHistory = async () => {
    try {
      const history = await fetchGames();

      dispatch({
        action: 'SET_GAME_HISTORY',
        payload: history,
      });
    } catch (historyError) {
      dispatch({
        action: 'SET_ERROR',
        payload:
          historyError instanceof Error
            ? historyError.message
            : 'Failed to load game history',
      });
    }
  };

  const handleCreateGame = async () => {
    dispatch({ action: 'SET_LOADING', payload: true });
    dispatch({ action: 'SET_ERROR', payload: null });

    try {
      const data = await createGame();

      dispatch({
        action: 'SET_GAME_SETUP',
        payload: data,
      });

      await loadGameHistory();
    } catch (createError) {
      dispatch({
        action: 'SET_ERROR',
        payload:
          createError instanceof Error
            ? createError.message
            : 'Failed to create a game',
      });
    } finally {
      dispatch({ action: 'SET_LOADING', payload: false });
    }
  };

  const handleSimulateGame = async () => {
    if (!game) {
      return;
    }

    dispatch({ action: 'SET_LOADING', payload: true });
    dispatch({ action: 'SET_ERROR', payload: null });

    try {
      const data = await simulateGame(game._id);

      dispatch({
        action: 'SET_SIMULATION_RESULT',
        payload: data,
      });

      await loadGameHistory();
    } catch (simulationError) {
      dispatch({
        action: 'SET_ERROR',
        payload:
          simulationError instanceof Error
            ? simulationError.message
            : 'Failed to simulate the game',
      });
    } finally {
      dispatch({ action: 'SET_LOADING', payload: false });
    }
  };

  return (
    <main className="app-shell app-grid">
      <section className="panel hero-panel">
        <p className="eyebrow">Woven Monopoly</p>

        <div className="action-row">
          <button className="primary-button" onClick={handleCreateGame} disabled={loading}>
            {loading ? 'Working...' : 'Create Game'}
          </button>
          <button
            className="secondary-button"
            onClick={handleSimulateGame}
            disabled={loading || !game}
          >
            Simulate Current Game
          </button>
        </div>

        {error ? <p className="error-text">{error}</p> : null}
      </section>

      <section className="panel status-panel">
        <h2>Current Game</h2>
        {game ? (
          <div className="stack">
            <p><strong>Game No:</strong> {game.gameNumber}</p>
            <p><strong>Roll Set:</strong> {game.rollSetUsed}</p>
            <p><strong>Status:</strong> {game.status}</p>
            <p><strong>Players Loaded:</strong> {players.length}</p>
            <p><strong>Turns Logged:</strong> {turns.length}</p>
          </div>
        ) : (
          <p className="muted-text">Create a game to begin.</p>
        )}
      </section>

      <section className="panel history-panel">
        <div className="panel-header">
          <h2>Game History</h2>
          <button className="text-button" onClick={loadGameHistory}>
            Refresh
          </button>
        </div>

        {games.length > 0 ? (
          <ul className="history-list">
            {games.map((historyGame) => (
              <li key={historyGame._id} className="history-item">
                <span>Game {historyGame.gameNumber}</span>
                <span>{historyGame.rollSetUsed}</span>
                <span>{historyGame.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted-text">No saved games yet.</p>
        )}
      </section>
    </main>
  );
};

export default HomePage;
