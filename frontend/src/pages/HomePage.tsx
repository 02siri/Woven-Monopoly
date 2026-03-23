import { useEffect, useMemo, useState } from 'react';
import {
  abandonGame,
  confirmAction,
  createGame,
  exitGame,
  fetchGameById,
  fetchGames,
  fetchPlayersByGameId,
  fetchPropertiesByGameId,
  fetchTurnsByGameId,
  resolveTurn,
  restartGame,
  resumeGame,
} from '../api/games.api';
import { useGameDispatch, useGameState } from '../context/GameContext';
import GameRoom from '../components/game/GameRoom';
import type { Property } from '../types/property.types';

const HomePage = () => {
  const { game, games, loading, error, players, properties, turns } = useGameState();
  const dispatch = useGameDispatch();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showGameRoom, setShowGameRoom] = useState(false);
  const [historySummaries, setHistorySummaries] = useState<
    Record<
      string,
      {
        winnerName: string;
        winnerBalance: number;
        loserName: string;
        loserBalance: number;
      }
    >
  >({});

  const currentPlayer =
    players.find((player) => player._id === game?.currentPlayerId) ?? null;
  const winner = players.find((player) => player._id === game?.winnerPlayerId) ?? null;
  const latestTurn = turns[turns.length - 1] ?? null;
  const pendingAction = game?.pendingActionData ?? null;

  const playersByTurnOrder = useMemo(
    () => [...players].sort((playerA, playerB) => playerA.turnOrder - playerB.turnOrder),
    [players]
  );
  const historyGames = useMemo(
    () => games.filter((historyGame) => historyGame.status !== 'IN_PROGRESS'),
    [games]
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
      bottomLeft: playersByTurnOrder[3] ?? null,
      bottomRight: playersByTurnOrder[2] ?? null,
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
        await loadGameHistory();
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

  useEffect(() => {
    const loadHistorySummaries = async () => {
      if (historyGames.length === 0) {
        setHistorySummaries({});
        return;
      }

      try {
        const summaries = await Promise.all(
          historyGames.map(async (historyGame) => {
            const historyPlayers = await fetchPlayersByGameId(historyGame._id);
            const sortedByBalance = [...historyPlayers].sort(
              (playerA, playerB) => playerB.balance - playerA.balance
            );
            const winner =
              sortedByBalance.find(
                (player) => player._id === historyGame.winnerPlayerId
              ) ?? sortedByBalance[0];
            const loser = sortedByBalance[sortedByBalance.length - 1];

            return [
              historyGame._id,
              {
                winnerName: winner?.name ?? 'Unknown',
                winnerBalance: winner?.balance ?? 0,
                loserName: loser?.name ?? 'Unknown',
                loserBalance: loser?.balance ?? 0,
              },
            ] as const;
          })
        );

        setHistorySummaries(Object.fromEntries(summaries));
      } catch {
        setHistorySummaries({});
      }
    };

    void loadHistorySummaries();
  }, [historyGames]);

  const handleCreateGame = async () => {
    dispatch({ action: 'SET_LOADING', payload: true });
    dispatch({ action: 'SET_ERROR', payload: null });

    try {
      const data = await createGame();

      dispatch({
        action: 'SET_GAME_SETUP',
        payload: data,
      });
      setShowGameRoom(true);

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

  const handleConfirmPendingAction = async () => {
    if (!game) {
      return;
    }

    dispatch({ action: 'SET_LOADING', payload: true });
    dispatch({ action: 'SET_ERROR', payload: null });

    try {
      const data = await confirmAction(game._id);

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
    } catch (actionError) {
      dispatch({
        action: 'SET_ERROR',
        payload:
          actionError instanceof Error
            ? actionError.message
            : 'Failed to confirm the pending action',
      });
    } finally {
      dispatch({ action: 'SET_LOADING', payload: false });
    }
  };

  const handleExitGame = async () => {
    if (!game) {
      return;
    }

    dispatch({ action: 'SET_LOADING', payload: true });
    dispatch({ action: 'SET_ERROR', payload: null });

    try {
      if (game.status === 'IN_PROGRESS') {
        await exitGame(game._id);
      }

      dispatch({ action: 'RESET_CURRENT_GAME' });
      setSelectedProperty(null);
      setShowGameRoom(false);
      await loadGameHistory();
    } catch (exitError) {
      dispatch({
        action: 'SET_ERROR',
        payload:
          exitError instanceof Error ? exitError.message : 'Failed to exit the game',
      });
    } finally {
      dispatch({ action: 'SET_LOADING', payload: false });
    }
  };

  const handleAbandonGame = async () => {
    if (!game) {
      return;
    }

    dispatch({ action: 'SET_LOADING', payload: true });
    dispatch({ action: 'SET_ERROR', payload: null });

    try {
      await abandonGame(game._id);

      dispatch({ action: 'RESET_CURRENT_GAME' });
      setSelectedProperty(null);
      setShowGameRoom(false);
      await loadGameHistory();
    } catch (abandonError) {
      dispatch({
        action: 'SET_ERROR',
        payload:
          abandonError instanceof Error
            ? abandonError.message
            : 'Failed to abandon the game',
      });
    } finally {
      dispatch({ action: 'SET_LOADING', payload: false });
    }
  };

  const handleResumeGame = async (gameId: string) => {
    dispatch({ action: 'SET_LOADING', payload: true });
    dispatch({ action: 'SET_ERROR', payload: null });

    try {
      const data = await resumeGame(gameId);

      dispatch({
        action: 'SET_GAME_DETAILS',
        payload: data,
      });
      setSelectedProperty(null);
      setShowGameRoom(true);
      await loadGameHistory();
    } catch (resumeError) {
      dispatch({
        action: 'SET_ERROR',
        payload:
          resumeError instanceof Error ? resumeError.message : 'Failed to resume the game',
      });
    } finally {
      dispatch({ action: 'SET_LOADING', payload: false });
    }
  };

  const handleRestartGame = async () => {
    if (!game) {
      return;
    }

    dispatch({ action: 'SET_LOADING', payload: true });
    dispatch({ action: 'SET_ERROR', payload: null });

    try {
      const data = await restartGame(game._id);

      dispatch({
        action: 'SET_GAME_DETAILS',
        payload: data,
      });
      setSelectedProperty(null);
      setShowGameRoom(true);
      await loadGameHistory();
    } catch (restartError) {
      dispatch({
        action: 'SET_ERROR',
        payload:
          restartError instanceof Error
            ? restartError.message
            : 'Failed to restart the game',
      });
    } finally {
      dispatch({ action: 'SET_LOADING', payload: false });
    }
  };

  const getHistoryStatusLabel = (status: string) => {
    switch (status) {
      case 'BANKRUPT_END':
      case 'COMPLETED':
        return 'Completed';
      case 'ABANDONED':
        return 'Abandoned';
      case 'EXITED':
        return 'Exited';
      default:
        return status.replace(/_/g, ' ');
    }
  };

  const startTurnLabel = turns.length === 0 ? 'Start' : 'Play Turn';
  const canCreateGame = !game || game.status !== 'IN_PROGRESS';
  const showBoard = properties.length > 0;
  const pageContent = !showGameRoom ? (
    <main className="monopoly-page landing-page">
      <section className="landing-hero">
        <p className="eyebrow">Woven Monopoly</p>
        <h1>Woven Monopoly</h1>
        <p className="landing-copy">
          Build your position. Make your moves. Outlast them all.
        </p>
        <button
          className="primary-button landing-start-button"
          onClick={handleCreateGame}
          disabled={loading || !canCreateGame}
        >
          {loading ? 'Creating...' : 'Start Game'}
        </button>
        {error ? <p className="error-text landing-error">{error}</p> : null}
      </section>

      <section className="landing-panel previous-games-panel panel">
        <div className="panel-header">
          <h2>Previous Games</h2>
          <button
            className="text-button"
            onClick={() => {
              void loadGameHistory();
            }}
          >
            Refresh
          </button>
        </div>

        {historyGames.length > 0 ? (
          <section className="history-table landing-history-list" aria-label="Previous games">
            <div className="history-table-header">
              <span>Game</span>
              <span>Winner</span>
              <span>Loser</span>
              <span>Status</span>
            </div>

            <ul className="history-list history-table-rows">
              {historyGames.map((historyGame) => (
                <li
                  key={historyGame._id}
                  className="history-item history-item-static"
                >
                  <span>Game {historyGame.gameNumber}</span>
                  <span>
                    {historySummaries[historyGame._id]?.winnerName ?? '-'} ($
                    {historySummaries[historyGame._id]?.winnerBalance ?? '-'})
                  </span>
                  <span>
                    {historySummaries[historyGame._id]?.loserName ?? '-'} ($
                    {historySummaries[historyGame._id]?.loserBalance ?? '-'})
                  </span>
                  <span className="history-status-cell">
                    {historyGame.status === 'EXITED' ? (
                      <button
                        className="secondary-button history-action-button"
                        onClick={() => {
                          void handleResumeGame(historyGame._id);
                        }}
                        disabled={loading}
                        type="button"
                      >
                        Resume Game
                      </button>
                    ) : (
                      getHistoryStatusLabel(historyGame.status)
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <div className="landing-empty-state">
            <p>No games played yet</p>
            <span>Start your first game to see history here.</span>
          </div>
        )}
      </section>

      <section className="landing-panel rules-panel panel">
        <h2>How to Play</h2>
        <ul className="rules-list">
          <li>Each new game starts with four players and a fixed deterministic roll set.</li>
          <li>Press `Start Game` to create a game, then resolve turns one by one.</li>
          <li>Players move using the next value from the game&apos;s predefined roll sequence.</li>
          <li>Landing on an unowned property buys it automatically if the player can afford it.</li>
          <li>Landing on another player&apos;s property pays rent based on ownership and monopoly state.</li>
          <li>The game ends when a player becomes bankrupt.</li>
        </ul>
      </section>
    </main>
  ) : (
    <GameRoom
      game={game}
      games={games}
      loading={loading}
      error={error}
      players={players}
      properties={properties}
      turns={turns}
      selectedProperty={selectedProperty}
      currentPlayer={currentPlayer}
      winner={winner}
      latestTurn={latestTurn}
      pendingAction={pendingAction}
      cornerPlayers={cornerPlayers}
      playerPropertiesMap={playerPropertiesMap}
      startTurnLabel={startTurnLabel}
      canCreateGame={canCreateGame}
      showBoard={showBoard}
      onCreateGame={() => {
        void handleCreateGame();
      }}
      onResolveTurn={() => {
        void handleResolveTurn();
      }}
      onConfirmPendingAction={() => {
        void handleConfirmPendingAction();
      }}
      onExitGame={() => {
        void handleExitGame();
      }}
      onAbandonGame={() => {
        void handleAbandonGame();
      }}
      onRestartGame={() => {
        void handleRestartGame();
      }}
      onRefreshGameHistory={() => {
        void loadGameHistory();
      }}
      onLoadGameDetails={(gameId) => {
        void loadGameDetails(gameId);
      }}
      onSelectProperty={setSelectedProperty}
    />
  );

  return (
    <>
      {pageContent}
      <footer className="site-footer">
        <p>&copy; 2026 Srishti Khosla. All rights reserved.</p>
      </footer>
    </>
  );
};

export default HomePage;
