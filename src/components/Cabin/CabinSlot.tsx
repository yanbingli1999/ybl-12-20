import React from 'react';
import { Flame, AlertTriangle, Lock, Highlighter } from 'lucide-react';
import type { Cabin, Die, CabinType } from '../../types';
import { useConfigStore } from '../../store/useConfigStore';

interface CabinSlotProps {
  cabin: Cabin;
  assignedDice: Die[];
  totalPoints: number;
  onDrop: (cabinType: CabinType, dieId: string) => void;
  onRemoveDie: (dieId: string) => void;
  disabled?: boolean;
  forceDisabled?: boolean;
  highlighted?: boolean;
}

const cabinColors: Record<CabinType, { bg: string; border: string; text: string; icon: string }> = {
  engine: { bg: 'bg-neon-purple/10', border: 'border-neon-purple', text: 'text-neon-purple', icon: '🚀' },
  shield: { bg: 'bg-neon-cyan/10', border: 'border-neon-cyan', text: 'text-neon-cyan', icon: '🛡️' },
  weapon: { bg: 'bg-neon-red/10', border: 'border-neon-red', text: 'text-neon-red', icon: '⚔️' },
  repair: { bg: 'bg-neon-green/10', border: 'border-neon-green', text: 'text-neon-green', icon: '🔧' },
  scanner: { bg: 'bg-neon-yellow/10', border: 'border-neon-yellow', text: 'text-neon-yellow', icon: '📡' },
};

export const CabinSlot: React.FC<CabinSlotProps> = ({
  cabin,
  assignedDice,
  totalPoints,
  onDrop,
  onRemoveDie,
  disabled,
  forceDisabled,
  highlighted,
}) => {
  const colors = cabinColors[cabin.type];
  const { config } = useConfigStore();
  const isOverheated = totalPoints > config.overheatThreshold;
  const isDamaged = cabin.damaged;

  const handleDragOver = (e: React.DragEvent) => {
    if (!disabled && !isDamaged && !forceDisabled) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled || isDamaged || forceDisabled) return;

    const dieId = e.dataTransfer.getData('dieId');
    if (dieId) {
      onDrop(cabin.type, dieId);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        cabin-slot relative
        ${colors.bg}
        ${isDamaged ? 'cabin-slot.damaged' : assignedDice.length > 0 ? 'cabin-slot.active' : ''}
        ${isOverheated ? 'ring-2 ring-neon-red' : ''}
        ${highlighted ? 'ring-4 ring-neon-green animate-pulse shadow-[0_0_20px_rgba(34,197,94,0.3)]' : ''}
        ${forceDisabled ? 'ring-2 ring-neon-orange border-neon-orange' : ''}
        ${disabled || isDamaged || forceDisabled ? 'opacity-70 cursor-not-allowed' : 'hover:border-opacity-60 cursor-pointer'}
        transition-all duration-200
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{colors.icon}</span>
          <div>
            <h4 className={`font-display font-bold ${colors.text}`}>
              {cabin.name}
              <span className="ml-2 text-xs text-gray-400">Lv.{cabin.level}</span>
            </h4>
            <p className="text-xs text-gray-500">{cabin.description}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {highlighted && (
            <div className="flex items-center gap-1 text-neon-green bg-neon-green/10 px-2 py-0.5 rounded">
              <Highlighter className="w-3 h-3" />
              <span className="text-xs font-bold">建议优先</span>
            </div>
          )}

          {forceDisabled && (
            <div className="flex items-center gap-1 text-neon-orange bg-neon-orange/10 px-2 py-0.5 rounded">
              <Lock className="w-3 h-3" />
              <span className="text-xs font-bold">指令禁用</span>
            </div>
          )}

          {isDamaged && (
            <div className="flex items-center gap-1 text-neon-red">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
              <span className="text-xs">损坏中 ({cabin.cooldown})</span>
            </div>
          )}

          {isOverheated && (
            <div className="flex items-center gap-1 text-neon-red animate-pulse">
              <Flame className="w-4 h-4" />
              <span className="text-xs">过热!</span>
            </div>
          )}
        </div>
      </div>

      {assignedDice.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {assignedDice.map(die => (
            <div
              key={die.id}
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                font-display font-bold text-lg
                ${colors.bg} border ${colors.border}
                ${!disabled && !forceDisabled ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-70'}
                transition-transform
              `}
              onClick={() => !disabled && !forceDisabled && onRemoveDie(die.id)}
            >
              {die.value}
            </div>
          ))}
        </div>
      )}

      {totalPoints > 0 && (
        <div className={`text-right font-display font-bold ${isOverheated ? 'text-neon-red' : colors.text}`}>
          总点数: {totalPoints}
          {isOverheated && (
            <span className="text-xs ml-2 text-neon-red">
              (超过阈值 {config.overheatThreshold})
            </span>
          )}
        </div>
      )}

      {isDamaged && (
        <div className="absolute inset-0 bg-neon-red/10 rounded-lg pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-red/20 to-transparent animate-scan-line" />
        </div>
      )}

      {forceDisabled && !isDamaged && (
        <div className="absolute inset-0 bg-neon-orange/5 rounded-lg pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-neon-orange/10 to-transparent" />
        </div>
      )}
    </div>
  );
};
