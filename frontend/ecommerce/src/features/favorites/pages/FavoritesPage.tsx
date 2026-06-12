import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, X } from 'lucide-react';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';

export function FavoritesPage() {
  const { items, isLoading, error, fetchFavorites, removeFavorite } = useFavoritesStore();
  const { isAuthenticated, isInitialized } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      fetchFavorites();
    }
  }, [isInitialized, isAuthenticated, fetchFavorites]);

  const handleRemove = async (productId: string) => {
    try {
      await removeFavorite(productId);
      addToast('Removed from favorites', 'success');
    } catch {
      addToast('Failed to remove favorite', 'error');
    }
  };

  if (!isInitialized || (isAuthenticated && isLoading && items.length === 0)) {
    return (
      <div className="pt-32 pb-20 max-w-screen-2xl mx-auto px-6 min-h-[60vh]">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-container-high rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-container-lowest aspect-[4/5] rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-20 max-w-screen-2xl mx-auto px-6 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <Heart className="w-16 h-16 text-on-surface-variant mb-6" />
        <h1 className="text-3xl font-black font-headline uppercase italic tracking-tighter mb-4">
          Sign In to View Favorites
        </h1>
        <p className="text-on-surface-variant mb-8 max-w-sm">
          Keep track of the products you love by signing in to your account.
        </p>
        <Link
          to="/auth"
          className="bg-on-surface text-surface px-10 py-4 font-black font-headline uppercase tracking-tighter hover:opacity-90 transition-opacity"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-32 pb-20 max-w-screen-2xl mx-auto px-6 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <p className="text-error font-bold text-lg mb-2">Something went wrong</p>
        <p className="text-on-surface-variant mb-6">{error}</p>
        <button
          onClick={() => fetchFavorites()}
          className="bg-on-surface text-surface px-10 py-4 font-black font-headline uppercase tracking-tighter hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 max-w-screen-2xl mx-auto px-6 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <Heart className="w-16 h-16 text-on-surface-variant mb-6" />
        <h1 className="text-3xl font-black font-headline uppercase italic tracking-tighter mb-4">
          No Favorites Yet
        </h1>
        <p className="text-on-surface-variant mb-8 max-w-sm">
          Start exploring our collection and save the products you love.
        </p>
        <Link
          to="/products"
          className="bg-on-surface text-surface px-10 py-4 font-black font-headline uppercase tracking-tighter hover:opacity-90 transition-opacity"
        >
          Start Exploring
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 max-w-screen-2xl mx-auto px-6 min-h-screen">
      <h1 className="text-4xl font-black font-headline uppercase italic tracking-tighter mb-2">
        Your Favorites
      </h1>
      <p className="text-on-surface-variant text-sm mb-12">
        {items.length} {items.length === 1 ? 'item' : 'items'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
        {items.map((product) => (
          <div key={product.id} className="group">
            <div className="relative aspect-[4/5] bg-surface-container-low overflow-hidden mb-4">
              <Link to={`/products/${product.slug}`}>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </Link>
              <button
                onClick={() => handleRemove(product.id)}
                className="absolute top-4 right-4 bg-surface-container-highest/80 backdrop-blur p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-error-container hover:text-error"
                aria-label="Remove from favorites"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              <Link to={`/products/${product.slug}`}>
                <h4 className="font-headline font-bold text-lg leading-tight hover:text-primary transition-colors">
                  {product.name}
                </h4>
              </Link>
              <p className="text-on-surface-variant text-sm">{product.category || "Men's Running"}</p>
              <p className="font-bold mt-2">${product.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
