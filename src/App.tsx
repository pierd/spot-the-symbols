import { useTranslation } from 'react-i18next';
import { LanguageSelector } from 'lessismore-react';
import { supportedLanguages, languageFlags } from './i18n';
import { useGame } from './hooks/useGame';
import { GameScreen } from './components/GameScreen';
import './App.css';

function App() {
  const { t } = useTranslation();
  const game = useGame();

  return (
    <div className="app">
      <div className="background-grid" />
      <div className="background-glow" />

      <LanguageSelector languages={supportedLanguages} flags={languageFlags} />

      <header className="header">
        <h1 className="title">
          <span className="title-icon">🔍</span>
          {t('app.title')}
        </h1>
        {game.screen === 'menu' && <p className="subtitle">{t('app.subtitle')}</p>}
      </header>

      <main className="main">
        {game.screen === 'menu' ? (
          <div className="menu-screen">
            <button className="play-button" onClick={game.startGame}>
              <span className="play-icon">🎯</span>
              <span className="play-text">{t('menu.play')}</span>
              <span className="play-description">{t('menu.playDescription')}</span>
            </button>
          </div>
        ) : (
          game.puzzle && (
            <GameScreen
              puzzle={game.puzzle}
              task1Selection={game.task1Selection}
              task2Selection={game.task2Selection}
              task3Selection={game.task3Selection}
              verified={game.verified}
              results={game.results}
              score={game.score}
              onSelectTask1={game.selectTask1}
              onToggleTask2={game.toggleTask2}
              onSelectTask3={game.selectTask3}
              onVerify={game.verify}
              onPlayAgain={game.playAgain}
              onBackToMenu={game.backToMenu}
            />
          )
        )}
      </main>

      <footer className="footer">
        <span>{t('app.footer')}</span>
      </footer>
    </div>
  );
}

export default App;
