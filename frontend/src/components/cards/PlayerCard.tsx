import type { Player } from '../../types/player.types';
import { PLAYER_AVATAR_URLS, PLAYER_TOKEN_IMAGES } from '../../constants/playerVisuals';

type PlayerCardProps = {
  player: Player;
  isCurrentTurn: boolean;
  isWinner: boolean;
  propertyCount: number;
};

const PlayerCard = ({ player, isCurrentTurn, isWinner, propertyCount }: PlayerCardProps) => {
  const avatarUrl = PLAYER_AVATAR_URLS[player.name] ?? PLAYER_AVATAR_URLS.Peter;
  const playerToken = PLAYER_TOKEN_IMAGES[player.name] ?? PLAYER_TOKEN_IMAGES.Peter;

  return (
    <article
      className={`card player-card ${isCurrentTurn ? 'current-card' : ''}`}
    >
      {isCurrentTurn ? <p className="turn-callout">Now playing</p> : null}

      <div className="card-header-row">
        <div className="player-card-heading">
          <div className="player-avatar-shell">
            <img className="player-avatar" src={avatarUrl} alt={`${player.name} avatar`} />
            <img
              className="player-chip"
              src={playerToken}
              alt={`${player.name} token`}
            />
          </div>
          <div className="player-heading-copy">
            <h3>{player.name}</h3>
            <p className="player-role-label">Player {player.turnOrder}</p>
          </div>
        </div>
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
      {player.isBankrupt ? <p className="winner-tag bankrupt-tag">Bankrupt</p> : null}
    </article>
  );
};

export default PlayerCard;
