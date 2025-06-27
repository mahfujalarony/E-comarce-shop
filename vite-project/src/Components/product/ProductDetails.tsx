import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import { Button } from '../ui/Button';
import Reviews from './Reviews';
import Rating from '../ui/Rating';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

//import { toast } from 'sonner';

import socket from '../../socket';
import NotFound from '../error/NotFound';

interface Product {
  _id: string;
  name: string;
  price: number;
  oldPrice?: number;
  description: string;
  images: string[];
  discount: number;
  stars?: number;
  totalReviews?: number;
  inStock: boolean;
  colors?: string[];
  sizes?: string[];
  size?: string; // single size field
  category?: string;
  brand?: string;
  weight?: number;
  tags?: string[]; // নতুন field
}

interface SimilarProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  stars?: number;
  discount?: number;
  oldPrice?: number;
}

const fetchProductDetails = async (productId: string): Promise<Product> => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch product details:', error);
    throw new Error('Failed to fetch product details. Please try again later.');
  }
};

const fetchSimilarProducts = async (category: string | undefined, excludeId: string): Promise<SimilarProduct[]> => {
  if (!category) return [];
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_API_URL}/api/products?category=${encodeURIComponent(category)}&limit=4&exclude=${excludeId}`
    );
    return response.data.products || response.data; // Handle different response formats
  } catch (error) {
    console.error('Failed to fetch similar products:', error);
    return []; // Return empty array instead of throwing error
  }
};

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authData } = useAuth();
  const [scrollPositions, setScrollPositions] = useState<Record<string, number>>({});


  
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

      if (response.data.message) {
        toast.success(response.data.message);
      } else {
        toast.error(`${'Product Add to Cart'}`);
      }
    } catch (error: any) {
      if (error.response) {
        const errorMessage = error.response.data.message || 'Failed to add to cart. Please try again.';
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error('No response received from server. Please check your network connection.');
      } else {
        toast.error(error.message);
      }
    } 
  };
  // save scroll position
  useEffect(() => {
    
    return () => {
      setScrollPositions(prev => ({
        ...prev,
        [location.pathname]: window.scrollY
      }));
    };
  }, [location]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const savedPosition = scrollPositions[location.pathname];
    if (savedPosition) {
      window.scrollTo(0, savedPosition);
    }
  }, [location, scrollPositions]);
  
  // Better user ID handling
  let userId = null;
  if (authData?.userId) {
    userId = authData.userId;
  } else {
    const localUser = localStorage.getItem('user');
    if (localUser) {
      try {
        const userData = JSON.parse(localUser);
        userId = userData?._id;
      } catch (err) {
        console.error("Invalid user data in localStorage");
      }
    }
  }

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isImageLoading, setIsImageLoading] = useState(true);

  const {
    data: product,
    isLoading,
    isError,
    //error: productError,
  } = useQuery<Product, Error>({
    queryKey: ['product', id],
    queryFn: () => fetchProductDetails(id!),
    enabled: !!id,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: similarProducts } = useQuery<SimilarProduct[], Error>({
    queryKey: ['similarProducts', product?.category, id],
    queryFn: () => fetchSimilarProducts(product?.category, id!),
    enabled: !!product?.category && !!id,
    retry: 1,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  useEffect(() => {
    if (product) {
      if (product.images?.length > 0 && !selectedImage) {
        setSelectedImage(product.images[0]);
      }
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        setSelectedColor(product.colors[0]);
      }
      // Handle both single size and sizes array
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        setSelectedSize(product.sizes[0]);
      } else if (product.size && !selectedSize) {
        setSelectedSize(product.size);
      }
    }
  }, [product, selectedImage, selectedColor, selectedSize]);

  const handleProductNavigation = (productId: string) => {
    navigate(`/details/${productId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

// ...existing code...
const handleMessageButtonClick = () => {
  if (!userId) {
    toast.info('Please login first');
    return;
  }

  console.log('Starting chat for product:', { productId: id });

  socket.emit('start_chat', { productId: id });

  socket.once('chat_started', (conversation) => {
    console.log('Chat started:', conversation);
    // Navbar-এর মতো state সহ পাঠানো হচ্ছে
    navigate(`/messages/${conversation.id}`, {
      state: { user: conversation.user, name: conversation.name },
    });
  });

  // Handle potential timeout
  setTimeout(() => {
    socket.off('chat_started');
  }, 10000);
};


  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://via.placeholder.com/400x400.png?text=Image+Not+Found';
    setIsImageLoading(false);
  };

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-10 text-red-500">
          <h2 className="text-2xl font-bold mb-2">Invalid Product</h2>
          <p>The product ID is missing or invalid.</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading product details...</div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      // <div className="min-h-screen flex items-center justify-center">
      //   <div className="text-center py-10 text-red-500">
      //     <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
      //     <p className="mb-4">{productError?.message || 'This product does not exist or failed to load.'}</p>
      //     <Button onClick={() => navigate('/')} className="mt-4">
      //       Go Home
      //     </Button>
      //   </div>
      // </div>

      <div>
        <NotFound />
      </div>
    );
  }

  // Calculate actual discounted price
  const actualPrice = product.oldPrice && product.discount > 0 
    ? product.oldPrice - (product.oldPrice * product.discount / 100)
    : product.price;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Main Product Section */}
      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        {/* Image Gallery */}
        <div className="w-full lg:w-1/2">
          <div className="mb-4 bg-white rounded-lg shadow-md overflow-hidden border">
            {isImageLoading && (
              <div className="w-full h-80 sm:h-96 md:h-[500px] bg-gray-200 animate-pulse flex items-center justify-center">
                <span className="text-gray-500">Loading...</span>
              </div>
            )}
            <img
              src={selectedImage || (product.images?.[0]) || 'https://via.placeholder.com/400x400.png?text=No+Image'}
              alt={product.name}
              className={`w-full h-80 sm:h-96 md:h-[500px] object-contain p-2 ${isImageLoading ? 'hidden' : 'block'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedImage(img);
                    setIsImageLoading(true);
                  }}
                  className={`aspect-square overflow-hidden rounded-md border-2 transition-all ${
                    selectedImage === img ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2 space-y-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
              {product.name}
            </h1>
            {product.brand && (
              <p className="text-lg text-gray-600">by <span className="font-semibold">{product.brand}</span></p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-3xl font-bold text-red-600">
              ৳{actualPrice.toLocaleString()}
            </span>
            {product.oldPrice && product.discount > 0 && (
              <>
                <span className="text-xl text-gray-500 line-through">
                  ৳{product.oldPrice.toLocaleString()}
                </span>
                <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-sm font-semibold">
                  -{product.discount}% OFF
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Rating productId={product._id} initialRating={product.stars} totalReviews={product.totalReviews} />
          </div>

          <p className="text-gray-600 leading-relaxed">
            {product.description.length > 200 
              ? `${product.description.substring(0, 200)}...` 
              : product.description
            }
          </p>

          {/* Product Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Color: <span className="font-normal">{selectedColor}</span></h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === c ? 'ring-2 ring-offset-1 ring-blue-500' : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {((product.sizes && product.sizes.length > 0) || product.size) && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Size: <span className="font-normal">{selectedSize}</span></h3>
              {product.sizes && product.sizes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-1.5 border rounded-md text-sm transition-colors ${
                        selectedSize === sz
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="px-4 py-1.5 bg-gray-100 text-gray-800 rounded-md text-sm">
                  {product.size}
                </span>
              )}
            </div>
          )}

          {/* Additional Info */}
          {(product.weight || product.category) && (
            <div className="space-y-1 text-sm text-gray-600">
              {product.category && <p><span className="font-semibold">Category:</span> {product.category}</p>}
              {product.weight && <p><span className="font-semibold">Weight:</span> {product.weight}g</p>}
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-gray-700">Quantity:</h3>
            <div className="flex items-center border rounded-md overflow-hidden">
              <button
                className="px-3 py-1.5 text-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-5 py-1.5 w-12 text-center text-gray-800 font-medium">{quantity}</span>
              <button
                className="px-3 py-1.5 text-lg text-gray-700 hover:bg-gray-100"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              className="flex-1 py-3 text-base"
              disabled={!product.inStock}
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}
            >
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            <Button
              onClick={handleMessageButtonClick}
              variant="outline"
              className="flex-1 py-3 text-base"
            >
              Message Us
            </Button>
          </div>
          
          <Button
            className="w-full py-3 text-base bg-green-600 hover:bg-green-700"
            disabled={!product.inStock}
            onClick={() => {
              if(localStorage.getItem('token') === null) {
                toast.info('Please login first');
              } else {
                navigate(`/details/payment/${product._id}?price=${actualPrice}&quantity=${quantity}&name=${encodeURIComponent(product.name)}&image=${encodeURIComponent(product.images[0])}`);
              }
            }}
          >
            Buy Now
          </Button>

          {/* Features */}
          <div className="space-y-1 pt-3 text-sm text-gray-600">
            <p>✓ Free Delivery</p>
            <p>✓ Free 30 Days Return</p>
            <p>{product.inStock ? '✓ In Stock' : '✗ Out of Stock'}</p>
          </div>
        </div>
      </div>

      {/* Product Full Description Section */}
      <section className="my-12 bg-white rounded-lg shadow-sm p-6 border">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Product Details</h2>
        <div className="prose max-w-none text-gray-700 whitespace-pre-line">
          {product.description}
        </div>
      </section>

      {/* Reviews Section */}
      <Reviews productId={product._id} currentUserId={userId || ''} currentUserName={authData?.name || ''} />

      {/* Similar Products Section */}
      {similarProducts && similarProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarProducts.map((simProd) => {
              const simActualPrice = simProd.oldPrice && simProd.discount 
                ? simProd.oldPrice - (simProd.oldPrice * simProd.discount / 100)
                : simProd.price;
              
              return (
                <div
                  key={simProd._id}
                  onClick={() => handleProductNavigation(simProd._id)}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border"
                >
                  <img
                    src={simProd.images[0] || 'https://via.placeholder.com/300x300.png?text=No+Image'}
                    alt={simProd.name}
                    className="w-full h-56 object-contain p-2"
                    onError={handleImageError}
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg truncate text-gray-800 mb-1">
                      {simProd.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-red-600 font-bold text-lg">৳{simActualPrice.toLocaleString()}</p>
                        {simProd.oldPrice && simProd.discount && (
                          <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                            -{simProd.discount}%
                          </span>
                        )}
                      </div>
                      {simProd.stars && <Rating productId={simProd._id} initialRating={simProd.stars} isSmall />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;