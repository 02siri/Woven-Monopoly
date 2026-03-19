type DiceDisplayProps = {
  total: number | null;
};

const getDiceFaces = (total: number | null) => {
  if (total === null) {
    return [1, 1];
  }

  if (total <= 1) {
    return [1, 1];
  }

  return [1, Math.min(6, total - 1)];
};

const DiceDisplay = ({ total }: DiceDisplayProps) => {
  const [leftDie, rightDie] = getDiceFaces(total);

  return (
    <div className="dice-row">
      <div className="dice-face">{leftDie}</div>
      <div className="dice-face">{rightDie}</div>
    </div>
  );
};

export default DiceDisplay;
