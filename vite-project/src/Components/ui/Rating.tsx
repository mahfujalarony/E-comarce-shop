// Rating component using react-query with memoization
import { useQuery } from '@tanstack/react-query';
import { memo } from 'react';

interface RatingProps {
  productId: string;
}

const fetchRating = async (productId: string) => {
  // Use environment variable for backend URL
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';
  const res = await fetch(`${baseUrl}/getrating/${productId}`);
  const data = await res.json();
  // Validate response data
  if (data && typeof data.averageRating === 'number' && typeof data.totalReviews === 'number') {
    return { averageRating: data.averageRating, totalReviews: data.totalReviews };
  }
  throw new Error('Invalid rating data');
};

const Rating = ({ productId }: RatingProps) => {
  // Use react-query to fetch and cache rating data
  const { data, isLoading, error } = useQuery({
    queryKey: ['rating', productId],
    queryFn: () => fetchRating(productId),
    // Cache data for 5 minutes
    staleTime: 5 * 60 * 1000,
  });

  // Show loading state
  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading rating...</p>;
  }

  // Show error state
  if (error) {
    return <p className="text-sm text-red-500">Failed to load rating</p>;
  }

  // Render stars based on average rating
  return (
    <div className="flex items-center gap-1 text-yellow-500">
      {[...Array(5)].map((_, i) => (
        <span key={i}>
          {i < Math.round(data.averageRating || 0) ? '★' : '☆'}
        </span>
      ))}
      <span className="text-gray-500 text-sm">({data.totalReviews})</span>
    </div>
  );
};

export default memo(Rating);