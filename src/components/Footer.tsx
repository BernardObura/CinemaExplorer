import { Film, Calendar } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Film className="h-5 w-5 text-netflix-red" />
            <span className="font-semibold text-foreground">CinemaExplorer</span>
          </div>
          
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{currentDate}</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            © {currentYear} CinemaExplorer. All rights reserved.
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Movie data provided by{' '}
            <a 
              href="https://www.themoviedb.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-netflix-red hover:underline"
            >
              The Movie Database (TMDB)
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}