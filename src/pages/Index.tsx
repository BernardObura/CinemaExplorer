import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { MovieCard } from '@/components/MovieCard';
import { MovieDetail } from '@/components/MovieDetail';
import { LoadingGrid } from '@/components/LoadingGrid';
import { MovieCategories } from '@/components/MovieCategories';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Film } from 'lucide-react';
import { Movie, tmdbService } from '@/services/tmdbApi';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  // Movie discovery application with categorized browsing
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('popular');
  const [hasApiKey, setHasApiKey] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Check API key
  const checkApiKey = () => {
    const apiKey = tmdbService.getApiKey();
    setHasApiKey(!!apiKey);
  };

  useEffect(() => {
    checkApiKey();
  }, []);

  const fetchMovies = async (query: string = '', category: string = 'popular', page: number = 1) => {
    if (!hasApiKey) return;
    
    setLoading(true);
    try {
      let response;
      if (query.trim()) {
        response = await tmdbService.searchMovies(query, page);
      } else {
        switch (category) {
          case 'trending':
            response = await tmdbService.getTrendingMovies('week', page);
            break;
          case 'top_rated':
            response = await tmdbService.getTopRatedMovies(page);
            break;
          case 'upcoming':
            response = await tmdbService.getUpcomingMovies(page);
            break;
          default:
            response = await tmdbService.getPopularMovies(page);
        }
      }
      
      if (page === 1) {
        setMovies(response.results);
      } else {
        setMovies(prev => [...prev, ...response.results]);
      }
      
      setTotalPages(response.total_pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch movies:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch movies. Please check your API key and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedSearchQuery !== undefined) {
      fetchMovies(debouncedSearchQuery, activeCategory, 1);
    }
  }, [debouncedSearchQuery, activeCategory, hasApiKey]);

  useEffect(() => {
    if (hasApiKey && !searchQuery) {
      fetchMovies('', activeCategory, 1);
    }
  }, [hasApiKey, activeCategory]);

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      fetchMovies(debouncedSearchQuery, activeCategory, currentPage + 1);
    }
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const handleCloseDetail = () => {
    setSelectedMovie(null);
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-background">
        <Header onSearch={setSearchQuery} searchQuery={searchQuery} onApiKeyChange={checkApiKey} />
        <main className="container py-12">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <Film className="h-24 w-24 text-cinema-gold" />
            <div className="space-y-4 max-w-md">
              <h1 className="text-3xl font-bold text-cinema-gold">
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
    <div className="min-h-screen bg-background">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} onApiKeyChange={checkApiKey} />
      
      <main className="container py-8">
        {/* Hero Section */}
        {!searchQuery && (
          <div className="text-center py-12 space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-cinema-gold">
                Discover Amazing Movies
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Explore movies by category. Find your next favorite film from popular, trending, top-rated, and upcoming releases.
              </p>
            </div>

            {/* Category Navigation */}
            <MovieCategories 
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
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
                  className="bg-cinema-gold text-background hover:bg-cinema-gold/90"
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
                Try adjusting your search terms or browse different categories.
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