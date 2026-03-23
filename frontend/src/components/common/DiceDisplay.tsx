type DiceDisplayProps = {
  total: number | null;
};

const DICE_PIP_LAYOUTS: Record<number, string[]> = {
  1: ['center'],
  2: ['top-left', 'bottom-right'],
  3: ['top-left', 'center', 'bottom-right'],
  4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
  5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
  6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
};

const getDieFace = (total: number | null) => {
  if (total === null) {
    return null;
  }

  return Math.max(1, Math.min(6, total));
};

const DiceDisplay = ({ total }: DiceDisplayProps) => {
  const dieFace = getDieFace(total);
  const pips = dieFace ? DICE_PIP_LAYOUTS[dieFace] : [];

  return (
    <div className="dice-row">
      <div className={`dice-face ${dieFace === null ? 'dice-face-empty' : ''}`}>
        {pips.map((pipPosition) => (
          <span
            key={pipPosition}
            className={`dice-pip dice-pip-${pipPosition}`}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
};

export default DiceDisplay;
