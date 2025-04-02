from django.shortcuts import get_object_or_404
from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.db.models import Count, Q

from .models import AccessibilityFeature, Place, UserProfile, Review
from .serializers import (
    AccessibilityFeatureSerializer, PlaceSerializer, UserSerializer,
    UserProfileSerializer, ReviewSerializer, RegisterSerializer
)
from .permissions import IsOwnerOrReadOnly, IsReviewOwnerOrReadOnly, IsProfileOwner, IsProviderUser, IsSeekerUser

# --- Authentication Views ---
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

# Note: Login (Token Obtain) and Refresh views are provided by simplejwt, configured in urls.py

# --- User Profile View ---
class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Get or Update the profile for the currently authenticated user.
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsProfileOwner]

    def get_object(self):
        # Ensure users can only access their own profile via this endpoint
        profile = get_object_or_404(UserProfile, user=self.request.user)
        self.check_object_permissions(self.request, profile) # Check IsProfileOwner
        return profile

    def perform_update(self, serializer):
         # Ensure needs_ids are handled correctly if sent
        if 'needs_ids' in self.request.data:
            serializer.save(accessibility_needs=self.request.data['needs_ids'])
        else:
            serializer.save()


# --- Accessibility Feature View ---
class AccessibilityFeatureViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lists all available accessibility features. Read-only.
    """
    queryset = AccessibilityFeature.objects.all()
    serializer_class = AccessibilityFeatureSerializer
    permission_classes = [permissions.AllowAny] # Anyone can see features

# --- Place View ---
class PlaceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Places.
    - List all places (GET)
    - Retrieve a specific place (GET /places/{id}/)
    - Create a place (POST - requires 'provider' user type)
    - Update a place (PUT/PATCH - requires owner or admin)
    - Delete a place (DELETE - requires owner or admin)
    """
    queryset = Place.objects.all().prefetch_related('accessibility_features', 'reviews').annotate(review_count=Count('reviews'))
    serializer_class = PlaceSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'create':
            # Only authenticated 'provider' users can create places
            permission_classes = [permissions.IsAuthenticated, IsProviderUser]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Only the owner can modify/delete
            permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
        else: # list, retrieve
            permission_classes = [permissions.AllowAny] # Anyone can view
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        # Assign the logged-in user as the owner when creating a place
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
         # Ensure feature_ids are handled correctly if sent
        if 'feature_ids' in self.request.data:
            serializer.save(accessibility_features=self.request.data['feature_ids'])
        else:
            serializer.save()

    # Optional: Add search/filtering capabilities
    # filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    # search_fields = ['name', 'address', 'description', 'place_type']
    # ordering_fields = ['name', 'created_at', 'rating'] # Add rating field later


# --- Review View ---
class ReviewViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Reviews.
    - List reviews (GET - optionally filtered by place_id in query params)
    - Retrieve a specific review (GET /reviews/{id}/)
    - Create a review (POST - requires authenticated user)
    - Update a review (PUT/PATCH - requires review owner)
    - Delete a review (DELETE - requires review owner)
    """
    queryset = Review.objects.all().select_related('user', 'place').prefetch_related('verified_features', 'missing_features')
    serializer_class = ReviewSerializer

    def get_permissions(self):
        """Set permissions based on action."""
        if self.action == 'create':
            # Any authenticated user can create a review
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Only the review owner can modify/delete
            permission_classes = [permissions.IsAuthenticated, IsReviewOwnerOrReadOnly]
        else: # list, retrieve
            permission_classes = [permissions.AllowAny] # Anyone can view reviews
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Optionally filter reviews by place."""
        queryset = super().get_queryset()
        place_id = self.request.query_params.get('place_id')
        if place_id:
            queryset = queryset.filter(place_id=place_id)
        return queryset

    def perform_create(self, serializer):
        # Assign the logged-in user to the review
        # Place ID should be provided in the request data
        place_id = self.request.data.get('place')
        if not place_id:
             raise serializers.ValidationError({'place': 'Place ID must be provided.'})
        place = get_object_or_404(Place, pk=place_id)
        serializer.save(user=self.request.user, place=place)

    def perform_update(self, serializer):
         # Ensure feature IDs are handled correctly if sent
        verified_ids = self.request.data.get('verified_feature_ids')
        missing_ids = self.request.data.get('missing_feature_ids')
        kwargs = {}
        if verified_ids is not None: # Check explicitly for None allows sending empty list
             kwargs['verified_features'] = verified_ids
        if missing_ids is not None:
             kwargs['missing_features'] = missing_ids
        serializer.save(**kwargs)


# --- Recommendation View ---
class RecommendationView(generics.ListAPIView):
    """
    Provides personalized place recommendations based on the user's needs.
    Requires authentication and 'seeker' user type.
    """
    serializer_class = PlaceSerializer
    permission_classes = [permissions.IsAuthenticated, IsSeekerUser]

    def get_queryset(self):
        user = self.request.user
        try:
            profile = user.profile
        except UserProfile.DoesNotExist:
            return Place.objects.none() # Or handle error

        user_needs_ids = profile.accessibility_needs.values_list('id', flat=True)

        if not user_needs_ids:
            # If user has no needs specified, return general popular/recent places?
            # For now, return empty or maybe all places (limited by pagination)
            # return Place.objects.all()[:20] # Example: Limit results
            return Place.objects.none() # Return nothing if no needs specified

        # --- Recommendation Logic ---
        # Strategy 1: Find places that have ALL the user's required features.
        # This can be very restrictive.
        # places_with_all_needs = Place.objects.filter(
        #     accessibility_features__id__in=user_needs_ids
        # ).annotate(
        #     needs_met_count=Count('accessibility_features', filter=Q(accessibility_features__id__in=user_needs_ids))
        # ).filter(needs_met_count=len(user_needs_ids))

        # Strategy 2: Find places that have ANY of the user's required features and order by match count.
        # More flexible.
        places_with_any_needs = Place.objects.filter(
            accessibility_features__id__in=user_needs_ids
        ).distinct() # Ensure unique places if they match multiple needs

        # Annotate with the count of matching needs for ranking
        places_ranked = places_with_any_needs.annotate(
            matching_needs_count=Count(
                'accessibility_features',
                filter=Q(accessibility_features__id__in=user_needs_ids)
            )
        ).order_by('-matching_needs_count', 'name') # Order by most matches, then name

        # --- Refinements (Optional) ---
        # - Factor in review verification status?
        # - Factor in overall ratings?
        # - Add location-based filtering (if lat/lon provided)?

        return places_ranked