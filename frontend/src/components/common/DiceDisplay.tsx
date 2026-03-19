type DiceDisplayProps = {
  total: number | null;
};

const getDieFace = (total: number | null) => {
  if (total === null) {
    return 1;
  }

  return Math.max(1, Math.min(6, total));
};

const DiceDisplay = ({ total }: DiceDisplayProps) => {
  const dieFace = getDieFace(total);

  return (
    <div className="dice-row">
      <div className="dice-face">{dieFace}</div>
    </div>
  );
};

export default DiceDisplay;
