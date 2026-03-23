import { useEffect, useRef, useState } from 'react';

type DiceDisplayProps = {
  total: number | null;
  rolling: boolean;
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

const DiceDisplay = ({ total, rolling }: DiceDisplayProps) => {
  const settledFace = getDieFace(total);
  const [displayedFace, setDisplayedFace] = useState<number | null>(settledFace);
  const rollingFaceRef = useRef(1);

  useEffect(() => {
    if (!rolling) {
      setDisplayedFace(settledFace);
      return;
    }

    const intervalId = window.setInterval(() => {
      rollingFaceRef.current = rollingFaceRef.current % 6 + 1;
      setDisplayedFace(rollingFaceRef.current);
    }, 88);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [rolling, settledFace]);

  const dieFace = displayedFace;
  const pips = dieFace ? DICE_PIP_LAYOUTS[dieFace] : [];

  return (
    <div className="dice-row">
      <div className="dice-stage">
        <div
          className={`dice-face ${dieFace === null ? 'dice-face-empty' : ''} ${
            rolling ? 'dice-face-rolling' : ''
          }`}
        >
          {pips.map((pipPosition) => (
            <span
              key={pipPosition}
              className={`dice-pip dice-pip-${pipPosition}`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiceDisplay;
