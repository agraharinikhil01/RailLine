import React from 'react';
import { Sparkles } from 'lucide-react';

export interface AskRayFloatingButtonProps {
  onClick: () => void;
  className?: string;
}

export const AskRayFloatingButton: React.FC<AskRayFloatingButtonProps> = ({
  onClick,
  className = '',
}) => {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto ${className}`}
    >
      <button
        type="button"
        onClick={onClick}
        className="group relative flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white font-bold text-xs sm:text-sm tracking-wide shadow-xl shadow-purple-600/35 hover:shadow-purple-600/50 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 select-none cursor-pointer"
        aria-label="Ask Ray AI Assistant"
      >
        {/* Glowing pulse ring around button */}
        <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-40 blur-xs group-hover:opacity-75 transition-opacity" />

        {/* Content */}
        <span className="relative flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
          <span className="font-extrabold tracking-tight">Ask Ray</span>
        </span>
      </button>
    </div>
  );
};
