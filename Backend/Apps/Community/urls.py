from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupportTicketViewSet, ForumPostViewSet, ForumCommentViewSet

router = DefaultRouter()
router.register(r'desk', SupportTicketViewSet, basename='desk')
router.register(r'forum', ForumPostViewSet, basename='forum')
router.register(r'comments', ForumCommentViewSet, basename='comments')

urlpatterns = [
    path('', include(router.urls)),
]
