import rolls1 from '../data/rolls_1.json';
import rolls2 from '../data/rolls_2.json';

const rollSets = {
  rolls_1: rolls1,
  rolls_2: rolls2,
};

type RollSetKey = 'rolls_1' | 'rolls_2';

export const getRollSetByKey = (key: RollSetKey) => {
  return [...rollSets[key]];
};

export const getRollSetForGameNumber = (gameNumber: number): RollSetKey => {
  return gameNumber % 2 === 1 ? 'rolls_1' : 'rolls_2';
};
