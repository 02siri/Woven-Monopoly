import {
  createGame,
  fetchGameById,
  fetchGames,
  fetchPlayersByGameId,
  fetchPropertiesByGameId,
  fetchTurnsByGameId,
  simulateGame,
} from '../api/games.api';
import { useGameDispatch, useGameState } from '../context/GameContext';
import NavbarInfoStrip from '../components/layout/NavBarInfoStrip';
import PlayerCard from '../components/cards/PlayerCard';
import PropertyCard from '../components/cards/PropertyCard';
import TurnCard from '../components/cards/TurnCard';
import { useEffect } from 'react';

const HomePage = () => {
  const { game, games, loading, error, players, properties, turns } = useGameState();
  const dispatch = useGameDispatch();

  const currentPlayer =
    players.find((player) => player._id === game?.currentPlayerId) ?? null;
  const winner = players.find((player) => player._id === game?.winnerPlayerId) ?? null;

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

  const loadGameDetails = async (gameId: string) => {
    dispatch({ action: 'SET_LOADING', payload: true });
    dispatch({ action: 'SET_ERROR', payload: null });

    try {
      const [selectedGame, selectedPlayers, selectedProperties, selectedTurns] =
        await Promise.all([
          fetchGameById(gameId),
          fetchPlayersByGameId(gameId),
          fetchPropertiesByGameId(gameId),
          fetchTurnsByGameId(gameId),
        ]);

      dispatch({
        action: 'SET_GAME_DETAILS',
        payload: {
          game: selectedGame,
          players: selectedPlayers,
          properties: selectedProperties,
          turns: selectedTurns,
        },
      });
    } catch (detailsError) {
      dispatch({
        action: 'SET_ERROR',
        payload:
          detailsError instanceof Error
            ? detailsError.message
            : 'Failed to load game details',
      });
    } finally {
      dispatch({ action: 'SET_LOADING', payload: false });
    }
  };

  useEffect(() => {
    void loadGameHistory();
  }, []);

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
      <NavbarInfoStrip
        gameNumber={game?.gameNumber}
        rollSetUsed={game?.rollSetUsed}
        playerCount={players.length}
        activePlayerName={currentPlayer?.name}
        status={game?.status}
      />

      <section className="panel hero-panel">
        <p className="eyebrow">Woven Monopoly</p>
        <h1>Start a game, simulate it, and inspect the full flow.</h1>
        <p className="hero-copy">
          This version now shows the game metadata, player state, property ownership,
          and turn-by-turn history so you can inspect the whole game instead of
          only the final result.
        </p>

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
            <p><strong>Properties Loaded:</strong> {properties.length}</p>
            <p><strong>Turns Logged:</strong> {turns.length}</p>
            <p><strong>Winner:</strong> {winner?.name ?? 'Not decided yet'}</p>
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
              <li
                key={historyGame._id}
                className="history-item clickable-item"
                onClick={() => void loadGameDetails(historyGame._id)}
              >
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

      <section className="panel wide-panel">
        <div className="panel-header">
          <h2>Players</h2>
          <span className="muted-text">{players.length} loaded</span>
        </div>

        {players.length > 0 ? (
          <div className="cards-grid">
            {players.map((player) => (
              <PlayerCard
                key={player._id}
                player={player}
                isCurrentTurn={player._id === game?.currentPlayerId}
                isWinner={player._id === game?.winnerPlayerId}
              />
            ))}
          </div>
        ) : (
          <p className="muted-text">Players will appear here once a game is created.</p>
        )}
      </section>

      <section className="panel wide-panel">
        <div className="panel-header">
          <h2>Properties</h2>
          <span className="muted-text">{properties.length} loaded</span>
        </div>

        {properties.length > 0 ? (
          <div className="cards-grid">
            {properties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                ownerName={players.find((player) => player._id === property.owner)?.name}
                players={players}
                properties={properties}
              />
            ))}
          </div>
        ) : (
          <p className="muted-text">Property ownership will appear here.</p>
        )}
      </section>

      <section className="panel wide-panel">
        <div className="panel-header">
          <h2>Turn History</h2>
          <span className="muted-text">{turns.length} turns logged</span>
        </div>

        {turns.length > 0 ? (
          <div className="turns-list">
            {turns.map((turn) => (
              <TurnCard
                key={turn._id ?? `${turn.turnNumber}-${turn.playerId}`}
                turn={turn}
                players={players}
                properties={properties}
              />
            ))}
          </div>
        ) : (
          <p className="muted-text">
            Simulate the game to see the full turn-by-turn timeline.
          </p>
        )}
      </section>
    </main>
  );
};

export default HomePage;
