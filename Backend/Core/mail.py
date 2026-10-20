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

    with start_custom_span("email.dispatch", {
        "email.recipient": recipient_email,
        "email.subject": subject,
        "email.from": from_email,
    }) as span:
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
            err_msg = str(exc)
            logger.error(f"-> [Email Dispatch Failed] Could Not Send '{subject}' To {recipient_email}: {err_msg}")
            if span:
                span.record_exception(exc)
                span.set_attribute("email.status", "failed")
                span.set_attribute("email.error", err_msg)
            return False, err_msg


def send_password_reset_email(user, otp: str) -> tuple:
    """
    Sends High-Security 6-Digit Password Reset Verification Code Email
    """
    full_name = getattr(user, "full_name", "") or getattr(user, "username", "") or "Scholar"
    subject = f"Your Verification Code: {otp} · SaastaScholar Security"
    preheader = f"Your 6-digit password reset verification code is {otp}."

    text_body = f"""Hello {full_name},

You requested to reset your account password on SaastaScholar.

Your 6-Digit Password Reset Verification Code is:
{otp}

This code is strictly confidential and expires in 15 minutes.
If you did not make this request, please disregard this email.

— The SaastaScholar Academic Security Team
"""

    html_content = f"""
      <span class="badge">Security Verification</span>
      <h2 style="color:#ffffff; font-size:20px; font-weight:700; margin-top:0;">Password Reset Verification Code</h2>
      <p>Hello <strong>{full_name}</strong>,</p>
      <p>We received an official request to reset the password for your SaastaScholar account (<code>{user.email}</code>).</p>
      <div class="otp-box">
        <p style="font-size:12px; color:#94a3b8; text-transform:uppercase; margin:0 0 8px 0; font-weight:700; letter-spacing:1px;">6-Digit Verification Code</p>
        <p class="otp-code">{otp}</p>
      </div>
      <p style="font-size:13px; color:#94a3b8;">
        ⏱️ <strong>This code will expire in 15 minutes.</strong><br>
        🔒 For your security, never share this verification code with anyone.
      </p>
      <p style="margin-top:24px; font-size:13px; color:#64748b;">
        If you did not request this password reset, no action is needed — your account remains completely secure.
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
    preheader = "Your academic workspace is now active. Access verified notes, syllabus and lab manuals."

    text_body = f"""Welcome to SaastaScholar, {full_name}!

Your student account has been created successfully.

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
      <p>Congratulations! Your academic account has been initialized successfully. You now have instant access to verified university notes, solved exam papers, lab practicals, and syllabus guides.</p>
      
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
    preheader = f"Your payment of ₹{amount_inr} for {plan_tier} Plan has been verified successfully."

    text_body = f"""Dear {full_name},

Thank you for upgrading your SaastaScholar membership.

Transaction Details:
- Invoice Number: {invoice_no}
- Plan Tier: {plan_tier}
- Amount Paid: ₹{amount_inr}
- Payment ID: {payment_id}
- Status: Confirmed & Paid

Your account has been upgraded with instant access to premium handwritten notes and lab manuals.

Access Your Dashboard:
https://saastascholar.durgaaisolutions.in/dashboard

— SaastaScholar Commerce & Billing
"""

    html_content = f"""
      <span class="badge">Payment Verified · Official Tax Invoice</span>
      <h2 style="color:#ffffff; font-size:20px; font-weight:700; margin-top:0;">Payment Confirmed!</h2>
      <p>Dear <strong>{full_name}</strong>,</p>
      <p>Thank you for subscribing to SaastaScholar. Your payment has been captured and verified via our banking gateway.</p>
      
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
