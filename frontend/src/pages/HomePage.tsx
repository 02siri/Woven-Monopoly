import { useEffect, useMemo, useState } from 'react';
import {
  createGame,
  fetchGameById,
  fetchGames,
  fetchPlayersByGameId,
  fetchPropertiesByGameId,
  fetchTurnsByGameId,
  resolveTurn,
} from '../api/games.api';
import { useGameDispatch, useGameState } from '../context/GameContext';
import NavbarInfoStrip from '../components/layout/NavbarInfoStrip';
import PlayerCard from '../components/cards/PlayerCard';
import GameBoard from '../components/board/GameBoard';
import DiceDisplay from '../components/common/DiceDisplay';
import PropertyModal from '../components/common/PropertyModal';
import GameLogPanel from '../components/common/GameLogPanel';
import type { Property } from '../types/property.types';

const HomePage = () => {
  const { game, games, loading, error, players, properties, turns } = useGameState();
  const dispatch = useGameDispatch();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const currentPlayer =
    players.find((player) => player._id === game?.currentPlayerId) ?? null;
  const winner = players.find((player) => player._id === game?.winnerPlayerId) ?? null;
  const latestTurn = turns[turns.length - 1] ?? null;

  const playersByTurnOrder = useMemo(
    () => [...players].sort((playerA, playerB) => playerA.turnOrder - playerB.turnOrder),
    [players]
  );
  const playerPropertiesMap = useMemo(
    () =>
      players.reduce<Record<string, number>>((accumulator, player) => {
        accumulator[player._id] = properties.filter((property) => property.owner === player._id).length;
        return accumulator;
      }, {}),
    [players, properties]
  );
  const cornerPlayers = useMemo(
    () => ({
      topLeft: playersByTurnOrder[0] ?? null,
      topRight: playersByTurnOrder[1] ?? null,
      bottomLeft: playersByTurnOrder[2] ?? null,
      bottomRight: playersByTurnOrder[3] ?? null,
    }),
    [playersByTurnOrder]
  );

  const loadGameHistory = async () => {
    const history = await fetchGames();

    dispatch({
      action: 'SET_GAME_HISTORY',
      payload: history,
    });

    return history;
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
    const boot = async () => {
      dispatch({ action: 'SET_LOADING', payload: true });
      dispatch({ action: 'SET_ERROR', payload: null });

      try {
        const history = await loadGameHistory();

        if (history.length > 0) {
          await loadGameDetails(history[0]._id);
        }
      } catch (historyError) {
        dispatch({
          action: 'SET_ERROR',
          payload:
            historyError instanceof Error
              ? historyError.message
              : 'Failed to load game history',
        });
      } finally {
        dispatch({ action: 'SET_LOADING', payload: false });
      }
    };

    void boot();
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

  const handleResolveTurn = async () => {
    if (!game || game.status !== 'IN_PROGRESS') {
      return;
    }

    dispatch({ action: 'SET_LOADING', payload: true });
    dispatch({ action: 'SET_ERROR', payload: null });

    try {
      const data = await resolveTurn(game._id);

      dispatch({
        action: 'SET_TURN_RESULT',
        payload: {
          game: data.game,
          players: data.players,
          properties: data.properties,
          turn: data.turn,
        },
      });

      await loadGameHistory();
    } catch (turnError) {
      dispatch({
        action: 'SET_ERROR',
        payload:
          turnError instanceof Error ? turnError.message : 'Failed to play the next turn',
      });
    } finally {
      dispatch({ action: 'SET_LOADING', payload: false });
    }
  };

  const startTurnLabel = turns.length === 0 ? 'Start' : 'Play Turn';
  const canCreateGame = !game || game.status !== 'IN_PROGRESS';
  const showBoard = properties.length > 0;

  return (
    <main className="monopoly-page">
      <section className="hero-shell panel">
        <header className="page-header">
          <div>
            <p className="eyebrow">Woven Monopoly</p>
            <h1>Board-first game room</h1>
            <p className="hero-copy">
              Create a deterministic game, then resolve turns one by one with a richer
              board, color-coded players, and a live event log.
            </p>
          </div>
          <button
            className="primary-button start-game-button"
            onClick={handleCreateGame}
            disabled={loading || !canCreateGame}
          >
            {loading && !game ? 'Creating...' : 'Start Game'}
          </button>
        </header>

        <NavbarInfoStrip
          gameNumber={game?.gameNumber}
          rollSetUsed={game?.rollSetUsed}
          playerCount={players.length}
          activePlayerName={currentPlayer?.name}
          status={game?.status}
        />
      </section>

      <section className="experience-layout">
        <section className="board-stage panel">
          <div className="stage-heading">
            <div>
              <p className="eyebrow">Game Table</p>
              <h2>{showBoard ? 'Players are seated. Let the turns roll.' : 'Press Start Game to build the table.'}</h2>
            </div>
            <div className="stage-badge-row">
              <span className="neutral-badge">4 player table</span>
              <span className="neutral-badge">Deterministic rolls</span>
            </div>
          </div>

          <div className={`board-stage-grid ${showBoard ? 'board-stage-live' : ''}`}>
            {cornerPlayers.topLeft ? (
              <div className="corner-slot corner-top-left">
                <PlayerCard
                  player={cornerPlayers.topLeft}
                  isCurrentTurn={cornerPlayers.topLeft._id === game?.currentPlayerId}
                  isWinner={cornerPlayers.topLeft._id === game?.winnerPlayerId}
                  propertyCount={playerPropertiesMap[cornerPlayers.topLeft._id] ?? 0}
                />
              </div>
            ) : null}

            {cornerPlayers.topRight ? (
              <div className="corner-slot corner-top-right">
                <PlayerCard
                  player={cornerPlayers.topRight}
                  isCurrentTurn={cornerPlayers.topRight._id === game?.currentPlayerId}
                  isWinner={cornerPlayers.topRight._id === game?.winnerPlayerId}
                  propertyCount={playerPropertiesMap[cornerPlayers.topRight._id] ?? 0}
                />
              </div>
            ) : null}

            {cornerPlayers.bottomLeft ? (
              <div className="corner-slot corner-bottom-left">
                <PlayerCard
                  player={cornerPlayers.bottomLeft}
                  isCurrentTurn={cornerPlayers.bottomLeft._id === game?.currentPlayerId}
                  isWinner={cornerPlayers.bottomLeft._id === game?.winnerPlayerId}
                  propertyCount={playerPropertiesMap[cornerPlayers.bottomLeft._id] ?? 0}
                />
              </div>
            ) : null}

            {cornerPlayers.bottomRight ? (
              <div className="corner-slot corner-bottom-right">
                <PlayerCard
                  player={cornerPlayers.bottomRight}
                  isCurrentTurn={cornerPlayers.bottomRight._id === game?.currentPlayerId}
                  isWinner={cornerPlayers.bottomRight._id === game?.winnerPlayerId}
                  propertyCount={playerPropertiesMap[cornerPlayers.bottomRight._id] ?? 0}
                />
              </div>
            ) : null}

            <div className="board-slot">
              {showBoard ? (
                <GameBoard
                  players={players}
                  properties={properties}
                  activePlayerId={game?.currentPlayerId}
                  onSelectProperty={setSelectedProperty}
                />
              ) : (
                <section className="board-placeholder panel">
                  <h2>Start a game to place the board on screen.</h2>
                  <p className="muted-text">
                    Once the game is created, the property board, player cards, and turn
                    controls will populate automatically.
                  </p>
                </section>
              )}
            </div>
          </div>
        </section>

        <aside className="sidebar-stack">
          <section className="control-card turn-card-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Turn Controls</p>
                <h2>{currentPlayer?.name ?? 'Waiting for players'}</h2>
              </div>
              {game?.status ? (
                <span className="status-badge neutral-badge">
                  {game.status.replace(/_/g, ' ')}
                </span>
              ) : null}
            </div>

            <DiceDisplay total={latestTurn?.diceRoll ?? null} />

            <p className="dice-note">
              Two dice are shown for board feel. The game still resolves against the single
              deterministic roll set already in code.
            </p>

            <button
              className="primary-button play-turn-button"
              onClick={handleResolveTurn}
              disabled={loading || !game || game.status !== 'IN_PROGRESS'}
            >
              {loading && game ? 'Working...' : startTurnLabel}
            </button>

            <div className="turn-stats">
              <div>
                <span className="metric-label">Roll Total</span>
                <strong>{latestTurn?.diceRoll ?? '-'}</strong>
              </div>
              <div>
                <span className="metric-label">Resolved Turns</span>
                <strong>{turns.length}</strong>
              </div>
            </div>

            {winner ? <p className="winner-banner">Winner: {winner.name}</p> : null}
            {error ? <p className="error-text compact-error">{error}</p> : null}
          </section>

          <GameLogPanel turns={turns} players={players} />
        </aside>
      </section>

      <section className="history-footer panel">
        <div className="panel-header">
          <h2>Saved Games</h2>
          <button
            className="text-button"
            onClick={() => {
              void loadGameHistory();
            }}
          >
            Refresh
          </button>
        </div>

        {games.length > 0 ? (
          <ul className="history-list">
            {games.map((historyGame) => (
              <li
                key={historyGame._id}
                className="history-item clickable-item"
                onClick={() => {
                  void loadGameDetails(historyGame._id);
                }}
              >
                <span>Game {historyGame.gameNumber}</span>
                <span>{historyGame.rollSetUsed}</span>
                <span>{historyGame.status.replace(/_/g, ' ')}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted-text">No saved games yet.</p>
        )}
      </section>

      {selectedProperty ? (
        <PropertyModal
          property={selectedProperty}
          ownerName={players.find((player) => player._id === selectedProperty.owner)?.name}
          players={players}
          properties={properties}
          onClose={() => setSelectedProperty(null)}
        />
      ) : null}
    </main>
  );
};

export default HomePage;
