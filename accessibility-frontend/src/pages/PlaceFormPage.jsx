// src/pages/PlaceFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const PlaceFormPage = () => {
  const { id } = useParams(); // If present, we're editing an existing place
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [isLoading, setIsLoading] = useState(isEditMode); // Load data if editing
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [features, setFeatures] = useState([]);
  const [formState, setFormState] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    place_type: '',
    description: '',
    website: '',
    phone_number: '',
    feature_ids: []
  });

  // Check if user is a provider
  useEffect(() => {
    if (profile && profile.user_type !== 'provider') {
      setError('Only provider accounts can create or edit places.');
      setIsLoading(false);
    }
  }, [profile]);

  // Fetch all accessibility features
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await apiClient.get('/features/');
        setFeatures(response.data.results || response.data);
      } catch (err) {
        console.error("Error fetching features:", err);
        setError('Failed to load accessibility features. Please try again.');
      }
    };
    
    fetchFeatures();
  }, []);

  // If editing, fetch the place data
  useEffect(() => {
    if (!isEditMode) return;

    const fetchPlace = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(`/places/${id}/`);
        const place = response.data;
        
        // Check if current user is the owner
        if (profile && place.owner && place.owner.id !== profile.user) {
          setError('You can only edit places you own.');
          return;
        }

        // Convert feature objects to IDs for the form
        const featureIds = place.accessibility_features?.map(feature => feature.id) || [];
        
        setFormState({
          name: place.name || '',
          address: place.address || '',
          latitude: place.latitude || '',
          longitude: place.longitude || '',
          place_type: place.place_type || '',
          description: place.description || '',
          website: place.website || '',
          phone_number: place.phone_number || '',
          feature_ids: featureIds
        });
      } catch (err) {
        console.error("Error fetching place:", err);
        if (err.response?.status === 404) {
          setError('Place not found.');
        } else {
          setError('Failed to load place details. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlace();
  }, [id, isEditMode, profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleFeatureChange = (featureId) => {
    setFormState(prev => {
      const newFeatureIds = [...prev.feature_ids];
      
      if (newFeatureIds.includes(featureId)) {
        return {
          ...prev,
          feature_ids: newFeatureIds.filter(id => id !== featureId)
        };
      } else {
        return {
          ...prev,
          feature_ids: [...newFeatureIds, featureId]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      // Make API request based on create or edit mode
      if (isEditMode) {
        await apiClient.put(`/places/${id}/`, {
          ...formState,
          // Send these as part of the JSON body, not as query params
          feature_ids: formState.feature_ids
        });
      } else {
        await apiClient.post('/places/', {
          ...formState,
          feature_ids: formState.feature_ids
        });
      }
      
      // Redirect back to my places on success
      navigate('/my-places');
    } catch (err) {
      console.error("Error saving place:", err);
      setError(err.response?.data?.detail || 'Failed to save place. Please check your input and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (error && profile?.user_type !== 'provider') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Alert message={error} type="error" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {isEditMode ? 'Edit Place' : 'Add New Place'}
      </h1>

      {error && <Alert message={error} type="error" className="mb-6" />}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Name */}
          <div className="col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Place Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formState.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
            />
          </div>

          {/* Address */}
          <div className="col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address*</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formState.address}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
            />
          </div>

          {/* Latitude & Longitude */}
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input
              type="text"
              id="latitude"
              name="latitude"
              value={formState.latitude}
              onChange={handleChange}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
            />
          </div>
          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input
              type="text"
              id="longitude"
              name="longitude"
              value={formState.longitude}
              onChange={handleChange}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
            />
          </div>

          {/* Place Type */}
          <div>
            <label htmlFor="place_type" className="block text-sm font-medium text-gray-700 mb-1">Place Type*</label>
            <select
              id="place_type"
              name="place_type"
              value={formState.place_type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
            >
              <option value="">Select Type</option>
              <option value="restaurant">Restaurant</option>
              <option value="cafe">Café</option>
              <option value="shop">Shop</option>
              <option value="venue">Venue</option>
              <option value="hotel">Hotel</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formState.phone_number}
              onChange={handleChange}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
            />
          </div>

          {/* Website */}
          <div className="col-span-2">
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              id="website"
              name="website"
              value={formState.website}
              onChange={handleChange}
              placeholder="Optional - Include https://"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
            />
          </div>

          {/* Description */}
          <div className="col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formState.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
              placeholder="Describe your place, including any general accessibility information"
            ></textarea>
          </div>
        </div>

        {/* Accessibility Features */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Accessibility Features</h3>
          <p className="text-sm text-gray-500 mb-4">
            Select all the accessibility features available at this place.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map(feature => (
              <label 
                key={feature.id} 
                className="flex items-center p-3 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition duration-150 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formState.feature_ids.includes(feature.id)}
                  onChange={() => handleFeatureChange(feature.id)}
                  className="h-5 w-5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-800">{feature.name}</span>
                  {feature.description && (
                    <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/my-places')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : isEditMode ? 'Update Place' : 'Create Place'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlaceFormPage;