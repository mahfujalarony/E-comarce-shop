import React, { useEffect, useState } from 'react';
import axios from 'axios';

// MUI Imports for Drawer and List
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Paper from '@mui/material/Paper';
import ConfirmationDialog from '../ui/Confirm';
import FormDialog from '../ui/ProductEditDilogBox';
import type { Products as Product, Reviews as Review } from '../types';
// interface UserInfo {
//   _id: string;
//   name: string;
//   email: string;
//   imgUrl?: string;
// }

// interface Review {
//   _id: string;
//   userId: UserInfo; 
//   productId: string;
//   rating: number;
//   review: string;
//   likes: number;
//   createdAt: string;
// }

// interface Product {
//   _id: string;
//   name: string;
//   price: number;
//   oldPrice: number;
//   description: string;
//   images: string[];
//   discount: number;
//   category: string;
//   inStock: boolean;
//   createdAt: string;
//   reviews: Review[];
// }

const ManageProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProductReviews, setSelectedProductReviews] = useState<Review[]>([]);
  const [selectedProductName, setSelectedProductName] = useState<string>('');

  // Confirmation Dialog State
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState<string | null>(null);


  // For Edit Product
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });
  

  // Edit product Notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };


  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:3001/api/fetchProducts`, {
        params: {
          page: page + 1,
          limit: rowsPerPage,
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.data && response.data.data.products) {
        setProducts(response.data.data.products);
        setTotalProducts(response.data.data.totalPages * rowsPerPage);
      } else {
        setProducts([]);
        console.warn("Products data not found in API response:", response.data);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage]);

  const handleNextPage = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setPage(prevPage => Math.max(0, prevPage - 1));
  };

  const toggleDrawer = (open: boolean, reviews: Review[] = [], productName: string = '') => {
    setDrawerOpen(open);
    if (open) {
      setSelectedProductReviews(reviews);
      setSelectedProductName(productName);
    }
  };

  const drawerContent = () => (
    <Box
      sx={{ width: 'auto', minWidth: 300, p: 2 }}
      role="presentation"
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Reviews for {selectedProductName}</Typography>
        <IconButton onClick={() => toggleDrawer(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      {selectedProductReviews.length > 0 ? (
        <List>
          {selectedProductReviews.map((reviewItem) => (
            <Paper key={reviewItem._id} elevation={1} sx={{ mb: 2, p: 2 }}>
              <ListItem alignItems="flex-start" sx={{ flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {reviewItem.userId.imgUrl && (
                    <img
                      src={reviewItem.userId.imgUrl}
                      alt={reviewItem.userId.name}
                      style={{ width: 32, height: 32, borderRadius: '50%', marginRight: '10px' }}
                    />
                  )}
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2">
                        {reviewItem.userId.name} ({reviewItem.userId.email})
                      </Typography>
                    }
                    secondary={`Rating: ${reviewItem.rating}/5`}
                  />
                </Box>
                <Typography
                  sx={{ display: 'block', mt: 1, whiteSpace: 'pre-wrap' }}
                  component="span"
                  variant="body2"
                  color="text.primary"
                >
                  {reviewItem.review}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Likes: {reviewItem.likes} | Date: {new Date(reviewItem.createdAt).toLocaleDateString()}
                </Typography>
              </ListItem>
            </Paper>
          ))}
        </List>
      ) : (
        <Typography sx={{ p: 2, textAlign: 'center' }}>No reviews for this product yet.</Typography>
      )}
    </Box>
  );



  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

const handleSaveProduct = async (editedProduct: Product) => {
  setIsSubmitting(true);
  try {
    const response = await axios.patch(
      `http://localhost:3001/api/updateProduct/${editedProduct._id}`,
      {
        name: editedProduct.name,
        price: editedProduct.price,
        oldPrice: editedProduct.oldPrice,
        description: editedProduct.description,
        category: editedProduct.category,
        // discount: editedProduct.discount, // যদি backend থেকে হিসাব হয়, এটা বাদ দিন
        inStock: editedProduct.inStock,
        images: editedProduct.images // <-- এই লাইনটি যোগ করুন
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    // ...rest of code...
  } catch (error) {
    console.error("Error updating product:", error);
    showNotification(
      error instanceof Error ? error.message : "Failed to update product",
      'error'
    );
  } finally {
    setIsSubmitting(false);
    setEditDialogOpen(false);
    setSelectedProduct(null);
  }
  };

  const handleDeleteProductClick = (productId: string) => {
    setProductIdToDelete(productId);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productIdToDelete) {
      try {
        await axios.delete(`http://localhost:3001/api/deleteProduct/${productIdToDelete}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Product list theke remove korun
        setProducts(products.filter(product => product._id !== productIdToDelete));
        console.log("Product deleted successfully:", productIdToDelete);
      } catch (err) {
        console.error("Error deleting product:", err);
        setError("Failed to delete product.");
      } finally {
        setConfirmDialogOpen(false);
        setProductIdToDelete(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
    setProductIdToDelete(null);
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (products.length === 0 && !loading) {
    return <div>No products found.</div>;
  }

  return (
    <div>
      <h1>Manage Products</h1>
      
      <ul>
        {products.map(product => (
          <li key={product._id}>
            <h2>{product.name}</h2>
            <p>Price: ${product.price}</p>
            <p>Old Price: ${product.oldPrice}</p>
            <p>Discount: {product.discount}%</p>
            <p>Category: {product.category}</p>
            <p>Description: {product.description.substring(0, 100)}...</p>
            {product.images && product.images.length > 0 && (
              <img src={product.images[0]} alt={product.name} width="100" />
            )}
            <p>In Stock: {product.inStock ? 'Yes' : 'No'}</p>
            <p>
              Reviews: {' '}
              <button 
                onClick={() => toggleDrawer(true, product.reviews, product.name)}
                style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
              >
                {product.reviews.length}
              </button>
            </p>
      <Button 
        variant="contained"
        color="primary"
        onClick={() => handleEditProduct(product)}
        sx={{ mr: 1 }}
      >
        Edit
      </Button>

            {/* Delete Product */}
            <Button 
              variant="contained"
              color="error"
              onClick={() => handleDeleteProductClick(product._id)}
            >
              Delete
            </Button>
            <hr />
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div>
        <button onClick={handlePreviousPage} disabled={page === 0}>
          Previous
        </button>
        <span> Page {page + 1} </span>
        <button onClick={handleNextPage} disabled={products.length < rowsPerPage || (page + 1) * rowsPerPage >= totalProducts}>
          Next
        </button>
      </div>

      {/* Rows per page selector */}
      <div>
        <label htmlFor="rowsPerPage">Products per page: </label>
        <select 
          id="rowsPerPage" 
          value={rowsPerPage} 
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(0); 
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      {/* Swipeable Drawer for Reviews */}
      <SwipeableDrawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => toggleDrawer(false)}
        onOpen={() => toggleDrawer(true, selectedProductReviews, selectedProductName)}
        disableSwipeToOpen={false}
        ModalProps={{
          keepMounted: true,
        }}
      >
        {drawerContent()}
      </SwipeableDrawer>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />


      {/* Notification */}
      {notification.show && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          padding: '10px 20px',
          backgroundColor: notification.type === 'success' ? '#4caf50' : '#f44336',
          color: 'white',
          borderRadius: 4,
          zIndex: 9999
        }}>
          {notification.message}
        </div>
      )}

      {/* Edit Product Dialog */}
      <FormDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleSaveProduct}
        product={selectedProduct}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default ManageProducts;