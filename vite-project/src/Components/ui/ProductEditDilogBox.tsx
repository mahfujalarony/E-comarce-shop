import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import type { Products as Product } from '../types';
import axios from 'axios';

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (editedProduct: Product) => Promise<void>;
  product: Product | null;
  isSubmitting?: boolean;
}

export default function FormDialog({
  open,
  onClose,
  onSave,
  product,
  isSubmitting = false
}: FormDialogProps) {
  const [editedProduct, setEditedProduct] = React.useState<Product | null>(null);
  const [oldImages, setOldImages] = React.useState<string[]>([]);
  const [newImages, setNewImages] = React.useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (product) {
      setEditedProduct(product);
      setOldImages(product.images || []);
      setNewImages([]);
      setNewImagePreviews([]);
    }
  }, [product]);

  if (!editedProduct) return null;

  // Handle new image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validFiles = Array.from(files).filter(
        file => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
      );
      if (validFiles.length !== files.length) {
        alert('Only image files (less than 5MB) are allowed.');
        return;
      }
      setNewImages(prev => [...prev, ...validFiles]);
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setNewImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  // Remove image (old or new)
  const removeImage = (index: number) => {
    if (index < oldImages.length) {
      // Remove from old images
      setOldImages(prev => prev.filter((_, i) => i !== index));
    } else {
      // Remove from new images and previews
      const newIndex = index - oldImages.length;
      URL.revokeObjectURL(newImagePreviews[newIndex]);
      setNewImages(prev => prev.filter((_, i) => i !== newIndex));
      setNewImagePreviews(prev => prev.filter((_, i) => i !== newIndex));
    }
  };

const handleSave = async () => {
  if (!editedProduct) return;
  try {
    let newImageUrls: string[] = [];
    if (newImages.length > 0) {
      const formDataToSend = new FormData();
      newImages.forEach((file) => {
        formDataToSend.append('images', file);
      });

      const imageUploadResponse = await axios.post(
        'http://localhost:3001/api/image',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            // 'Authorization': `Bearer ${localStorage.getItem('token')}` // লাগলে আনকমেন্ট করুন
          }
        }
      );
      console.log('imageUploadResponse', imageUploadResponse.data);

      // এখানে error চেকের পরিবর্তে imageUrls চেক করুন
      if (imageUploadResponse.data.imageUrls && imageUploadResponse.data.imageUrls.length > 0) {
        newImageUrls = imageUploadResponse.data.imageUrls;
      } else {
        throw new Error('Failed to upload images');
      }
    }

    const updatedProduct = {
      ...editedProduct,
      images: [...oldImages, ...newImageUrls],
      price: Number(editedProduct.price),
      oldPrice: Number(editedProduct.oldPrice)
    };
    await onSave(updatedProduct);

    // Clean up previews
    newImagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    setNewImages([]);
    setNewImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  } catch (error) {
    console.error('Error saving product:', error);
    alert('Failed to save product. Please try again.');
  }
};

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Product
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Name"
          fullWidth
          value={editedProduct.name}
          onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Price"
          type="number"
          fullWidth
          value={editedProduct.price}
          onChange={(e) => setEditedProduct({ ...editedProduct, price: Number(e.target.value) })}
        />
        <TextField
          margin="dense"
          label="Old Price"
          type="number"
          fullWidth
          value={editedProduct.oldPrice}
          onChange={(e) => setEditedProduct({ ...editedProduct, oldPrice: Number(e.target.value) })}
        />
        <TextField
          margin="dense"
          label="Description"
          multiline
          rows={4}
          fullWidth
          value={editedProduct.description}
          onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Category"
          fullWidth
          value={editedProduct.category}
          onChange={(e) => setEditedProduct({ ...editedProduct, category: e.target.value })}
        />
        <FormControlLabel
          control={
            <Switch
              checked={editedProduct.inStock}
              onChange={(e) => setEditedProduct({ ...editedProduct, inStock: e.target.checked })}
            />
          }
          label="In Stock"
          sx={{ mt: 1 }}
        />

        <Box sx={{ mt: 2 }}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          <Button
            variant="outlined"
            onClick={() => fileInputRef.current?.click()}
            sx={{ mb: 2 }}
          >
            Add Images
          </Button>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: 1,
            mt: 2
          }}>
            {[...oldImages, ...newImagePreviews].map((preview, index) => (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  paddingTop: '100%',
                  border: '1px solid #ddd',
                  borderRadius: 1,
                }}
              >
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => removeImage(index)}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}