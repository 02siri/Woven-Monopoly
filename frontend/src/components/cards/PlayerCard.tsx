import type { Player } from '../../types/player.types';

type PlayerCardProps = {
  player: Player;
  isCurrentTurn: boolean;
  isWinner: boolean;
  propertyCount: number;
};

const PLAYER_AVATAR_URLS: Record<string, string> = {
  Peter: 'https://api.dicebear.com/9.x/toon-head/svg?seed=Easton',
  Billy: 'https://api.dicebear.com/9.x/toon-head/svg?seed=Luis',
  Charlotte: 'https://api.dicebear.com/9.x/toon-head/svg?seed=Riley',
  Sweedal: 'https://api.dicebear.com/9.x/toon-head/svg?seed=Andrea',
};

const PlayerCard = ({ player, isCurrentTurn, isWinner, propertyCount }: PlayerCardProps) => {
  const statusLabel = player.isBankrupt
    ? 'Bankrupt'
    : isCurrentTurn
      ? 'Current Turn'
      : 'Active';
  const playerToneClass = `player-tone-${player.turnOrder}`;
  const statusToneClass = player.isBankrupt
    ? 'danger-badge'
    : isCurrentTurn
      ? 'current-turn-badge'
      : 'success-badge';
  const avatarUrl = PLAYER_AVATAR_URLS[player.name] ?? "https://api.dicebear.com/9.x/bottts/svg?seed=Eliza";

  return (
    <article
      className={`card player-card ${playerToneClass} ${isCurrentTurn ? 'current-card' : ''}`}
    >
      {isCurrentTurn ? <p className="turn-callout">Now playing</p> : null}

      <div className="card-header-row">
        <div className="player-card-heading">
          <div className="player-avatar-shell">
            <img className="player-avatar" src={avatarUrl} alt={`${player.name} avatar`} />
            <span className="player-chip" aria-hidden="true" />
          </div>
          <div className="player-heading-copy">
            <h3>{player.name}</h3>
            <p className="player-role-label">Player {player.turnOrder}</p>
          </div>
        </div>
        <span className={`status-badge ${statusToneClass}`}>
          {statusLabel}
        </span>
      </div>

      <p className="card-subtext player-subtext">
        {isCurrentTurn
          ? 'This player is on the clock.'
          : `Waiting at board space ${player.positionIndex}.`}
      </p>

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
