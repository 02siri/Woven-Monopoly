type NavbarInfoStripProps = {
  gameNumber?: number;
  rollSetUsed?: string;
  playerCount: number;
  activePlayerName?: string;
  status?: string;
};

const NavbarInfoStrip = ({
  gameNumber,
  rollSetUsed,
  playerCount,
  activePlayerName,
  status,
}: NavbarInfoStripProps) => {
  return (
    <section className="info-strip">
      <div className="info-pill">
        <span className="info-label">Game</span>
        <strong>{gameNumber ? `#${gameNumber}` : '-'}</strong>
      </div>
      <div className="info-pill">
        <span className="info-label">Roll Set</span>
        <strong>{rollSetUsed ?? '-'}</strong>
      </div>
      <div className="info-pill">
        <span className="info-label">Players</span>
        <strong>{playerCount}</strong>
      </div>
      <div className="info-pill">
        <span className="info-label">Active Player</span>
        <strong>{activePlayerName ?? '-'}</strong>
      </div>
      <div className="info-pill">
        <span className="info-label">Status</span>
        <strong>{status ? status.replace(/_/g, ' ') : '-'}</strong>
      </div>
    </section>
  );
};

export default NavbarInfoStrip;
