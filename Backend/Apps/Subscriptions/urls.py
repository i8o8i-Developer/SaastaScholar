from django.urls import path
from .views import (
    SubscriptionPlanListView,
    RazorpayCreateOrderView,
    RazorpayVerifyPaymentView,
    ApplyCouponView,
    StudentMyInvoicesView,
    StudentInvoiceDetailView,
    AdminOrderListView,
    AdminOrderActionView,
    AdminInvoiceDetailView,
    AdminCouponListCreateView,
    AdminCouponDetailView,
    RazorpayWebhookView,
    UserAccessMatrixView,
    AdminPlanAccessMatrixView,
)

urlpatterns = [
    # Student Facing Endpoints
    path("plans/", SubscriptionPlanListView.as_view(), name="subscription-plans"),
    path("my-access/", UserAccessMatrixView.as_view(), name="subscription-my-access"),
    path("my-invoices/", StudentMyInvoicesView.as_view(), name="student-my-invoices"),
    path("my-invoices/<uuid:pk>/", StudentInvoiceDetailView.as_view(), name="student-invoice-detail"),
    path("apply-coupon/", ApplyCouponView.as_view(), name="subscription-apply-coupon"),
    path("razorpay/create-order/", RazorpayCreateOrderView.as_view(), name="razorpay-create-order"),
    path("razorpay/verify-payment/", RazorpayVerifyPaymentView.as_view(), name="razorpay-verify-payment"),
    path("webhook/", RazorpayWebhookView.as_view(), name="razorpay-webhook"),
    path("razorpay/webhook/", RazorpayWebhookView.as_view(), name="razorpay-webhook-alias"),

    # Administrator Management Endpoints
    path("admin/plans/matrix/", AdminPlanAccessMatrixView.as_view(), name="admin-plans-matrix"),
    path("admin/orders/", AdminOrderListView.as_view(), name="admin-orders-list"),
    path("admin/orders/<uuid:pk>/action/", AdminOrderActionView.as_view(), name="admin-order-action"),
    path("admin/invoices/<uuid:pk>/", AdminInvoiceDetailView.as_view(), name="admin-invoice-detail"),
    path("admin/coupons/", AdminCouponListCreateView.as_view(), name="admin-coupons-list"),
    path("admin/coupons/<uuid:pk>/", AdminCouponDetailView.as_view(), name="admin-coupon-detail"),
]