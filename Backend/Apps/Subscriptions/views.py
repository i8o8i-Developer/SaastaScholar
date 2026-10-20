import hmac
import hashlib
import uuid
import string
import random
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SubscriptionPlan, UserSubscription, RazorpayOrder, DiscountCoupon
from .serializers import (
    SubscriptionPlanSerializer,
    RazorpayOrderSerializer,
    DiscountCouponSerializer,
)
from Core.telemetry import start_custom_span

# Standardized Pricing Matrix (Paise: 1 INR = 100 Paise)
PRICING_MATRIX = {
    "FREE": {
        "monthly": 0,
        "semester": 0,
        "name": "Free Plan",
        "description": "Syllabus , Time Table , Faculty Materials , Notices , Exam Dates",
    },
    "BASIC": {
        "monthly": 9900,      # ₹99
        "semester": 49900,    # ₹499
        "name": "Basic Plan",
        "description": "Free + Handwritten Notes",
    },
    "PREMIUM": {
        "monthly": 12900,     # ₹129
        "semester": 64900,    # ₹649
        "name": "Premium Plan",
        "description": "Basic + Handwritten Lab Manual And Viva Practice + PYQ Question Papers",
    },
    "ELITE": {
        "monthly": 15900,     # ₹159
        "semester": 79900,    # ₹799
        "name": "Elite Plan",
        "description": "Premium + Most Expected Question Paper + Sample Practice Question Papers",
    },
    # Backwards Compatibility Aliases
    "STARTER": {
        "monthly": 0,
        "semester": 0,
        "name": "Free Plan",
        "description": "Syllabus , Time Table , Faculty Materials , Notices , Exam Dates",
    },
    "SCHOLAR": {
        "monthly": 9900,
        "semester": 49900,
        "name": "Basic Plan",
        "description": "Free + Handwritten Notes",
    },
    "ACHIEVER": {
        "monthly": 12900,
        "semester": 64900,
        "name": "Premium Plan",
        "description": "Basic + Handwritten Lab Manual And Viva Practice + PYQ Question Papers",
    },
    "ELITE_PLUS": {
        "monthly": 15900,
        "semester": 79900,
        "name": "Elite Plan",
        "description": "Premium + Most Expected Question Paper + Sample Practice Question Papers",
    },
}


class SubscriptionPlanListView(generics.ListAPIView):
    queryset = SubscriptionPlan.objects.all().order_by("price_monthly")
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]


class ApplyCouponView(APIView):
    """
    Validates A Promo Discount Coupon And Returns Discounted Price Calculation.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        code = str(request.data.get("code") or "").strip().upper()
        plan_tier = str(request.data.get("plan_tier") or "BASIC").strip().upper()
        cycle = str(request.data.get("cycle") or "monthly").strip().lower()

        if not code:
            return Response({"error": "Coupon Code Is Required."}, status=status.HTTP_400_BAD_REQUEST)

        coupon = DiscountCoupon.objects.filter(code__iexact=code, is_active=True).first()
        if not coupon:
            return Response({"error": "Invalid Or Expired Discount Code."}, status=status.HTTP_400_BAD_REQUEST)

        if coupon.valid_until and coupon.valid_until < timezone.now():
            return Response({"error": "This Coupon Code Has Expired."}, status=status.HTTP_400_BAD_REQUEST)

        if coupon.max_uses > 0 and coupon.times_used >= coupon.max_uses:
            return Response({"error": "This Coupon Code Has Reached Its Maximum Usage Limit."}, status=status.HTTP_400_BAD_REQUEST)

        if coupon.applicable_tier and coupon.applicable_tier != "ALL" and coupon.applicable_tier.upper() != plan_tier:
            return Response(
                {"error": f"This Coupon Is Only Valid For {coupon.applicable_tier} Plan."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        tier_info = PRICING_MATRIX.get(plan_tier, PRICING_MATRIX["BASIC"])
        base_amount_paise = tier_info.get(cycle, tier_info["monthly"])

        discount_paise = 0
        if coupon.discount_percent > 0:
            discount_paise = int(base_amount_paise * (coupon.discount_percent / 100.0))
        elif coupon.discount_amount > 0:
            discount_paise = coupon.discount_amount * 100

        discount_paise = min(discount_paise, base_amount_paise)
        final_amount_paise = max(0, base_amount_paise - discount_paise)

        return Response({
            "valid": True,
            "code": coupon.code,
            "discount_percent": coupon.discount_percent,
            "discount_amount_inr": round(discount_paise / 100, 2),
            "original_amount_inr": round(base_amount_paise / 100, 2),
            "final_amount_inr": round(final_amount_paise / 100, 2),
            "final_amount_paise": final_amount_paise,
            "message": f"Coupon '{coupon.code}' Applied Successfully!",
        })


class RazorpayCreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_tier = str(request.data.get("plan_tier") or "").strip().upper()
        cycle = str(request.data.get("cycle") or "monthly").strip().lower()
        coupon_code = str(request.data.get("coupon_code") or "").strip().upper()

        if plan_tier not in PRICING_MATRIX:
            return Response(
                {"error": f"Invalid Plan Tier '{plan_tier}'. Available Tiers: FREE, BASIC, PREMIUM, ELITE."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        tier_info = PRICING_MATRIX[plan_tier]
        base_amount = tier_info.get(cycle, tier_info["monthly"])
        plan_name = tier_info["name"]

        # Handle 100% Free Tier Directly
        if base_amount == 0:
            user = request.user
            user.access_tier = "FREE"
            user.save(update_fields=["access_tier"])
            return Response({
                "free_tier": True,
                "message": "Free Plan Activated Immediately. No Payment Required.",
                "plan_tier": "FREE",
            })

        final_amount = base_amount
        discount_paise = 0
        applied_coupon = None

        if coupon_code:
            coupon = DiscountCoupon.objects.filter(code__iexact=coupon_code, is_active=True).first()
            if coupon and (not coupon.valid_until or coupon.valid_until >= timezone.now()) and (coupon.max_uses <= 0 or coupon.times_used < coupon.max_uses):
                if coupon.discount_percent > 0:
                    discount_paise = int(base_amount * (coupon.discount_percent / 100.0))
                elif coupon.discount_amount > 0:
                    discount_paise = coupon.discount_amount * 100
                discount_paise = min(discount_paise, base_amount)
                final_amount = max(0, base_amount - discount_paise)
                applied_coupon = coupon

        key_id = getattr(settings, "RAZORPAY_KEY_ID", "").strip()
        key_secret = getattr(settings, "RAZORPAY_KEY_SECRET", "").strip()

        if not key_id or not key_secret:
            return Response(
                {"error": "Razorpay Payment Gateway Is Not Configured On The Server. Please Ensure RAZORPAY_KEY_ID And RAZORPAY_KEY_SECRET Are Set."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            import razorpay
            client = razorpay.Client(auth=(key_id, key_secret))
            rp_order = client.order.create({
                "amount": final_amount,
                "currency": "INR",
                "receipt": f"rcpt_{uuid.uuid4().hex[:10]}",
                "notes": {
                    "user_id": str(request.user.id),
                    "user_email": request.user.email,
                    "plan_tier": plan_tier,
                    "cycle": cycle,
                    "coupon_code": coupon_code or "",
                },
            })
            order_id = rp_order["id"]
        except Exception as exc:
            return Response(
                {"error": f"Razorpay Gateway Order Generation Failed: {str(exc)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        invoice_no = f"INV-{timezone.now().year}-{uuid.uuid4().hex[:8].upper()}"

        RazorpayOrder.objects.create(
            user=request.user,
            order_id=order_id,
            amount=final_amount,
            currency="INR",
            plan_tier=plan_tier,
            cycle=cycle,
            status="created",
            invoice_number=invoice_no,
            discount_code=coupon_code if applied_coupon else "",
            discount_amount_paise=discount_paise,
        )

        if applied_coupon:
            applied_coupon.times_used += 1
            applied_coupon.save(update_fields=["times_used"])

        return Response({
            "order_id": order_id,
            "amount": final_amount,
            "amount_inr": round(final_amount / 100, 2),
            "discount_inr": round(discount_paise / 100, 2),
            "invoice_number": invoice_no,
            "currency": "INR",
            "key_id": key_id,
            "plan_name": plan_name,
            "plan_tier": plan_tier,
            "cycle": cycle,
            "user_email": request.user.email,
            "user_name": request.user.full_name or request.user.username,
            "user_phone": request.user.phone_number or "9999999999",
        })


class RazorpayVerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = str(request.data.get("razorpay_order_id") or "").strip()
        payment_id = str(request.data.get("razorpay_payment_id") or "").strip()
        signature = str(request.data.get("razorpay_signature") or "").strip()
        plan_tier = str(request.data.get("plan_tier") or "").strip().upper()

        if not order_id or not payment_id:
            return Response({"error": "Order ID And Payment ID Are Required."}, status=status.HTTP_400_BAD_REQUEST)

        order_record = RazorpayOrder.objects.filter(order_id=order_id, user=request.user).first()
        if not order_record:
            return Response(
                {"error": f"No Matching Order Found For ID '{order_id}'."},
                status=status.HTTP_404_NOT_FOUND,
            )

        target_tier = plan_tier or order_record.plan_tier

        tier_alias_map = {
            "STARTER": "FREE",
            "SCHOLAR": "BASIC",
            "ACHIEVER": "PREMIUM",
            "ELITE_PLUS": "ELITE",
        }
        canonical_tier = tier_alias_map.get(target_tier, target_tier)

        key_id = getattr(settings, "RAZORPAY_KEY_ID", "").strip()
        key_secret = getattr(settings, "RAZORPAY_KEY_SECRET", "").strip()

        if not key_secret:
            return Response(
                {"error": "Razorpay Secret Key Is Not Configured On The Server."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if not signature:
            return Response(
                {"error": "Cryptographic Razorpay Signature Is Required For Verification."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Enforce Real Cryptographic HMAC Verification
        try:
            import razorpay
            client = razorpay.Client(auth=(key_id, key_secret))
            client.utility.verify_payment_signature({
                "razorpay_order_id": order_id,
                "razorpay_payment_id": payment_id,
                "razorpay_signature": signature,
            })
        except Exception as e:
            order_record.status = "failed"
            order_record.save(update_fields=["status", "updated_at"])
            return Response(
                {"error": f"Cryptographic Signature Verification Failed: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not order_record.invoice_number:
            order_record.invoice_number = f"INV-{timezone.now().year}-{uuid.uuid4().hex[:8].upper()}"

        order_record.status = "paid"
        order_record.payment_id = payment_id
        order_record.signature = signature
        order_record.save()

        user = request.user
        user.access_tier = canonical_tier
        user.save(update_fields=["access_tier"])

        duration_days = 180 if order_record.cycle == "semester" else 30
        now = timezone.now()
        plan_obj = SubscriptionPlan.objects.filter(tier__iexact=canonical_tier).first()
        if not plan_obj:
            tier_info = PRICING_MATRIX.get(canonical_tier, {})
            plan_obj = SubscriptionPlan.objects.create(
                tier=canonical_tier,
                name=tier_info.get("name", f"{canonical_tier.title()} Plan"),
                tagline=tier_info.get("description", ""),
                price_monthly=round(tier_info.get("monthly", 0) / 100, 2),
                price_semester=round(tier_info.get("semester", 0) / 100, 2),
            )

        UserSubscription.objects.create(
            user=user,
            plan=plan_obj,
            start_date=now,
            end_date=now + timedelta(days=duration_days),
            is_active=True,
            transaction_id=payment_id,
        )

        try:
            from Core.mail import send_payment_success_email
            send_payment_success_email(order_record)
        except Exception:
            pass

        return Response({
            "success": True,
            "message": f"Payment Verified! Your Account Is Now Upgraded To {canonical_tier} Tier.",
            "access_tier": canonical_tier,
            "order_id": order_id,
            "payment_id": payment_id,
            "invoice_number": order_record.invoice_number,
            "amount_paid": round(order_record.amount / 100, 2),
        })


# ==============================================================================
# ADMINISTRATOR CONTROLLERS FOR SUBSCRIPTIONS, ORDERS, INVOICES & COUPONS
# ==============================================================================

class AdminOrderListView(generics.ListAPIView):
    serializer_class = RazorpayOrderSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        qs = RazorpayOrder.objects.select_related("user").all().order_by("-created_at")
        status_filter = self.request.query_params.get("status")
        search = self.request.query_params.get("search")
        tier = self.request.query_params.get("tier")

        if status_filter:
            qs = qs.filter(status__iexact=status_filter)
        if tier:
            qs = qs.filter(plan_tier__iexact=tier)
        if search:
            qs = qs.filter(
                Q(order_id__icontains=search)
                | Q(payment_id__icontains=search)
                | Q(invoice_number__icontains=search)
                | Q(user__email__icontains=search)
                | Q(user__full_name__icontains=search)
                | Q(user__roll_number__icontains=search)
            )
        return qs


class AdminOrderActionView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            order = RazorpayOrder.objects.select_related("user").get(id=pk)
        except RazorpayOrder.DoesNotExist:
            return Response({"error": "Order Record Not Found."}, status=status.HTTP_404_NOT_FOUND)

        action = str(request.data.get("action") or "").strip().upper()
        reason = str(request.data.get("reason") or "Administrative Manual Intervention").strip()

        if action == "MARK_PAID":
            order.status = "paid"
            if not order.payment_id:
                order.payment_id = f"pay_admin_manual_{uuid.uuid4().hex[:10]}"
            if not order.invoice_number:
                order.invoice_number = f"INV-{timezone.now().year}-{uuid.uuid4().hex[:8].upper()}"
            order.save()

            student = order.user
            student.access_tier = order.plan_tier
            student.save(update_fields=["access_tier"])

            return Response({
                "message": f"Order Marked As PAID. Scholar '{student.email}' Access Tier Updated To '{order.plan_tier}'.",
                "order": RazorpayOrderSerializer(order).data,
            })

        elif action == "REFUND":
            order.status = "refunded"
            order.save(update_fields=["status", "updated_at"])

            student = order.user
            student.access_tier = "FREE"
            student.save(update_fields=["access_tier"])

            return Response({
                "message": f"Order Marked As REFUNDED. Scholar '{student.email}' Access Tier Set Back To Free.",
                "order": RazorpayOrderSerializer(order).data,
            })

        elif action == "REGENERATE_INVOICE":
            order.invoice_number = f"INV-{timezone.now().year}-{uuid.uuid4().hex[:8].upper()}"
            order.save(update_fields=["invoice_number", "updated_at"])
            return Response({
                "message": f"New Invoice Number '{order.invoice_number}' Generated.",
                "order": RazorpayOrderSerializer(order).data,
            })

        return Response({"error": f"Unknown action '{action}'."}, status=status.HTTP_400_BAD_REQUEST)


class AdminInvoiceDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, pk):
        try:
            order = RazorpayOrder.objects.select_related("user").get(id=pk)
        except RazorpayOrder.DoesNotExist:
            return Response({"error": "Invoice / Order Record Not Found."}, status=status.HTTP_404_NOT_FOUND)

        student = order.user
        amount_inr = round(order.amount / 100, 2)
        discount_inr = round(order.discount_amount_paise / 100, 2)
        subtotal_inr = round(amount_inr + discount_inr, 2)

        return Response({
            "invoice_number": order.invoice_number or f"INV-2026-{order.id.hex[:8].upper()}",
            "order_id": order.order_id,
            "payment_id": order.payment_id or "N/A",
            "date": order.created_at.strftime("%d %B %Y, %I:%M %p"),
            "status": order.status.upper(),
            "billing_cycle": order.cycle.title(),
            "plan_tier": order.plan_tier,
            "plan_name": PRICING_MATRIX.get(order.plan_tier, {}).get("name", f"{order.plan_tier} Plan"),
            "plan_description": PRICING_MATRIX.get(order.plan_tier, {}).get("description", ""),
            "customer": {
                "name": student.full_name or student.username,
                "email": student.email,
                "phone": student.phone_number or "N/A",
                "roll_number": student.roll_number,
                "university": student.university,
                "department": student.department,
                "semester": student.semester,
                "section": student.section,
            },
            "financials": {
                "subtotal_inr": subtotal_inr,
                "discount_code": order.discount_code or None,
                "discount_inr": discount_inr,
                "total_paid_inr": amount_inr,
                "currency": order.currency,
                "payment_gateway": "Razorpay Payments (India)",
            },
            "company": {
                "name": "SaastaScholar™ Academic Innovations",
                "parent": "DurgaAI Solutions",
                "tagline": "Quality Education, Without The Heavy Price.",
                "support_email": "support@saastascholar.in",
                "portal_domain": "saastascholar.durgaaisolutions.in",
            },
        })


class AdminCouponListCreateView(generics.ListCreateAPIView):
    queryset = DiscountCoupon.objects.all()
    serializer_class = DiscountCouponSerializer
    permission_classes = [permissions.IsAdminUser]

    def create(self, request, *args, **kwargs):
        code = str(request.data.get("code") or "").strip().upper()
        if not code:
            rand_suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
            code = f"SCHOLAR{rand_suffix}"

        if DiscountCoupon.objects.filter(code__iexact=code).exists():
            return Response({"error": f"Coupon Code '{code}' Already Exists."}, status=status.HTTP_400_BAD_REQUEST)

        discount_percent = int(request.data.get("discount_percent") or 0)
        discount_amount = int(request.data.get("discount_amount") or 0)
        max_uses = int(request.data.get("max_uses") or 100)
        applicable_tier = str(request.data.get("applicable_tier") or "ALL").strip().upper()
        valid_days = int(request.data.get("valid_days") or 30)

        valid_until = timezone.now() + timedelta(days=valid_days) if valid_days > 0 else None

        coupon = DiscountCoupon.objects.create(
            code=code,
            discount_percent=discount_percent,
            discount_amount=discount_amount,
            max_uses=max_uses,
            applicable_tier=applicable_tier,
            valid_until=valid_until,
            is_active=True,
        )

        return Response(
            {
                "message": f"Discount Code '{coupon.code}' Created Successfully!",
                "coupon": DiscountCouponSerializer(coupon).data,
            },
            status=status.HTTP_201_CREATED,
        )


class AdminCouponDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DiscountCoupon.objects.all()
    serializer_class = DiscountCouponSerializer
    permission_classes = [permissions.IsAdminUser]


class RazorpayWebhookView(APIView):
    """
    Official Razorpay Webhook Endpoint
    Verifies X-Razorpay-Signature using RAZORPAY_WEBHOOK_SECRET and processes:
    - payment.captured / order.paid: Upgrades scholar access tier
    - payment.failed: Records failed transaction
    - refund.processed: Downgrades scholar to FREE
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        secret = getattr(settings, "RAZORPAY_WEBHOOK_SECRET", "")
        signature = request.headers.get("X-Razorpay-Signature", "")
        raw_body = request.body

        # Verify Signature If Webhook Secret Is Configured
        if secret and signature:
            import hmac
            import hashlib
            expected_sig = hmac.new(
                secret.encode("utf-8"),
                raw_body,
                hashlib.sha256,
            ).hexdigest()

            if not hmac.compare_digest(expected_sig, signature):
                return Response(
                    {"error": "Invalid Webhook Cryptographic Signature."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        try:
            import json
            data = json.loads(raw_body.decode("utf-8")) if raw_body else {}
        except Exception:
            return Response({"error": "Malformed JSON Payload."}, status=status.HTTP_400_BAD_REQUEST)

        event = data.get("event", "")
        payload = data.get("payload", {})

        with start_custom_span("razorpay.process_webhook", {"webhook.event": event}) as span:
            if event in ("payment.captured", "order.paid"):
                payment_entity = payload.get("payment", {}).get("entity", {})
                order_id = payment_entity.get("order_id") or payload.get("order", {}).get("entity", {}).get("id")
                payment_id = payment_entity.get("id")

                if order_id:
                    try:
                        order = RazorpayOrder.objects.select_related("user").get(order_id=order_id)
                        order.status = "paid"
                        if payment_id and not order.payment_id:
                            order.payment_id = payment_id
                        if not order.invoice_number:
                            order.invoice_number = f"INV-{timezone.now().year}-{uuid.uuid4().hex[:8].upper()}"
                        order.save()

                        # Upgrade Scholar Plan Tier
                        student = order.user
                        student.access_tier = order.plan_tier
                        student.save(update_fields=["access_tier"])
                        try:
                            from Core.mail import send_payment_success_email
                            send_payment_success_email(order)
                        except Exception:
                            pass
                        if span:
                            span.add_event("scholar.tier_upgraded", {"student.email": student.email, "tier": order.plan_tier})
                    except RazorpayOrder.DoesNotExist:
                        pass

            elif event == "payment.failed":
                payment_entity = payload.get("payment", {}).get("entity", {})
                order_id = payment_entity.get("order_id")
                if order_id:
                    try:
                        order = RazorpayOrder.objects.get(order_id=order_id)
                        order.status = "failed"
                        order.save(update_fields=["status", "updated_at"])
                    except RazorpayOrder.DoesNotExist:
                        pass

            elif event == "refund.processed":
                refund_entity = payload.get("refund", {}).get("entity", {})
                payment_id = refund_entity.get("payment_id")
                if payment_id:
                    try:
                        order = RazorpayOrder.objects.select_related("user").get(payment_id=payment_id)
                        order.status = "refunded"
                        order.save(update_fields=["status", "updated_at"])
                        student = order.user
                        student.access_tier = "FREE"
                        student.save(update_fields=["access_tier"])
                    except RazorpayOrder.DoesNotExist:
                        pass

        return Response({"status": "ok", "message": f"Webhook '{event}' Processed Successfully."})

