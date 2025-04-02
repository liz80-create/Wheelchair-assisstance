 // src/pages/RecommendationsPage.jsx
 import React, { useState, useEffect } from 'react';
 import apiClient from '../services/api';
 import PlaceCard from '../components/PlaceCard';
 import LoadingSpinner from '../components/LoadingSpinner';
 import Alert from '../components/Alert';
 import { useAuth } from '../contexts/AuthContext';
 import { Link } from 'react-router-dom';
 
 const RecommendationsPage = () => {
     const [recommendations, setRecommendations] = useState([]);
     const [isLoading, setIsLoading] = useState(true);
     const [error, setError] = useState(null);
     const { profile } = useAuth(); // Get profile info
 
     useEffect(() => {
         // Only fetch if the user is a seeker and profile is loaded
         if (profile?.user_type === 'seeker') {
             const fetchRecommendations = async () => {
                 setIsLoading(true);
                 setError(null);
                 try {
                     const response = await apiClient.get('/recommendations/');
                      setRecommendations(response.data.results || response.data); // Handle pagination if added
 
                      // Check if the user has defined needs - API might return empty if not
                     if (profile.accessibility_needs?.length === 0 && response.data.results?.length === 0) {
                          setError("Please specify your accessibility needs in your profile to get recommendations.");
                      } else if (response.data.results?.length === 0 && profile.accessibility_needs?.length > 0) {
                         // Has needs, but no places match
                          setError("We couldn't find any places matching all your current needs. Try adjusting your needs or explore all places.");
                      }
 
                 } catch (err) {
                     console.error("Error fetching recommendations:", err);
                      if (err.response?.status === 403) { // Forbidden likely means not a seeker
                         setError('You must be logged in as an Accessibility Seeker to view recommendations.');
                      } else {
                         setError('Failed to load recommendations. Please try again later.');
                      }
                 } finally {
                     setIsLoading(false);
                 }
             };
             fetchRecommendations();
         } else if (profile) {
             // User is logged in but not a seeker
              setError('Recommendations are only available for Accessibility Seekers.');
              setIsLoading(false);
         } else {
              // Profile not yet loaded (or user not logged in)
              // AuthContext loading state should handle the spinner
              setIsLoading(false); // Stop local loading if profile isn't ready
         }
 
     }, [profile]); // Re-fetch if profile changes (e.g., user logs in/out, type changes)
 
     // Initial loading state handled by AuthContext loading
     if (!profile && isLoading) return <LoadingSpinner />; // Show spinner while profile loads
 
     return (
         <div>
             <h1 className="text-3xl font-bold text-gray-800 mb-6">Places Recommended For You</h1>
 
             {isLoading && <LoadingSpinner />}
             {error && (
                 <Alert message={error} type={recommendations.length > 0 ? "info" : "warning"}>
                      {/* Add link to profile if error mentions needs */}
                      {error.includes("needs") && (
                          <Link to="/profile" className="font-medium text-brand-blue hover:underline ml-2">Update Profile</Link>
                      )}
                 </Alert>
             )}
 
 
             {!isLoading && !error && recommendations.length === 0 && (
                 <p className="text-center text-gray-500 mt-10">
                     No recommendations found based on your current needs.
                      <Link to="/places" className="text-brand-blue hover:underline ml-1">Explore all places?</Link>
                 </p>
             )}
 
             {!isLoading && recommendations.length > 0 && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     {recommendations.map(place => (
                         <PlaceCard key={place.id} place={place} />
                     ))}
                 </div>
             )}
         </div>
     );
 };
 
 export default RecommendationsPage;