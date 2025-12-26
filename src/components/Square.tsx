import { Piece } from '../game/types';
import PieceComponent from './Piece';
import './Square.css';

interface SquareProps {
  row: number;
  col: number;
  isDark: boolean;
  piece: Piece | null;
  isSelected: boolean;
  isAvailable: boolean;
  onPieceClick?: () => void;
  onSquareClick: () => void;
}

export default function Square({
  isDark,
  piece,
  isSelected,
  isAvailable,
  onPieceClick,
  onSquareClick
}: SquareProps) {
  const handleClick = () => {
    if (piece && onPieceClick) {
      onPieceClick();
    } else {
      onSquareClick();
    }
  };

  return (
    <div
      className={`square ${isDark ? 'dark' : 'light'} ${isSelected ? 'selected' : ''} ${isAvailable ? 'available' : ''}`}
      onClick={handleClick}
    >
      {piece && (
        <PieceComponent
          piece={piece}
          isSelected={isSelected}
          onClick={onPieceClick}
        />
      )}
      {isAvailable && !piece && <div className="available-marker" />}
    </div>
  );
}

