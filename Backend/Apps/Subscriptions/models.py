import uuid
from django.db import models
from django.conf import settings

class SubscriptionPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tier = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    tagline = models.CharField(max_length=255, blank=True)
    price_monthly = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    price_semester = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    is_popular = models.BooleanField(default=False)
    badge = models.CharField(max_length=50, blank=True)
    features_list = models.JSONField(default=list)
    permissions = models.JSONField(default=dict, blank=True, help_text="Configurable Tab And Feature Access Matrix")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.tier})"

class UserSubscription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="subscriptions")
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    transaction_id = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.user.email} - {self.plan.name}"


class DiscountCoupon(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True, db_index=True)
    discount_percent = models.PositiveIntegerField(default=0, help_text="Percentage discount (0-100)")
    discount_amount = models.PositiveIntegerField(default=0, help_text="Flat discount in INR")
    max_uses = models.PositiveIntegerField(default=100)
    times_used = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True, db_index=True)
    applicable_tier = models.CharField(max_length=50, blank=True, default="ALL")
    valid_until = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.code} ({self.discount_percent}% / ₹{self.discount_amount} off)"


class RazorpayOrder(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="razorpay_orders")
    order_id = models.CharField(max_length=100, unique=True, db_index=True)
    amount = models.PositiveIntegerField(help_text="Amount in paise")
    currency = models.CharField(max_length=10, default="INR")
    plan_tier = models.CharField(max_length=50, db_index=True)
    cycle = models.CharField(max_length=20, default="monthly")
    status = models.CharField(max_length=30, default="created", db_index=True)
    payment_id = models.CharField(max_length=100, blank=True)
    signature = models.CharField(max_length=255, blank=True)
    invoice_number = models.CharField(max_length=50, blank=True, db_index=True)
    discount_code = models.CharField(max_length=50, blank=True)
    discount_amount_paise = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} - {self.order_id} ({self.status})"

