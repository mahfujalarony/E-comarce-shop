import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../ui/Button';
import { useQuery } from '@tanstack/react-query';
import Reviews from './Reviews';
import { useAuth } from '../auth/AuthContext';

interface Product {
  _id: string;
  name: string;
  price: number;
  oldPrice?: number;
  description: string;
  images: string[];
  discount: number;
  stars?: number;
  reviews?: number;
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
}

const fetchProductDetails = async (productId: string) => {
  try {
    const response = await axios.get(`http://localhost:3001/api/products/${productId}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch product details. Please try again later.');
  }
};

const fetchSimilarProducts = async (category: string, excludeId: string) => {
  try {
    const response = await axios.get(
      `http://localhost:3001/api/products?category=${category}&limit=4&exclude=${excludeId}`
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch similar products.');
  }
};

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const { authData } = useAuth();
  const userId = authData.userId;
  const userName = authData.name;

  // Fetch product details
  const { 
    data: product, 
    isLoading, 
    isError, 
    error 
  } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => fetchProductDetails(id || ''),
    enabled: !!id,
  });

  // Initialize selectedImage with the first image
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Fetch similar products
  const { data: similarProducts } = useQuery<SimilarProduct[]>({
    queryKey: ['similarProducts', product?.category, id],
    queryFn: () =>
      product?.category ? fetchSimilarProducts(product.category, id || '') : Promise.resolve([]),
    enabled: !!product?.category,
  });

  // Set initial values when product data is loaded
  useEffect(() => {
    if (product) {
      if (product.images?.length > 0 && !selectedImage) {
        setSelectedImage(product.images[0]);
      }
      if (product.colors?.length > 0 && !color) {
        setColor(product.colors[0]);
      }
      if (product.sizes?.length > 0 && !size) {
        setSize(product.sizes[0]);
      }
    }
  }, [product]);

  const handleProductNavigation = (productId: string) => {
    navigate(`/details/${productId}`);
    window.scrollTo(0, 0);
  };

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-10 text-red-500">Invalid product ID</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-10">Loading product details...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-10 text-red-500">
          Error: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-10">Product not found</div>
      </div>
    );
  }

  const discountedPrice = product.oldPrice
    ? Math.round(product.oldPrice * (1 - product.discount / 100))
    : product.price;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Main Product Section */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Image Gallery */}
        <div className="w-full lg:w-1/2">
          <div className="mb-4 bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={selectedImage || 'https://via.placeholder.com/400'}
              alt={product.name}
              className="w-full h-64 sm:h-80 md:h-96 object-contain"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(img)}
                className={`aspect-square overflow-hidden rounded-md border-2 ${
                  selectedImage === img ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${i}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2 space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {product.name}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-red-600">
              ${discountedPrice}
            </span>
            {product.oldPrice && (
              <span className="text-lg text-gray-500 line-through">
                ${product.oldPrice}
              </span>
            )}
            {product.discount > 0 && (
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm">
                -{product.discount}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i}>
                  {i < Math.floor(product.stars || 0) ? (
                    <span className="text-yellow-400">★</span>
                  ) : (
                    <span className="text-gray-300">☆</span>
                  )}
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-500">
              ({product.reviews || 0} reviews)
            </span>
          </div>
          <p className="text-gray-700">{product.description}</p>
          
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Color:</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      color === c ? 'ring-2 ring-blue-500' : 'border-gray-200'
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
              <h3 className="font-semibold">Size:</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSize(sz)}
                    className={`px-4 py-2 border rounded-md ${
                      size === sz
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-800'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            <h3 className="font-semibold">Quantity:</h3>
            <div className="flex items-center border rounded-md">
              <button
                className="px-3 py-1 text-lg"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-4 w-8 text-center">{quantity}</span>
              <button
                className="px-3 py-1 text-lg"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              className="flex-1 py-3"
              disabled={!product.inStock}
            >
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            <Button
              className="flex-1 py-3 bg-green-600 hover:bg-green-700"
              disabled={!product.inStock}
              onClick={() => navigate(`/details/payment/${product._id}?price=${product.price}&quantity=${quantity}`)}
            >
              Buy Now
            </Button>
          </div>
          
          <div className="space-y-2 pt-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span>✅</span>
              <span>Free Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span>🔁</span>
              <span>Free 30 Days Return</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span>ℹ️</span>
              <span>{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Section */}
      <section className="mt-16 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Product Details</h2>
        <p className="text-gray-700 whitespace-pre-line">
          {product.description}
        </p>
      </section>

      {/* Reviews Section */}
      <Reviews productId={id} currentUserId={userId} currentUserName={userName} />

      {/* Similar Products Section */}
      {similarProducts && similarProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold mb-6">Similar Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => handleProductNavigation(product._id)}
                className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-48 object-contain"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg truncate">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 mt-1">${product.price}</p>
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