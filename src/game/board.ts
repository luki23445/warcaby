import { Board, Piece, Player } from './types';

export function createEmptyBoard(size: 8 | 10): Board {
  return Array(size).fill(null).map(() => Array(size).fill(null));
}

export function initializeBoard(size: 8 | 10): Board {
  const board = createEmptyBoard(size);
  const rowsPerPlayer = (size - 2) / 2;

  // Czarne pionki (góra planszy)
  for (let row = 0; row < rowsPerPlayer; row++) {
    for (let col = 0; col < size; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = {
          player: 'black',
          type: 'pawn',
          row,
          col
        };
      }
    }
  }

  // Białe pionki (dół planszy)
  for (let row = size - rowsPerPlayer; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = {
          player: 'white',
          type: 'pawn',
          row,
          col
        };
      }
    }
  }

  return board;
}

export function getPieceAt(board: Board, row: number, col: number): Piece | null {
  if (row < 0 || row >= board.length || col < 0 || col >= board[0].length) {
    return null;
  }
  return board[row][col];
}

export function isValidPosition(board: Board, row: number, col: number): boolean {
  return row >= 0 && row < board.length && col >= 0 && col < board[0].length;
}

export function isDarkSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 1;
}

export function getLastRow(player: Player, boardSize: number): number {
  return player === 'white' ? 0 : boardSize - 1;
}

