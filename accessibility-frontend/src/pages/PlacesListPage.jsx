// src/pages/PlacesListPage.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import PlaceCard from '../components/PlaceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const PlacesListPage = () => {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Add state for search, filters, pagination later

  useEffect(() => {
    const fetchPlaces = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get('/places/'); // Adjust if pagination is added
        setPlaces(response.data.results || response.data); // Handle potential pagination
      } catch (err) {
        console.error("Error fetching places:", err);
        setError('Failed to load places. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaces();
  }, []); // Fetch on mount

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Explore Accessible Places</h1>
      {/* Add Search/Filter bar here later */}

      {isLoading && <LoadingSpinner />}
      {error && <Alert message={error} type="error" />}

      {!isLoading && !error && (
        places.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map(place => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-10">No places found matching your criteria.</p>
        )
      )}

       {/* Add Pagination controls here later */}
    </div>
  );
};

export default PlacesListPage;