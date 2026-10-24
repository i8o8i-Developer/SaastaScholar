from django.contrib import admin
from django.urls import include, path, re_path
from django.conf import settings
from django.views.static import serve

urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("api/auth/", include("Apps.Accounts.urls")),
    path("api/accounts/", include("Apps.Accounts.urls")),
    path("api/academic/", include("Apps.Academic.urls")),
    path("api/assignments/", include("Apps.Assignments.urls")),
    path("api/planner/", include("Apps.Planner.urls")),
    path("api/drm/", include("Apps.DrmProtection.urls")),
    path("api/subscriptions/", include("Apps.Subscriptions.urls")),
    path("api/community/", include("Apps.Community.urls")),
    
    # Always Serve Uploaded Avatars & Media Assets In Dev & Production Fallback
    re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
]
