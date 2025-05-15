import React, { useState, useRef } from 'react';
import axios from 'axios';

// Define form data interface
interface FormData {
  name: string;
  price: number;
  oldPrice: number;
  description: string;
  stars: number;
  reviews: number;
  size: string;
  images: File[];
  discount: number;
  category: string;
  inStock: boolean;
}

const InsertOne: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    price: 0,
    oldPrice: 0,
    description: '',
    stars: 0,
    reviews: 0,
    size: 'M',
    images: [],
    discount: 0,
    category: '',
    inStock: true,
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
          ? parseFloat(value) || 0
          : value,
    }));
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validFiles = Array.from(files).filter(
        (file) =>
          file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
      );
      if (validFiles.length !== files.length) {
        setError('Only image files (less than 5MB) are allowed.');
      }
      // Append new files to existing images
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...validFiles],
      }));
      // Append new previews to existing previews
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  // Remove an image from selection
  const removeImage = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, images: newImages }));
    setImagePreviews(newPreviews);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validate inputs
    if (!formData.name || !formData.price || !formData.category) {
      setError('Name, price, and category are required.');
      setIsLoading(false);
      return;
    }
    if (formData.stars < 0 || formData.stars > 5) {
      setError('Stars must be between 0 and 5.');
      setIsLoading(false);
      return;
    }
    if (formData.images.length === 0) {
      setError('At least one image is required.');
      setIsLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formData.images.forEach((file) => {
      formDataToSend.append('images', file);
    });

    try {
      // Upload images
      const imageUploadResponse = await axios.post(
        'http://localhost:3001/api/image',
        formDataToSend,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      // Prepare product data
      const productData = {
        ...formData,
        images: imageUploadResponse.data.imageUrls, // Expecting array of URLs
      };

      // Insert product
      await axios.post('http://localhost:3001/api/products', productData);
      alert('Product added successfully!');
      // Reset form
      setFormData({
        name: '',
        price: 0,
        oldPrice: 0,
        description: '',
        stars: 0,
        reviews: 0,
        size: 'M',
        images: [],
        discount: 0,
        category: '',
        inStock: true,
      });
      // Clean up previews
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
      setImagePreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error adding product:', error);
      setError(
        error.response?.data?.message || 'Failed to add product. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Add New Product</h2>
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md"
            min="0"
            step="0.01"
            required
          />
        </div>

        {/* Old Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Old Price
          </label>
          <input
            type="number"
            name="oldPrice"
            value={formData.oldPrice}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md"
            min="0"
            step="0.01"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md"
          />
        </div>

        {/* Stars */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Stars</label>
          <input
            type="number"
            name="stars"
            value={formData.stars}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md"
            min="0"
            max="5"
            step="0.1"
          />
        </div>

        {/* Reviews */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Reviews
          </label>
          <input
            type="number"
            name="reviews"
            value={formData.reviews}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md"
            min="0"
          />
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Size</label>
          <select
            name="size"
            value={formData.size}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md"
          >
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full p-2 border rounded-md"
            ref={fileInputRef}
          />
          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Discount */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Discount (%)
          </label>
          <input
            type="number"
            name="discount"
            value={formData.discount}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md"
            min="0"
            max="100"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md"
            required
          />
        </div>

        {/* In Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            In Stock
          </label>
          <input
            type="checkbox"
            name="inStock"
            checked={formData.inStock}
            onChange={handleChange}
            className="mt-1 block"
          />
        </div>

        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default InsertOne;