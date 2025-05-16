import React, { useState, useEffect } from 'react';
import { GoArrowRight, GoArrowLeft } from 'react-icons/go';
import axios from 'axios';

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


const Explore: React.FC = () => {
  const [verticalProducts, setVerticalProducts] = useState<Product[]>([]);
  const [verticalOffset, setVerticalOffset] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreVertical, setHasMoreVertical] = useState(true);
  const [verticalLoading, setVerticalLoading] = useState(false);

  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        setLoading(true);
        // প্রথম ৫টি প্রোডাক্ট লোড করা হচ্ছে
        const response = await axios.get('http://localhost:3001/api/products?limit=15&offset=0');
        setVerticalProducts(response.data);
        setVerticalOffset(5);
        setLoading(false);
      } catch (error) {
        setError('Failed to load the product.');
        setLoading(false);
      }
    };
    fetchInitialProducts();
  }, []);

  const loadMoreVertical = async () => {
    if (verticalLoading || !hasMoreVertical) return;

    try {
      setVerticalLoading(true);
      const response = await axios.get(
        `http://localhost:3001/api/products?limit=20&offset=${verticalOffset}`
      );
      const newProducts: Product[] = response.data;

      // পূর্বে থাকা প্রোডাক্ট থেকে পুনরাবৃত্তি এড়াতে ফিল্টার করা
      const filtered = newProducts.filter(
        (product) => !verticalProducts.some((p) => p._id === product._id)
      );

      setVerticalProducts((prev) => [...prev, ...filtered]);
      setVerticalOffset((prevOffset) => prevOffset + 20);

      if (newProducts.length < 20) {
        setHasMoreVertical(false);
      }
    } catch (err) {
      setError('Failed to load more products.');
    } finally {
      setVerticalLoading(false);
    }
  };

  return (
    <div className=" px-20 mt-20">
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

      <div>
        <h2 className="text-xl font-semibold mb-4">All Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {verticalProducts.map((product) => (
            <div key={product._id} className="relative w-full h-72 border rounded-lg">
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
          <div className="text-center mt-6 text-gray-500">No More Products।</div>
        )}
      </div>
    </div>
  );
};

export default Explore;
