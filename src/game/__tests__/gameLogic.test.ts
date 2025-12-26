import { describe, it, expect } from 'vitest';
import { createInitialState, checkGameOver } from '../gameLogic';
import { createEmptyBoard } from '../board';

describe('Zasady gry', () => {
  it('powinno inicjalizować planszę poprawnie', () => {
    const state = createInitialState(8, 'white');
    expect(state.board.length).toBe(8);
    expect(state.currentPlayer).toBe('white');
  });

  it('powinno wykrywać koniec gry gdy gracz nie ma bierek', () => {
    const state = createInitialState(8, 'white');
    // Usuń wszystkie czarne bierki
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = state.board[row][col];
        if (piece && piece.player === 'black') {
          state.board[row][col] = null;
        }
      }
    }

    const gameOver = checkGameOver(state);
    expect(gameOver.isOver).toBe(true);
    expect(gameOver.winner).toBe('white');
  });

  it('powinno wykrywać koniec gry gdy gracz nie ma legalnych ruchów', () => {
    const board = createEmptyBoard(8);
    // Tylko jedna biała bierka w rogu bez możliwości ruchu
    board[0][0] = { player: 'white', type: 'pawn', row: 0, col: 0 };
    board[7][7] = { player: 'black', type: 'pawn', row: 7, col: 7 };

    const state = {
      board,
      currentPlayer: 'white' as const,
      boardSize: 8 as const,
      selectedPiece: null,
      captureInProgress: null,
      history: []
    };

    const gameOver = checkGameOver(state);
    expect(gameOver.isOver).toBe(true);
  });
});

