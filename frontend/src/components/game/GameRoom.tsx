import { useEffect, useState } from 'react';
import NavbarInfoStrip from '../layout/NavbarInfoStrip';
import PlayerCard from '../cards/PlayerCard';
import GameBoard from '../board/GameBoard';
import DiceDisplay from '../common/DiceDisplay';
import PropertyModal from '../common/PropertyModal';
import GameLogPanel from '../common/GameLogPanel';
import type { Game } from '../../types/game.types';
import type { Player } from '../../types/player.types';
import type { Property } from '../../types/property.types';
import type { Turn } from '../../types/turn.types';

type GameRoomProps = {
  game: Game | null;
  games: Game[];
  loading: boolean;
  error: string | null;
  players: Player[];
  properties: Property[];
  turns: Turn[];
  selectedProperty: Property | null;
  currentPlayer: Player | null;
  winner: Player | null;
  latestTurn: Turn | null;
  cornerPlayers: {
    topLeft: Player | null;
    topRight: Player | null;
    bottomLeft: Player | null;
    bottomRight: Player | null;
  };
  playerPropertiesMap: Record<string, number>;
  startTurnLabel: string;
  canCreateGame: boolean;
  showBoard: boolean;
  onCreateGame: () => void;
  onResolveTurn: () => void;
  onExitGame: () => void;
  onRefreshGameHistory: () => void;
  onLoadGameDetails: (gameId: string) => void;
  onSelectProperty: (property: Property | null) => void;
};

const GameRoom = ({
  game,
  games,
  loading,
  error,
  players,
  properties,
  turns,
  selectedProperty,
  currentPlayer,
  winner,
  latestTurn,
  cornerPlayers,
  playerPropertiesMap,
  startTurnLabel,
  canCreateGame,
  showBoard,
  onCreateGame,
  onResolveTurn,
  onExitGame,
  onRefreshGameHistory,
  onLoadGameDetails,
  onSelectProperty,
}: GameRoomProps) => {
  const isGameOver = Boolean(game && game.status !== 'IN_PROGRESS');
  const [showGameOverModal, setShowGameOverModal] = useState(false);

  useEffect(() => {
    if (isGameOver) {
      setShowGameOverModal(true);
      return;
    }

    setShowGameOverModal(false);
  }, [isGameOver]);

  return (
    <main className="monopoly-page">
      <section className="hero-shell panel">
        <header className="page-header">
          <div>
            <h1>Woven Monopoly</h1>
            
          </div>
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
              <h2>
                {showBoard
                  ? 'Players are seated. Let the turns roll.'
                  : 'Press Start Game to build the table.'}
              </h2>
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
                  onSelectProperty={onSelectProperty}
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
              The roll display reflects the same deterministic turn logic already used by
              the game engine.
            </p>

            {!isGameOver ? (
              <>
                <button
                  className="primary-button play-turn-button"
                  onClick={onResolveTurn}
                  disabled={loading || !game || game.status !== 'IN_PROGRESS'}
                >
                  {loading && game ? 'Working...' : startTurnLabel}
                </button>
                <button
                  className="secondary-button exit-game-button"
                  onClick={onExitGame}
                  disabled={loading || !game}
                  type="button"
                >
                  Exit Game
                </button>
              </>
            ) : null}

            {winner ? <p className="winner-banner">Winner: {winner.name}</p> : null}
            {error ? <p className="error-text compact-error">{error}</p> : null}
          </section>

          <GameLogPanel turns={turns} players={players} />
        </aside>
      </section>

      {selectedProperty ? (
        <PropertyModal
          property={selectedProperty}
          ownerName={players.find((player) => player._id === selectedProperty.owner)?.name}
          players={players}
          properties={properties}
          onClose={() => onSelectProperty(null)}
        />
      ) : null}

      {showGameOverModal ? (
        <div className="game-over-backdrop" role="presentation">
          <section className="game-over-modal" role="dialog" aria-modal="true">
            <h2>Game Over!</h2>
            <p>
              {winner ? `${winner.name} wins this round.` : 'This game has finished.'}
            </p>
            <button
              className="primary-button"
              onClick={() => {
                setShowGameOverModal(false);
                onExitGame();
              }}
              type="button"
            >
              Exit Game
            </button>
          </section>
        </div>
      ) : null}
    </main>
  );
};

export default GameRoom;
