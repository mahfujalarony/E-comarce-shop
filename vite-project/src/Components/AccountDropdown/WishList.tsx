import React, { useEffect, useState } from 'react';

interface Product {
  _id: string;
  name: string;
  price: number;
  oldPrice: number;
  discount: number;
  images: string[];
}

const WishList: React.FC = () => {
  const [wishList, setWishList] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchWishList = async () => {
      if (!token) {
        setError('No token found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/getwishlist', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch wishlist');
        }

        const data = await response.json();
        console.log('Wishlist:', data); // 🔍 দেখতে পারো এখানে পুরো wishlist object আসছে

        setWishList(data.products || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWishList();
  }, [token]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Wish List</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishList.map((item) => (
          <div key={item._id} className="border p-4 rounded shadow">
            <img
              src={item.images?.[0]}
              alt={item.name}
              className="w-full h-40 object-cover mb-2 rounded"
            />
            <h3 className="text-lg font-semibold">{item.name}</h3>
            <p>Price: ${item.price}</p>
            <p className="line-through text-gray-400">Old Price: ${item.oldPrice}</p>
            <p className="text-green-600">Discount: {item.discount}%</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishList;
