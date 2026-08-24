from django.urls import path
from .views import SubscriptionPlanListView

urlpatterns = [
    path("plans/", SubscriptionPlanListView.as_view(), name="subscription-plans"),
]
