import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Rating from '../ui/Rating';
import { ShoppingCart, MessageCircle, Grid, List } from 'lucide-react';
import socket from '../../socket'; 
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';


interface Product {
  _id: string;
  name: string;
  price: number;
  oldPrice?: number;
  description?: string;
  brand?: string;
  weight?: number;
  size?: string;
  images: string[];
  tags: string[];
  discount?: number;
  category?: string;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SearchResponse {
  products: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
  suggestions?: string[];
}

const PAGE_SIZE = 20;

const fetchSearchResults = async (query: string, page: number, sortBy: string = 'relevance', category: string = ''): Promise<SearchResponse> => {
  const url = `${import.meta.env.VITE_APP_API_URL}/api/products/search?q=${encodeURIComponent(query)}&page=${page}&limit=${PAGE_SIZE}&sort=${sortBy}&category=${category}`;
  const res = await axios.get(url);
  return res.data;
};

const SearchResultPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const sortBy = searchParams.get('sort') || 'relevance';
  const category = searchParams.get('category') || '';
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  
  const { authData } = useAuth?.() || {};
  let userId = null;
  if (authData?.userId) {
    userId = authData.userId;
  } else {
    const localUser = localStorage.getItem('user');
    if (localUser) {
      try {
        userId = JSON.parse(localUser).userId;
      } catch {}
    }
  }
    const handleAddToCart = async (product: Product) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.info('Please log in First');
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

      if (response.data.message) {
        toast.success(response.data.message);
      } else {
        toast.success(`${product.name} has been added to wishlist!`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleMessageClick = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    if (!userId) {
      toast.info('Please log in to start a chat');
      return;
    }
    socket.emit('start_chat', { productId });

    socket.once('chat_started', (conversation) => {
      if (conversation && conversation.id) {
        navigate(`/messages/${conversation.id}`, {
          state: { user: conversation.user, name: conversation.name },
        });
      } else {
        alert('Could not start chat. Please try again.');
      }
    });

    setTimeout(() => {
      socket.off('chat_started');
    }, 10000);
  };

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<SearchResponse, Error>({
    queryKey: ['search', query, page, sortBy, category],
    queryFn: () => fetchSearchResults(query, page, sortBy, category),
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const products = data?.products || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || Math.ceil(total / PAGE_SIZE);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (productId: string) => {
    navigate(`/details/${productId}`);
  };



  // Loading Skeleton Components
  const GridSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
          <Skeleton height={200} className="rounded-lg mb-3" />
          <Skeleton height={20} className="mb-2" />
          <Skeleton height={16} width="60%" className="mb-2" />
          <Skeleton height={16} width="40%" className="mb-3" />
          <Skeleton height={24} width="80%" className="mb-4" />
          <div className="flex gap-2">
            <Skeleton height={36} className="flex-1" />
            <Skeleton height={36} width={48} />
          </div>
        </div>
      ))}
    </div>
  );

  const ListSkeleton = () => (
    <div className="space-y-4 md:space-y-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
            <Skeleton height={160} width={160} className="flex-shrink-0 rounded-lg" />
            <div className="flex-1">
              <Skeleton height={24} className="mb-3" />
              <Skeleton height={16} width="30%" className="mb-2" />
              <Skeleton height={16} width="40%" className="mb-3" />
              <Skeleton height={48} className="mb-4" />
              <Skeleton height={32} width="50%" className="mb-4" />
              <div className="flex gap-3">
                <Skeleton height={44} width={120} />
                <Skeleton height={44} width={120} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

const renderGridView = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
    {products.map((product: Product) => (
      <div 
        key={product._id} 
        className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 group cursor-pointer flex flex-col h-full"
        onClick={() => handleProductClick(product._id)}
      >
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product.images?.[0] || '/placeholder-product.png'}
            alt={product.name}
            className="w-full h-48 sm:h-52 md:h-56 object-cover transition-transform duration-300"
          />
          {product.discount && product.discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{product.discount}%
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="text-white font-bold text-sm">Out of Stock</span>
            </div>
          )}
        </div>
        
        <div className="p-3 md:p-4 flex flex-col flex-1">
          <h3 className="font-medium text-sm md:text-base text-gray-800 line-clamp-2 mb-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          
          {product.brand && (
            <p className="text-xs text-gray-500 mb-2 font-medium">{product.brand}</p>
          )}
          
          <div className="mb-3">
            <Rating productId={product._id} />
          </div>
          
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="font-bold text-lg md:text-xl text-red-600">৳{product.price.toLocaleString()}</span>
            {product.oldPrice && (
              <span className="text-sm text-gray-400 line-through">৳{product.oldPrice.toLocaleString()}</span>
            )}
          </div>
          
          {/* Buttons container - এই অংশটা সবচেয়ে গুরুত্বপূর্ণ */}
          <div className="mt-auto">
            <div className="flex gap-2">
              <button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm py-2.5 px-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[36px]"
                onClick={(e) => handleMessageClick(e, product._id)}
                disabled={!product.inStock}
              >
                <MessageCircle size={14} className="mr-1" />
                Message
              </button>
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs md:text-sm py-2.5 px-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[36px] min-w-[48px]"
                disabled={!product.inStock}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
              >
                <ShoppingCart size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

  const renderListView = () => (
    <div className="space-y-4 md:space-y-6">
      {products.map((product: Product) => (
        <div 
          key={product._id} 
          className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200 p-4 md:p-6 group cursor-pointer"
          onClick={() => handleProductClick(product._id)}
        >
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
            <div className="relative flex-shrink-0">
              <img
                src={product.images?.[0] || '/placeholder-product.png'}
                alt={product.name}
                className="w-full sm:w-32 md:w-40 h-48 sm:h-32 md:h-40 object-cover rounded-lg  transition-transform duration-300"
              />
              {product.discount && product.discount > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  -{product.discount}%
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg md:text-xl text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
              
              {product.brand && (
                <p className="text-sm text-gray-600 mb-2">Brand: <span className="font-medium">{product.brand}</span></p>
              )}
              
              <Rating productId={product._id} />
              
              <p className="text-sm text-gray-600 mt-3 line-clamp-3 md:line-clamp-2">
                {product.description || 'No description available'}
              </p>
              
              <div className="flex items-center gap-3 mt-4">
                <span className="font-bold text-xl md:text-2xl text-red-600">৳{product.price.toLocaleString()}</span>
                {product.oldPrice && (
                  <span className="text-lg text-gray-400 line-through">৳{product.oldPrice.toLocaleString()}</span>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  onClick={(e) => handleMessageClick(e, product._id)}
                  disabled={!product.inStock}
                >
                  <MessageCircle size={16} className="inline mr-2" />
                  Message
                </button>
                <button
                  className="border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white text-xs md:text-sm py-2.5 px-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[36px] min-w-[48px]"
                  disabled={!product.inStock}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                >
                  <ShoppingCart size={16} className="inline  mr-2" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Search for something</h2>
          <p className="text-gray-500">Type in the search box to find your favorite products</p>
        </div>
      </div>
    );
  }

  return (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-6">
          {/* Search Header */}
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                {isLoading ? (
                  <>
                    <Skeleton height={32} width="60%" className="mb-2" />
                    <Skeleton height={20} width="40%" />
                  </>
                ) : (
                  <>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                      Search results for "{query}"
                    </h1>
                    {total > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        {total.toLocaleString()} products found (Page {page} of {totalPages})
                      </p>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-3 md:gap-4">
                {/* View Toggle */}
                <div className="flex border rounded-lg overflow-hidden shadow-sm">
                  <button
                    className={`p-2 md:p-3 transition-colors duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    className={`p-2 md:p-3 transition-colors duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          {isLoading || isFetching ? (
            viewMode === 'grid' ? <GridSkeleton /> : <ListSkeleton />
          ) : isError ? (
            <div className="text-center py-20">
              <div className="text-red-500 text-lg font-semibold mb-2">Something went wrong</div>
              <p className="text-gray-600">
                {error instanceof Error ? error.message : 'Could not fetch data from server.'}
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-500 text-lg font-semibold mb-2">No products found</div>
              <p className="text-gray-400">Try searching with different keywords</p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? renderGridView() : renderListView()}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 bg-white rounded-lg shadow-sm p-4 md:p-6">
                  <button
                    className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    ← Previous
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex gap-1 md:gap-2 overflow-x-auto">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          className={`px-3 md:px-4 py-2 md:py-3 rounded-lg transition-colors duration-200 font-medium min-w-[44px] ${
                            pageNum === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                    disabled={page >= totalPages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default SearchResultPage;