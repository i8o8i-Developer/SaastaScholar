from rest_framework import serializers
from .models import SubscriptionPlan, UserSubscription, RazorpayOrder, DiscountCoupon

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


class DiscountCouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscountCoupon
        fields = "__all__"


class RazorpayOrderSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source="user.email")
    user_name = serializers.ReadOnlyField(source="user.full_name")
    user_roll = serializers.ReadOnlyField(source="user.roll_number")
    user_tier = serializers.ReadOnlyField(source="user.access_tier")
    amount_inr = serializers.SerializerMethodField()
    discount_inr = serializers.SerializerMethodField()

    class Meta:
        model = RazorpayOrder
        fields = [
            "id",
            "order_id",
            "amount",
            "amount_inr",
            "discount_inr",
            "currency",
            "plan_tier",
            "cycle",
            "status",
            "payment_id",
            "signature",
            "invoice_number",
            "discount_code",
            "created_at",
            "updated_at",
            "user_email",
            "user_name",
            "user_roll",
            "user_tier",
        ]

    def get_amount_inr(self, obj):
        return round(obj.amount / 100, 2)

    def get_discount_inr(self, obj):
        return round(obj.discount_amount_paise / 100, 2)

