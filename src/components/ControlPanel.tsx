import { Player, CaptureSequence } from '../game/types';
import './ControlPanel.css';

interface ControlPanelProps {
  currentPlayer: Player;
  gameOver: { isOver: boolean; winner: Player | null };
  captureInProgress: CaptureSequence | null;
  onNewGame: () => void;
  onUndo: () => void;
  onSettings: () => void;
  canUndo: boolean;
}

export default function ControlPanel({
  currentPlayer,
  gameOver,
  captureInProgress,
  onNewGame,
  onUndo,
  onSettings,
  canUndo
}: ControlPanelProps) {
  return (
    <div className="control-panel">
      <div className="status">
        {gameOver.isOver ? (
          <div className="game-over">
            <h2>Koniec gry!</h2>
            <p>Zwycięzca: {gameOver.winner === 'white' ? 'Białe' : 'Czarne'}</p>
          </div>
        ) : (
          <>
            <div className="current-turn">
              <span className="turn-label">Tura:</span>
              <span className={`player-badge ${currentPlayer}`}>
                {currentPlayer === 'white' ? 'Białe' : 'Czarne'}
              </span>
            </div>
            {captureInProgress && (
              <div className="capture-message">
                ⚠️ Kontynuuj bicie tą samą bierką
              </div>
            )}
          </>
        )}
      </div>

      <div className="controls">
        <button className="btn btn-primary" onClick={onNewGame}>
          Nowa gra
        </button>
        <button className="btn btn-secondary" onClick={onUndo} disabled={!canUndo}>
          Cofnij
        </button>
        <button className="btn btn-secondary" onClick={onSettings}>
          Ustawienia
        </button>
      </div>
    </div>
  );
}

