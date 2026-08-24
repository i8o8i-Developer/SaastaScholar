from rest_framework import generics, permissions
from .models import SubscriptionPlan
from .serializers import SubscriptionPlanSerializer

class SubscriptionPlanListView(generics.ListAPIView):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]
