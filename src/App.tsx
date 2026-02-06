import { useTranslation } from 'react-i18next';
import { LanguageSelector } from 'lessismore-react';
import { supportedLanguages, languageFlags } from './i18n';
import './App.css';

function App() {
  const { t } = useTranslation();

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
        <p className="subtitle">{t('app.subtitle')}</p>
      </header>

      <main className="main">
        <div className="menu-screen">
          <button className="play-button" onClick={() => {}}>
            <span className="play-icon">🎯</span>
            <span className="play-text">{t('menu.play')}</span>
            <span className="play-description">{t('menu.playDescription')}</span>
          </button>

          <div className="mode-buttons">
            <button className="mode-btn" onClick={() => {}}>
              <span className="mode-emoji">⏱️</span>
              <span className="mode-name">{t('menu.timeAttack')}</span>
              <span className="mode-description">{t('menu.timeAttackDescription')}</span>
            </button>

            <button className="mode-btn" onClick={() => {}}>
              <span className="mode-emoji">🧘</span>
              <span className="mode-name">{t('menu.zen')}</span>
              <span className="mode-description">{t('menu.zenDescription')}</span>
            </button>

            <button className="mode-btn" onClick={() => {}}>
              <span className="mode-emoji">📅</span>
              <span className="mode-name">{t('menu.daily')}</span>
              <span className="mode-description">{t('menu.dailyDescription')}</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="footer">
        <span>{t('app.footer')}</span>
      </footer>
    </div>
  );
}

export default App;
