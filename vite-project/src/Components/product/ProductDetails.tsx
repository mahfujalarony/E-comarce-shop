import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import { Button } from '../ui/Button';
import Reviews from './Reviews';
import Rating from '../ui/Rating';
import { useAuth } from '../auth/AuthContext';

import socket from '../../socket';

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
  category?: string;
}

interface SimilarProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  stars?: number;
}

const fetchProductDetails = async (productId: string): Promise<Product> => {
  try {
    const response = await axios.get(`http://localhost:3001/api/products/${productId}`);
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
      `http://localhost:3001/api/products?category=${category}&limit=4&exclude=${excludeId}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch similar products:', error);
    throw new Error('Failed to fetch similar products.');
  }
};

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authData } = useAuth();
  //const userId = authData?.userId || JSON.parse(localStorage.getItem('user'))._id;
  let userId = null;

    if (authData?.userId) {
      userId = authData.userId;
    } else {
      const localUser = localStorage.getItem('user');
      if (localUser) {
        try {
          userId = JSON.parse(localUser)?._id;
        } catch (err) {
          console.error("Invalid user data in localStorage");
        }
      }
    }


  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');

  const {
    data: product,
    isLoading,
    isError,
    error: productError,
  } = useQuery<Product, Error>({
    queryKey: ['product', id],
    queryFn: () => fetchProductDetails(id!),
    enabled: !!id,
  });

  const { data: similarProducts } = useQuery<SimilarProduct[], Error>({
    queryKey: ['similarProducts', product?.category, id],
    queryFn: () => fetchSimilarProducts(product?.category, id!),
    enabled: !!product?.category && !!id,
  });

  useEffect(() => {
    if (product) {
      if (product.images?.length > 0 && !selectedImage) {
        setSelectedImage(product.images[0]);
      }
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        setSelectedColor(product.colors[0]);
      }
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        setSelectedSize(product.sizes[0]);
      }
    }
  }, [product, selectedImage, selectedColor, selectedSize]);

  const handleProductNavigation = (productId: string) => {
    navigate(`/details/${productId}`);
    window.scrollTo(0, 0);
  };

const handleMessageButtonClick = () => {
  if (!userId) {
    alert('Please log in to send messages.');
    navigate('/login');
    return;
  }

  console.log('start_chat call korchi', { productId: id }); // Debug log

  socket.emit('start_chat', { productId: id });

  socket.once('chat_started', (conversation) => {
    console.log('Chat started:', conversation);
    navigate(`/messages/${conversation.chatId}`);
  });
};

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-10 text-red-500">Invalid product ID.</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading product details...</div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-10 text-red-500">
          Error: {productError?.message || 'Product not found or failed to load.'}
        </div>
      </div>
    );
  }

  const discountedPrice = product.oldPrice
    ? Math.round(product.oldPrice * (1 - (product.discount || 0) / 100))
    : product.price;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Main Product Section */}
      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        {/* Image Gallery */}
        <div className="w-full lg:w-1/2">
          <div className="mb-4 bg-white rounded-lg shadow-md overflow-hidden border">
            <img
              src={selectedImage || (product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/400x400.png?text=No+Image')}
              alt={product.name}
              className="w-full h-80 sm:h-96 md:h-[500px] object-contain p-2"
            />
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {product.images?.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(img)}
                className={`aspect-square overflow-hidden rounded-md border-2 transition-all ${
                  selectedImage === img ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2 space-y-5">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            {product.name}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-red-600">
              ${discountedPrice.toFixed(2)}
            </span>
            {product.oldPrice && (
              <span className="text-xl text-gray-500 line-through">
                ${product.oldPrice.toFixed(2)}
              </span>
            )}
            {product.discount > 0 && (
              <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-sm font-semibold">
                -{product.discount}% OFF
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Rating productId={product._id} initialRating={product.stars} totalReviews={product.totalReviews} />
          </div>
          <p className="text-gray-600 leading-relaxed">{product.description.substring(0, 200)}...</p>

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

          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Size: <span className="font-normal">{selectedSize}</span></h3>
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
            </div>
          )}

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

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              className="flex-1 py-3 text-base"
              disabled={!product.inStock}
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
              onClick={() => navigate(`/details/payment/${product._id}?price=${discountedPrice}&quantity=${quantity}&name=${encodeURIComponent(product.name)}&image=${encodeURIComponent(product.images[0])}`)}
            >
              Buy Now
            </Button>

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
            {similarProducts.map((simProd) => (
              <div
                key={simProd._id}
                onClick={() => handleProductNavigation(simProd._id)}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border"
              >
                <img
                  src={simProd.images[0] || 'https://via.placeholder.com/300x300.png?text=No+Image'}
                  alt={simProd.name}
                  className="w-full h-56 object-contain p-2"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg truncate text-gray-800 mb-1">
                    {simProd.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-red-600 font-bold text-lg">${simProd.price.toFixed(2)}</p>
                    {simProd.stars && <Rating productId={simProd._id} initialRating={simProd.stars} isSmall />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;