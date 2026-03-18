import GameProvider from './context/GameProvider';
import HomePage from './pages/HomePage';

const App = () => {
  return (
    <GameProvider>
      <HomePage />
    </GameProvider>
  );
};

export default App;
