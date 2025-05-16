import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { GoArrowRight, GoArrowLeft } from 'react-icons/go';

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

const ProductList: React.FC = () => {
  const [horizontalProducts, setHorizontalProducts] = useState<Product[]>([]);
  const [verticalProducts, setVerticalProducts] = useState<Product[]>([]);
  const [horizontalOffset, setHorizontalOffset] = useState(0);
  const [verticalOffset, setVerticalOffset] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [hasMoreVertical, setHasMoreVertical] = useState(true); // আরও প্রোডাক্ট আছে কিনা
const [verticalLoading, setVerticalLoading] = useState(false); // শুধু vertical এর জন্য loading


  const horizontalContainerRef = useRef<HTMLDivElement>(null);

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

  // Initial Load for Horizontal (5 products)
  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3001/api/products?limit=5&offset=0');
        setHorizontalProducts(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load the product.');
        setLoading(false);
      }
    };
    fetchInitialProducts();
  }, []);

  // Load More for Horizontal (20 products)
  // const loadMoreHorizontal = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await axios.get(
  //       `http://localhost:3001/api/products?limit=20&offset=${horizontalOffset + 5}`
  //     );
  //     setHorizontalProducts([...horizontalProducts, ...response.data]);
  //     setHorizontalOffset(horizontalOffset + 20);
  //     setLoading(false);
  //     // Scroll to the right
  //     if (horizontalContainerRef.current) {
  //       horizontalContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  //     }
  //   } catch (error) {
  //     setError('Failed to load more products !');
  //     setLoading(false);
  //   }
  // };

  const loadMoreHorizontal = async () => {
  try {
    setLoading(true);

    // নতুন প্রোডাক্ট আনার অনুরোধ
    const response = await axios.get(
      `http://localhost:3001/api/products?limit=20&offset=${horizontalProducts.length}`
    );

    const newProducts = response.data;

    // যদি নতুন প্রোডাক্ট না আসে
    if (newProducts.length === 0) {
      alert("আর কোনো প্রোডাক্ট নেই।");
      setLoading(false);
      return;
    }

    // পুরাতন প্রোডাক্টের ID গুলো সংগ্রহ
    const existingIds = new Set(horizontalProducts.map((p) => p._id));

    // নতুন যেসব প্রোডাক্ট আগের মধ্যে নেই সেগুলো ফিল্টার করে নাও
    const uniqueNewProducts = newProducts.filter(
      (p: Product) => !existingIds.has(p._id)
    );

    // যদি সব নতুন প্রোডাক্ট আগেই ছিল, তাহলে আবার alert
    if (uniqueNewProducts.length === 0) {
      alert("নতুন কোনো প্রোডাক্ট পাওয়া যায়নি।");
      setLoading(false);
      return;
    }

    // লিস্টে যোগ করো
    setHorizontalProducts([...horizontalProducts, ...uniqueNewProducts]);
    setHorizontalOffset(horizontalOffset + uniqueNewProducts.length);
    
    // Scroll right
    if (horizontalContainerRef.current) {
      horizontalContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }

    setLoading(false);
  } catch (error) {
    setError('আরো প্রোডাক্ট লোড করতে সমস্যা হয়েছে!');
    setLoading(false);
  }
};


  // Load More for Vertical (20 products)
  // const loadMoreVertical = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await axios.get(
  //       `http://localhost:3001/api/products?limit=20&offset=${verticalOffset}`
  //     );
  //     setVerticalProducts([...verticalProducts, ...response.data]);
  //     setVerticalOffset(verticalOffset + 20);
  //     setLoading(false);
  //     // Scroll down
  //     window.scrollBy({ top: 300, behavior: 'smooth' });
  //   } catch (error) {
  //     setError('Failed to load more products.');
  //     setLoading(false);
  //   }
  // };

  const loadMoreVertical = async () => {
  if (verticalLoading || !hasMoreVertical) return;

  try {
    setVerticalLoading(true);

    const response = await axios.get(
      `http://localhost:3001/api/products?limit=20&offset=${verticalOffset}`
    );

    const newProducts: Product[] = response.data;

    // নতুন প্রোডাক্ট গুলোর মধ্যে যদি আগেই থাকা কোনো প্রোডাক্ট থাকে তাহলে বাদ দাও
    const filtered = newProducts.filter(
      (product) => !verticalProducts.some((p) => p._id === product._id)
    );

    // নতুন প্রোডাক্ট গুলো যোগ করো
    setVerticalProducts((prev) => [...prev, ...filtered]);

    // অফসেট আপডেট করো
    setVerticalOffset((prevOffset) => prevOffset + 20);

    // যদি ২০টার কম পাই, তাহলে বুঝবো আর কিছু নাই
    if (newProducts.length < 20) {
      setHasMoreVertical(false);
    }
  } catch (err) {
    setError('Failed to load more products.');
  } finally {
    setVerticalLoading(false);
  }
};


  if (loading && horizontalProducts.length === 0) {
    return <div className="text-center py-10">Loading....</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
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
            disabled={loading}
          >
            <GoArrowRight size={24} />
          </button>
        </div>
        <div
          ref={horizontalContainerRef}
          className="flex overflow-x-auto space-x-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300"
        >
          {horizontalProducts.map((product) => (
            <div
              key={product._id}
              className="relative w-56 h-72 border rounded-lg flex-shrink-0"
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

      {/* Vertical Grid Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {verticalProducts.map((product) => (
            <div
              key={product._id}
              className="relative w-full h-72 border rounded-lg"
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
        {/* <button
          onClick={loadMoreVertical}
          className="mt-8 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 mx-auto block"
          disabled={loading}
        >
          View More
        </button> */}

        {hasMoreVertical ? (
  <div className="text-center mt-6">
    <button
      onClick={loadMoreVertical}
      className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      disabled={verticalLoading}
    >
      {verticalLoading ? 'Loading...' : 'Load More'}
    </button>
  </div>
) : (
  <div className="text-center mt-6 text-gray-500">আর কোনো পণ্য নেই।</div>
)}

      </div>
    </div>
  );
};

export default ProductList;