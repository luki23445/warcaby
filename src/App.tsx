import { useReducer, useEffect } from 'react';
import { GameState, GameSettings, Move, Piece } from './game/types';
import { createInitialState, applyMove, checkGameOver, undoMove, getAvailableMovesForPiece } from './game/gameLogic';
import { getLegalActions } from './game/moves';
import Board from './components/Board';
import ControlPanel from './components/ControlPanel';
import SettingsModal from './components/SettingsModal';
import './App.css';

type GameAction =
  | { type: 'SELECT_PIECE'; piece: Piece | null }
  | { type: 'MAKE_MOVE'; move: Move }
  | { type: 'UNDO' }
  | { type: 'NEW_GAME'; settings: GameSettings }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'LOAD_STATE'; state: GameState };

function gameReducer(state: GameState & { settings: GameSettings; showSettings: boolean }, action: GameAction): typeof state {
  switch (action.type) {
    case 'SELECT_PIECE':
      return { ...state, selectedPiece: action.piece };
    
    case 'MAKE_MOVE':
      const newState = applyMove(state, action.move);
      return { ...state, ...newState };
    
    case 'UNDO':
      const undone = undoMove(state);
      if (undone) {
        return { ...state, ...undone };
      }
      return state;
    
    case 'NEW_GAME':
      return {
        ...createInitialState(action.settings.boardSize, action.settings.startingPlayer),
        settings: action.settings,
        showSettings: false
      };
    
    case 'TOGGLE_SETTINGS':
      return { ...state, showSettings: !state.showSettings };
    
    case 'LOAD_STATE':
      return { ...state, ...action.state };
    
    default:
      return state;
  }
}

const defaultSettings: GameSettings = {
  boardSize: 8,
  startingPlayer: 'white',
  gameMode: 'pvp'
};

function App() {
  const [state, dispatch] = useReducer(gameReducer, {
    ...createInitialState(defaultSettings.boardSize, defaultSettings.startingPlayer),
    settings: defaultSettings,
    showSettings: false
  });

  // Wczytaj stan z localStorage przy starcie
  useEffect(() => {
    const saved = localStorage.getItem('warcaby-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', state: parsed });
      } catch (e) {
        console.error('Failed to load state:', e);
      }
    }
  }, []);

  // Zapisz stan do localStorage przy zmianie
  useEffect(() => {
    const stateToSave = {
      board: state.board,
      currentPlayer: state.currentPlayer,
      boardSize: state.boardSize,
      selectedPiece: null,
      captureInProgress: null,
      history: []
    };
    localStorage.setItem('warcaby-state', JSON.stringify(stateToSave));
  }, [state.board, state.currentPlayer, state.boardSize]);

  const handlePieceClick = (piece: Piece) => {
    if (piece.player !== state.currentPlayer) return;
    if (state.captureInProgress) {
      // Tylko bierka w trakcie bicia może być wybrana
      if (piece.row !== state.captureInProgress.piece.row || piece.col !== state.captureInProgress.piece.col) {
        return;
      }
    }
    dispatch({ type: 'SELECT_PIECE', piece: state.selectedPiece === piece ? null : piece });
  };

  const handleSquareClick = (row: number, col: number) => {
    if (!state.selectedPiece) return;

    const availableMoves = getAvailableMovesForPiece(state, state.selectedPiece);
    
    for (const move of availableMoves) {
      if ('steps' in move) {
        // CaptureSequence
        const finalStep = move.steps[move.steps.length - 1];
        if (finalStep.to.row === row && finalStep.to.col === col) {
          dispatch({ type: 'MAKE_MOVE', move });
          return;
        }
      } else {
        // SimpleMove
        if (move.to.row === row && move.to.col === col) {
          dispatch({ type: 'MAKE_MOVE', move });
          return;
        }
      }
    }
  };

  const gameOver = checkGameOver(state);
  const legalActions = getLegalActions(state.board, state.currentPlayer);

  // Bot move
  useEffect(() => {
    if (state.settings.gameMode === 'bot' && state.currentPlayer === 'black' && !gameOver.isOver) {
      if (legalActions.length > 0) {
        const randomMove = legalActions[Math.floor(Math.random() * legalActions.length)];
        setTimeout(() => {
          dispatch({ type: 'MAKE_MOVE', move: randomMove });
        }, 500);
      }
    }
  }, [state.currentPlayer, state.settings.gameMode, gameOver.isOver, legalActions]);

  return (
    <div className="app">
      <ControlPanel
        currentPlayer={state.currentPlayer}
        gameOver={gameOver}
        captureInProgress={state.captureInProgress}
        onNewGame={() => dispatch({ type: 'NEW_GAME', settings: state.settings })}
        onUndo={() => dispatch({ type: 'UNDO' })}
        onSettings={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
        canUndo={state.history.length > 0}
      />
      
      <Board
        board={state.board}
        boardSize={state.boardSize}
        selectedPiece={state.selectedPiece}
        onPieceClick={handlePieceClick}
        onSquareClick={handleSquareClick}
        getAvailableMoves={(piece) => getAvailableMovesForPiece(state, piece)}
      />

      {state.showSettings && (
        <SettingsModal
          settings={state.settings}
          onClose={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
          onSave={(newSettings) => {
            dispatch({ type: 'NEW_GAME', settings: newSettings });
          }}
        />
      )}
    </div>
  );
}

export default App;

