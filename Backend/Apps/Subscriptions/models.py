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
