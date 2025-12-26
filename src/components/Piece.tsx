import { Piece as PieceType } from '../game/types';
import './Piece.css';

interface PieceProps {
  piece: PieceType;
  isSelected: boolean;
  onClick?: () => void;
}

export default function PieceComponent({ piece, isSelected }: PieceProps) {
  return (
    <div
      className={`piece ${piece.player} ${piece.type} ${isSelected ? 'selected' : ''}`}
    >
      {piece.type === 'king' && <div className="king-crown">♔</div>}
    </div>
  );
}

