import { useState, useEffect } from 'react';
import { X, Play, ExternalLink, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MovieVideo } from '@/services/tmdbApi';

interface VideoPlayerProps {
  videos: MovieVideo[];
  isOpen: boolean;
  onClose: () => void;
}

export function VideoPlayer({ videos, isOpen, onClose }: VideoPlayerProps) {
  const [selectedVideo, setSelectedVideo] = useState<MovieVideo | null>(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent background scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset selected video when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedVideo(null);
    }
  }, [isOpen]);

  // Find the best trailer to show first
  const getMainTrailer = () => {
    const trailers = videos.filter(video => 
      video.type === 'Trailer' && 
      video.site === 'YouTube' && 
      video.official
    );
    
    if (trailers.length > 0) {
      return trailers[0];
    }
    
    // Fallback to any YouTube video
    const youtubeVideos = videos.filter(video => video.site === 'YouTube');
    return youtubeVideos.length > 0 ? youtubeVideos[0] : null;
  };

  const mainTrailer = selectedVideo || getMainTrailer();

  if (!mainTrailer) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="relative">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="text-center py-8">
              <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Trailers Available</h3>
              <p className="text-muted-foreground mb-4">
                Sorry, there are no trailers available for this movie.
              </p>
              
              <Alert className="text-left">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> Full movies are not available through this app. 
                  We only provide movie information and trailers. To watch full movies, 
                  please check streaming services like Netflix, Amazon Prime, or visit your local cinema.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 bg-black border-0">
        <div className="relative">
          {/* Close Button - Multiple ways to close */}
          <div className="absolute top-4 right-4 z-50 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="bg-black/70 hover:bg-black/90 text-white rounded-full p-3 transition-all duration-200"
              title="Close (ESC)"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Background overlay - Click to close */}
          <div 
            className="absolute inset-0 bg-black/20 z-10"
            onClick={onClose}
            title="Click to close"
          />

          {/* Video Player */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden z-20">
            <iframe
              src={`https://www.youtube.com/embed/${mainTrailer.key}?autoplay=1&rel=0&modestbranding=1&fs=1&iv_load_policy=3`}
              title={mainTrailer.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>

          {/* Video Info and Controls */}
          <div className="bg-card p-4 space-y-3 relative z-20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{mainTrailer.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {mainTrailer.type} • {mainTrailer.site}
                </p>
              </div>
              
              {/* Open in YouTube */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://www.youtube.com/watch?v=${mainTrailer.key}`, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Watch on YouTube
              </Button>
            </div>

            {/* Full Movie Notice */}
            <Alert className="bg-netflix-red/10 border-netflix-red/30">
              <AlertCircle className="h-4 w-4 text-netflix-red" />
              <AlertDescription className="text-sm">
                <strong>Looking for the full movie?</strong> This app shows trailers only. 
                To watch the complete film, check streaming platforms like Netflix, Amazon Prime, 
                Disney+, or visit your local theater.
              </AlertDescription>
            </Alert>

            {/* Video Selection */}
            {videos.length > 1 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-foreground">More Videos ({videos.length})</h5>
                <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                  {videos
                    .filter(video => video.site === 'YouTube')
                    .map((video) => (
                      <button
                        key={video.id}
                        onClick={() => setSelectedVideo(video)}
                        className={`px-3 py-1.5 rounded text-xs transition-all duration-200 ${
                          mainTrailer.id === video.id
                            ? 'bg-netflix-red text-white'
                            : 'bg-muted hover:bg-accent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <Play className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate max-w-32">{video.name}</span>
                        </div>
                      </button>
                    ))
                  }
                </div>
              </div>
            )}
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="absolute bottom-2 left-4 text-xs text-muted-foreground bg-black/50 px-2 py-1 rounded z-30">
            Press ESC or click outside to close
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}