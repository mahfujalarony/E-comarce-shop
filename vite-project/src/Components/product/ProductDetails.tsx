import React, { useState } from 'react';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { FiMinus, FiPlus } from 'react-icons/fi';

// পণ্যের ডেটা (আপাতত স্ট্যাটিক)
const product = {
  name: 'Havic HV G-92 Gamepad',
  price: 192.00,
  description: 'PlayStation 5 Controller Skin High quality vinyl with air channel adhesive for easy bubble free install & mess free removal. Pressure sensitive.',
  colors: ['#000000', '#ffffff', '#007bff'], // উদাহরণস্বরূপ রং
  sizes: ['XS', 'S', 'M', 'L', 'XL'],
  images: [
    '/images/havic-g92-1.webp',
    '/images/havic-g92-2.webp',
    '/images/havic-g92-3.webp',
    '/images/havic-g92-4.webp',
  ],
};

const ProductDetails: React.FC = () => {
  const [mainImage, setMainImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleQuantityChange = (type: 'inc' | 'dec') => {
    if (type === 'inc') {
      setQuantity((prev) => prev + 1);
    } else if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  const handleWishlistToggle = () => {
    setIsWishlisted((prev) => !prev);
  };

  return (
    <div className="bg-white py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* বাম অংশ - ছবি গ্যালারি এবং প্রধান ছবি */}
        <div className="flex flex-col">
          <div className="flex space-x-2 mb-4">
            {product.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Product thumbnail ${index + 1}`}
                className="w-20 h-20 object-cover cursor-pointer rounded-md border border-gray-200"
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
          <div className="rounded-md overflow-hidden border border-gray-200">
            <img src={mainImage} alt="Main product image" className="w-full h-auto object-cover" />
          </div>
        </div>

        {/* ডান অংশ - পণ্যের বিবরণ */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <div className="text-gray-600 mb-4">
            <span className="font-semibold">${product.price.toFixed(2)}</span>
            <span className="ml-2 text-sm text-green-500">In Stock</span>
          </div>
          <p className="text-gray-700 mb-6">{product.description}</p>

          {/* রং নির্বাচন */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Colors:</h3>
              <div className="flex items-center space-x-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full cursor-pointer focus:outline-none ring-2 ring-offset-2 ${
                      selectedColor === color ? 'ring-indigo-500' : 'ring-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                  ></button>
                ))}
              </div>
            </div>
          )}

          {/* সাইজ নির্বাচন */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Size:</h3>
              <div className="flex items-center space-x-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`px-3 py-1 rounded-md text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      selectedSize === size ? 'bg-indigo-500 text-white hover:bg-indigo-600' : ''
                    }`}
                    onClick={() => handleSizeSelect(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* পরিমাণ এবং কার্ট বাটন */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                className="px-3 py-2 focus:outline-none"
                onClick={() => handleQuantityChange('dec')}
              >
                <FiMinus />
              </button>
              <span className="px-4 py-2 text-gray-700">{quantity}</span>
              <button
                className="px-3 py-2 focus:outline-none"
                onClick={() => handleQuantityChange('inc')}
              >
                <FiPlus />
              </button>
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              Buy Now
            </button>
            <button
              className="focus:outline-none"
              onClick={handleWishlistToggle}
            >
              {isWishlisted ? <AiFillHeart className="text-red-500 h-6 w-6" /> : <AiOutlineHeart className="text-gray-500 hover:text-red-500 h-6 w-6" />}
            </button>
          </div>

          {/* ডেলিভারি এবং রিটার্ন তথ্য */}
          <div className="bg-gray-100 rounded-md p-4">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-gray-700">Free Delivery</span>
            </div>
            <p className="text-sm text-gray-500 mb-2">Enter your postal code for Delivery Availability</p>
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3m6 8a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
              <span className="font-semibold text-gray-700">Return Delivery</span>
            </div>
            <p className="text-sm text-gray-500">Free 30 Days Delivery Returns. <button className="text-blue-500">Details</button></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;