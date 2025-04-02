from django.contrib import admin
from .models import AccessibilityFeature, Place, UserProfile, Review

@admin.register(AccessibilityFeature)
class AccessibilityFeatureAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

class UserProfileInline(admin.StackedInline): # Or admin.TabularInline
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'
    fields = ('user_type', 'accessibility_needs') # Customize fields displayed

# Extend the default User admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

class CustomUserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'get_user_type')
    list_select_related = ('profile',)

    def get_user_type(self, instance):
        return instance.profile.get_user_type_display()
    get_user_type.short_description = 'User Type'

    def get_inline_instances(self, request, obj=None):
        if not obj:
            return list()
        return super().get_inline_instances(request, obj)

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'place_type', 'address', 'owner', 'created_at')
    list_filter = ('place_type', 'created_at')
    search_fields = ('name', 'address', 'description')
    filter_horizontal = ('accessibility_features',) # Easier ManyToMany selection
    raw_id_fields = ('owner',) # Better UI for selecting owner if many users


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('place', 'user', 'rating', 'accessibility_verification', 'created_at')
    list_filter = ('accessibility_verification', 'rating', 'created_at')
    search_fields = ('place__name', 'user__username', 'comment')
    raw_id_fields = ('place', 'user') # Better UI
    filter_horizontal = ('verified_features', 'missing_features')


# Optional: Register UserProfile directly if needed, but inline is usually better
# @admin.register(UserProfile)
# class UserProfileAdmin(admin.ModelAdmin):
#     list_display = ('user', 'user_type')
#     filter_horizontal = ('accessibility_needs',)