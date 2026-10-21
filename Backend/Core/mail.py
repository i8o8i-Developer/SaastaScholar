import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from Core.telemetry import start_custom_span

logger = logging.getLogger("saastascholar.mail")

def get_sender_email():
    """
    Returns Valid Sender Email Address
    Ensures Compatibility With Gmail SMTP & Enterprise Relays
    """
    host_user = getattr(settings, "EMAIL_HOST_USER", "").strip()
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "").strip()
    if from_email and ("@" in from_email):
        return from_email
    if host_user and ("@" in host_user):
        return f"SaastaScholar Support <{host_user}>"
    return "support@saastascholar.in"


def build_brand_email_template(title: str, preheader: str, content_html: str) -> str:
    """
    Renders Responsive, Professional HTML Email Template In SaastaScholar Brand Aesthetics
    """
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #0d140e;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
      -webkit-font-smoothing: antialiased;
    }}
    .container {{
      max-width: 600px;
      margin: 32px auto;
      background-color: #121c14;
      border: 1px solid #1f3322;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }}
    .header {{
      background: linear-gradient(135deg, #005F15 0%, #00360c 100%);
      padding: 32px 24px;
      text-align: center;
      border-bottom: 1px solid #1f3322;
    }}
    .logo-text {{
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      margin: 0;
    }}
    .tagline {{
      font-size: 12px;
      color: #a7f3d0;
      margin: 6px 0 0 0;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: 600;
    }}
    .body {{
      padding: 36px 32px;
      color: #cbd5e1;
      font-size: 15px;
      line-height: 1.6;
    }}
    .otp-box {{
      margin: 28px 0;
      background-color: #0b140c;
      border: 1px dashed #10b981;
      border-radius: 14px;
      padding: 20px;
      text-align: center;
    }}
    .otp-code {{
      font-size: 36px;
      font-weight: 900;
      color: #34d399;
      letter-spacing: 8px;
      font-family: monospace;
      margin: 0;
    }}
    .footer {{
      padding: 24px 32px;
      background-color: #0b140c;
      border-top: 1px solid #1a2c1d;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }}
    .badge {{
      display: inline-block;
      padding: 4px 10px;
      background-color: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 16px;
    }}
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    {preheader}
  </div>
  <div class="container">
    <div class="header">
      <h1 class="logo-text">SaastaScholar™</h1>
      <p class="tagline">Quality Education, Without The Heavy Price</p>
    </div>
    <div class="body">
      {content_html}
    </div>
    <div class="footer">
      <p style="margin: 0 0 8px 0;">&copy; 2026 <strong>SaastaScholar</strong> · Owned & Engineered By DurgaAI Solutions.</p>
      <p style="margin: 0; font-size: 11px;">Protected Under The Digital Personal Data Protection Act, 2023 (DPDP Act).</p>
    </div>
  </div>
</body>
</html>"""


def send_system_email(subject: str, recipient_email: str, text_content: str, html_content: str = None, reply_to: list = None) -> tuple:
    """
    Robust Email Dispatcher With OpenTelemetry Tracing & Comprehensive Error Handling
    Returns (True, None) on Success, (False, error_str) on Failure
    """
    recipient_email = str(recipient_email or "").strip().lower()
    if not recipient_email or "@" not in recipient_email:
        return False, "Invalid Recipient Email Address."

    from_email = get_sender_email()
    reply_to_list = reply_to or ["support@saastascholar.in"]

    import time
    with start_custom_span("email.dispatch", {
        "email.recipient": recipient_email,
        "email.subject": subject,
        "email.from": from_email,
    }) as span:
        last_error = "Unknown Dispatch Failure"
        for attempt in range(2):
            try:
                msg = EmailMultiAlternatives(
                    subject=subject,
                    body=text_content,
                    from_email=from_email,
                    to=[recipient_email],
                    reply_to=reply_to_list,
                )
                if html_content:
                    msg.attach_alternative(html_content, "text/html")

                msg.send(fail_silently=False)

                logger.info(f"-> [Email Dispatch] Successfully Delivered '{subject}' To {recipient_email}")
                if span:
                    span.set_attribute("email.status", "delivered")
                return True, None
            except Exception as exc:
                last_error = str(exc)
                logger.warning(f"-> [Email Dispatch Attempt {attempt + 1} Failed] {last_error}")
                if attempt == 0:
                    time.sleep(0.6)
                    continue

        logger.error(f"-> [Email Dispatch Failed] Could Not Send '{subject}' To {recipient_email}: {last_error}")
        if span:
            span.set_attribute("email.status", "failed")
            span.set_attribute("email.error", last_error)
        return False, last_error


def send_password_reset_email(user, otp: str) -> tuple:
    """
    Sends High-Security 6-Digit Password Reset Verification Code Email
    """
    full_name = getattr(user, "full_name", "") or getattr(user, "username", "") or "Scholar"
    subject = f"Your Verification Code: {otp} · SaastaScholar Security"
    preheader = f"Your 6-Digit Password Reset Verification Code is {otp}."

    text_body = f"""Hello {full_name},

You Requested To Reset Your Account Password On SaastaScholar.

Your 6-Digit Password Reset Verification Code Is:
{otp}

This Code Is Strictly Confidential And Expires In 15 Minutes.
If You Did Not Make This Request, Please Disregard This Email.

— The SaastaScholar Academic Security Team
"""

    html_content = f"""
      <span class="badge">Security Verification</span>
      <h2 style="color:#ffffff; font-size:20px; font-weight:700; margin-top:0;">Password Reset Verification Code</h2>
      <p>Hello <strong>{full_name}</strong>,</p>
      <p>We Received An Official Request To Reset The Password For Your SaastaScholar Account (<code>{user.email}</code>).</p>
      <div class="otp-box">
        <p style="font-size:12px; color:#94a3b8; text-transform:uppercase; margin:0 0 8px 0; font-weight:700; letter-spacing:1px;">6-Digit Verification Code</p>
        <p class="otp-code">{otp}</p>
      </div>
      <p style="font-size:13px; color:#94a3b8;">
        ⏱️ <strong>This Code Will Expire In 15 Minutes.</strong><br>
        🔒 For Your Security, Never Share This Verification Code With Anyone.
      </p>
      <p style="margin-top:24px; font-size:13px; color:#64748b;">
        If You Did Not Request This Password Reset, No Action Is Needed — Your Account Remains Completely Secure.
      </p>
    """

    full_html = build_brand_email_template("Password Reset Verification Code", preheader, html_content)
    return send_system_email(subject, user.email, text_body, full_html)


def send_welcome_email(user) -> tuple:
    """
    Sends Onboarding Welcome Email Upon Successful Scholar Registration
    """
    full_name = getattr(user, "full_name", "") or getattr(user, "username", "") or "Scholar"
    program = getattr(user, "program", "Academic Program")
    roll = getattr(user, "roll_number", "Unassigned")
    tier = getattr(user, "access_tier", "FREE")

    subject = f"Welcome To SaastaScholar, {full_name}! · Academic Portal Activated"
    preheader = "Your Academic Workspace Is Now Active. Access Verified Notes, Syllabus And Lab Manuals."

    text_body = f"""Welcome To SaastaScholar, {full_name}!

Your Student Account Has Been Created Successfully.

Academic Profile:
- Degree Course: {program}
- Roll Number: {roll}
- Current Access Tier: {tier}

Access Your Study Portal:
https://saastascholar.durgaaisolutions.in/login

— The SaastaScholar Academic Team
"""

    html_content = f"""
      <span class="badge">Welcome Scholar</span>
      <h2 style="color:#ffffff; font-size:20px; font-weight:700; margin-top:0;">Welcome To SaastaScholar™</h2>
      <p>Hello <strong>{full_name}</strong>,</p>
      <p>Congratulations! Your Academic Account Has Been Initialized Successfully. You Now Have Instant Access To Verified University Notes, Solved Exam Papers, Lab Practicals, And Syllabus Guides.</p>
      
      <div style="background-color:#0b140c; border:1px solid #1f3322; border-radius:12px; padding:18px; margin:20px 0;">
        <p style="margin:0 0 6px 0; font-size:13px;"><strong>Program:</strong> <span style="color:#34d399;">{program}</span></p>
        <p style="margin:0 0 6px 0; font-size:13px;"><strong>Roll Number:</strong> <span style="color:#34d399;">{roll}</span></p>
        <p style="margin:0; font-size:13px;"><strong>Membership Tier:</strong> <span style="color:#34d399;">{tier}</span></p>
      </div>

      <div style="text-align:center; margin:28px 0;">
        <a href="https://saastascholar.durgaaisolutions.in/login" style="display:inline-block; background-color:#005F15; color:#ffffff; font-weight:700; padding:12px 28px; border-radius:9999px; text-decoration:none; font-size:14px; box-shadow:0 4px 15px rgba(0, 95, 21, 0.4);">
          Open Student Study Portal &rarr;
        </a>
      </div>
    """

    full_html = build_brand_email_template("Welcome To SaastaScholar", preheader, html_content)
    return send_system_email(subject, user.email, text_body, full_html)


def send_payment_success_email(order) -> tuple:
    """
    Sends Official Tax Invoice Receipt Email Upon Confirmed Razorpay Payment Capture
    """
    user = order.user
    full_name = getattr(user, "full_name", "") or getattr(user, "username", "") or "Scholar"
    invoice_no = getattr(order, "invoice_number", f"INV-{order.id}")
    amount_inr = round(order.amount / 100, 2)
    plan_tier = getattr(order, "plan_tier", "BASIC")
    payment_id = getattr(order, "payment_id", "Confirmed")

    subject = f"Payment Receipt & Invoice [{invoice_no}] · SaastaScholar {plan_tier} Plan"
    preheader = f"Your Payment Of ₹{amount_inr} For {plan_tier} Plan Has Been Verified Successfully."

    text_body = f"""Dear {full_name},

Thank You For Upgrading Your SaastaScholar Membership.

Transaction Details:
- Invoice Number: {invoice_no}
- Plan Tier: {plan_tier}
- Amount Paid: ₹{amount_inr}
- Payment ID: {payment_id}
- Status: Confirmed & Paid

Your Account Has Been Upgraded With Instant Access To Premium Handwritten Notes And Lab Manuals.

Access Your Dashboard:
https://saastascholar.durgaaisolutions.in/dashboard

— SaastaScholar Commerce & Billing
"""

    html_content = f"""
      <span class="badge">Payment Verified · Official Tax Invoice</span>
      <h2 style="color:#ffffff; font-size:20px; font-weight:700; margin-top:0;">Payment Confirmed!</h2>
      <p>Dear <strong>{full_name}</strong>,</p>
      <p>Thank You For Subscribing To SaastaScholar. Your Payment Has Been Captured And Verified Via Our Banking Gateway.</p>
      
      <div style="background-color:#0b140c; border:1px solid #1f3322; border-radius:14px; padding:20px; margin:20px 0;">
        <table style="width:100%; border-collapse:collapse; font-size:13px;">
          <tr>
            <td style="padding:6px 0; color:#94a3b8;">Invoice Number:</td>
            <td style="padding:6px 0; text-align:right; font-weight:700; color:#ffffff;">{invoice_no}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#94a3b8;">Plan Tier:</td>
            <td style="padding:6px 0; text-align:right; font-weight:700; color:#34d399;">{plan_tier} Membership</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#94a3b8;">Payment Reference:</td>
            <td style="padding:6px 0; text-align:right; font-family:monospace; color:#cbd5e1;">{payment_id}</td>
          </tr>
          <tr style="border-top:1px solid #1f3322;">
            <td style="padding:10px 0 0 0; color:#ffffff; font-weight:700; font-size:15px;">Total Paid:</td>
            <td style="padding:10px 0 0 0; text-align:right; font-weight:800; font-size:17px; color:#34d399;">₹{amount_inr}</td>
          </tr>
        </table>
      </div>

      <div style="text-align:center; margin:28px 0;">
        <a href="https://saastascholar.durgaaisolutions.in/dashboard" style="display:inline-block; background-color:#005F15; color:#ffffff; font-weight:700; padding:12px 28px; border-radius:9999px; text-decoration:none; font-size:14px; box-shadow:0 4px 15px rgba(0, 95, 21, 0.4);">
          Launch Scholar Dashboard &rarr;
        </a>
      </div>
    """

    full_html = build_brand_email_template("Payment Receipt & Invoice", preheader, html_content)
    return send_system_email(subject, user.email, text_body, full_html)


def send_password_changed_notification_email(user) -> tuple:
    """
    Sends High-Priority Security Notice Email Upon Successful Password Change
    """
    full_name = getattr(user, "full_name", "") or getattr(user, "username", "") or "Scholar"
    from django.utils import timezone
    now_str = timezone.now().strftime("%d %B %Y, %I:%M %p IST")

    subject = "Security Notice: Your Account Password Was Successfully Changed · SaastaScholar"
    preheader = f"Your SaastaScholar Account Password was changed on {now_str}."

    text_body = f"""Hello {full_name},

This Is An Official Security Confirmation That The Password For Your SaastaScholar Account ({user.email}) Was Successfully Updated On:
{now_str}

If You Made This Change:
No Further Action Is Needed. You Can Log In With Your New Password.

If You Did NOT Make This Change:
Your Account May Be Compromised. Please Contact The SaastaScholar Academic Security Team Immediately At support@saastascholar.in.

— The SaastaScholar Academic Security Team
"""

    html_content = f"""
      <span class="badge" style="background-color:rgba(16, 185, 129, 0.2); color:#34d399;">Security Notice</span>
      <h2 style="color:#ffffff; font-size:20px; font-weight:700; margin-top:0;">Password Successfully Updated</h2>
      <p>Hello <strong>{full_name}</strong>,</p>
      <p>This Is An Automated Confirmation That The Password For Your SaastaScholar Account (<code>{user.email}</code>) Was Successfully Changed On <strong>{now_str}</strong>.</p>
      
      <div style="background-color:#0b140c; border:1px solid #1f3322; border-radius:12px; padding:18px; margin:20px 0;">
        <p style="margin:0 0 6px 0; font-size:13px; color:#94a3b8;"><strong>Timestamp:</strong> <span style="color:#ffffff;">{now_str}</span></p>
        <p style="margin:0; font-size:13px; color:#94a3b8;"><strong>Status:</strong> <span style="color:#34d399; font-weight:700;">Password Updated &amp; Sessions Synced</span></p>
      </div>

      <p style="font-size:13px; color:#94a3b8;">
        🔒 If You Initiated This Password Change, No Further Action Is Required.
      </p>

      <p style="margin-top:20px; font-size:13px; color:#ef4444; background:rgba(239, 68, 68, 0.1); border:1px solid rgba(239, 68, 68, 0.3); border-radius:10px; padding:12px;">
        ⚠️ <strong>Did Not Request This Change?</strong> If You Did Not Perform This Password Update, Please Contact Academic Support Immediately At <code>support@saastascholar.in</code> To Lock Your Account.
      </p>

      <div style="text-align:center; margin:28px 0 10px 0;">
        <a href="https://saastascholar.durgaaisolutions.in/login" style="display:inline-block; background-color:#005F15; color:#ffffff; font-weight:700; padding:12px 28px; border-radius:9999px; text-decoration:none; font-size:14px; box-shadow:0 4px 15px rgba(0, 95, 21, 0.4);">
          Log In To Student Portal &rarr;
        </a>
      </div>
    """

    full_html = build_brand_email_template("Password Changed Successfully", preheader, html_content)
    return send_system_email(subject, user.email, text_body, full_html)


def send_refund_processed_email(order, refund_amount_paise: int = None, reason: str = "") -> tuple:
    """
    Sends Official Refund Confirmation Email When An Order Is Reversed Via Razorpay
    """
    user = order.user
    full_name = getattr(user, "full_name", "") or getattr(user, "username", "") or "Scholar"
    from django.utils import timezone
    now_str = timezone.now().strftime("%d %B %Y, %I:%M %p IST")

    amount_paise = refund_amount_paise if refund_amount_paise is not None else order.amount
    amount_inr = round(amount_paise / 100, 2)

    subject = f"Refund Confirmation: ₹{amount_inr} For Order {order.order_id} · SaastaScholar"
    preheader = f"Your refund of ₹{amount_inr} for order {order.order_id} has been initiated."

    text_body = f"""Hello {full_name},

This Is An Official Confirmation That A Refund Of ₹{amount_inr} For Your Order ({order.order_id}) Was Successfully Initiated On:
{now_str}

Refund Details:
- Order ID: {order.order_id}
- Transaction ID: {order.payment_id or 'Online Payment'}
- Invoice Number: {order.invoice_number or 'N/A'}
- Refunded Amount: ₹{amount_inr}
- Subscription Tier: {order.plan_tier}
- Updated Access Tier: FREE Tier
{f"- Reason: {reason}" if reason else ""}

Timeline For Credit:
According To Razorpay And RBI Banking Standards, The Refunded Amount Will Credit Directly Back To Your Original Payment Source (UPI / NetBanking / Debit Card) Within 5-7 Working Days.

If You Have Any Questions Regarding This Transaction, Please Reply Directly To support@saastascholar.in.

— The SaastaScholar Accounts & Billing Team
"""

    html_content = f"""
      <span class="badge" style="background-color:rgba(239, 68, 68, 0.2); color:#f87171;">Refund Processed</span>
      <h2 style="color:#ffffff; font-size:20px; font-weight:700; margin-top:0;">Refund Processed Successfully</h2>
      <p>Hello <strong>{full_name}</strong>,</p>
      <p>Your Refund Of <strong>₹{amount_inr}</strong> For Order <code>{order.order_id}</code> Has Been Successfully Initiated Via The Razorpay Payment Gateway On <strong>{now_str}</strong>.</p>
      
      <div style="background-color:#0b140c; border:1px solid #1f3322; border-radius:12px; padding:18px; margin:20px 0;">
        <table style="width:100%; font-size:13px; color:#cbd5e1; border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0; color:#94a3b8;"><strong>Order ID:</strong></td>
            <td style="padding:6px 0; font-family:monospace; text-align:right; color:#ffffff;">{order.order_id}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#94a3b8;"><strong>Payment ID:</strong></td>
            <td style="padding:6px 0; font-family:monospace; text-align:right; color:#ffffff;">{order.payment_id or 'Online Payment'}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#94a3b8;"><strong>Invoice Number:</strong></td>
            <td style="padding:6px 0; font-family:monospace; text-align:right; color:#ffffff;">{order.invoice_number or 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#94a3b8;"><strong>Refund Amount:</strong></td>
            <td style="padding:6px 0; font-weight:800; text-align:right; color:#34d399; font-size:15px;">₹{amount_inr}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#94a3b8;"><strong>Access Tier:</strong></td>
            <td style="padding:6px 0; text-align:right; color:#f87171; font-weight:700;">Reverted To FREE</td>
          </tr>
        </table>
      </div>

      <div style="background-color:rgba(59, 130, 246, 0.1); border:1px solid rgba(59, 130, 246, 0.3); border-radius:10px; padding:14px; margin-bottom:20px;">
        <p style="margin:0; font-size:12px; color:#93c5fd; line-height:1.5;">
          ℹ️ <strong>Expected Credit Timeline:</strong> Under Standard Banking Protocols, Funds Typically Reflect In Your Source Account (Bank / UPI / Card) Within <strong>5 To 7 Working Days</strong>.
        </p>
      </div>

      <p style="font-size:12px; color:#94a3b8;">
        If You Need Any Further Assistance Or Did Not Request This Action, Please Reach Out To Our Support Desk At <code>support@saastascholar.in</code>.
      </p>
    """

    full_html = build_brand_email_template("Refund Confirmation", preheader, html_content)
    return send_system_email(subject, user.email, text_body, full_html)

