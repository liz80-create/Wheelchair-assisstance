# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import (
#     AccessibilityFeatureViewSet, PlaceViewSet, ReviewViewSet,
#     RegisterView, UserProfileView, RecommendationView
# )
# # Import simplejwt views
# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
#     TokenRefreshView,
# )

# # Create a router and register our viewsets with it.
# router = DefaultRouter()
# router.register(r'features', AccessibilityFeatureViewSet, basename='feature')
# router.register(r'places', PlaceViewSet, basename='place')
# router.register(r'reviews', ReviewViewSet, basename='review')
# # Note: User/Profile are handled by specific views below, not a viewset

# # The API URLs are now determined automatically by the router.
# urlpatterns = [
#     # Authentication
#     path('auth/register/', RegisterView.as_view(), name='auth_register'),
#     path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # POST username/password -> tokens
#     path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # POST refresh token -> new access token

#     # User Profile
#     path('profile/', UserProfileView.as_view(), name='user_profile'), # GET/PUT/PATCH for logged-in user's profile

#     # Recommendations
#     path('recommendations/', RecommendationView.as_view(), name='recommendations'),

#     # ViewSet routes
#     path('', include(router.urls)), # Includes /features/, /places/, /reviews/
# ]
# wheel/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AccessibilityFeatureViewSet, PlaceViewSet, ReviewViewSet,
    RegisterView, UserProfileView, RecommendationView, get_current_user # Make sure get_current_user is imported if added
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'features', AccessibilityFeatureViewSet, basename='feature')
router.register(r'places', PlaceViewSet, basename='place')
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    # Ensure this path has the trailing slash
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', get_current_user, name='auth_me'), # Ensure this exists if used by AuthProvider

    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('recommendations/', RecommendationView.as_view(), name='recommendations'),

    # Include router URLs (these typically handle slashes automatically)
    path('', include(router.urls)),
]