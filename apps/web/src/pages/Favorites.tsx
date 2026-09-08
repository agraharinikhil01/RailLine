import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, ArrowLeft, Search } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { TrainSearchResultCard } from '../components/search/TrainSearchResultCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';

export const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { favorites, isLoading } = useFavorites();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                Favorite Trains
              </h1>
              <p className="text-xs text-slate-500">
                Your pinned trains for quick 1-click live telemetry
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-full h-20 rounded-xl" />
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="space-y-3">
            {favorites.map((train) => (
              <TrainSearchResultCard
                key={train.trainNumber}
                train={train}
                onClick={() => navigate(`/journey/${train.trainNumber}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            title="No favorite trains yet"
            description="You can pin frequently tracked journeys by clicking the heart icon on any train journey page."
            action={
              <Button size="sm" onClick={() => navigate('/')}>
                <Search className="w-3.5 h-3.5 mr-1.5" />
                Find Trains to Pin
              </Button>
            }
          />
        )}
      </div>

      <div className="text-center text-xs text-slate-400 py-6 border-t border-slate-200/80 mt-12">
        RailLine Favorites • Saved locally and synchronized
      </div>
    </div>
  );
};
