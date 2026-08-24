from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

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
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
