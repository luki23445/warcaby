import { Board, Piece, Player, Move, CaptureSequence, SimpleMove, GameState } from './types';
import { initializeBoard, getPieceAt, getLastRow } from './board';
import { getLegalActions, canContinueCapture, getAllCaptures, getAllSimpleMoves } from './moves';

export function createInitialState(boardSize: 8 | 10, startingPlayer: Player): GameState {
  return {
    board: initializeBoard(boardSize),
    currentPlayer: startingPlayer,
    boardSize,
    selectedPiece: null,
    captureInProgress: null,
    history: []
  };
}

export function applyMove(state: GameState, move: Move): GameState {
  const newState = { ...state };
  newState.history = [...state.history, JSON.parse(JSON.stringify(state))];

  if ('steps' in move) {
    // CaptureSequence
    newState.board = applyCaptureSequence(state.board, move);
    newState.captureInProgress = null;

    // Sprawdź promocję po zakończeniu sekwencji
    const finalPiece = getPieceAt(newState.board, move.steps[move.steps.length - 1].to.row, move.steps[move.steps.length - 1].to.col);
    if (finalPiece && finalPiece.type === 'pawn') {
      const lastRow = getLastRow(finalPiece.player, state.boardSize);
      if (finalPiece.row === lastRow) {
        newState.board[finalPiece.row][finalPiece.col] = {
          ...finalPiece,
          type: 'king'
        };
      }
    }
  } else {
    // SimpleMove
    newState.board = applySimpleMove(state.board, move);

    // Sprawdź promocję
    const movedPiece = getPieceAt(newState.board, move.to.row, move.to.col);
    if (movedPiece && movedPiece.type === 'pawn') {
      const lastRow = getLastRow(movedPiece.player, state.boardSize);
      if (movedPiece.row === lastRow) {
        newState.board[movedPiece.row][movedPiece.col] = {
          ...movedPiece,
          type: 'king'
        };
      }
    }
  }

  // Zmień gracza tylko jeśli nie ma kontynuacji bicia
  if ('steps' in move) {
    const finalPosition = move.steps[move.steps.length - 1].to;
    const finalPiece = getPieceAt(newState.board, finalPosition.row, finalPosition.col);
    if (finalPiece && canContinueCapture(newState.board, finalPiece, finalPosition)) {
      // Kontynuacja bicia - nie zmieniaj gracza
      newState.captureInProgress = {
        steps: move.steps,
        piece: finalPiece
      };
    } else {
      newState.currentPlayer = state.currentPlayer === 'white' ? 'black' : 'white';
    }
  } else {
    newState.currentPlayer = state.currentPlayer === 'white' ? 'black' : 'white';
  }

  newState.selectedPiece = null;
  return newState;
}

function applySimpleMove(board: Board, move: SimpleMove): Board {
  const newBoard = board.map(row => row.map(p => p ? { ...p } : null));
  const piece = getPieceAt(board, move.from.row, move.from.col);

  if (!piece) return board;

  newBoard[move.from.row][move.from.col] = null;
  newBoard[move.to.row][move.to.col] = {
    ...piece,
    row: move.to.row,
    col: move.to.col
  };

  return newBoard;
}

function applyCaptureSequence(board: Board, sequence: CaptureSequence): Board {
  let currentBoard = board.map(row => row.map(p => p ? { ...p } : null));
  let currentPiece = getPieceAt(board, sequence.steps[0].from.row, sequence.steps[0].from.col);

  if (!currentPiece) return board;

  for (const step of sequence.steps) {
    // Usuń z pozycji startowej
    currentBoard[step.from.row][step.from.col] = null;
    // Usuń zbity pionek
    currentBoard[step.captured.row][step.captured.col] = null;
    // Przenieś na nową pozycję
    currentBoard[step.to.row][step.to.col] = {
      ...currentPiece,
      row: step.to.row,
      col: step.to.col
    };

    currentPiece = {
      ...currentPiece,
      row: step.to.row,
      col: step.to.col
    };
  }

  return currentBoard;
}

export function checkGameOver(state: GameState): { isOver: boolean; winner: Player | null } {
  const currentActions = getLegalActions(state.board, state.currentPlayer);
  const opponent = state.currentPlayer === 'white' ? 'black' : 'white';
  const opponentActions = getLegalActions(state.board, opponent);

  // Sprawdź czy gracz ma bierki
  let hasPieces = false;
  for (let row = 0; row < state.board.length; row++) {
    for (let col = 0; col < state.board[0].length; col++) {
      const piece = getPieceAt(state.board, row, col);
      if (piece && piece.player === opponent) {
        hasPieces = true;
        break;
      }
    }
    if (hasPieces) break;
  }

  if (!hasPieces) {
    return { isOver: true, winner: state.currentPlayer };
  }

  // Sprawdź czy przeciwnik ma legalne ruchy
  if (opponentActions.length === 0) {
    return { isOver: true, winner: state.currentPlayer };
  }

  // Sprawdź czy obecny gracz ma legalne ruchy (jeśli nie ma kontynuacji bicia)
  if (!state.captureInProgress && currentActions.length === 0) {
    return { isOver: true, winner: opponent };
  }

  return { isOver: false, winner: null };
}

export function getAvailableMovesForPiece(state: GameState, piece: Piece): Move[] {
  // Jeśli trwa wielobicie, tylko ta sama bierka może kontynuować
  if (state.captureInProgress) {
    if (piece.row !== state.captureInProgress.piece.row || piece.col !== state.captureInProgress.piece.col) {
      return [];
    }
    // Kontynuacja bicia tą samą bierką
    const captures = getAllCaptures(state.board, state.currentPlayer);
    return captures.filter(c => 
      c.steps[0].from.row === piece.row && c.steps[0].from.col === piece.col
    );
  }

  const captures = getAllCaptures(state.board, state.currentPlayer);

  // Jeśli są obowiązkowe bicia, zwróć tylko bicia dla tej bierki
  if (captures.length > 0) {
    return captures.filter(c => 
      c.steps[0].from.row === piece.row && c.steps[0].from.col === piece.col
    );
  }

  // Zwykłe ruchy dla tej bierki
  const simpleMoves = getAllSimpleMoves(state.board, state.currentPlayer);
  return simpleMoves.filter(m => 
    m.from.row === piece.row && m.from.col === piece.col
  );
}

export function undoMove(state: GameState): GameState | null {
  if (state.history.length === 0) return null;

  const previousState = state.history[state.history.length - 1];
  return {
    ...previousState,
    history: previousState.history.slice(0, -1)
  };
}

