import React from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import { clsx } from 'clsx';

export interface FavoriteButtonProps {
  trainNumber: string;
  className?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ trainNumber, className }) => {
  const { isFavorite, toggleFavorite, isMutating } = useFavorites();
  const favorited = isFavorite(trainNumber);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(trainNumber)}
      disabled={isMutating}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
      className={clsx(
        'p-2 rounded-lg border transition-all duration-150 flex items-center justify-center',
        favorited
          ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm'
          : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50',
        className
      )}
    >
      <Heart
        className={clsx(
          'w-4 h-4 transition-transform active:scale-125',
          favorited && 'fill-rose-500 text-rose-500'
        )}
      />
    </button>
  );
};
