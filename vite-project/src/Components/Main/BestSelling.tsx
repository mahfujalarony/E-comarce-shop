import React, { useRef, useEffect, useState } from 'react';
import { GoArrowRight } from 'react-icons/go';
import { useInfiniteQuery, QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Rating from '../ui/Rating';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast } from 'react-toastify';

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  oldPrice?: number;
  discount: number;
  stars?: number;
  reviews?: number;
}

const queryClient = new QueryClient();

const API_URL = `${import.meta.env.VITE_APP_API_URL}/api/products`;

const BestSellingComponent: React.FC = () => {
  const navigate = useNavigate();
  const queryClientInstance = useQueryClient();
  const horizontalContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [horizontalScrollPosition, setHorizontalScrollPosition] = useState(0);

  // State এবং scroll positions restore করুন
  useEffect(() => {
    const savedPageScroll = sessionStorage.getItem('bestSellingPageScrollPosition');
    const savedHorizontalScroll = sessionStorage.getItem('bestSellingHorizontalScrollPosition');
    
    if (savedPageScroll) {
      setScrollPosition(parseInt(savedPageScroll));
    }
    
    if (savedHorizontalScroll) {
      setHorizontalScrollPosition(parseInt(savedHorizontalScroll));
    }
  }, []);

  // Horizontal Products Query
  const {
    data: horizontalProducts,
    fetchNextPage: fetchMoreHorizontal,
    isFetchingNextPage: horizontalLoading,
    isLoading: horizontalInitialLoading,
    error: horizontalError,
  } = useInfiniteQuery({
    queryKey: ['bestSellingHorizontal'],
    queryFn: async ({ pageParam = 0 }: { pageParam?: number }) => {
      const response = await axios.get(`${API_URL}?limit=8&offset=${pageParam}`);
      return response.data as Product[];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length ? allPages.length * 8 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });

  const flattenedHorizontalProducts = horizontalProducts?.pages?.flat() || [];

  // Page scroll position restore করুন
  useEffect(() => {
    if (flattenedHorizontalProducts.length > 0 && scrollPosition > 0) {
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
        sessionStorage.removeItem('bestSellingPageScrollPosition');
        setScrollPosition(0);
      }, 100);
    }
  }, [flattenedHorizontalProducts.length, scrollPosition]);

  // Horizontal scroll position restore করুন
  useEffect(() => {
    if (flattenedHorizontalProducts.length > 0 && horizontalScrollPosition > 0 && horizontalContainerRef.current) {
      setTimeout(() => {
        if (horizontalContainerRef.current) {
          horizontalContainerRef.current.scrollLeft = horizontalScrollPosition;
          sessionStorage.removeItem('bestSellingHorizontalScrollPosition');
          setHorizontalScrollPosition(0);
        }
      }, 100);
    }
  }, [flattenedHorizontalProducts.length, horizontalScrollPosition]);

  const loadMoreHorizontal = async () => {
    await fetchMoreHorizontal();
    if (horizontalContainerRef.current) {
      horizontalContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleViewMore = () => {
    loadMoreHorizontal();
  };

  const handleProductClick = (productId: string) => {
    // Page scroll position save করুন
    const currentScrollPosition = window.pageYOffset;
    sessionStorage.setItem('bestSellingPageScrollPosition', currentScrollPosition.toString());
    
    // Horizontal scroll position save করুন
    if (horizontalContainerRef.current) {
      sessionStorage.setItem('bestSellingHorizontalScrollPosition', horizontalContainerRef.current.scrollLeft.toString());
    }
    
    navigate(`/details/${productId}`);
  };

  // Add to Cart Function
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
    queryClientInstance.invalidateQueries({ queryKey: ['bestSellingHorizontal'] });
    sessionStorage.removeItem('bestSellingPageScrollPosition');
    sessionStorage.removeItem('bestSellingHorizontalScrollPosition');
    window.scrollTo(0, 0);
    if (horizontalContainerRef.current) {
      horizontalContainerRef.current.scrollLeft = 0;
    }
  };

  // Skeleton for Horizontal Products
  const renderHorizontalSkeleton = () => (
    <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="relative w-56 h-80 border rounded-lg flex-shrink-0 bg-white"
        >
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

  if (horizontalInitialLoading) {
    return (
      <div className="px-4 sm:px-10 md:px-20">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="w-full sm:w-auto">
            <div className="flex items-center space-x-4">
              <Skeleton width={12} height={28} />
              <Skeleton width={100} className="ml-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold mt-4">
              <Skeleton width={200} />
            </h1>
            <Skeleton width={120} height={40} className="mt-6 sm:mt-0" />
          </div>
        </div>
        {/* Products Skeleton */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              <Skeleton width={100} />
            </h2>
            <Skeleton width={40} height={40} className="rounded-full" />
          </div>
          {renderHorizontalSkeleton()}
        </div>
        {/* Banner Section Skeleton */}
        <div className="bg-gray-200 flex flex-col-reverse md:flex-row h-auto md:h-[100vh]">
          <div className="flex-1 space-y-8 flex flex-col justify-center items-start px-6 md:px-10 py-10 md:py-0">
            <Skeleton width={80} height={20} />
            <Skeleton count={2} width={300} height={30} />
            <div className="flex flex-wrap gap-4 md:space-x-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} width={80} height={80} circle />
              ))}
            </div>
            <Skeleton width={140} height={40} className="rounded-md" />
          </div>
          <div className="flex-1 h-[300px] md:h-auto">
            <Skeleton height="100%" />
          </div>
        </div>
      </div>
    );
  }

  if (horizontalError) {
    return (
      <div className="text-center py-10 text-red-500">
        <p>Error loading products</p>
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
    <div className="px-4 sm:px-10 md:px-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <div className="w-full sm:w-auto">
          <div className="flex items-center space-x-4">
            <div className="h-7 w-3 bg-red-500"></div>
            <div className="text-red-500 font-semibold">This Month</div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold mt-4">
            Best Selling Products
          </h1>
        </div>
        <div className="flex gap-2 mt-6 sm:mt-0">
          <button
            onClick={handleViewMore}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            disabled={horizontalLoading}
          >
            {horizontalLoading ? 'Loading...' : 'View More'}
          </button>
          {/* Optional refresh button */}
          <button
            onClick={handleRefresh}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            title="Refresh products"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Products */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Top Picks</h2>
          <button
            onClick={loadMoreHorizontal}
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            disabled={horizontalLoading}
            title="Load more products"
          >
            <GoArrowRight size={24} />
          </button>
        </div>

        <div
          ref={horizontalContainerRef}
          className="flex overflow-x-auto space-x-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300"
        >
          {flattenedHorizontalProducts.map((product) => (
            <div
              key={product._id}
              onClick={() => handleProductClick(product._id)}
              className="relative w-56 h-80 border rounded-lg flex-shrink-0 bg-white cursor-pointer hover:shadow-lg transition-shadow"
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-40 object-cover rounded-t-lg"
              />
              <div className="absolute top-2 left-2 h-6 w-16 flex items-center justify-center bg-red-500 text-white text-sm rounded-sm">
                -{product.discount}%
              </div>
              <div className="p-4">
                <h1 className="font-semibold text-base truncate">{product.name}</h1>
                <div className="flex space-x-2 items-center mt-1">
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
                  className="hover:scale-95 mt-4 w-full py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-all"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {horizontalLoading && (
          <div className="text-center py-4 text-gray-600">
            Loading more products...
          </div>
        )}
      </div>

      {/* Banner Section */}
      <div className="bg-black flex flex-col-reverse md:flex-row h-auto md:h-[100vh] rounded-lg overflow-hidden">
        {/* Text section */}
        <div className="text-white flex-1 space-y-8 flex flex-col justify-center items-start px-6 md:px-10 py-10 md:py-0">
          <p className="text-[#00FF66] text-sm md:text-base">Categories</p>
          <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-semibold leading-snug">
            Enhance Your <br /> Music Experience
          </h1>

          {/* Countdown */}
          <div className="flex flex-wrap gap-4 md:space-x-6">
            {[
              { value: "23", label: "Hours" },
              { value: "05", label: "Days" },
              { value: "59", label: "Minutes" },
              { value: "35", label: "Seconds" },
            ].map((item, index) => (
              <div
                key={index}
                className="h-20 w-20 flex flex-col justify-center items-center font-semibold bg-white text-black rounded-full hover:scale-105 transition-transform"
              >
                <p className="text-lg">{item.value}</p>
                <p className="text-sm">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Button */}
          <button className="bg-[#00FF66] text-black w-32 md:w-36 h-12 md:h-16 rounded-md hover:scale-95 transition duration-200 flex justify-center items-center font-semibold">
            Buy Now
          </button>
        </div>

        {/* Image section */}
        <div
          className="flex-1 bg-no-repeat bg-center bg-contain h-[300px] md:h-auto"
          style={{ backgroundImage: "url(/figma/hadphone.svg)" }}
        ></div>
      </div>
    </div>
  );
};

const BestSelling = () => (
  <QueryClientProvider client={queryClient}>
    <BestSellingComponent />
  </QueryClientProvider>
);

export default BestSelling;