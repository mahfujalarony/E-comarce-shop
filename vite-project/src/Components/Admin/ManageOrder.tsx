import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import LoadingSpinner from '../ui/LoadingSpinner'; 
import { FaUser, FaBox, FaMapMarkerAlt, FaSpinner, FaSearch } from 'react-icons/fa';

interface FormattedOrder {
  _id: string;
  orderStatus: string;
  orderTotalAmount: number;
  orderCreatedAt: string;
  userName?: string;
  userEmail?: string;
  userImgUrl?: string;
  productName?: string;
  productPrice?: number;
  productOldPrice?: number;
  productImages?: string[];
  productDiscount?: number;
  productCategory?: string;
  productInStock?: boolean;
  quantity?: number;
  orderedProductPrice?: number;
  orderedProductImage?: string;
  addressFullName?: string;
  addressStreet?: string;
  addressCity?: string;
  addressDistrict?: string;
  addressThana?: string;
  addressLandmark?: string;
  addressHouse?: string;
  addressPhone?: string;
  addressCountry?: string;
}

// Order status type
type OrderStatus = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const ManageOrder: React.FC = () => {
  const [orders, setOrders] = useState<FormattedOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<FormattedOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [activeStatus, setActiveStatus] = useState<OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const ordersPerPage = 10;

  // Status color mapping
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  // Fetch orders from API
  const fetchOrdersAdmin = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found. Please login.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:3001/api/fetchOrders?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.error === false) {
        setOrders(response.data.data);
        setFilteredOrders(response.data.data);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
      } else {
        setError(response.data.message || 'Failed to load order data.');
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdateLoading(orderId);
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `http://localhost:3001/api/updateOrderStatus/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state to reflect the change
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );
      
      setFilteredOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );
      
      // Reapply filters
      filterOrdersByStatus(activeStatus);
      
    } catch (err: any) {
      console.error('Error updating order status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdateLoading(null);
    }
  };

  // Search functionality
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (!query) {
      filterOrdersByStatus(activeStatus);
      return;
    }
    
    const results = orders.filter(
      order => 
        order._id.toLowerCase().includes(query) ||
        order.userName?.toLowerCase().includes(query) ||
        order.userEmail?.toLowerCase().includes(query) ||
        order.productName?.toLowerCase().includes(query) ||
        order.addressPhone?.toLowerCase().includes(query)
    );
    
    setFilteredOrders(results);
  };

  // Filter orders by status
  const filterOrdersByStatus = (status: OrderStatus) => {
    setActiveStatus(status);
    
    if (status === 'all') {
      if (searchQuery) {
        handleSearch({ target: { value: searchQuery } } as React.ChangeEvent<HTMLInputElement>);
      } else {
        setFilteredOrders(orders);
      }
      return;
    }
    
    const filtered = orders.filter(order => order.orderStatus.toLowerCase() === status);
    setFilteredOrders(filtered);
  };

  useEffect(() => {
    fetchOrdersAdmin(currentPage);
  }, [currentPage, fetchOrdersAdmin]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Loading state
  if (loading && orders.length === 0) {
    return <LoadingSpinner message="Loading orders..." className="mt-20" />;
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-md my-4 max-w-4xl mx-auto">
        <p className="text-red-700 font-medium">Error: {error}</p>
        <button 
          onClick={() => fetchOrdersAdmin(currentPage)}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-2xl lg:text-3xl font-bold mb-6 text-gray-800">Order Management</h1>
      
      {/* Search bar */}
      <div className="mb-6 relative">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <div className="pl-4">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by order ID, name, email or product..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full p-3 outline-none"
          />
        </div>
      </div>
      
      {/* Status filter tabs - made responsive with overflow-x-auto */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center overflow-x-auto">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'Pending' },
            { id: 'processing', label: 'Processing' },
            { id: 'shipped', label: 'Shipped' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <li className="mr-2" key={tab.id}>
              <button 
                className={`inline-block p-4 rounded-t-lg whitespace-nowrap ${
                  activeStatus === tab.id ? 
                  'border-b-2 border-blue-600 text-blue-600' : 
                  'border-b-2 border-transparent hover:border-gray-300 hover:text-gray-600'
                }`}
                onClick={() => filterOrdersByStatus(tab.id as OrderStatus)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Order count */}
      <p className="text-sm text-gray-600 mb-4">
        Total {filteredOrders.length} orders found
      </p>

      {/* Order list */}
      {filteredOrders.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Order header */}
              <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                <div className="min-w-[200px]">
                  <span className="text-sm text-gray-500">Order ID:</span>
                  <span className="ml-2 font-medium break-all">{order._id}</span>
                </div>
                <div className="flex items-center min-w-[150px]">
                  <span className="text-sm text-gray-500 mr-2">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    statusColors[order.orderStatus.toLowerCase() as keyof typeof statusColors] || 'bg-gray-100'
                  }`}>
                    {order.orderStatus}
                  </span>
                </div>
                <div className="text-sm text-gray-500 min-w-[200px]">
                  <span>Order Date:</span>
                  <span className="ml-2 font-medium">{formatDate(order.orderCreatedAt)}</span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* User information */}
                  <div className="flex">
                    <div className="mr-4">
                      <FaUser className="w-10 h-10 p-2 bg-blue-100 text-blue-600 rounded-full" />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-lg font-semibold mb-2 flex items-center">
                        Customer Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          {order.userImgUrl && (
                            <img 
                              src={order.userImgUrl} 
                              alt={order.userName || 'User'} 
                              className="w-10 h-10 rounded-full mr-3 object-cover"
                            />
                          )}
                          <div className="overflow-hidden">
                            <p className="font-medium truncate">{order.userName || 'Unknown'}</p>
                            <p className="text-sm text-gray-600 truncate">{order.userEmail || 'No email'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Product information */}
                  <div className="flex">
                    <div className="mr-4">
                      <FaBox className="w-10 h-10 p-2 bg-green-100 text-green-600 rounded-full" />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-lg font-semibold mb-2">Product Details</h3>
                      <div className="flex items-start">
                        {order.orderedProductImage && (
                          <img 
                            src={order.orderedProductImage} 
                            alt={order.productName || 'Product'} 
                            className="w-16 h-16 object-cover rounded border border-gray-200 mr-3"
                          />
                        )}
                        <div className="overflow-hidden">
                          <p className="font-medium truncate">{order.productName || 'Unknown product'}</p>
                          <p className="text-sm text-gray-600">Quantity: {order.quantity || 0}pcs</p>
                          <p className="text-sm font-medium">Price: ৳{order.orderedProductPrice?.toLocaleString() || 0}
                            {order.productDiscount && order.productDiscount > 0 && (
                              <span className="ml-2 text-xs bg-red-100 text-red-700 py-0.5 px-1.5 rounded-sm">
                                {order.productDiscount}% off
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Address information */}
                  <div className="flex">
                    <div className="mr-4">
                      <FaMapMarkerAlt className="w-10 h-10 p-2 bg-red-100 text-red-600 rounded-full" />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-lg font-semibold mb-2">Delivery Address</h3>
                      <div className="space-y-1">
                        <p className="font-medium truncate">{order.addressFullName || 'Unknown'}</p>
                        <p className="text-sm text-gray-600 truncate">
                            <div className="space-y-1">
                            {[order.addressHouse, order.addressStreet, order.addressThana, order.addressDistrict, order.addressCity]
                              .filter(Boolean)
                              .map((addressPart, index) => (
                              <p key={index} className="text-sm text-gray-600 truncate">
                                {addressPart}
                              </p>
                              ))}
                            </div>
                        </p>
                        <p className="text-sm text-gray-600">Phone: {order.addressPhone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order footer */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-lg font-bold">Total Amount: </span>
                      <span className="text-lg font-bold">৳{order.orderTotalAmount?.toLocaleString() || 0}</span>
                    </div>
                    
                    {/* Status update dropdown */}
                    <div className="mt-3 sm:mt-0">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-sm font-medium whitespace-nowrap">Order Status:</span>
                        <select 
                          className="border border-gray-300 rounded px-3 py-1.5 min-w-[120px]"
                          value={order.orderStatus}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          disabled={updateLoading === order._id}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        {updateLoading === order._id && (
                          <FaSpinner className="ml-2 animate-spin text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination controls */}
      {totalPages > 0 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center flex-wrap justify-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || loading}
              className={`px-4 py-2 mx-1 rounded whitespace-nowrap ${
                currentPage === 1 || loading
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Previous Page
            </button>
            
            <div className="flex flex-wrap justify-center">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show 5 pages max, centered around current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 mx-1 flex items-center justify-center rounded ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || loading}
              className={`px-4 py-2 mx-1 rounded whitespace-nowrap ${
                currentPage === totalPages || loading
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Next Page
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ManageOrder;