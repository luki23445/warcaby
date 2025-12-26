export type Player = 'white' | 'black';

export type PieceType = 'pawn' | 'king';

export interface Piece {
  player: Player;
  type: PieceType;
  row: number;
  col: number;
  pendingPromotion?: boolean;
}

export type Board = (Piece | null)[][];

export interface Position {
  row: number;
  col: number;
}

export interface CaptureStep {
  from: Position;
  captured: Position;
  to: Position;
}

export interface CaptureSequence {
  steps: CaptureStep[];
  piece: Piece;
}

export interface SimpleMove {
  from: Position;
  to: Position;
  piece: Piece;
}

export type Move = SimpleMove | CaptureSequence;

export interface GameState {
  board: Board;
  currentPlayer: Player;
  boardSize: 8 | 10;
  selectedPiece: Piece | null;
  captureInProgress: CaptureSequence | null;
  history: GameState[];
}

export interface GameSettings {
  boardSize: 8 | 10;
  startingPlayer: Player;
  gameMode: 'pvp' | 'bot';
}

