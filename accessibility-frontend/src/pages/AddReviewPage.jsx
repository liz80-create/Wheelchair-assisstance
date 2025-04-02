// src/pages/AddReviewPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { useAuth } from '../contexts/AuthContext';
import StarRating from '../components/StarRating';

const AddReviewPage = () => {
    const { id } = useParams(); // Get place ID from URL
    const navigate = useNavigate();
    const { profile, isLoading: authLoading } = useAuth();
    
    const [place, setPlace] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [accessibilityFeatures, setAccessibilityFeatures] = useState([]);
    
    // Form state
    const [rating, setRating] = useState(0);
    const [accessibilityRating, setAccessibilityRating] = useState(0);
    const [comment, setComment] = useState('');
    const [verifiedFeatures, setVerifiedFeatures] = useState([]);
    const [missingFeatures, setMissingFeatures] = useState([]);

    // Fetch the place details and accessibility features
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Get place details
                const placeResponse = await apiClient.get(`/places/${id}/`);
                setPlace(placeResponse.data);
                
                // Get accessibility features
                const featuresResponse = await apiClient.get('/features/');
                const features = featuresResponse.data.results || featuresResponse.data;
                setAccessibilityFeatures(features);
                
            } catch (err) {
                console.error("Error fetching data:", err);
                setError('Failed to load place details. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchData();
    }, [id]);

    const handleVerifiedFeatureToggle = (featureId) => {
        if (verifiedFeatures.includes(featureId)) {
            setVerifiedFeatures(verifiedFeatures.filter(id => id !== featureId));
        } else {
            setVerifiedFeatures([...verifiedFeatures, featureId]);
            // If feature is being marked as verified, remove from missing if present
            if (missingFeatures.includes(featureId)) {
                setMissingFeatures(missingFeatures.filter(id => id !== featureId));
            }
        }
    };

    const handleMissingFeatureToggle = (featureId) => {
        if (missingFeatures.includes(featureId)) {
            setMissingFeatures(missingFeatures.filter(id => id !== featureId));
        } else {
            setMissingFeatures([...missingFeatures, featureId]);
            // If feature is being marked as missing, remove from verified if present
            if (verifiedFeatures.includes(featureId)) {
                setVerifiedFeatures(verifiedFeatures.filter(id => id !== featureId));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (rating === 0) {
            setError('Please provide an overall rating');
            return;
        }
        
        if (accessibilityRating === 0) {
            setError('Please provide an accessibility rating');
            return;
        }
        
        setIsSaving(true);
        
        const reviewData = {
            place: parseInt(id),
            rating,
            accessibility_rating: accessibilityRating,
            comment,
            verified_feature_ids: verifiedFeatures,
            missing_feature_ids: missingFeatures,
            // Remove the accessibility_verification field as it seems to be
            // automatically determined by the backend based on verified/missing features
        };
        
        try {
            await apiClient.post('/reviews/', reviewData);
            // Navigate back to the place detail page after successful submission
            navigate(`/places/${id}`);
        } catch (err) {
            console.error("Error submitting review:", err);
            setError('Failed to submit your review. Please try again.');
            if (err.response && err.response.data) {
                // Show more detailed API error if available
                const errorMessages = Object.entries(err.response.data)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ');
                setError(`API Error: ${errorMessages}`);
            }
        } finally {
            setIsSaving(false);
        }
    };
    if (authLoading || isLoading) return <LoadingSpinner />;
    
    if (!profile) {
        return <Alert message="You must be logged in to submit a review." type="warning" />;
    }
    
    if (!place) {
        return <Alert message="Place not found." type="error" />;
    }

    return (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <div className="mb-6">
                <Link to={`/places/${id}`} className="text-brand-blue hover:underline flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to {place.name}
                </Link>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-4">Write a Review for {place.name}</h1>
            
            {error && <Alert message={error} type="error" className="mb-4" />}
            
            <form onSubmit={handleSubmit}>
                {/* Overall Rating */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Overall Rating</label>
                    <div className="flex items-center">
                        <StarRating 
                            rating={rating} 
                            onChange={setRating} 
                            size={8} 
                            interactive={true} 
                        />
                        <span className="ml-2 text-gray-600">
                            {rating > 0 ? `${rating} out of 5 stars` : 'Select a rating'}
                        </span>
                    </div>
                </div>
                
                {/* Accessibility Rating */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Accessibility Rating</label>
                    <div className="flex items-center">
                        <StarRating 
                            rating={accessibilityRating} 
                            onChange={setAccessibilityRating} 
                            size={8} 
                            interactive={true} 
                        />
                        <span className="ml-2 text-gray-600">
                            {accessibilityRating > 0 ? `${accessibilityRating} out of 5 stars` : 'Select a rating'}
                        </span>
                    </div>
                </div>
                
                {/* Comment */}
                <div className="mb-6">
                    <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
                        Your Experience (Optional)
                    </label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        rows="4"
                        placeholder="Share details about your experience at this place..."
                    ></textarea>
                </div>
                
                {/* Accessibility Features */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Accessibility Features Verification</h2>
                    <p className="text-gray-600 mb-4">
                        Indicate which features you found at the location and which ones were missing.
                    </p>
                    
                    <div className="space-y-6">
                        {accessibilityFeatures.map(feature => (
                            <div key={feature.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex flex-col space-y-3">
                                    <div className="font-medium text-gray-800">{feature.name}</div>
                                    {feature.description && (
                                        <p className="text-sm text-gray-600">{feature.description}</p>
                                    )}
                                    
                                    <div className="flex space-x-4 mt-2">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`verified-${feature.id}`}
                                                checked={verifiedFeatures.includes(feature.id)}
                                                onChange={() => handleVerifiedFeatureToggle(feature.id)}
                                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor={`verified-${feature.id}`} className="ml-2 text-sm text-gray-700">
                                                Feature Present
                                            </label>
                                        </div>
                                        
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`missing-${feature.id}`}
                                                checked={missingFeatures.includes(feature.id)}
                                                onChange={() => handleMissingFeatureToggle(feature.id)}
                                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor={`missing-${feature.id}`} className="ml-2 text-sm text-gray-700">
                                                Feature Missing
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => navigate(`/places/${id}`)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={`px-6 py-2 bg-brand-blue text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue ${
                            isSaving ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddReviewPage;