import { useState } from 'react';
import { GameSettings } from '../game/types';
import './SettingsModal.css';

interface SettingsModalProps {
  settings: GameSettings;
  onClose: () => void;
  onSave: (settings: GameSettings) => void;
}

export default function SettingsModal({ settings, onClose, onSave }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSave(localSettings);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Ustawienia</h2>

        <div className="setting-group">
          <label>Rozmiar planszy:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="8"
                checked={localSettings.boardSize === 8}
                onChange={() => setLocalSettings({ ...localSettings, boardSize: 8 })}
              />
              8x8
            </label>
            <label>
              <input
                type="radio"
                value="10"
                checked={localSettings.boardSize === 10}
                onChange={() => setLocalSettings({ ...localSettings, boardSize: 10 })}
              />
              10x10
            </label>
          </div>
        </div>

        <div className="setting-group">
          <label>Kto zaczyna:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="white"
                checked={localSettings.startingPlayer === 'white'}
                onChange={() => setLocalSettings({ ...localSettings, startingPlayer: 'white' })}
              />
              Białe
            </label>
            <label>
              <input
                type="radio"
                value="black"
                checked={localSettings.startingPlayer === 'black'}
                onChange={() => setLocalSettings({ ...localSettings, startingPlayer: 'black' })}
              />
              Czarne
            </label>
          </div>
        </div>

        <div className="setting-group">
          <label>Tryb gry:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="pvp"
                checked={localSettings.gameMode === 'pvp'}
                onChange={() => setLocalSettings({ ...localSettings, gameMode: 'pvp' })}
              />
              PvP (hot-seat)
            </label>
            <label>
              <input
                type="radio"
                value="bot"
                checked={localSettings.gameMode === 'bot'}
                onChange={() => setLocalSettings({ ...localSettings, gameMode: 'bot' })}
              />
              Bot
            </label>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Anuluj
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Zapisz
          </button>
        </div>
      </div>
    </div>
  );
}

