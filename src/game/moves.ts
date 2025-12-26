import { Board, Piece, Player, Position, SimpleMove, CaptureStep, CaptureSequence, Move } from './types';
import { getPieceAt, isValidPosition } from './board';

const DIAGONAL_DIRECTIONS = [
  { row: -1, col: -1 },
  { row: -1, col: 1 },
  { row: 1, col: -1 },
  { row: 1, col: 1 }
];

export function generateSimpleMoves(board: Board, piece: Piece): SimpleMove[] {
  const moves: SimpleMove[] = [];

  if (piece.type === 'pawn') {
    const forwardDir = piece.player === 'white' ? -1 : 1;
    const directions = [
      { row: forwardDir, col: -1 },
      { row: forwardDir, col: 1 }
    ];

    for (const dir of directions) {
      const newRow = piece.row + dir.row;
      const newCol = piece.col + dir.col;

      if (isValidPosition(board, newRow, newCol) && getPieceAt(board, newRow, newCol) === null) {
        moves.push({
          from: { row: piece.row, col: piece.col },
          to: { row: newRow, col: newCol },
          piece
        });
      }
    }
  } else {
    // Damka - może iść na dowolną liczbę pól po skosie
    for (const dir of DIAGONAL_DIRECTIONS) {
      for (let distance = 1; distance < board.length; distance++) {
        const newRow = piece.row + dir.row * distance;
        const newCol = piece.col + dir.col * distance;

        if (!isValidPosition(board, newRow, newCol)) break;
        if (getPieceAt(board, newRow, newCol) !== null) break;

        moves.push({
          from: { row: piece.row, col: piece.col },
          to: { row: newRow, col: newCol },
          piece
        });
      }
    }
  }

  return moves;
}

export function generateCapturesForPiece(board: Board, piece: Piece): CaptureSequence[] {
  const sequences: CaptureSequence[] = [];

  function findCaptureSequences(
    currentBoard: Board,
    currentPiece: Piece,
    currentSequence: CaptureStep[],
    visited: Set<string>
  ) {
    const key = `${currentPiece.row},${currentPiece.col}`;
    if (visited.has(key)) return;
    visited.add(key);

    const captures = findSingleCaptures(currentBoard, currentPiece);

    if (captures.length === 0) {
      if (currentSequence.length > 0) {
        sequences.push({
          steps: [...currentSequence],
          piece: { ...piece, row: currentPiece.row, col: currentPiece.col }
        });
      }
      return;
    }

    for (const capture of captures) {
      const newBoard = applyCaptureStep(currentBoard, capture, currentPiece);
      const newPiece = {
        ...currentPiece,
        row: capture.to.row,
        col: capture.to.col
      };

      findCaptureSequences(
        newBoard,
        newPiece,
        [...currentSequence, capture],
        new Set(visited)
      );
    }
  }

  findCaptureSequences(board, piece, [], new Set());
  return sequences;
}

function findSingleCaptures(board: Board, piece: Piece): CaptureStep[] {
  const captures: CaptureStep[] = [];

  if (piece.type === 'pawn') {
    // Pionek może bić do przodu i do tyłu
    for (const dir of DIAGONAL_DIRECTIONS) {
      const enemyRow = piece.row + dir.row;
      const enemyCol = piece.col + dir.col;
      const landingRow = piece.row + dir.row * 2;
      const landingCol = piece.col + dir.col * 2;

      if (!isValidPosition(board, enemyRow, enemyCol) || !isValidPosition(board, landingRow, landingCol)) {
        continue;
      }

      const enemy = getPieceAt(board, enemyRow, enemyCol);
      const landing = getPieceAt(board, landingRow, landingCol);

      if (enemy && enemy.player !== piece.player && landing === null) {
        captures.push({
          from: { row: piece.row, col: piece.col },
          captured: { row: enemyRow, col: enemyCol },
          to: { row: landingRow, col: landingCol }
        });
      }
    }
  } else {
    // Damka "latająca" - może lądować na dowolnym pustym polu za zbitą bierką
    for (const dir of DIAGONAL_DIRECTIONS) {
      for (let distance = 1; distance < board.length; distance++) {
        const checkRow = piece.row + dir.row * distance;
        const checkCol = piece.col + dir.col * distance;

        if (!isValidPosition(board, checkRow, checkCol)) break;

        const checkPiece = getPieceAt(board, checkRow, checkCol);

        if (checkPiece === null) continue;
        if (checkPiece.player === piece.player) break;

        // Znaleziono przeciwnika - szukaj pustych pól za nim
        for (let landingDist = distance + 1; landingDist < board.length; landingDist++) {
          const landingRow = piece.row + dir.row * landingDist;
          const landingCol = piece.col + dir.col * landingDist;

          if (!isValidPosition(board, landingRow, landingCol)) break;

          const landing = getPieceAt(board, landingRow, landingCol);
          if (landing !== null) break;

          captures.push({
            from: { row: piece.row, col: piece.col },
            captured: { row: checkRow, col: checkCol },
            to: { row: landingRow, col: landingCol }
          });
        }

        break; // Po znalezieniu przeciwnika na tej przekątnej, przejdź do następnej
      }
    }
  }

  return captures;
}

function applyCaptureStep(board: Board, step: CaptureStep, piece: Piece): Board {
  const newBoard = board.map(row => row.map(p => p ? { ...p } : null));

  // Usuń bierkę z pozycji startowej
  newBoard[step.from.row][step.from.col] = null;
  // Usuń zbity pionek
  newBoard[step.captured.row][step.captured.col] = null;
  // Przenieś bierkę na nową pozycję
  newBoard[step.to.row][step.to.col] = {
    ...piece,
    row: step.to.row,
    col: step.to.col
  };

  return newBoard;
}

export function getAllCaptures(board: Board, player: Player): CaptureSequence[] {
  const allCaptures: CaptureSequence[] = [];

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const piece = getPieceAt(board, row, col);
      if (piece && piece.player === player) {
        const captures = generateCapturesForPiece(board, piece);
        allCaptures.push(...captures);
      }
    }
  }

  return allCaptures;
}

export function getAllSimpleMoves(board: Board, player: Player): SimpleMove[] {
  const allMoves: SimpleMove[] = [];

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const piece = getPieceAt(board, row, col);
      if (piece && piece.player === player) {
        const moves = generateSimpleMoves(board, piece);
        allMoves.push(...moves);
      }
    }
  }

  return allMoves;
}

export function getLegalActions(board: Board, player: Player): Move[] {
  const captures = getAllCaptures(board, player);

  // Jeśli są bicia, zwróć tylko bicia (obowiązkowe)
  if (captures.length > 0) {
    return captures;
  }

  // W przeciwnym razie zwróć zwykłe ruchy
  return getAllSimpleMoves(board, player);
}

export function canContinueCapture(board: Board, piece: Piece, afterPosition: Position): boolean {
  const tempPiece = { ...piece, row: afterPosition.row, col: afterPosition.col };
  const captures = findSingleCaptures(board, tempPiece);
  return captures.length > 0;
}

