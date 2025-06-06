import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface Product {
  _id: string;
  name: string;
  price: number;
  oldPrice: number;
  discount: number;
  images: string[];
}

const fetchWishList = async (token: string | null) => {
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch('http://localhost:3001/api/getwishlist', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch wishlist');
  }

  const data = await response.json();
  return data.products || [];
};

const WishList: React.FC = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const { data: wishList = [], isLoading, error } = useQuery<Product[], Error>({
    queryKey: ['wishlist', token],
    queryFn: () => fetchWishList(token),
    enabled: !!token,
  });

  // ইমেজ লোডিং ফেইল হলে ফলব্যাক ইমেজ
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image';
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">My Wishlist</h2>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 bg-white shadow-sm">
              <Skeleton height={192} className="rounded-md" />
              <Skeleton count={3} className="mt-2" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-center text-sm sm:text-base">
          Error: {error.message}
        </p>
      )}

      {!isLoading && wishList.length === 0 && (
        <p className="text-gray-500 text-center text-sm sm:text-base">
          Your wishlist is empty.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {wishList.map((item) => (
          <div
            key={item._id}
            className="border rounded-lg p-4 bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative w-full h-48 sm:h-56">
              <img
                src={item.images?.[0] || 'https://via.placeholder.com/150?text=No+Image'}
                alt={item.name}
                className="w-full h-full object-contain rounded-md"
                onError={handleImageError}
              />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mt-3 truncate">
              {item.name}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">Price: ${item.price}</p>
            <p className="line-through text-gray-400 text-sm sm:text-base">
              Old Price: ${item.oldPrice}
            </p>
            <p className="text-green-600 font-medium text-sm sm:text-base">
              Discount: {item.discount}%
            </p>
            <Stack direction="row" spacing={1} className="mt-4">
              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                className="text-red-500 border-red-500 hover:bg-red-50 text-xs sm:text-sm"
              >
                Delete
              </Button>
              <Button
                onClick={() => navigate(`/details/${item._id}`)}
                variant="contained"
                color="primary"
                startIcon={<RemoveShoppingCartIcon />}
                className="text-xs sm:text-sm"
              >
                Buy Now
              </Button>
            </Stack>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishList;