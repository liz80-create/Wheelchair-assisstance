// // src/App.jsx
// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import Layout from './components/Layout';
// import HomePage from './pages/HomePage';
// import PlacesListPage from './pages/PlacesListPage';
// import PlaceDetailPage from './pages/PlaceDetailPage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import ProfilePage from './pages/ProfilePage';
// import RecommendationsPage from './pages/RecommendationsPage';
// import NotFoundPage from './pages/NotFoundPage';
// import { useAuth } from './contexts/AuthContext'; // Import useAuth
// import LoadingSpinner from './components/LoadingSpinner'; // Import LoadingSpinner
// import MyPlacesPage from './pages/MyPlacesPage';
// import PlaceFormPage from './pages/PlaceFormPage';
// // Protected Route Component
// const ProtectedRoute = ({ children }) => {
//     const { isAuthenticated, isLoading } = useAuth();

//     if (isLoading) {
//         // Show a loading indicator while checking auth status
//         return <div className='pt-20'><LoadingSpinner /></div>;
//     }

//     if (!isAuthenticated) {
//         // Redirect them to the /login page, but save the current location they were
//         // trying to go to. This allows us to send them back after login.
//         return <Navigate to="/login" replace />;
//     }

//     return children; // Render the children (the protected page) if authenticated
// };

// // Seeker Protected Route Component (Example)
// const SeekerRoute = ({ children }) => {
//     const { isAuthenticated, isLoading, profile } = useAuth();

//     if (isLoading) {
//         return <div className='pt-20'><LoadingSpinner /></div>;
//     }

//     if (!isAuthenticated) {
//         return <Navigate to="/login" replace />;
//     }

//     if (profile?.user_type !== 'seeker') {
//          // Or show a 'Forbidden' message page
//          return <Navigate to="/profile" replace />; // Redirect non-seekers
//     }

//     return children;
// }

// function App() {
//   const { isLoading } = useAuth(); // Get loading state

//   // Optional: Show a full-page loader while auth context initializes
//    if (isLoading) {
//        return (
//           <div className="flex justify-center items-center min-h-screen">
//                <LoadingSpinner />
//            </div>
//         );
//    }

//   return (
//     <Layout> {/* Apply layout to all pages */}
//       <Routes>
//         {/* Public Routes */}
//         <Route path="/" element={<HomePage />} />
//         <Route path="/places" element={<PlacesListPage />} />
//         <Route path="/places/:id" element={<PlaceDetailPage />} />
//         {/* TODO: Add route for adding reviews: /places/:id/add-review */}
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/register" element={<RegisterPage />} />
//         <Route path="/places/new" element={<PlaceFormPage />} />
//         <Route path="/places/:id/edit" element={<PlaceFormPage />} />
//         <Route path ="/my-places" element={<MyPlacesPage />} />
//         {/* Protected Routes (Require Login) */}
//          <Route
//             path="/profile"
//             element={
//                 <ProtectedRoute>
//                     <ProfilePage />
//                 </ProtectedRoute>
//             }
//          />
//          <Route
//             path="/recommendations"
//             element={
//                 <SeekerRoute> {/* Example: Only seekers can access */}
//                     <RecommendationsPage />
//                 </SeekerRoute>
//             }
//          />
//         {/* TODO: Add routes for place owners: /my-places, /places/new, /places/:id/edit */}


//         {/* Catch-all Not Found Route */}
//         <Route path="*" element={<NotFoundPage />} />
//       </Routes>
//     </Layout>
//   );
// }

// export default App;

// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PlacesListPage from './pages/PlacesListPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import RecommendationsPage from './pages/RecommendationsPage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuth } from './contexts/AuthContext'; // Import useAuth
import LoadingSpinner from './components/LoadingSpinner'; // Import LoadingSpinner
import MyPlacesPage from './pages/MyPlacesPage';
import PlaceFormPage from './pages/PlaceFormPage';
import AddReviewPage from './pages/AddReviewPage'; // Import AddReviewPage

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        // Show a loading indicator while checking auth status
        return <div className='pt-20'><LoadingSpinner /></div>;
    }

    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to. This allows us to send them back after login.
        return <Navigate to="/login" replace />;
    }

    return children; // Render the children (the protected page) if authenticated
};

// Seeker Protected Route Component (Example)
const SeekerRoute = ({ children }) => {
    const { isAuthenticated, isLoading, profile } = useAuth();

    if (isLoading) {
        return <div className='pt-20'><LoadingSpinner /></div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (profile?.user_type !== 'seeker') {
         // Or show a 'Forbidden' message page
         return <Navigate to="/profile" replace />; // Redirect non-seekers
    }

    return children;
}

function App() {
  const { isLoading } = useAuth(); // Get loading state

  // Optional: Show a full-page loader while auth context initializes
   if (isLoading) {
       return (
          <div className="flex justify-center items-center min-h-screen">
               <LoadingSpinner />
           </div>
        );
   }

  return (
    <Layout> {/* Apply layout to all pages */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/places" element={<PlacesListPage />} />
        <Route path="/places/:id" element={<PlaceDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/places/new" element={<PlaceFormPage />} />
        <Route path="/places/:id/edit" element={<PlaceFormPage />} />
        <Route path="/my-places" element={<MyPlacesPage />} />
        
        {/* Review Route */}
        <Route 
          path="/places/:id/add-review" 
          element={
            <ProtectedRoute>
              <AddReviewPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected Routes (Require Login) */}
         <Route
            path="/profile"
            element={
                <ProtectedRoute>
                    <ProfilePage />
                </ProtectedRoute>
            }
         />
         <Route
            path="/recommendations"
            element={
                <SeekerRoute> {/* Example: Only seekers can access */}
                    <RecommendationsPage />
                </SeekerRoute>
            }
         />

        {/* Catch-all Not Found Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;