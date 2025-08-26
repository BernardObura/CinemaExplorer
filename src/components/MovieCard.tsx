import { useState } from 'react';
import { Star, Calendar, Play, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Movie, MovieVideo, tmdbService } from '@/services/tmdbApi';
import { VideoPlayer } from '@/components/VideoPlayer';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [videos, setVideos] = useState<MovieVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  
  const posterUrl = tmdbService.getPosterUrl(movie.poster_path);
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

  const handlePlayClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingVideos(true);
    
    try {
      const videoResponse = await tmdbService.getMovieVideos(movie.id);
      setVideos(videoResponse.results);
      setShowVideoPlayer(true);
    } catch (error) {
      console.error('Failed to load videos:', error);
      // Fallback to showing movie details
      onClick(movie);
    } finally {
      setLoadingVideos(false);
    }
  };

  return (
    <>
      <Card 
        className="group relative overflow-hidden bg-card border-border hover:border-netflix-red transition-all duration-300 hover:shadow-glow hover:scale-[1.02] cursor-pointer"
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
          <Badge className="absolute top-2 left-2 bg-black/80 text-netflix-red border-netflix-red/30">
            <Star className="h-3 w-3 mr-1 fill-current" />
            {rating}
          </Badge>
        )}

        {/* Action Buttons Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex gap-3">
            <Button
              onClick={handlePlayClick}
              disabled={loadingVideos}
              size="sm"
              className="bg-netflix-red hover:bg-netflix-red/90 text-white rounded-full px-4 py-2 transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg"
            >
              <Play className="h-4 w-4 mr-2 fill-current" />
              {loadingVideos ? 'Loading...' : 'Trailer'}
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onClick(movie);
              }}
              size="sm"
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-full px-4 py-2 transform scale-90 group-hover:scale-100 transition-all duration-300"
            >
              <Eye className="h-4 w-4 mr-2" />
              Details
            </Button>
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

      {/* Video Player Modal */}
      <VideoPlayer
        videos={videos}
        isOpen={showVideoPlayer}
        onClose={() => setShowVideoPlayer(false)}
      />
    </>
  );
}