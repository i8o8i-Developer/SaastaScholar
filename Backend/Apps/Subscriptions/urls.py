from django.urls import path
from .views import (
    SubscriptionPlanListView,
    RazorpayCreateOrderView,
    RazorpayVerifyPaymentView,
    ApplyCouponView,
    AdminOrderListView,
    AdminOrderActionView,
    AdminInvoiceDetailView,
    AdminCouponListCreateView,
    AdminCouponDetailView,
    RazorpayWebhookView,
)

urlpatterns = [
    # Student Facing Endpoints
    path("plans/", SubscriptionPlanListView.as_view(), name="subscription-plans"),
    path("apply-coupon/", ApplyCouponView.as_view(), name="subscription-apply-coupon"),
    path("razorpay/create-order/", RazorpayCreateOrderView.as_view(), name="razorpay-create-order"),
    path("razorpay/verify-payment/", RazorpayVerifyPaymentView.as_view(), name="razorpay-verify-payment"),
    path("webhook/", RazorpayWebhookView.as_view(), name="razorpay-webhook"),
    path("razorpay/webhook/", RazorpayWebhookView.as_view(), name="razorpay-webhook-alias"),

    # Administrator Management Endpoints
    path("admin/orders/", AdminOrderListView.as_view(), name="admin-orders-list"),
    path("admin/orders/<uuid:pk>/action/", AdminOrderActionView.as_view(), name="admin-order-action"),
    path("admin/invoices/<uuid:pk>/", AdminInvoiceDetailView.as_view(), name="admin-invoice-detail"),
    path("admin/coupons/", AdminCouponListCreateView.as_view(), name="admin-coupons-list"),
    path("admin/coupons/<uuid:pk>/", AdminCouponDetailView.as_view(), name="admin-coupon-detail"),
]
