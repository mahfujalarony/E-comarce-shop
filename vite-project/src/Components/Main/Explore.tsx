import React from 'react';
import { GoArrowRight, GoArrowLeft } from 'react-icons/go';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  const response = await axios.get(`http://localhost:3001/api/products?limit=20&offset=${pageParam}`);
  return response.data;
};

const Explore: React.FC = () => {
  const navigate = useNavigate();
  
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
  });

  const products = data?.pages.flat() || [];

  const handleProductClick = (productId: string) => {
    navigate(`/details/${productId}`);
  };

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
          <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
            <GoArrowLeft />
          </button>
          <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
            <GoArrowRight />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading products...</div>
      ) : isError ? (
        <div className="text-center py-10 text-red-500">
          Error: {error.message}
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-xl font-semibold mb-4">All Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((product: Product) => (
                <div 
                  key={product._id} 
                  onClick={() => handleProductClick(product._id)}
                  className="relative w-full h-72 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
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
                    <div className="flex items-center space-x-1">
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
          </div>

          {hasNextPage ? (
            <div className="text-center mt-6">
              <button
                onClick={() => fetchNextPage()}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More'}
              </button>
            </div>
          ) : (
            <div className="text-center mt-6 text-gray-500">No more products available</div>
          )}
        </>
      )}
    </div>
  );
};

export default Explore;