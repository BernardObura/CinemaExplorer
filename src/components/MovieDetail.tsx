import { useEffect, useState } from 'react';
import { X, Star, Calendar, Clock, DollarSign, Play, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Movie, MovieDetails, MovieVideo, tmdbService } from '@/services/tmdbApi';
import { VideoPlayer } from '@/components/VideoPlayer';
import { toast } from '@/components/ui/use-toast';

interface MovieDetailProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MovieDetail({ movie, isOpen, onClose }: MovieDetailProps) {
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<MovieVideo[]>([]);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!movie || !isOpen) return;
      
      setLoading(true);
      try {
        const [details, videosResponse] = await Promise.all([
          tmdbService.getMovieDetails(movie.id),
          tmdbService.getMovieVideos(movie.id)
        ]);
        setMovieDetails(details);
        setVideos(videosResponse.results);
      } catch (error) {
        console.error('Failed to fetch movie details:', error);
        toast({
          title: "Error",
          description: "Failed to load movie details. Please check your API key.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movie, isOpen]);

  if (!movie) return null;

  const backdropUrl = tmdbService.getBackdropUrl(movie.backdrop_path);
  const posterUrl = tmdbService.getPosterUrl(movie.poster_path);
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] p-6 overflow-hidden">
        <div className="relative">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Hero Section */}
          <div className="relative h-64 md:h-80 overflow-hidden">
            {backdropUrl ? (
              <img
                src={backdropUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-dark flex items-center justify-center">
                <Play className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="p-6 -mt-20 relative z-10">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Poster */}
              <div className="flex-shrink-0">
                <div className="w-32 md:w-48 aspect-[2/3] rounded-lg overflow-hidden shadow-card">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Play className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    {movie.title}
                  </h1>
                  {movieDetails?.tagline && (
                    <p className="text-netflix-red italic text-sm">
                      "{movieDetails.tagline}"
                    </p>
                  )}
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-netflix-red fill-current" />
                    <span>{rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{releaseYear}</span>
                  </div>
                  {loading ? (
                    <Skeleton className="h-4 w-16" />
                  ) : (
                    movieDetails?.runtime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatRuntime(movieDetails.runtime)}</span>
                      </div>
                    )
                  )}
                </div>

                {/* Genres */}
                {loading ? (
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-14" />
                  </div>
                ) : (
                  movieDetails?.genres && (
                    <div className="flex flex-wrap gap-2">
                      {movieDetails.genres.map((genre) => (
                        <Badge key={genre.id} variant="secondary" className="text-xs">
                          {genre.name}
                        </Badge>
                      ))}
                    </div>
                  )
                )}

                {/* Play Trailer Button */}
                <div className="flex flex-wrap gap-3">
                  {videos.length > 0 && (
                    <Button
                      onClick={() => setShowVideoPlayer(true)}
                      size="lg"
                      className="bg-netflix-red hover:bg-netflix-red/90 text-white shadow-lg"
                    >
                      <Play className="h-5 w-5 mr-2 fill-current" />
                      Watch Trailer
                    </Button>
                  )}
                  
                  <Alert className="flex-1 min-w-full">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Note:</strong> Only trailers and movie information are available. 
                      For full movies, check streaming services or local theaters.
                    </AlertDescription>
                  </Alert>
                </div>

                {/* Overview */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Overview</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {movie.overview || 'No overview available.'}
                  </p>
                </div>

                {/* Financial Info */}
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : (
                  movieDetails && (movieDetails.budget > 0 || movieDetails.revenue > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {movieDetails.budget > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            <span>Budget</span>
                          </div>
                          <p className="font-semibold">{formatCurrency(movieDetails.budget)}</p>
                        </div>
                      )}
                      {movieDetails.revenue > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            <span>Revenue</span>
                          </div>
                          <p className="font-semibold">{formatCurrency(movieDetails.revenue)}</p>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Video Player Modal */}
      <VideoPlayer
        videos={videos}
        isOpen={showVideoPlayer}
        onClose={() => setShowVideoPlayer(false)}
      />
    </Dialog>
  );
}