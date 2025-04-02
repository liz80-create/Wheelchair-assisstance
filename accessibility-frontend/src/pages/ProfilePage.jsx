// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom'; // Add this import
import apiClient from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const ProfilePage = () => {
    const { user, profile, isLoading: authLoading, updateUserProfile } = useAuth();
    const [allFeatures, setAllFeatures] = useState([]);
    const [selectedNeeds, setSelectedNeeds] = useState(new Set());
    const [isLoadingFeatures, setIsLoadingFeatures] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');

    // Fetch all available features once
    useEffect(() => {
        const fetchFeatures = async () => {
            setIsLoadingFeatures(true);
            try {
                const response = await apiClient.get('/features/');
                setAllFeatures(response.data.results || response.data);
            } catch (err) {
                console.error("Failed to fetch features:", err);
                setError("Could not load accessibility features list.");
            } finally {
                setIsLoadingFeatures(false);
            }
        };
        fetchFeatures();
    }, []);

    // Set initial selected needs when profile data loads
    useEffect(() => {
        if (profile?.accessibility_needs) {
            setSelectedNeeds(new Set(profile.accessibility_needs.map(need => need.id)));
        }
    }, [profile]); // Depend on profile object

    const handleNeedChange = (featureId) => {
        setSelectedNeeds(prevNeeds => {
            const newNeeds = new Set(prevNeeds);
            if (newNeeds.has(featureId)) {
                newNeeds.delete(featureId);
            } else {
                newNeeds.add(featureId);
            }
            return newNeeds;
        });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess('');
        setIsUpdating(true);

        const needsData = {
            needs_ids: Array.from(selectedNeeds) // Send array of IDs
        };

        try {
             await updateUserProfile(needsData);
             setSuccess('Profile updated successfully!');
        } catch (err) {
             setError('Failed to update profile. Please try again.');
             console.error("Profile update error:", err);
        } finally {
             setIsUpdating(false);
        }
    };

    if (authLoading || isLoadingFeatures) return <LoadingSpinner />;
    if (!profile || !user) return <Alert message="User profile not loaded. Please try logging in again." type="warning" />;


    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Profile</h1>

            {error && <Alert message={error} type="error" />}
            {success && <Alert message={success} type="success" />}


            <div className="mb-6 pb-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Account Details</h2>
                <p><span className="font-medium">Username:</span> {user.username}</p>
                 {/* Display email, name from User model if fetched/available */}
                <p><span className="font-medium">User Type:</span> <span className='capitalize'>{profile.user_type}</span></p>
            </div>

            {/* Only show Accessibility Needs for 'seeker' */}
            {profile.user_type === 'seeker' && (
                <form onSubmit={handleProfileUpdate}>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">My Accessibility Needs</h2>
                     <p className="text-sm text-gray-600 mb-5">Select the features that are important for you when visiting a place. This helps us provide better recommendations.</p>

                    <div className="space-y-3 mb-6">
                        {allFeatures.length > 0 ? (
                            allFeatures.map(feature => (
                                <label key={feature.id} className="flex items-center p-3 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition duration-150 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedNeeds.has(feature.id)}
                                        onChange={() => handleNeedChange(feature.id)}
                                        className="h-5 w-5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                                    />
                                    <span className="ml-3 text-sm font-medium text-gray-800">{feature.name}</span>
                                     {/* Optional: Show description on hover/click */}
                                     {feature.description && <span className="ml-auto text-xs text-gray-500 hidden md:block truncate" title={feature.description}>({feature.description})</span>}
                                </label>
                            ))
                        ) : (
                            <p className='text-gray-500'>Loading features...</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isUpdating}
                        className={`w-full md:w-auto px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isUpdating ? 'Saving...' : 'Save My Needs'}
                    </button>
                </form>
            )}

             {/* If user type is 'provider', show link to manage places */}
              {profile.user_type === 'provider' && (
                <div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Place Management</h2>
                    <p className='text-gray-600 mb-4'>Manage the accessibility information for places you own.</p>
                    {/* TODO: Add link/button to a "My Places" page */}
                     <Link to="/my-places" className="inline-block px-6 py-2 border border-brand-blue text-brand-blue text-sm font-medium rounded-md hover:bg-blue-50 transition duration-150">
                       Manage My Places
                     </Link>
                     {/* My Places page needs to be created */}
                </div>
            )}

        </div>
    );
};

export default ProfilePage;