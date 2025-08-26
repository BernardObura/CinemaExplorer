import { useState } from 'react';
import { X, Play } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MovieVideo } from '@/services/tmdbApi';

interface VideoPlayerProps {
  videos: MovieVideo[];
  isOpen: boolean;
  onClose: () => void;
}

export function VideoPlayer({ videos, isOpen, onClose }: VideoPlayerProps) {
  const [selectedVideo, setSelectedVideo] = useState<MovieVideo | null>(null);

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
          <div className="text-center py-8">
            <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Videos Available</h3>
            <p className="text-muted-foreground">
              Sorry, there are no trailers or videos available for this movie.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0">
        <div className="relative">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Video Player */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${mainTrailer.key}?autoplay=1&rel=0&modestbranding=1`}
              title={mainTrailer.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          {/* Video Selection */}
          {videos.length > 1 && (
            <div className="p-4 space-y-2">
              <h4 className="text-sm font-medium text-foreground">Available Videos</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {videos
                  .filter(video => video.site === 'YouTube')
                  .map((video) => (
                    <button
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        mainTrailer.id === video.id
                          ? 'bg-netflix-red text-white'
                          : 'bg-muted hover:bg-accent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Play className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{video.name}</span>
                        <span className="text-xs opacity-60 ml-auto">{video.type}</span>
                      </div>
                    </button>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}