import { apiFetch } from "./Api";
import { toast } from "sonner";

interface RazorpayOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  plan_name: string;
  plan_tier: string;
  cycle: string;
  user_email?: string;
  user_name?: string;
  user_phone?: string;
}

interface RazorpayVerifyResponse {
  success: boolean;
  access_tier: string;
  plan_name: string;
  payment_id: string;
  expires_in_days: number;
  message: string;
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn("Razorpay SDK Could Not Be Loaded Via CDN");
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export async function initiateRazorpayPayment({
  planTier,
  cycle = "monthly",
  couponCode,
  onSuccess,
  onError,
}: {
  planTier: "FREE" | "BASIC" | "PREMIUM" | "ELITE" | "STARTER" | "SCHOLAR" | "ACHIEVER" | "ELITE_PLUS" | string;
  cycle?: "monthly" | "semester";
  couponCode?: string;
  onSuccess?: (res: RazorpayVerifyResponse) => void;
  onError?: (err: any) => void;
}) {
  const loadingToast = toast.loading(`Initiating Secure Payment For ${planTier}...`);

  try {
    // 1. Create Order on Backend
    const orderData = await apiFetch<any>("/subscriptions/razorpay/create-order/", {
      method: "POST",
      body: JSON.stringify({
        plan_tier: planTier,
        cycle,
        coupon_code: couponCode,
      }),
    });

    toast.dismiss(loadingToast);

    // If 100% Free Plan activated directly
    if (orderData.free_tier) {
      toast.success(orderData.message || "Free Plan Activated Successfully!");
      if (onSuccess) {
        onSuccess({
          success: true,
          access_tier: "FREE",
          plan_name: "Free Plan",
          payment_id: "free_tier",
          expires_in_days: 365,
          message: orderData.message,
        });
      }
      return;
    }

    // 2. Load SDK
    const isLoaded = await loadRazorpayScript();

    // 3. Fallback or Standard Razorpay Gateway
    if (isLoaded && (window as any).Razorpay && !orderData.key_id.startsWith("rzp_test_mock")) {
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "SaastaScholar™",
        description: `${orderData.plan_name} (${cycle === "semester" ? "Semester Pass" : "Monthly"})`,
        image: "/SaastaScholar.png",
        order_id: orderData.order_id,
        handler: async function (response: any) {
          const verifyToast = toast.loading("Verifying Transaction With Bank Gateway...");
          try {
            const verifyRes = await apiFetch<RazorpayVerifyResponse>(
              "/subscriptions/razorpay/verify-payment/",
              {
                method: "POST",
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id || orderData.order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature || "",
                  plan_tier: planTier,
                }),
              }
            );
            toast.dismiss(verifyToast);
            toast.success(verifyRes.message || "Plan Upgrade Activated Successfully!");
            if (onSuccess) onSuccess(verifyRes);
          } catch (verifyErr: any) {
            toast.dismiss(verifyToast);
            toast.error(verifyErr.message || "Payment Verification Failed.");
            if (onError) onError(verifyErr);
          }
        },
        prefill: {
          name: orderData.user_name || "Student Scholar",
          email: orderData.user_email || "",
          contact: orderData.user_phone || "9999999999",
        },
        theme: {
          color: "#005F15", // Saasta Scholar Forest Green
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment window dismissed.");
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
    } else {
      // Test / Sandbox Simulation Mode (Instant Seamless Verification)
      const confirmSimulated = window.confirm(
        `[SaastaScholar Sandbox Gateway]\n\nAuthorize Payment Of ₹${orderData.amount / 100} For ${orderData.plan_name}?\n\nClick OK To Simulate Successful Razorpay Transaction.`
      );

      if (confirmSimulated) {
        const verifyToast = toast.loading("Confirming Sandbox Student Upgrade...");
        const mockPaymentId = `pay_mock_${Date.now()}`;
        const verifyRes = await apiFetch<RazorpayVerifyResponse>(
          "/subscriptions/razorpay/verify-payment/",
          {
            method: "POST",
            body: JSON.stringify({
              razorpay_order_id: orderData.order_id,
              razorpay_payment_id: mockPaymentId,
              razorpay_signature: "mock_signature_authorized",
              plan_tier: planTier,
            }),
          }
        );
        toast.dismiss(verifyToast);
        toast.success(verifyRes.message || "Account Upgraded Successfully!");
        if (onSuccess) onSuccess(verifyRes);
      } else {
        toast.info("Upgrade Cancelled.");
      }
    }
  } catch (err: any) {
    toast.dismiss(loadingToast);
    toast.error(err.message || "Failed To Initialize Payment Gateway.");
    if (onError) onError(err);
  }
}
