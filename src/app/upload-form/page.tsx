'use client';

import { useState, FormEvent, ChangeEvent } from 'react';

interface FormData {
  name: string;
  rating: string;
  totalRatings: string;
  address: string;
  phone: string;
  tags: string;
  hasWhatsApp: boolean;
  hasEnquiry: boolean;
  isTrusted: boolean;
  isVerified: boolean;
  isPopular: boolean;
  category: string;
  subcategory: string;
  pincode: string;
  city: string;
}

interface ApiResponse {
  message: string;
  data?: any;
  error?: string;
}

export default function UploadFormPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    rating: '',
    totalRatings: '',
    address: '',
    phone: '',
    tags: '',
    hasWhatsApp: false,
    hasEnquiry: false,
    isTrusted: false,
    isVerified: false,
    isPopular: false,
    category: '',
    subcategory: '',
    pincode: '',
    city: '',
  });
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    // Allow typing in pincode without immediate validation
    if (name === 'pincode' && value.length > 6) {
      return; // Prevent typing more than 6 characters
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear pincode-specific error if user starts typing
    if (name === 'pincode' && error === 'Pincode must be a 6-digit number') {
      setError('');
    }
  };

  const handlePincodeBlur = () => {
    // Validate pincode on blur
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      setError('Pincode must be a 6-digit number');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode)) {
      setError('Pincode must be a 6-digit number');
      return;
    }

    try {
      const response = await fetch('/api/uploadform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0),
        }),
      });

      const data: ApiResponse = await response.json();

      if (response.ok) {
        setMessage('Business data saved successfully!');
        setError('');
        setFormData({
          name: '',
          rating: '',
          totalRatings: '',
          address: '',
          phone: '',
          tags: '',
          hasWhatsApp: false,
          hasEnquiry: false,
          isTrusted: false,
          isVerified: false,
          isPopular: false,
          category: '',
          subcategory: '',
          pincode: '',
          city: '',
        });
      } else {
        setError(data.error || 'Failed to save data');
        setMessage('');
      }
    } catch (err) {
      setError('An error occurred while saving the data');
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <style jsx>{`
        .toggle-checkbox:checked {
          transform: translateX(16px);
          border-color: #3b82f6;
        }
        .toggle-checkbox {
          transition: transform 0.2s ease-in-out;
        }
        .toggle-label {
          transition: background-color 0.2s ease-in-out;
        }
      `}</style>
      <div className="w-full bg-white rounded-xl shadow-2xl p-8 sm:p-12">
        <h1 className="text-3xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Add New Business
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
              Business Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter business name"
              className="mt-2 block w-full border border-gray-200 rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter 10-digit phone number"
              className="mt-2 block w-full border border-gray-200 rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
              required
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-semibold text-gray-700">
              Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter full address"
              className="mt-2 block w-full border border-gray-200 rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
              required
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-semibold text-gray-700">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter city name"
              className="mt-2 block w-full border border-gray-200 rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-gray-700">
              Category
            </label>
            <input
              id="category"
              name="category"
              type="text"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Restaurant, Salon"
              className="mt-2 block w-full border border-gray-200 rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
              required
            />
          </div>
          <div>
            <label htmlFor="subcategory" className="block text-sm font-semibold text-gray-700">
              Subcategory
            </label>
            <input
              id="subcategory"
              name="subcategory"
              type="text"
              value={formData.subcategory}
              onChange={handleChange}
              placeholder="e.g., Fine Dining, Hair Care"
              className="mt-2 block w-full border border-gray-200 rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
              required
            />
          </div>
          <div>
            <label htmlFor="rating" className="block text-sm font-semibold text-gray-700">
              Rating (0-5)
            </label>
            <input
              id="rating"
              name="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={handleChange}
              placeholder="e.g., 4.5"
              className="mt-2 block w-full border border-gray-200 rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
            />
          </div>
          <div>
            <label htmlFor="totalRatings" className="block text-sm font-semibold text-gray-700">
              Total Ratings
            </label>
            <input
              id="totalRatings"
              name="totalRatings"
              type="number"
              min="0"
              value={formData.totalRatings}
              onChange={handleChange}
              placeholder="e.g., 120"
              className="mt-2 block w-full border border-gray-200 rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
            />
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-semibold text-gray-700">
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., photography, wedding, portrait"
              className="mt-2 block w-full border border-gray-200 rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Has WhatsApp</span>
              <div className="relative inline-block w-10 h-6">
                <input
                  type="checkbox"
                  name="hasWhatsApp"
                  id="hasWhatsApp"
                  checked={formData.hasWhatsApp}
                  onChange={handleChange}
                  className="toggle-checkbox absolute w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer top-0 left-0 shadow-sm"
                />
                <label
                  htmlFor="hasWhatsApp"
                  className={`toggle-label block w-10 h-6 rounded-full bg-gray-300 cursor-pointer ${formData.hasWhatsApp ? 'bg-blue-600' : ''}`}
                ></label>
              </div>
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Has Enquiry</span>
              <div className="relative inline-block w-10 h-6">
                <input
                  type="checkbox"
                  name="hasEnquiry"
                  id="hasEnquiry"
                  checked={formData.hasEnquiry}
                  onChange={handleChange}
                  className="toggle-checkbox absolute w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer top-0 left-0 shadow-sm"
                />
                <label
                  htmlFor="hasEnquiry"
                  className={`toggle-label block w-10 h-6 rounded-full bg-gray-300 cursor-pointer ${formData.hasEnquiry ? 'bg-blue-600' : ''}`}
                ></label>
              </div>
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Is Trusted</span>
              <div className="relative inline-block w-10 h-6">
                <input
                  type="checkbox"
                  name="isTrusted"
                  id="isTrusted"
                  checked={formData.isTrusted}
                  onChange={handleChange}
                  className="toggle-checkbox absolute w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer top-0 left-0 shadow-sm"
                />
                <label
                  htmlFor="isTrusted"
                  className={`toggle-label block w-10 h-6 rounded-full bg-gray-300 cursor-pointer ${formData.isTrusted ? 'bg-blue-600' : ''}`}
                ></label>
              </div>
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Is Verified</span>
              <div className="relative inline-block w-10 h-6">
                <input
                  type="checkbox"
                  name="isVerified"
                  id="isVerified"
                  checked={formData.isVerified}
                  onChange={handleChange}
                  className="toggle-checkbox absolute w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer top-0 left-0 shadow-sm"
                />
                <label
                  htmlFor="isVerified"
                  className={`toggle-label block w-10 h-6 rounded-full bg-gray-300 cursor-pointer ${formData.isVerified ? 'bg-blue-600' : ''}`}
                ></label>
              </div>
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Is Popular</span>
              <div className="relative inline-block w-10 h-6">
                <input
                  type="checkbox"
                  name="isPopular"
                  id="isPopular"
                  checked={formData.isPopular}
                  onChange={handleChange}
                  className="toggle-checkbox absolute w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer top-0 left-0 shadow-sm"
                />
                <label
                  htmlFor="isPopular"
                  className={`toggle-label block w-10 h-6 rounded-full bg-gray-300 cursor-pointer ${formData.isPopular ? 'bg-blue-600' : ''}`}
                ></label>
              </div>
            </label>
          </div>
          <div>
            <label htmlFor="pincode" className="block text-sm font-semibold text-gray-700">
              Pincode (6 digits)
            </label>
            <input
              id="pincode"
              name="pincode"
              type="text"
              value={formData.pincode}
              onChange={handleChange}
              onBlur={handlePincodeBlur}
              placeholder="e.g., 573201"
              className="mt-2 block w-full border border-gray-200 rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
              pattern="\d{6}"
              maxLength={6}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-md"
          >
            Save Business
          </button>
        </form>
        {message && (
          <p className="mt-6 text-center text-green-600 font-semibold bg-green-50 p-3 rounded-lg">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-6 text-center text-red-600 font-semibold bg-red-50 p-3 rounded-lg">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}