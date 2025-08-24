import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { MovieCard } from '@/components/MovieCard';
import { MovieDetail } from '@/components/MovieDetail';
import { LoadingGrid } from '@/components/LoadingGrid';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Film, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { Movie, tmdbService, TMDBResponse } from '@/services/tmdbApi';
import { toast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

const Index = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState<'popular' | 'trending'>('popular');
  const [hasApiKey, setHasApiKey] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Check API key on mount and when it changes
  const checkApiKey = useCallback(() => {
    const apiKey = tmdbService.getApiKey();
    console.log('Checking API key:', apiKey ? 'Present' : 'Missing');
    setHasApiKey(!!apiKey);
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const fetchMovies = useCallback(async (page: number = 1, query?: string) => {
    if (!tmdbService.getApiKey()) {
      setHasApiKey(false);
      return;
    }

    setLoading(true);
    try {
      let response: TMDBResponse<Movie>;
      
      if (query && query.trim()) {
        response = await tmdbService.searchMovies(query.trim(), page);
      } else if (activeTab === 'trending') {
        response = await tmdbService.getTrendingMovies('week', page);
      } else {
        response = await tmdbService.getPopularMovies(page);
      }
      
      if (page === 1) {
        setMovies(response.results);
      } else {
        setMovies((prev) => [...prev, ...response.results]);
      }
      
      setTotalPages(response.total_pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch movies:', error);
      toast({
        title: "Error",
        description: "Failed to load movies. Please check your API key.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Fetch movies when search query changes
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) return;
    setCurrentPage(1);
    fetchMovies(1, debouncedSearchQuery);
  }, [debouncedSearchQuery, activeTab, fetchMovies]);

  // Initial load
  useEffect(() => {
    if (hasApiKey && !searchQuery) {
      fetchMovies(1);
    }
  }, [hasApiKey, activeTab, fetchMovies]);

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      fetchMovies(currentPage + 1, debouncedSearchQuery);
    }
  };

  const handleTabChange = (tab: 'popular' | 'trending') => {
    setActiveTab(tab);
    setCurrentPage(1);
    setMovies([]);
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const handleCloseDetail = () => {
    setSelectedMovie(null);
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Header onSearch={setSearchQuery} searchQuery={searchQuery} onApiKeyChange={checkApiKey} />
        <main className="container py-12">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <Film className="h-24 w-24 text-cinema-gold" />
            <div className="space-y-4 max-w-md">
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Welcome to CinemaExplorer
              </h1>
              <p className="text-muted-foreground">
                Discover and explore movies from around the world. Get started by adding your TMDB API key.
              </p>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Click the settings icon in the header to configure your TMDB API key.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} onApiKeyChange={checkApiKey} />
      
      <main className="container py-8">
        {/* Hero Section */}
        {!searchQuery && (
          <div className="text-center py-12 space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Discover Amazing Movies
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Explore the world of cinema with popular and trending movies from around the globe
              </p>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex justify-center gap-4 pt-8">
              <Button
                variant={activeTab === 'popular' ? 'default' : 'outline'}
                onClick={() => handleTabChange('popular')}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Popular Movies
              </Button>
              <Button
                variant={activeTab === 'trending' ? 'default' : 'outline'}
                onClick={() => handleTabChange('trending')}
                className="gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Trending Now
              </Button>
            </div>
          </div>
        )}

        {/* Search Results Header */}
        {searchQuery && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              Search results for "{searchQuery}"
            </h2>
            <p className="text-muted-foreground">
              {movies.length > 0 ? `Found ${movies.length} movies` : 'No movies found'}
            </p>
          </div>
        )}

        {/* Movies Grid */}
        {loading && movies.length === 0 ? (
          <LoadingGrid />
        ) : movies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={handleMovieClick}
                />
              ))}
            </div>

            {/* Load More Button */}
            {currentPage < totalPages && (
              <div className="flex justify-center">
                <Button
                  onClick={handleLoadMore}
                  disabled={loading}
                  size="lg"
                  className="gap-2"
                >
                  {loading ? 'Loading...' : 'Load More Movies'}
                </Button>
              </div>
            )}
          </>
        ) : (
          !loading && (
            <div className="text-center py-12">
              <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No movies found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or browse popular movies instead.
              </p>
            </div>
          )
        )}
      </main>

      {/* Movie Detail Modal */}
      <MovieDetail
        movie={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={handleCloseDetail}
      />
    </div>
  );
};

export default Index;
