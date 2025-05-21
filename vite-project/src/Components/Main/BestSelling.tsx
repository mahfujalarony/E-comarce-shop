import React, { useRef } from 'react';
import { GoArrowRight } from 'react-icons/go';
import { useQuery, useInfiniteQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

const API_URL = 'http://localhost:3001/api/products';

const BestSellingComponent: React.FC = () => {
  const navigate = useNavigate();
  const horizontalContainerRef = useRef<HTMLDivElement>(null);

  // Horizontal Products Query
  const {
    data: horizontalProducts = [],
    fetchNextPage: fetchMoreHorizontal,
    hasNextPage: hasMoreHorizontal,
    isFetchingNextPage: horizontalLoading,
    isLoading: horizontalInitialLoading,
    error: horizontalError,
  } = useInfiniteQuery({
    queryKey: ['bestSellingHorizontal'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await axios.get(`${API_URL}?limit=5&offset=${pageParam}`);
      return response.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length ? allPages.length * 5 : undefined;
    },
  });

  const flattenedHorizontalProducts = horizontalProducts.pages?.flat() || [];

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
    navigate(`/details/${productId}`);
  };

  if (horizontalInitialLoading) {
    return <div className="text-center py-10">Loading best selling products...</div>;
  }

  if (horizontalError) {
    return <div className="text-center py-10 text-red-500">Error loading products</div>;
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
        <button
          onClick={handleViewMore}
          className="mt-6 sm:mt-0 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          disabled={horizontalLoading}
        >
          {horizontalLoading ? 'Loading...' : 'View More'}
        </button>
      </div>

      {/* Products */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Top Picks</h2>
          <button
            onClick={loadMoreHorizontal}
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
            disabled={horizontalLoading}
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
              className="relative w-56 h-72 border rounded-lg flex-shrink-0 bg-white cursor-pointer hover:shadow-lg transition-shadow"
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
                <div className="flex items-center space-x-1 mt-1">
                  {[...Array(5)].map((_, index) => (
                    <span key={index}>
                      {index < Math.floor(product.stars || 0) ? (
                        <span className="text-yellow-400">★</span>
                      ) : (
                        <span className="text-gray-300">☆</span>
                      )}
                    </span>
                  ))}
                  <span className="text-sm">({product.reviews || 0})</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {horizontalLoading && <div className="text-center py-4">Loading more products...</div>}
      </div>

      <div className="bg-black flex flex-col-reverse md:flex-row h-auto md:h-[100vh]">
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
                className="h-20 w-20 flex flex-col justify-center items-center font-semibold bg-white text-black rounded-full"
              >
                <p className="text-lg">{item.value}</p>
                <p className="text-sm">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Button */}
          <button className="bg-[#00FF66] text-black w-32 md:w-36 h-12 md:h-16 rounded-md hover:scale-95 transition duration-200 flex justify-center items-center">
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