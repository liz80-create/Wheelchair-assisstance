// src/components/PlaceCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaInfoCircle, FaStar } from 'react-icons/fa'; // Using react-icons

const PlaceCard = ({ place }) => {
  // Function to generate simple star rating (replace with actual avg rating if available)
  const renderStars = (count = place.review_count > 0 ? 4 : 0) => { // Placeholder logic
      let stars = [];
      for (let i = 0; i < 5; i++) {
          stars.push(
              <FaStar key={i} className={i < count ? 'text-yellow-400' : 'text-gray-300'} />
          );
      }
      return <div className="flex items-center">{stars} <span className='text-xs ml-1 text-gray-500'>({place.review_count || 0})</span></div>;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col">
      {/* Optional Image Placeholder */}
      {/* <img src="https://via.placeholder.com/400x200?text=Place+Image" alt={place.name} className="w-full h-40 object-cover"/> */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate">{place.name}</h3>
        <p className="text-sm text-gray-600 mb-3 flex items-center">
          <FaMapMarkerAlt className="mr-2 text-brand-gray flex-shrink-0" />
          <span className='truncate'>{place.address}</span>
        </p>
         <p className="text-sm text-gray-500 mb-3 capitalize flex items-center">
          <FaInfoCircle className="mr-2 text-brand-gray flex-shrink-0" />
          Type: {place.place_type}
        </p>
        {/* Placeholder for rating */}
         <div className="mb-4">
           {renderStars()}
         </div>

        {/* Accessibility Feature Highlights (Show a few key icons/tags) */}
        {place.accessibility_features && place.accessibility_features.length > 0 && (
           <div className="mb-4 flex flex-wrap gap-2">
             {place.accessibility_features.slice(0, 3).map(feature => ( // Show first 3 features
               <span key={feature.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                 {feature.name}
               </span>
             ))}
             {place.accessibility_features.length > 3 && (
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full font-medium">
                  +{place.accessibility_features.length - 3} more
                </span>
             )}
           </div>
        )}

        <div className="mt-auto pt-3 border-t border-gray-100">
            <Link
            to={`/places/${place.id}`}
            className="inline-block bg-brand-blue hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-200 w-full text-center"
            >
            View Details
            </Link>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;