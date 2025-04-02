from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('wheel.urls')), # Include your app's API urls
    # Optional: Add root endpoint or documentation later
    # path('', ...)
]