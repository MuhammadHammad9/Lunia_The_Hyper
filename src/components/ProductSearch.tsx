import { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, Star, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCategories } from '@/hooks/use-products';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  tagline: string;
  price: number;
  image_url: string;
  badge: string | null;
  category_id: string | null;
  average_rating: number;
}

interface ProductSearchProps {
  onProductSelect?: (product: Product) => void;
  onResultsChange?: (products: Product[]) => void;
}

export const ProductSearch = ({ onProductSelect, onResultsChange }: ProductSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [minRating, setMinRating] = useState<number>(0);
  
  const { data: categories } = useCategories();
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch();
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, selectedCategory, priceRange, minRating]);

  const performSearch = async () => {
    setIsLoading(true);
    
    try {
      let queryBuilder = supabase
        .from('products')
        .select('id, name, tagline, price, image_url, badge, category_id, average_rating')
        .eq('is_active', true)
        .gte('price', priceRange[0])
        .lte('price', priceRange[1])
        .gte('average_rating', minRating);

      if (query.trim()) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,tagline.ilike.%${query}%,description.ilike.%${query}%`);
      }

      if (selectedCategory) {
        queryBuilder = queryBuilder.eq('category_id', selectedCategory);
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false });

      if (error) throw error;
      
      setResults(data || []);
      onResultsChange?.(data || []);
      
      if (query.trim()) {
        setShowResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    onProductSelect?.(product);
    setShowResults(false);
    setQuery('');
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setPriceRange([0, 500]);
    setMinRating(0);
  };

  const hasActiveFilters = selectedCategory || priceRange[0] > 0 || priceRange[1] < 500 || minRating > 0;

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setShowResults(true)}
          placeholder="Search products..."
          className="w-full pl-12 pr-24 py-4 bg-secondary/50 border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setShowResults(false);
              }}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${showFilters || hasActiveFilters ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-6 bg-secondary/50 border border-border rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Category</label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">All Categories</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="flex-1 accent-primary"
                  />
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="flex-1 accent-primary"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Minimum Rating
                </label>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`p-2 rounded-lg transition-colors ${minRating === rating ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                    >
                      {rating === 0 ? (
                        <span className="text-xs">Any</span>
                      ) : (
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs">{rating}+</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Autocomplete Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              </div>
            ) : results.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <p>No products found for "{query}"</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {results.slice(0, 6).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors text-left"
                  >
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{product.tagline}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium text-primary">${product.price}</span>
                        {product.average_rating > 0 && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {product.average_rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    {product.badge && (
                      <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                        {product.badge}
                      </span>
                    )}
                  </button>
                ))}
                {results.length > 6 && (
                  <div className="p-3 text-center text-sm text-muted-foreground bg-secondary/30">
                    +{results.length - 6} more results
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
