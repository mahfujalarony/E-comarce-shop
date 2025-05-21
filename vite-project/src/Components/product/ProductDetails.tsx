import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../ui/Button';
import { useQuery } from '@tanstack/react-query';

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
  const response = await axios.get(`http://localhost:3001/api/products/${productId}`);
  return response.data;
};

const fetchSimilarProducts = async (category: string, excludeId: string) => {
  const response = await axios.get(
    `http://localhost:3001/api/products?category=${category}&limit=4&exclude=${excludeId}`
  );
  return response.data;
};

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);

  const { data: product, isLoading, isError, error } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => fetchProductDetails(id || ''),
    enabled: !!id,
  });

  const { data: similarProducts } = useQuery<SimilarProduct[]>({
    queryKey: ['similarProducts', product?.category, id],
    queryFn: () => 
      product?.category ? fetchSimilarProducts(product.category, id || '') : [],
    enabled: !!product?.category,
  });

  useEffect(() => {
    if (product?.images?.length) {
      setSelectedImage(product.images[0]);
    }
    if (product?.colors?.length) {
      setColor(product.colors[0]);
    }
    if (product?.sizes?.length) {
      setSize(product.sizes[0]);
    }
  }, [product]);

  const handleProductNavigation = (productId: string) => {
    navigate(`/details/${productId}`);
    window.scrollTo(0, 0);
  };

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
          Error: {error.message}
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
        {/* Image Gallery - Mobile First */}
        <div className="w-full lg:w-1/2">
          {/* Main Image */}
          <div className="mb-4 bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-64 sm:h-80 md:h-96 object-contain"
            />
          </div>
          
          {/* Thumbnail Grid */}
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

          {/* Price Section */}
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

          {/* Rating */}
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

          {/* Description */}
          <p className="text-gray-700">{product.description}</p>

          {/* Color Selection */}
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

          {/* Size Selection */}
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

          {/* Quantity Selector */}
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

          {/* Action Buttons */}
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
            >
              Buy Now
            </Button>
          </div>

          {/* Delivery Info */}
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

      {/* Reviews Section */}
      <section className="mt-16 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6">Customer Reviews</h2>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="border-b border-gray-200 pb-4 mb-4 last:border-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-300"></div>
              <span className="font-medium">User {index + 1}</span>
            </div>
            <div className="flex mb-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
            </div>
            <p className="text-gray-700">
              This product is amazing! The quality exceeded my expectations.
            </p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default ProductDetails;