import { useState } from 'react';
import { Search, Settings, Save, Film, LogOut, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { tmdbService } from '@/services/tmdbApi';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  onApiKeyChange?: () => void;
}

export function Header({ onSearch, searchQuery, onApiKeyChange }: HeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(tmdbService.getApiKey() || '');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      tmdbService.setApiKey(apiKey.trim());
      toast({
        title: "API Key Saved",
        description: "Your TMDB API key has been saved successfully.",
      });
      setIsSettingsOpen(false);
      onApiKeyChange?.();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Film className="h-6 w-6 text-netflix-red" />
            <h1 className="text-xl font-bold text-foreground">CinemaExplorer</h1>
          </button>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10 bg-muted border-border"
                onKeyDown={(e) => e.key === 'Enter' && onSearch(searchQuery)}
              />
            </div>
            <Button 
              onClick={() => onSearch(searchQuery)}
              className="bg-netflix-red hover:bg-netflix-red/90 text-white px-6"
            >
              Search
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-accent hover:text-accent-foreground">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={() => navigate('/auth')} 
              variant="outline"
              className="border-netflix-red text-netflix-red hover:bg-netflix-red hover:text-white"
            >
              Sign In
            </Button>
          )}
          
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-accent hover:text-accent-foreground">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>TMDB API Configuration</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <p className="text-sm text-muted-foreground">
                    Get your free API key from{' '}
                    <a 
                      href="https://www.themoviedb.org/settings/api" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-netflix-red hover:underline"
                    >
                      TMDB
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
                    <Save className="h-4 w-4 mr-2" />
                    Save Key
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}