import { useState } from 'react';
import { Star, Calendar, Play } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Movie } from '@/services/tmdbApi';
import { tmdbService } from '@/services/tmdbApi';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const posterUrl = tmdbService.getPosterUrl(movie.poster_path);
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

  return (
    <Card 
      className="group relative overflow-hidden bg-gradient-card border-border/40 hover:border-cinema-gold/50 transition-all duration-300 hover:shadow-card hover:scale-105 cursor-pointer"
      onClick={() => onClick(movie)}
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        {posterUrl && !imageError ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Play className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating Badge */}
        {movie.vote_average > 0 && (
          <Badge className="absolute top-2 left-2 bg-black/70 text-cinema-gold border-cinema-gold/30 hover:bg-black/80">
            <Star className="h-3 w-3 mr-1 fill-current" />
            {rating}
          </Badge>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-cinema-gold/90 text-cinema-blue p-3 rounded-full transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="h-6 w-6 fill-current" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-sm line-clamp-2 text-foreground leading-tight">
          {movie.title}
        </h3>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{releaseYear}</span>
        </div>

        {movie.overview && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {movie.overview}
          </p>
        )}
      </div>
    </Card>
  );
}