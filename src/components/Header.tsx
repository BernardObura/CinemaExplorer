import { useState } from 'react';
import { Search, Film, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { tmdbService } from '@/services/tmdbApi';
import { toast } from '@/components/ui/use-toast';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  onApiKeyChange?: () => void;
}

export function Header({ onSearch, searchQuery, onApiKeyChange }: HeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(tmdbService.getApiKey() || '');

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      tmdbService.setApiKey(apiKey.trim());
      console.log('API key saved:', apiKey.trim().substring(0, 8) + '...');
      toast({
        title: "API Key Saved",
        description: "Your TMDB API key has been saved locally.",
      });
      setIsSettingsOpen(false);
      onApiKeyChange?.();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Film className="h-8 w-8 text-cinema-gold" />
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                CinemaExplorer
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-1 max-w-md mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for movies..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-9 bg-muted/50 border-muted-foreground/20 focus:border-cinema-gold"
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            className="hover:bg-muted/50"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>TMDB API Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                To use this app, you need a TMDB API key. Get one free at{' '}
                <a 
                  href="https://www.themoviedb.org/settings/api" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cinema-gold hover:underline"
                >
                  themoviedb.org
                </a>
              </p>
              <Input
                type="password"
                placeholder="Enter your TMDB API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApiKeySubmit} disabled={!apiKey.trim()}>
                Save Key
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}