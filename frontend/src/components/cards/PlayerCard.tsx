import type { Player } from '../../../types/player.types';

type PlayerCardProps = {
  player: Player;
  isCurrentTurn: boolean;
  isWinner: boolean;
};

const PlayerCard = ({ player, isCurrentTurn, isWinner }: PlayerCardProps) => {
  const statusLabel = player.isBankrupt
    ? 'Bankrupt'
    : isCurrentTurn
      ? 'Current Turn'
      : 'Active';

  return (
    <article className={`card player-card ${isCurrentTurn ? 'current-card' : ''}`}>
      <div className="card-header-row">
        <div>
          <h3>{player.name}</h3>
          <p className="card-subtext">Turn order: {player.turnOrder}</p>
        </div>
        <span className={`status-badge ${player.isBankrupt ? 'danger-badge' : 'success-badge'}`}>
          {statusLabel}
        </span>
      </div>

      <div className="metric-grid">
        <div>
          <span className="metric-label">Balance</span>
          <strong>${player.balance}</strong>
        </div>
        <div>
          <span className="metric-label">Position</span>
          <strong>{player.positionIndex}</strong>
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
