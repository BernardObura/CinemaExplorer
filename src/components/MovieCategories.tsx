import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp, Star, Clock } from 'lucide-react';

interface MovieCategoriesProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'popular', label: 'Popular', icon: Star },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'top_rated', label: 'Top Rated', icon: Flame },
  { id: 'upcoming', label: 'Upcoming', icon: Clock },
];

export function MovieCategories({ activeCategory, onCategoryChange }: MovieCategoriesProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = activeCategory === category.id;
        
        return (
          <Button
            key={category.id}
            variant={isActive ? "default" : "secondary"}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center gap-2 transition-all duration-200 ${
              isActive 
                ? 'bg-cinema-gold text-background hover:bg-cinema-gold/90' 
                : 'bg-secondary hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {category.label}
            {isActive && (
              <Badge variant="secondary" className="ml-1 bg-background/20 text-current">
                Active
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
}