const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime: number;
  budget: number;
  revenue: number;
  production_companies: { id: number; name: string; logo_path: string | null }[];
  production_countries: { iso_3166_1: string; name: string }[];
  spoken_languages: { iso_639_1: string; name: string }[];
  status: string;
  tagline: string;
}

export interface MovieVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

class TMDBService {
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = localStorage.getItem('tmdb_api_key');
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('tmdb_api_key', key);
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  clearApiKey() {
    this.apiKey = null;
    localStorage.removeItem('tmdb_api_key');
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${this.apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async getPopularMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.makeRequest(`/movie/popular?page=${page}`);
  }

  async searchMovies(query: string, page: number = 1): Promise<TMDBResponse<Movie>> {
    const encodedQuery = encodeURIComponent(query);
    return this.makeRequest(`/search/movie?query=${encodedQuery}&page=${page}`);
  }

  async getMovieDetails(movieId: number): Promise<MovieDetails> {
    return this.makeRequest(`/movie/${movieId}`);
  }

  async getTopRatedMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.makeRequest(`/movie/top_rated?page=${page}`);
  }

  async getUpcomingMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.makeRequest(`/movie/upcoming?page=${page}`);
  }

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week', page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.makeRequest(`/trending/movie/${timeWindow}?page=${page}`);
  }

  async getMovieVideos(movieId: number): Promise<{ results: MovieVideo[] }> {
    return this.makeRequest(`/movie/${movieId}/videos`);
  }

  getImageUrl(path: string | null, size: 'w200' | 'w300' | 'w400' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
    if (!path) return null;
    return `${IMAGE_BASE_URL}/${size}${path}`;
  }

  getPosterUrl(path: string | null): string | null {
    return this.getImageUrl(path, 'w500');
  }

  getBackdropUrl(path: string | null): string | null {
    return this.getImageUrl(path, 'w780');
  }
}

export const tmdbService = new TMDBService();