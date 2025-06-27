import React, { useEffect, useState } from 'react';
import { GoArrowRight, GoArrowLeft } from 'react-icons/go';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Rating from '../ui/Rating';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast } from 'react-toastify';

type Product = {
  _id: string;
  name: string;
  price: number;
  oldPrice?: number;
  discount: number;
  images: string[];
  stars?: number;
  reviews?: number;
};

const fetchProducts = async ({ pageParam = 0 }) => {
  const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/products?limit=20&offset=${pageParam}`);
  return response.data;
};

const Explore: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [scrollPosition, setScrollPosition] = useState(0);

  // Page load হওয়ার সময় scroll position restore করুন
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('exploreScrollPosition');
    
    if (savedScrollPosition) {
      setScrollPosition(parseInt(savedScrollPosition));
    }
  }, []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['exploreProducts'],
    queryFn: fetchProducts,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length ? allPages.length * 20 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });

  const products = data?.pages.flat() || [];

  // Products load হওয়ার পর scroll position restore করুন
  useEffect(() => {
    if (products.length > 0 && scrollPosition > 0) {
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
        sessionStorage.removeItem('exploreScrollPosition'); // restore করার পর remove করুন
        setScrollPosition(0);
      }, 100);
    }
  }, [products.length, scrollPosition]);

  const handleProductClick = (productId: string) => {
    // Current scroll position save করুন
    const currentScrollPosition = window.pageYOffset;
    sessionStorage.setItem('exploreScrollPosition', currentScrollPosition.toString());
    
    navigate(`/details/${productId}`);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.info('Please login first');
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/api/addwishlist`,
        { productId: product._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Always show backend message
      if (response.data?.success) {
        toast.success(response.data.message || 'Product added to wishlist.');
      } else {
        toast.error(response.data.message || 'Failed to add to wishlist.');
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data?.message || 'Failed to add to wishlist.');
      } else if (error.request) {
        toast.error('No response received from server. Please check your network connection.');
      } else {
        toast.error(error.message);
      }
    }
  };

  // Manual refresh function (optional)
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['exploreProducts'] });
    sessionStorage.removeItem('exploreScrollPosition');
    window.scrollTo(0, 0);
  };

  // Navigation functions for arrow buttons (optional enhancement)
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  // Skeleton for Vertical Products
  const renderVerticalSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="relative w-full h-80 border rounded-lg">
          <Skeleton height={160} className="rounded-t-lg" />
          <div className="absolute top-2 left-2 h-6 w-16">
            <Skeleton />
          </div>
          <div className="p-4">
            <Skeleton height={20} width="80%" />
            <Skeleton height={18} width="60%" className="mt-2" />
            <Skeleton height={16} width="40%" className="mt-2" />
            <Skeleton height={36} width="100%" className="mt-4" />
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="px-4 sm:px-8 md:px-16 lg:px-20 mt-20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center space-x-4">
              <Skeleton width={12} height={28} />
              <Skeleton width={100} />
            </div>
            <Skeleton width={200} height={30} className="mt-4" />
          </div>
          <div className="flex space-x-3">
            <Skeleton width={40} height={40} className="rounded-full" />
            <Skeleton width={40} height={40} className="rounded-full" />
          </div>
        </div>
        <div>
          <Skeleton width={100} height={20} className="mb-4" />
          {renderVerticalSkeleton()}
        </div>
        <div className="text-center mt-6">
          <Skeleton width={120} height={36} className="rounded" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-500">
        <p>Error: {error.message}</p>
        <button 
          onClick={handleRefresh}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-20 mt-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center space-x-4">
            <div className="h-7 w-3 bg-red-500"></div>
            <div className="text-red-500 font-semibold">Featured</div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold mt-4">New Arrival</h1>
        </div>
        <div className="flex space-x-3 text-xl">
          <button 
            onClick={scrollToTop}
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
            title="Scroll to top"
          >
            <GoArrowLeft />
          </button>
          <button 
            onClick={scrollToBottom}
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
            title="Scroll to bottom"
          >
            <GoArrowRight />
          </button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">All Products</h2>
          {/* Optional refresh button */}
          <button 
            onClick={handleRefresh}
            className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
          >
            Refresh
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product: Product) => (
            <div
              key={product._id}
              onClick={() => handleProductClick(product._id)}
              className="relative w-full h-80 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-40 object-cover rounded-t-lg"
              />
              <div className="absolute top-2 left-2 h-6 flex items-center justify-center w-16 bg-red-500 text-white text-sm rounded-sm">
                -{product.discount}%
              </div>
              <div className="p-4">
                <h1 className="font-semibold text-lg truncate">{product.name}</h1>
                <div className="flex space-x-3 items-center">
                  <p className="text-lg font-bold">৳{product.price}</p>
                  {product.oldPrice && (
                    <p className="text-sm text-red-400 line-through">৳{product.oldPrice}</p>
                  )}
                </div>
                <Rating productId={product._id} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  className="hover:scale-x-95 mt-4 w-full py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-transform"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {hasNextPage ? (
        <div className="text-center mt-6">
          <button
            onClick={() => fetchNextPage()}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </button>
        </div>
      ) : (
        <div className="text-center mt-6 text-gray-500">No more products available</div>
      )}
    </div>
  );
};

export default Explore;