// src/pages/MyPlacesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { FaPlus, FaEdit, FaTrash, FaBuilding, FaExclamationTriangle } from 'react-icons/fa';

const MyPlacesPage = () => {
  const { user, profile } = useAuth();
  const [myPlaces, setMyPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Fetch places owned by the current user
  useEffect(() => {
    const fetchMyPlaces = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      try {
        // The API doesn't have a dedicated my-places endpoint, so we'll get all places and filter
        // In a production app, you would want a dedicated API endpoint for this
        const response = await apiClient.get('/places/');
        const places = response.data.results || response.data;
        
        // Filter places where the current user is the owner
        const userPlaces = places.filter(place => place.owner?.id === user.id);
        setMyPlaces(userPlaces);
      } catch (err) {
        console.error("Error fetching my places:", err);
        setError('Failed to load your places. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyPlaces();
  }, [user]);

  // Check if user is a provider
  useEffect(() => {
    if (profile && profile.user_type !== 'provider') {
      setError('Only provider accounts can manage places.');
      setIsLoading(false);
    }
  }, [profile]);

  const handleDelete = async (placeId) => {
    setDeleteLoading(true);
    try {
      await apiClient.delete(`/places/${placeId}/`);
      setMyPlaces(myPlaces.filter(place => place.id !== placeId));
      setSuccessMessage('Place successfully deleted.');
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting place:", err);
      setError('Failed to delete place. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (isLoading) return <LoadingSpinner />;
  
  if (error && profile?.user_type !== 'provider') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert message={error} type="error">
          <Link to="/profile" className="text-brand-blue hover:underline font-medium ml-2">
            Return to Profile
          </Link>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Places</h1>
        <button
          onClick={() => navigate('/places/new')}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-brand-green hover:bg-green-600 text-white font-medium rounded-md transition duration-150"
        >
          <FaPlus className="mr-2" /> Add New Place
        </button>
      </div>

      {error && <Alert message={error} type="error" className="mb-6" />}
      {successMessage && <Alert message={successMessage} type="success" className="mb-6" />}

      {myPlaces.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <FaBuilding className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-medium text-gray-700 mb-2">No Places Added Yet</h2>
          <p className="text-gray-500 mb-6">
            Start helping people find accessible locations by adding your first place.
          </p>
          <button
            onClick={() => navigate('/places/new')}
            className="inline-flex items-center px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white font-medium rounded-md transition duration-150"
          >
            <FaPlus className="mr-2" /> Add Your First Place
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {myPlaces.map(place => (
              <li key={place.id} className="p-4 sm:p-6 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-lg font-medium text-gray-900">
                      <Link to={`/places/${place.id}`} className="hover:text-brand-blue">
                        {place.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{place.address}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="mr-2">{place.place_type}</span>
                      <span>•</span>
                      <span className="mx-2">{place.review_count || 0} reviews</span>
                      <span>•</span>
                      <span className="mx-2">{place.accessibility_features?.length || 0} accessibility features</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Link
                      to={`/places/${place.id}/edit`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FaEdit className="mr-1.5" /> Edit
                    </Link>
                    
                    {deleteConfirm === place.id ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDelete(place.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700"
                          disabled={deleteLoading}
                        >
                          {deleteLoading ? 'Deleting...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                          disabled={deleteLoading}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(place.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 hover:text-red-600"
                      >
                        <FaTrash className="mr-1.5" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MyPlacesPage;