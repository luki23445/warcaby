import { Board as BoardType, Piece, Move } from '../game/types';
import { isDarkSquare, getPieceAt } from '../game/board';
import Square from './Square';
import './Board.css';

interface BoardProps {
  board: BoardType;
  boardSize: 8 | 10;
  selectedPiece: Piece | null;
  onPieceClick: (piece: Piece) => void;
  onSquareClick: (row: number, col: number) => void;
  getAvailableMoves: (piece: Piece) => Move[];
}

export default function Board({
  board,
  boardSize,
  selectedPiece,
  onPieceClick,
  onSquareClick,
  getAvailableMoves
}: BoardProps) {
  const getAvailableTargets = (): Set<string> => {
    const targets = new Set<string>();
    if (selectedPiece) {
      const moves = getAvailableMoves(selectedPiece);
      for (const move of moves) {
        if ('steps' in move) {
          const finalStep = move.steps[move.steps.length - 1];
          targets.add(`${finalStep.to.row},${finalStep.to.col}`);
        } else {
          targets.add(`${move.to.row},${move.to.col}`);
        }
      }
    }
    return targets;
  };

  const availableTargets = getAvailableTargets();

  return (
    <div className="board-container">
      <div 
        className="board"
        style={{
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
          gridTemplateRows: `repeat(${boardSize}, 1fr)`
        }}
      >
        {Array.from({ length: boardSize * boardSize }, (_, i) => {
          const row = Math.floor(i / boardSize);
          const col = i % boardSize;
          const piece = getPieceAt(board, row, col);
          const isSelected = selectedPiece?.row === row && selectedPiece?.col === col;
          const isAvailable = availableTargets.has(`${row},${col}`);
          const isDark = isDarkSquare(row, col);

          return (
            <Square
              key={`${row}-${col}`}
              row={row}
              col={col}
              isDark={isDark}
              piece={piece}
              isSelected={isSelected}
              isAvailable={isAvailable}
              onPieceClick={piece ? () => onPieceClick(piece) : undefined}
              onSquareClick={() => onSquareClick(row, col)}
            />
          );
        })}
      </div>
    </div>
  );
}

