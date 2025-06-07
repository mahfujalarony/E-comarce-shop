import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { GoArrowRight } from 'react-icons/go';
import { useNavigate } from 'react-router-dom';
import { useQuery, useInfiniteQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Rating from '../ui/Rating';
//import { useAuth } from '../auth/AuthContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';


interface Product {
  _id: string;
  name: string;
  price: number;
  oldPrice?: number;
  description?: string;
  stars?: number;
  reviews?: number;
  size?: string;
  images: string[];
  discount?: number;
  category?: string;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

const queryClient = new QueryClient();

const fetchProducts = async ({ pageParam = 0 }) => {
  const response = await axios.get(`http://localhost:3001/api/products?limit=20&offset=${pageParam}`);
  //console.log('Fetched products:', response.data);
  return response.data;
};

const ProductList: React.FC = () => {



  const [timer, setTimer] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [cartLoading, setCartLoading] = useState<string | null>(null);
  const [showVerticalProducts, setShowVerticalProducts] = useState(false); // New state to control vertical products display
  const horizontalContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  //const { authData } = useAuth();
  //const token = authData.token || localStorage.getItem('token');


  // Timer Logic
  useEffect(() => {
    const targetDate = new Date('2025-05-20T23:59:59').getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance < 0) {
        setTimer({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimer({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Horizontal Products (initial 5)
  const { data: horizontalProducts = [], isLoading: horizontalLoading } = useQuery<Product[]>({
    queryKey: ['horizontalProducts'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3001/api/products?limit=8&offset=0');
      return response.data;
    },
  });

  // Vertical Products (infinite scroll, only fetched when button is clicked)
  const {
    data: verticalPages,
    fetchNextPage: fetchMoreVertical,
    hasNextPage: hasMoreVertical,
    isFetchingNextPage: verticalLoading,
    isLoading: verticalInitialLoading,
  } = useInfiniteQuery({
    queryKey: ['verticalProducts'],
    queryFn: fetchProducts,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length ? allPages.length * 20 : undefined;
    },
    enabled: showVerticalProducts, // Only fetch when showVerticalProducts is true
  });

  const verticalProducts = verticalPages?.pages.flat() || [];

  // Add to Cart Function
  const handleAddToCart = async (product: Product) => {
    setCartLoading(product._id);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        'http://localhost:3001/api/addwishlist',
        { productId: product._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.message) {
        alert(response.data.message);
      } else {
        alert(`${product.name} has been added to wishlist!`);
      }
    } catch (error: any) {
      if (error.response) {
        const errorMessage = error.response.data.message || 'Failed to add to cart. Please try again.';
        alert(errorMessage);
      } else if (error.request) {
        alert('No response received from server. Please check your network connection.');
      } else {
        alert('Error adding to cart: ' + error.message);
      }
    } finally {
      setCartLoading(null);
    }
  };

  const loadMoreHorizontal = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/products?limit=20&offset=${horizontalProducts.length}`
      );
      const newProducts = response.data;

      if (newProducts.length === 0) {
        alert('No more products available.');
        return;
      }

      queryClient.setQueryData(['horizontalProducts'], (old: Product[] | undefined) => {
        const existingIds = new Set(old?.map((p) => p._id));
        const uniqueNewProducts = newProducts.filter((p: Product) => !existingIds.has(p._id));
        return [...(old || []), ...uniqueNewProducts];
      });

      if (horizontalContainerRef.current) {
        horizontalContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error loading more products!', error);
    }
  };

  // Skeleton for Horizontal Products
  const renderHorizontalSkeleton = () => (
    <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="relative w-56 h-80 border rounded-lg flex-shrink-0">
          <Skeleton height={160} className="rounded-t-lg" />
          <div className="absolute top-2 left-2 h-6 w-16">
            <Skeleton />
          </div>
          <div className="p-4">
            <Skeleton height={24} width="80%" />
            <Skeleton height={20} width="60%" className="mt-2" />
            <Skeleton height={16} width="40%" className="mt-2" />
            <Skeleton height={36} width="100%" className="mt-4" />
          </div>
        </div>
      ))}
    </div>
  );

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
            <Skeleton height={24} width="80%" />
            <Skeleton height={20} width="60%" className="mt-2" />
            <Skeleton height={16} width="40%" className="mt-2" />
            <Skeleton height={36} width="100%" className="mt-4" />
          </div>
        </div>
      ))}
    </div>
  );

  // Function to handle "Load All Products" button click
  const handleLoadAllProducts = () => {
    setShowVerticalProducts(true);
  };

  const handleProductClick = (product: Product) => {
    navigate(`/details/${product._id}`);
  };

  if (horizontalLoading) {
    return (
      <div className="px-4 sm:px-8 md:px-16 py-10">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="h-7 w-3 bg-red-500"></div>
            <div className="text-red-500 font-semibold">Todays</div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between mt-5">
            <h1 className="text-2xl sm:text-3xl font-semibold flex-1">
              <Skeleton width={150} />
            </h1>
            <div className="flex space-x-4 sm:space-x-6 mt-4 sm:mt-0">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton width={50} />
                  <Skeleton width={30} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">
            <Skeleton width={150} />
          </h2>
          {renderHorizontalSkeleton()}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 md:px-16 py-10">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <div className="h-7 w-3 bg-red-500"></div>
          <div className="text-red-500 font-semibold">Todays</div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between mt-5">
          <h1 className="text-2xl sm:text-3xl font-semibold flex-1">Flash Sale</h1>
          <div className="flex space-x-4 sm:space-x-6 mt-4 sm:mt-0">
            <div className="text-center">
              <p className="text-sm">Days</p>
              <p className="font-bold">{timer.days.toString().padStart(2, '0')}</p>
            </div>
            <div className="text-center">
              <p className="text-sm">Hours</p>
              <p className="font-bold">{timer.hours.toString().padStart(2, '0')}</p>
            </div>
            <div className="text-center">
              <p className="text-sm">Minutes</p>
              <p className="font-bold">{timer.minutes.toString().padStart(2, '0')}</p>
            </div>
            <div className="text-center">
              <p className="text-sm">Seconds</p>
              <p className="font-bold">{timer.seconds.toString().padStart(2, '0')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Horizontal Products</h2>
          <button
            onClick={loadMoreHorizontal}
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
            disabled={horizontalLoading}
          >
            <GoArrowRight size={24} />
          </button>
        </div>
        {horizontalLoading ? (
          renderHorizontalSkeleton()
        ) : (
          <div
            ref={horizontalContainerRef}
            className="flex overflow-x-auto space-x-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300"
          >
            {horizontalProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => handleProductClick(product)}
                className="relative w-56 h-80 border rounded-lg flex-shrink-0 cursor-pointer"
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
                    className="mt-4 w-full py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={cartLoading === product._id}
                  >
                    {cartLoading === product._id ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Load All Products Button */}
      {!showVerticalProducts && (
        <div className="text-center mt-6">
          <button
            onClick={handleLoadAllProducts}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Load All Products
          </button>
        </div>
      )}

      {/* Vertical Grid Section */}
      {showVerticalProducts && (
        <div>
          <h2 className="text-xl font-semibold mb-4">All Products</h2>
          {verticalInitialLoading ? (
            renderVerticalSkeleton()
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {verticalProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => navigate(`/details/${product._id}`)}
                  className="relative w-full h-80 border rounded-lg cursor-pointer"
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
                      className="mt-4 w-full py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                      disabled={cartLoading === product._id}
                    >
                      {cartLoading === product._id ? 'Adding...' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasMoreVertical ? (
            <div className="text-center mt-6">
              <button
                onClick={() => fetchMoreVertical()}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={verticalLoading}
              >
                {verticalLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          ) : (
            <div className="text-center mt-6 text-gray-500">No more products</div>
          )}
        </div>
      )}
    </div>
  );
};

const Fetch = () => (
  <QueryClientProvider client={queryClient}>
    <ProductList />
  </QueryClientProvider>
);

export default Fetch;