from rest_framework import serializers
from .models import SubscriptionPlan, UserSubscription

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = [
            "id",
            "tier",
            "name",
            "tagline",
            "price_monthly",
            "price_semester",
            "is_popular",
            "badge",
            "features_list",
        ]
