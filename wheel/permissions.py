from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    Assumes the model instance has an `owner` attribute.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the place.
        # Make sure the object has an 'owner' attribute
        if not hasattr(obj, 'owner'):
             # Or handle appropriately, maybe deny? Check model design.
            return False
        return obj.owner == request.user


class IsReviewOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of a review to edit it.
    Assumes the model instance has a `user` attribute.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions are only allowed to the user who created the review.
        return obj.user == request.user

class IsProfileOwner(permissions.BasePermission):
     """Allow user to edit only their own profile."""
     def has_object_permission(self, request, view, obj):
         # Check if the profile being accessed belongs to the requesting user
         return obj.user == request.user

class IsProviderUser(permissions.BasePermission):
    """
    Allows access only to users with 'provider' user_type.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.profile.user_type == 'provider'

class IsSeekerUser(permissions.BasePermission):
    """
    Allows access only to users with 'seeker' user_type.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.profile.user_type == 'seeker'