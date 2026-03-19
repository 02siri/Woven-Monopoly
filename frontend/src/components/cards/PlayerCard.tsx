import type { Player } from '../../types/player.types';

type PlayerCardProps = {
  player: Player;
  isCurrentTurn: boolean;
  isWinner: boolean;
  propertyCount: number;
};

const PlayerCard = ({ player, isCurrentTurn, isWinner, propertyCount }: PlayerCardProps) => {
  const statusLabel = player.isBankrupt
    ? 'Bankrupt'
    : isCurrentTurn
      ? 'Current Turn'
      : 'Active';
  const playerToneClass = `player-tone-${player.turnOrder}`;

  return (
    <article
      className={`card player-card ${playerToneClass} ${isCurrentTurn ? 'current-card' : ''}`}
    >
      <div className="card-header-row">
        <div className="player-card-heading">
          <span className="player-chip" aria-hidden="true" />
          <h3>{player.name}</h3>
        </div>
        <span className={`status-badge ${player.isBankrupt ? 'danger-badge' : 'success-badge'}`}>
          {statusLabel}
        </span>
      </div>

      <p className="card-subtext">Turn order {player.turnOrder}</p>

      <div className="metric-grid">
        <div>
          <span className="metric-label">Balance</span>
          <strong>${player.balance}</strong>
        </div>
        <div>
          <span className="metric-label">Board Space</span>
          <strong>{player.positionIndex}</strong>
        </div>
      </div>

      <div className="metric-grid">
        <div>
          <span className="metric-label">Properties</span>
          <strong>{propertyCount}</strong>
        </div>
        <div>
          <span className="metric-label">Status</span>
          <strong>{player.isBankrupt ? 'Out' : 'Playing'}</strong>
        </div>
      </div>

      <p className="card-subtext">
        Last action: {player.lastAction ?? 'No action recorded yet'}
      </p>

      {isWinner ? <p className="winner-tag">Winner</p> : null}
    </article>
  );
};

export default PlayerCard;
