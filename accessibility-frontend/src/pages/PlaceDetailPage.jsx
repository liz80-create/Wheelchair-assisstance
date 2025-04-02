// src/pages/PlaceDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { 
  FaMapMarkerAlt, FaPhone, FaGlobe, FaCheckCircle, FaTimesCircle, 
  FaEdit, FaStar, FaRegStar, FaWheelchair, FaDirections, FaShare 
} from 'react-icons/fa';

// Simple Review Card Component
const ReviewCard = ({ review }) => {
    // Helper to display verification status with icons/colors
    const VerificationStatus = ({ status, verified = [], missing = [] }) => {
        let icon = <FaCheckCircle className="text-gray-500 mr-1" />;
        let text = "Not Verified Yet";
        let color = "text-gray-500";
        let details = "";

        switch (status) {
            case 'verified':
                icon = <FaCheckCircle className="text-green-500 mr-1" />;
                text = "Verified Accurate";
                color = "text-green-600 font-semibold";
                if (verified.length > 0) details = `Confirmed: ${verified.map(f => f.name).join(', ')}`;
                break;
            case 'inaccurate':
                icon = <FaTimesCircle className="text-red-500 mr-1" />;
                text = "Information Inaccurate";
                color = "text-red-600 font-semibold";
                if (missing.length > 0) details = `Claimed but missing: ${missing.map(f => f.name).join(', ')}`;
                break;
            case 'partial':
                icon = <FaEdit className="text-yellow-500 mr-1" />;
                text = "Partially Accurate";
                color = "text-yellow-600 font-semibold";
                if (verified.length > 0) details += ` Confirmed: ${verified.map(f => f.name).join(', ')}.`;
                if (missing.length > 0) details += ` Missing: ${missing.map(f => f.name).join(', ')}.`;
                break;
        }
        return (
            <div className={`text-sm flex flex-col mt-2 ${color}`}>
               <div className="flex items-center">{icon} {text}</div>
               {details && <p className="text-xs text-gray-500 ml-5">{details.trim()}</p>}
            </div>
        );
    };

    // Simple Star Rating Display
    const StarRating = ({ rating }) => {
        const totalStars = 5;
        return (
            <div className="flex items-center">
                {[...Array(totalStars)].map((_, i) =>
                    i < rating ? 
                      <FaStar key={i} className="text-yellow-400" /> : 
                      <FaRegStar key={i} className="text-gray-300" />
                )}
            </div>
        );
    };

    // Format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="bg-white border border-gray-200 p-5 rounded-lg mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <p className="font-semibold text-gray-800">{review.user?.username || 'Anonymous'}</p>
                    <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
                </div>
                <StarRating rating={review.rating} />
            </div>
            {review.comment && <p className="text-gray-700 mb-3">{review.comment}</p>}
            <div className="bg-gray-50 p-3 rounded-md">
                <VerificationStatus 
                    status={review.accessibility_verification} 
                    verified={review.verified_features} 
                    missing={review.missing_features}
                />
                {review.accessibility_rating && (
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                        <span className="mr-2 flex items-center"><FaWheelchair className="text-brand-blue mr-1"/> Accessibility Rating:</span> 
                        <StarRating rating={review.accessibility_rating}/>
                    </div>
                )}
            </div>
        </div>
    );
};

const PlaceDetailPage = () => {
  const { id } = useParams(); // Get place ID from URL
  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'reviews'

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch place details and reviews in parallel
        const [placeResponse, reviewsResponse] = await Promise.all([
          apiClient.get(`/places/${id}/`),
          apiClient.get(`/reviews/?place_id=${id}`) // Filter reviews by place ID
        ]);
        setPlace(placeResponse.data);
        setReviews(reviewsResponse.data.results || reviewsResponse.data); // Handle pagination
      } catch (err) {
        console.error("Error fetching place details:", err);
        if (err.response?.status === 404) {
          setError('Place not found.');
        } else {
          setError('Failed to load place details. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaceDetails();
  }, [id]); // Re-fetch if ID changes

  if (isLoading) return <LoadingSpinner />;
  if (error) return <Alert message={error} type="error" />;
  if (!place) return <Alert message="Place data could not be loaded." type="warning"/>; // Should be caught by error state normally

  // Calculate average accessibility rating
  const avgAccessibilityRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + (review.accessibility_rating || 0), 0) / reviews.length).toFixed(1)
    : 'N/A';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Section with Hero Image */}
      <div className="bg-brand-blue bg-opacity-10 p-6 md:p-8 rounded-xl shadow-md mb-8 border border-brand-blue border-opacity-20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 md:mb-0">{place.name}</h1>
          <div className="flex items-center space-x-2">
            <span className="bg-brand-blue text-white text-sm font-medium px-3 py-1 rounded-full flex items-center">
              <FaWheelchair className="mr-1" /> {avgAccessibilityRating === 'N/A' ? 'Not rated yet' : `${avgAccessibilityRating}/5`}
            </span>
            <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition duration-150">
              <FaShare className="text-gray-600" />
            </button>
          </div>
        </div>
        <p className="text-md text-gray-600 mb-4 flex items-center">
          <FaMapMarkerAlt className="mr-2 text-brand-gray flex-shrink-0" /> {place.address}
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-4">
          {place.phone_number && (
            <span className="flex items-center">
              <FaPhone className="mr-1.5 text-brand-gray" /> {place.phone_number}
            </span>
          )}
          {place.website && (
            <a href={place.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-brand-blue hover:underline">
              <FaGlobe className="mr-1.5" /> Visit Website
            </a>
          )}
          <a href={`https://maps.google.com/?q=${place.address}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-brand-green hover:underline">
            <FaDirections className="mr-1.5" /> Get Directions
          </a>
        </div>
        {place.description && <p className="text-gray-700 mb-4">{place.description}</p>}
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Accessibility Info
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reviews'
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'info' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Accessibility Features</h2>
          {place.accessibility_features && place.accessibility_features.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {place.accessibility_features.map(feature => (
                <div key={feature.id} className="flex items-start bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                  <FaCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-gray-800">{feature.name}</span>
                    {feature.description && <p className="text-sm text-gray-600 mt-1">{feature.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg">
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
                No specific accessibility features listed for this place yet.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Community Reviews & Verification</h2>
            <Link 
              to={`/places/${id}/add-review`} 
              className="inline-block bg-brand-green hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 text-sm flex items-center"
            >
              <FaEdit className="mr-1"/> Add Review
            </Link>
          </div>

          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FaWheelchair className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-500 mb-4">Be the first to review this place!</p>
              <Link 
                to={`/places/${id}/add-review`} 
                className="inline-block bg-brand-blue hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 text-sm"
              >
                Add Your Review
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlaceDetailPage;