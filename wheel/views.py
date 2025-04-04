# from django.shortcuts import get_object_or_404
# from rest_framework import viewsets, generics, permissions, status
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from rest_framework.views import APIView
# from django.contrib.auth.models import User
# from django.db.models import Count, Q

# from .models import AccessibilityFeature, Place, UserProfile, Review
# from .serializers import (
#     AccessibilityFeatureSerializer, PlaceSerializer, UserSerializer,
#     UserProfileSerializer, ReviewSerializer, RegisterSerializer
# )
# from .permissions import IsOwnerOrReadOnly, IsReviewOwnerOrReadOnly, IsProfileOwner, IsProviderUser, IsSeekerUser

# # --- Authentication Views ---
# class RegisterView(generics.CreateAPIView):
#     queryset = User.objects.all()
#     permission_classes = (permissions.AllowAny,)
#     serializer_class = RegisterSerializer

# # Note: Login (Token Obtain) and Refresh views are provided by simplejwt, configured in urls.py

# # --- User Profile View ---
# class UserProfileView(generics.RetrieveUpdateAPIView):
#     """
#     Get or Update the profile for the currently authenticated user.
#     """
#     queryset = UserProfile.objects.all()
#     serializer_class = UserProfileSerializer
#     permission_classes = [permissions.IsAuthenticated, IsProfileOwner]

#     def get_object(self):
#         # Ensure users can only access their own profile via this endpoint
#         profile = get_object_or_404(UserProfile, user=self.request.user)
#         self.check_object_permissions(self.request, profile) # Check IsProfileOwner
#         return profile

#     def perform_update(self, serializer):
#          # Ensure needs_ids are handled correctly if sent
#         if 'needs_ids' in self.request.data:
#             serializer.save(accessibility_needs=self.request.data['needs_ids'])
#         else:
#             serializer.save()


# # --- Accessibility Feature View ---
# class AccessibilityFeatureViewSet(viewsets.ReadOnlyModelViewSet):
#     """
#     Lists all available accessibility features. Read-only.
#     """
#     queryset = AccessibilityFeature.objects.all()
#     serializer_class = AccessibilityFeatureSerializer
#     permission_classes = [permissions.AllowAny] # Anyone can see features

# # --- Place View ---
# class PlaceViewSet(viewsets.ModelViewSet):
#     """
#     API endpoint for Places.
#     - List all places (GET)
#     - Retrieve a specific place (GET /places/{id}/)
#     - Create a place (POST - requires 'provider' user type)
#     - Update a place (PUT/PATCH - requires owner or admin)
#     - Delete a place (DELETE - requires owner or admin)
#     """
#     queryset = Place.objects.all().prefetch_related('accessibility_features', 'reviews').annotate(review_count=Count('reviews'))
#     serializer_class = PlaceSerializer

#     def get_permissions(self):
#         """
#         Instantiates and returns the list of permissions that this view requires.
#         """
#         if self.action == 'create':
#             # Only authenticated 'provider' users can create places
#             permission_classes = [permissions.IsAuthenticated, IsProviderUser]
#         elif self.action in ['update', 'partial_update', 'destroy']:
#             # Only the owner can modify/delete
#             permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
#         else: # list, retrieve
#             permission_classes = [permissions.AllowAny] # Anyone can view
#         return [permission() for permission in permission_classes]

#     def perform_create(self, serializer):
#         # Assign the logged-in user as the owner when creating a place
#         serializer.save(owner=self.request.user)

#     def perform_update(self, serializer):
#          # Ensure feature_ids are handled correctly if sent
#         if 'feature_ids' in self.request.data:
#             serializer.save(accessibility_features=self.request.data['feature_ids'])
#         else:
#             serializer.save()

#     # Optional: Add search/filtering capabilities
#     # filter_backends = [filters.SearchFilter, filters.OrderingFilter]
#     # search_fields = ['name', 'address', 'description', 'place_type']
#     # ordering_fields = ['name', 'created_at', 'rating'] # Add rating field later


# # --- Review View ---
# class ReviewViewSet(viewsets.ModelViewSet):
#     """
#     API endpoint for Reviews.
#     - List reviews (GET - optionally filtered by place_id in query params)
#     - Retrieve a specific review (GET /reviews/{id}/)
#     - Create a review (POST - requires authenticated user)
#     - Update a review (PUT/PATCH - requires review owner)
#     - Delete a review (DELETE - requires review owner)
#     """
#     queryset = Review.objects.all().select_related('user', 'place').prefetch_related('verified_features', 'missing_features')
#     serializer_class = ReviewSerializer

#     def get_permissions(self):
#         """Set permissions based on action."""
#         if self.action == 'create':
#             # Any authenticated user can create a review
#             permission_classes = [permissions.IsAuthenticated]
#         elif self.action in ['update', 'partial_update', 'destroy']:
#             # Only the review owner can modify/delete
#             permission_classes = [permissions.IsAuthenticated, IsReviewOwnerOrReadOnly]
#         else: # list, retrieve
#             permission_classes = [permissions.AllowAny] # Anyone can view reviews
#         return [permission() for permission in permission_classes]

#     def get_queryset(self):
#         """Optionally filter reviews by place."""
#         queryset = super().get_queryset()
#         place_id = self.request.query_params.get('place_id')
#         if place_id:
#             queryset = queryset.filter(place_id=place_id)
#         return queryset

#     def perform_create(self, serializer):
#         # Assign the logged-in user to the review
#         # Place ID should be provided in the request data
#         place_id = self.request.data.get('place')
#         if not place_id:
#              raise serializers.ValidationError({'place': 'Place ID must be provided.'})
#         place = get_object_or_404(Place, pk=place_id)
#         serializer.save(user=self.request.user, place=place)

#     def perform_update(self, serializer):
#          # Ensure feature IDs are handled correctly if sent
#         verified_ids = self.request.data.get('verified_feature_ids')
#         missing_ids = self.request.data.get('missing_feature_ids')
#         kwargs = {}
#         if verified_ids is not None: # Check explicitly for None allows sending empty list
#              kwargs['verified_features'] = verified_ids
#         if missing_ids is not None:
#              kwargs['missing_features'] = missing_ids
#         serializer.save(**kwargs)


# # --- Recommendation View ---
# class RecommendationView(generics.ListAPIView):
#     """
#     Provides personalized place recommendations based on the user's needs.
#     Requires authentication and 'seeker' user type.
#     """
#     serializer_class = PlaceSerializer
#     permission_classes = [permissions.IsAuthenticated, IsSeekerUser]

#     def get_queryset(self):
#         user = self.request.user
#         try:
#             profile = user.profile
#         except UserProfile.DoesNotExist:
#             return Place.objects.none() # Or handle error

#         user_needs_ids = profile.accessibility_needs.values_list('id', flat=True)

#         if not user_needs_ids:
#             # If user has no needs specified, return general popular/recent places?
#             # For now, return empty or maybe all places (limited by pagination)
#             # return Place.objects.all()[:20] # Example: Limit results
#             return Place.objects.none() # Return nothing if no needs specified

#         # --- Recommendation Logic ---
#         # Strategy 1: Find places that have ALL the user's required features.
#         # This can be very restrictive.
#         # places_with_all_needs = Place.objects.filter(
#         #     accessibility_features__id__in=user_needs_ids
#         # ).annotate(
#         #     needs_met_count=Count('accessibility_features', filter=Q(accessibility_features__id__in=user_needs_ids))
#         # ).filter(needs_met_count=len(user_needs_ids))

#         # Strategy 2: Find places that have ANY of the user's required features and order by match count.
#         # More flexible.
#         places_with_any_needs = Place.objects.filter(
#             accessibility_features__id__in=user_needs_ids
#         ).distinct() # Ensure unique places if they match multiple needs

#         # Annotate with the count of matching needs for ranking
#         places_ranked = places_with_any_needs.annotate(
#             matching_needs_count=Count(
#                 'accessibility_features',
#                 filter=Q(accessibility_features__id__in=user_needs_ids)
#             )
#         ).order_by('-matching_needs_count', 'name') # Order by most matches, then name

#         # --- Refinements (Optional) ---
#         # - Factor in review verification status?
#         # - Factor in overall ratings?
#         # - Add location-based filtering (if lat/lon provided)?

#         return places_ranked
# wheel/views.py

from django.shortcuts import get_object_or_404
from rest_framework import viewsets, generics, permissions, status, serializers # Added serializers for validation error
from rest_framework.decorators import action, api_view, permission_classes # Added api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.db.models import Count, Q
from rest_framework.permissions import IsAuthenticated # Added IsAuthenticated

from .models import AccessibilityFeature, Place, UserProfile, Review
from .serializers import (
    AccessibilityFeatureSerializer, PlaceSerializer, UserSerializer, # Ensure UserSerializer is imported
    UserProfileSerializer, ReviewSerializer, RegisterSerializer
)
from .permissions import IsOwnerOrReadOnly, IsReviewOwnerOrReadOnly, IsProfileOwner, IsProviderUser, IsSeekerUser

# --- Authentication Views ---

class RegisterView(generics.CreateAPIView):
    """
    Handles user registration.
    """
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,) # Anyone can attempt to register
    serializer_class = RegisterSerializer
    # Default CreateModelMixin handles saving via serializer.create

# --- Added View for Current User Details ---
@api_view(['GET']) # Specify allowed method is GET
@permission_classes([IsAuthenticated]) # Ensure only logged-in users can access
def get_current_user(request):
    """
    Returns details for the currently authenticated user based on the provided token.
    """
    # request.user is automatically populated by Django REST Framework
    # when a valid token is provided in the Authorization header.
    serializer = UserSerializer(request.user) # Use your existing UserSerializer
    return Response(serializer.data)
# --- End Added View ---


# --- User Profile View ---
class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Get or Update the profile for the currently authenticated user.
    Uses IsProfileOwner permission to ensure users only modify their own profile.
    """
    queryset = UserProfile.objects.select_related('user').prefetch_related('accessibility_needs') # Optimization
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsProfileOwner] # IsAuthenticated first

    def get_object(self):
        """
        Retrieve the profile associated with the request.user.
        Permission check (IsProfileOwner) is implicitly handled by DRF
        based on the queryset and lookup field (which defaults to pk,
        but since we override get_object, we explicitly check permissions).
        """
        # We don't need UserProfile.objects.all() here, just get the specific one.
        profile = get_object_or_404(UserProfile, user=self.request.user)
        # Although IsProfileOwner checks this, it's good practice to call explicitly
        # when overriding get_object if the permission logic isn't obvious.
        self.check_object_permissions(self.request, profile)
        return profile

    # NOTE: The perform_update logic was moved into the UserProfileSerializer
    # using PrimaryKeyRelatedField and source='accessibility_needs'.
    # DRF handles the update based on validated_data['needs_ids'] automatically now.
    # If you needed more complex logic, you would override perform_update or update method.
    # def perform_update(self, serializer):
    #     # Example of custom logic if needed:
    #     # instance = serializer.save() # Default save happens first
    #     # Add custom actions here...
    #     # If needs_ids is directly in validated_data (due to PrimaryKeyRelatedField),
    #     # DRF's default save handles the M2M update.
    #     serializer.save()


# --- Accessibility Feature View ---
class AccessibilityFeatureViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lists all available accessibility features. Read-only for all users.
    """
    queryset = AccessibilityFeature.objects.all().order_by('name') # Ensure consistent ordering
    serializer_class = AccessibilityFeatureSerializer
    permission_classes = [permissions.AllowAny] # Anyone can see features


# --- Place View ---
class PlaceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Places. Allows CRUD operations based on permissions.
    - List all places (GET - any user)
    - Retrieve a specific place (GET /places/{id}/ - any user)
    - Create a place (POST - requires authenticated 'provider' user)
    - Update a place (PUT/PATCH - requires place owner)
    - Delete a place (DELETE - requires place owner)
    """
    # Optimized queryset: prefetch related features/reviews and annotate count
    queryset = Place.objects.all().select_related('owner').prefetch_related(
        'accessibility_features', 'reviews'
    ).annotate(
        review_count=Count('reviews')
    ).order_by('name') # Default ordering

    serializer_class = PlaceSerializer
    # filter_backends = [...] # Add filtering/searching later if needed
    # search_fields = [...]
    # filterset_fields = [...]

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires
        based on the current action (list, create, retrieve, update, destroy).
        """
        if self.action == 'create':
            # Only authenticated 'provider' users can create places
            permission_classes = [permissions.IsAuthenticated, IsProviderUser]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Only the owner can modify/delete (IsOwnerOrReadOnly handles this)
            permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
        else: # list, retrieve, other custom actions
            permission_classes = [permissions.AllowAny] # Anyone can view
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """
        Assign the currently logged-in user as the owner when creating a new place.
        Permission check (IsProviderUser) already happened in get_permissions.
        """
        serializer.save(owner=self.request.user)

    # NOTE: perform_update for handling 'feature_ids' moved to PlaceSerializer logic
    # using PrimaryKeyRelatedField and source='accessibility_features'.
    # def perform_update(self, serializer):
    #     serializer.save()


# --- Review View ---
class ReviewViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Reviews. Allows CRUD operations based on permissions.
    - List reviews (GET - any user, filterable by place_id)
    - Retrieve a specific review (GET /reviews/{id}/ - any user)
    - Create a review (POST - requires authenticated user)
    - Update a review (PUT/PATCH - requires review owner)
    - Delete a review (DELETE - requires review owner)
    """
    # Optimized queryset: select related user/place, prefetch features
    queryset = Review.objects.all().select_related(
        'user', 'place'
    ).prefetch_related(
        'verified_features', 'missing_features'
    ).order_by('-created_at') # Default ordering: newest first

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
        """
        Override to allow filtering reviews by 'place_id' query parameter.
        Example: GET /api/v1/reviews/?place_id=5
        """
        queryset = super().get_queryset()
        # Filter by place if place_id is provided in query params
        place_id = self.request.query_params.get('place_id')
        if place_id:
            # Validate place_id is an integer before filtering
            try:
                place_id_int = int(place_id)
                queryset = queryset.filter(place_id=place_id_int)
            except (ValueError, TypeError):
                # Optional: You could raise a validation error here
                # but often it's okay to just return an empty list if invalid ID format
                return queryset.none() # Return empty queryset for invalid place_id format
        return queryset

    def perform_create(self, serializer):
        """
        Assign the currently logged-in user to the review upon creation.
        The 'place' ID must be provided in the request data.
        """
        # Permission check (IsAuthenticated) already happened.
        # The serializer's validation ensures 'place' is provided and valid.
        # We just need to inject the user.
        serializer.save(user=self.request.user)
        # Note: place is handled by the serializer validation now if 'place' is a required writeable field.

    # NOTE: perform_update for handling 'verified_feature_ids' and 'missing_feature_ids'
    # moved to ReviewSerializer logic using PrimaryKeyRelatedField.
    # def perform_update(self, serializer):
    #     serializer.save()


# --- Recommendation View ---
class RecommendationView(generics.ListAPIView):
    """
    Provides personalized place recommendations based on the authenticated
    'seeker' user's accessibility needs stored in their profile.
    """
    serializer_class = PlaceSerializer # Reuse PlaceSerializer for output
    permission_classes = [permissions.IsAuthenticated, IsSeekerUser] # Must be logged in and a seeker

    def get_queryset(self):
        """
        Generate queryset based on user's needs.
        Returns places ordered by the number of matching accessibility needs.
        """
        user = self.request.user
        # Get user's profile safely
        try:
            # Select related needs to avoid extra queries
            profile = UserProfile.objects.prefetch_related('accessibility_needs').get(user=user)
        except UserProfile.DoesNotExist:
             # This shouldn't happen if the signal works, but handle defensively
            return Place.objects.none() # Return empty queryset if no profile

        # Get IDs of features the user needs
        user_needs_ids = profile.accessibility_needs.values_list('id', flat=True)

        if not user_needs_ids:
            # If user has no needs specified, return nothing for now.
            # Could potentially return popular places later.
            return Place.objects.none()

        # Find places that have ANY of the user's required features
        # Using distinct() is important as a place matching multiple needs would appear multiple times otherwise
        places_with_any_needs = Place.objects.filter(
            accessibility_features__id__in=user_needs_ids
        ).distinct()

        # Annotate with the count of matching needs for ranking
        # We filter the count specifically to only include features the user needs
        places_ranked = places_with_any_needs.annotate(
            matching_needs_count=Count(
                'accessibility_features',
                filter=Q(accessibility_features__id__in=user_needs_ids)
            )
        ).select_related('owner').prefetch_related( # Add prefetching for serialization efficiency
             'accessibility_features'
        ).order_by('-matching_needs_count', 'name') # Order by most matches first, then alphabetically

        # Further refinements could be added here (e.g., location proximity, ratings)

        return places_ranked