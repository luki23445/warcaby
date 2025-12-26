import { describe, it, expect } from 'vitest';
import { createEmptyBoard, initializeBoard } from '../board';
import { generateCapturesForPiece, getLegalActions, canContinueCapture } from '../moves';

describe('Obowiązkowe bicia', () => {
  it('powinno zwracać tylko bicia gdy są dostępne', () => {
    const board = createEmptyBoard(8);
    // Ustaw sytuację z możliwym biciem
    board[3][3] = { player: 'white', type: 'pawn', row: 3, col: 3 };
    board[4][4] = { player: 'black', type: 'pawn', row: 4, col: 4 };
    board[5][5] = null; // Puste pole za czarnym pionkiem

    const actions = getLegalActions(board, 'white');
    expect(actions.length).toBeGreaterThan(0);
    expect(actions.every(a => 'steps' in a)).toBe(true);
  });

  it('powinno zwracać zwykłe ruchy gdy nie ma bić', () => {
    const board = initializeBoard(8);
    const actions = getLegalActions(board, 'white');
    expect(actions.length).toBeGreaterThan(0);
    expect(actions.every(a => !('steps' in a))).toBe(true);
  });
});

describe('Bicie do tyłu pionkiem', () => {
  it('pionek powinien móc bić do tyłu', () => {
    const board = createEmptyBoard(8);
    board[4][4] = { player: 'white', type: 'pawn', row: 4, col: 4 };
    board[3][3] = { player: 'black', type: 'pawn', row: 3, col: 3 };
    board[2][2] = null; // Puste pole za czarnym pionkiem (do tyłu dla białego)

    const captures = generateCapturesForPiece(board, board[4][4]!);
    expect(captures.length).toBeGreaterThan(0);
    expect(captures.some(c => c.steps[0].to.row < 4)).toBe(true);
  });
});

describe('Wielobicia', () => {
  it('powinno wymuszać kontynuację bicia tą samą bierką', () => {
    const board = createEmptyBoard(8);
    // Ustaw sytuację z wielobiciami
    board[2][2] = { player: 'white', type: 'pawn', row: 2, col: 2 };
    board[3][3] = { player: 'black', type: 'pawn', row: 3, col: 3 };
    board[4][4] = { player: 'black', type: 'pawn', row: 4, col: 4 };
    board[5][5] = null; // Puste pole za drugim czarnym pionkiem

    const captures = generateCapturesForPiece(board, board[2][2]!);
    const multiCaptures = captures.filter(c => c.steps.length > 1);
    expect(multiCaptures.length).toBeGreaterThan(0);
  });

  it('powinno wykrywać możliwość kontynuacji bicia', () => {
    const board = createEmptyBoard(8);
    board[4][4] = { player: 'white', type: 'pawn', row: 4, col: 4 };
    board[3][3] = { player: 'black', type: 'pawn', row: 3, col: 3 };
    board[2][2] = { player: 'black', type: 'pawn', row: 2, col: 2 };
    board[1][1] = null;

    // Po zbiciu pierwszego, sprawdź czy można kontynuować
    const afterPosition = { row: 2, col: 2 };
    const canContinue = canContinueCapture(board, board[4][4]!, afterPosition);
    expect(canContinue).toBe(true);
  });
});

describe('Damka latająca', () => {
  it('damka powinna móc lądować na dowolnym pustym polu za zbitą bierką', () => {
    const board = createEmptyBoard(8);
    board[0][0] = { player: 'white', type: 'king', row: 0, col: 0 };
    board[3][3] = { player: 'black', type: 'pawn', row: 3, col: 3 };
    board[4][4] = null;
    board[5][5] = null;
    board[6][6] = null;

    const captures = generateCapturesForPiece(board, board[0][0]!);
    expect(captures.length).toBeGreaterThan(0);
    
    // Sprawdź czy są różne pola lądowania
    const landingPositions = new Set(
      captures.map(c => `${c.steps[0].to.row},${c.steps[0].to.col}`)
    );
    expect(landingPositions.size).toBeGreaterThan(1);
  });

  it('damka powinna przeskakiwać dokładnie jedną bierkę przeciwnika', () => {
    const board = createEmptyBoard(8);
    board[0][0] = { player: 'white', type: 'king', row: 0, col: 0 };
    board[2][2] = { player: 'black', type: 'pawn', row: 2, col: 2 };
    board[3][3] = null;

    const captures = generateCapturesForPiece(board, board[0][0]!);
    expect(captures.length).toBeGreaterThan(0);
    expect(captures[0].steps[0].captured.row).toBe(2);
    expect(captures[0].steps[0].captured.col).toBe(2);
  });
});

describe('Promocja po zakończeniu tury', () => {
  it('pionek nie powinien być promowany w trakcie sekwencji bicia', () => {
    const board = createEmptyBoard(8);
    // Biały pionek blisko ostatniego rzędu
    board[1][1] = { player: 'white', type: 'pawn', row: 1, col: 1 };
    board[2][2] = { player: 'black', type: 'pawn', row: 2, col: 2 };
    board[0][0] = null; // Ostatni rząd dla białych

    const captures = generateCapturesForPiece(board, board[1][1]!);
    const promotionCapture = captures.find(c => 
      c.steps.some(s => s.to.row === 0)
    );
    
    if (promotionCapture) {
      // Pionek powinien być nadal pionkiem w sekwencji
      expect(promotionCapture.piece.type).toBe('pawn');
    }
  });
});

