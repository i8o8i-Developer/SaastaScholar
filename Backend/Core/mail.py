import logging
import email.utils
import uuid
import re
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from Core.telemetry import start_custom_span

logger = logging.getLogger("saastascholar.mail")

def get_sender_email() -> str:
    """
    Returns Valid Sender Email Address
    Ensures Compatibility With Gmail SMTP & Enterprise Relays
    Eliminates DMARC/SPF Mismatches That Cause Emails To Land In The Spam Folder
    """
    host_user = getattr(settings, "EMAIL_HOST_USER", "").strip()
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "").strip()
    smtp_host = getattr(settings, "EMAIL_HOST", "").lower()

    # If sending through Gmail SMTP (smtp.gmail.com), Google strictly mandates that the
    # From envelope address must match EMAIL_HOST_USER. Any mismatch results in immediate SPF fail/spam routing!
    if "gmail" in smtp_host and host_user and ("@" in host_user):
        if ("@gmail.com" in host_user.lower()) or ("@googlemail.com" in host_user.lower()):
            return f"SaastaScholar Support <{host_user}>"

    if from_email and ("@" in from_email):
        return from_email
    if host_user and ("@" in host_user):
        return f"SaastaScholar Support <{host_user}>"
    return "support@saastascholar.in"


def build_brand_email_template(
    title: str,
    preheader: str,
    content_html: str,
    is_marketing: bool = False,
    unsubscribe_url: str = None,
) -> str:
    """
    Renders Responsive, Anti-Spam Optimized HTML Email In SaastaScholar Brand Aesthetics
    Adheres Strictly To DPDP Act (2023) And Global Deliverability Standards
    """
    unsub_section = ""
    if is_marketing or unsubscribe_url:
        unsub_link = unsubscribe_url or "https://saastascholar.durgaaisolutions.in/unsubscribe"
        unsub_section = f"""
          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #1a2c1d; font-size: 11px; color: #64748b;">
            <p style="margin: 0 0 6px 0;">You Are Receiving This Because You Subscribed To SaastaScholar Weekly Academic Dispatch.</p>
            <p style="margin: 0;">
              <a href="{unsub_link}" style="color: #34d399; text-decoration: underline;">Unsubscribe Instantly</a> · 
              <a href="https://saastascholar.durgaaisolutions.in/preferences" style="color: #94a3b8; text-decoration: none;">Manage Preferences</a>
            </p>
          </div>
        """

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>{title}</title>
  <style>
    * {{
      box-sizing: border-box;
      border-radius: 0 !important;
    }}
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
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }}
    .header {{
      background: #005F15;
      padding: 26px 24px;
      text-align: center;
      border-bottom: 2px solid #10b981;
    }}
    .logo-text {{
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      margin: 0;
      text-transform: uppercase;
    }}
    .tagline {{
      font-size: 11px;
      color: #a7f3d0;
      margin: 5px 0 0 0;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      font-weight: 700;
    }}
    .body {{
      padding: 32px 28px;
      color: #cbd5e1;
      font-size: 14px;
      line-height: 1.6;
    }}
    .otp-box {{
      margin: 24px 0;
      background-color: #0b140c;
      border: 1px solid #10b981;
      padding: 20px;
      text-align: center;
    }}
    .otp-code {{
      font-size: 34px;
      font-weight: 900;
      color: #34d399;
      letter-spacing: 8px;
      font-family: monospace;
      margin: 0;
    }}
    .footer {{
      padding: 22px 28px;
      background-color: #0b140c;
      border-top: 1px solid #1a2c1d;
      text-align: center;
      font-size: 11px;
      color: #64748b;
      line-height: 1.5;
    }}
    .badge {{
      display: inline-block;
      padding: 4px 10px;
      background-color: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid #10b981;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 16px;
    }}
    .btn-primary {{
      display: inline-block;
      background-color: #005F15;
      color: #ffffff !important;
      font-weight: 800;
      padding: 12px 28px;
      text-decoration: none;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      border: 1px solid #00450f;
    }}
  </style>
</head>
<body>
  <!-- Anti-Spam Clean Preheader Without Hidden CSS Opacity Hacks -->
  <div style="display:none; max-height:0px; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px;">
    {preheader} &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
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
      <p style="margin: 0 0 4px 0;">&copy; 2026 <strong>SaastaScholar</strong> · Owned &amp; Engineered By DurgaAI Solutions.</p>
      <p style="margin: 0 0 4px 0;">Jaipur Knowledge City, Rajasthan 303121 · Registered Under The DPDP Act, 2023.</p>
      {unsub_section}
    </div>
  </div>
</body>
</html>"""


def send_system_email(
    subject: str,
    recipient_email: str,
    text_content: str,
    html_content: str = None,
    reply_to: list = None,
    email_type: str = "transactional",
    unsubscribe_url: str = None,
) -> tuple:
    """
    Robust Anti-Spam Email Dispatcher With OpenTelemetry Tracing & RFC-2822 Headers
    Returns (True, None) on Success, (False, error_str) on Failure
    """
    recipient_email = str(recipient_email or "").strip().lower()
    if not recipient_email or "@" not in recipient_email:
        return False, "Invalid Recipient Email Address."

    from_email = get_sender_email()
    reply_to_list = reply_to or ["support@saastascholar.in"]

    # Extract Domain For Cryptographic Message-ID Generation
    msg_id_domain = "saastascholar.in"
    if "@" in from_email:
        extracted = from_email.split("@")[-1].replace(">", "").strip()
        if extracted:
            msg_id_domain = extracted

    # Anti-Spam Essential RFC Headers (Prevents Gmail & Outlook Spam Penalties)
    custom_headers = {
        "Message-ID": f"<{uuid.uuid4()}@{msg_id_domain}>",
        "Date": email.utils.formatdate(localtime=True),
        "X-Mailer": "SaastaScholar Academic Dispatcher v2.6 (DurgaAI Solutions)",
        "X-Entity-Ref-ID": str(uuid.uuid4()),
        "X-Report-Abuse-To": "abuse@saastascholar.in",
    }

    if email_type == "marketing" or unsubscribe_url:
        unsub_link = unsubscribe_url or "https://saastascholar.durgaaisolutions.in/unsubscribe"
        custom_headers["List-Unsubscribe"] = f"<mailto:unsubscribe@saastascholar.in?subject=unsubscribe>, <{unsub_link}>"
        custom_headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"
        custom_headers["Precedence"] = "bulk"
    else:
        custom_headers["Auto-Submitted"] = "auto-generated"
        custom_headers["X-Auto-Response-Suppress"] = "All"
        custom_headers["Precedence"] = "transactional"

    import time
    with start_custom_span("email.dispatch", {
        "email.recipient": recipient_email,
        "email.subject": subject,
        "email.from": from_email,
        "email.type": email_type,
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
                    headers=custom_headers,
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


# ==============================================================================
# NOTIFICATION 1: EMAIL ADDRESS CHANGED (SECURITY ALERT TO BOTH OLD & NEW)
# ==============================================================================
def send_email_changed_notification(
    user,
    old_email: str,
    new_email: str,
    ip_address: str = "Unknown IP",
    user_agent: str = "Browser Session",
) -> tuple:
    """
    Sends High-Priority Dual Security Notices When Primary Student Email Is Updated
    """
    from django.utils import timezone
    now_str = timezone.now().strftime("%d %B %Y, %I:%M %p IST")
    full_name = getattr(user, "full_name", "") or getattr(user, "username", "") or "Scholar"

    # Part A: Security Alert to OLD Email Address
    subject_old = "Security Alert: Primary Email Address Changed · SaastaScholar"
    preheader_old = f"The Email for your SaastaScholar account was updated to {new_email}."
    text_old = f"""Security Alert: Primary Email Address Updated

Hello {full_name},

This is an urgent security notification that the primary email address for your SaastaScholar account was successfully changed to:
{new_email}

Timestamp: {now_str}
Originating Device: {user_agent}
IP Address: {ip_address}

IF YOU MADE THIS CHANGE:
You can safely disregard this email. All future notifications and invoices will be sent to {new_email}.

IF YOU DID NOT MAKE THIS CHANGE:
Your account may be compromised. Please reply immediately to support@saastascholar.in or contact the DurgaAI Security Desk to lock your account.

— The SaastaScholar Academic Security Team
"""
    html_old = f"""
      <span class="badge" style="background-color:rgba(239,68,68,0.15); color:#f87171; border:1px solid #ef4444;">Security Alert</span>
      <h2 style="color:#ffffff; font-size:18px; font-weight:800; margin-top:0; text-transform:uppercase;">Primary Email Address Changed</h2>
      <p>Hello <strong>{full_name}</strong>,</p>
      <p>This Is An Automated Security Notification That The Primary Email Address Associated With Your SaastaScholar Account Has Been Updated.</p>
      
      <div style="background-color:#0b140c; border:1px solid #1f3322; padding:16px; margin:20px 0; font-size:12.5px;">
        <p style="margin:0 0 6px 0; color:#94a3b8;"><strong>Previous Email:</strong> <span style="color:#cbd5e1; font-family:monospace;">{old_email}</span></p>
        <p style="margin:0 0 6px 0; color:#94a3b8;"><strong>Updated Primary Email:</strong> <span style="color:#34d399; font-weight:700; font-family:monospace;">{new_email}</span></p>
        <p style="margin:0 0 6px 0; color:#94a3b8;"><strong>Timestamp:</strong> <span style="color:#ffffff;">{now_str}</span></p>
        <p style="margin:0; color:#94a3b8;"><strong>Device / IP:</strong> <span style="color:#cbd5e1;">{user_agent} ({ip_address})</span></p>
      </div>

      <div style="background-color:rgba(239,68,68,0.08); border:1px solid #ef4444; padding:12px 16px; margin:20px 0; font-size:12px; color:#fca5a5;">
        <p style="margin:0 0 4px 0;"><strong>SECURITY WARNING:</strong> If You Did Not Authorize This Change, Your Account Credentials May Be Compromised.</p>
        <p style="margin:0;">Reply Immediately To <a href="mailto:support@saastascholar.in" style="color:#ffffff; font-weight:700;">support@saastascholar.in</a> To Secure Your Study Vault.</p>
      </div>
    """
    full_html_old = build_brand_email_template("Primary Email Address Changed", preheader_old, html_old)
    send_system_email(subject_old, old_email, text_old, full_html_old)

    # Part B: Confirmation to NEW Email Address
    subject_new = "Confirmation: Your New SaastaScholar Primary Email Is Active"
    preheader_new = f"Your SaastaScholar student account is now linked to {new_email}."
    text_new = f"""Confirmation: Primary Email Active

Hello {full_name},

This email confirms that {new_email} is now the primary email address for your SaastaScholar account.

Timestamp: {now_str}

All future term notifications, lecture schedules, verified notes, and billing receipts will be delivered to this inbox.

Access Your Academic Workspace:
https://saastascholar.durgaaisolutions.in/login

— The SaastaScholar Academic Team
"""
    html_new = f"""
      <span class="badge">Email Verified</span>
      <h2 style="color:#ffffff; font-size:18px; font-weight:800; margin-top:0; text-transform:uppercase;">New Primary Email Confirmed</h2>
      <p>Hello <strong>{full_name}</strong>,</p>
      <p>Welcome! Your SaastaScholar Account Has Been Successfully Linked To <strong>{new_email}</strong> As Your Primary Contact Address.</p>

      <div style="background-color:#0b140c; border:1px solid #1f3322; padding:16px; margin:20px 0; font-size:12.5px;">
        <p style="margin:0 0 6px 0; color:#94a3b8;"><strong>Primary Email:</strong> <span style="color:#34d399; font-weight:700;">{new_email}</span></p>
        <p style="margin:0 0 6px 0; color:#94a3b8;"><strong>Activation Timestamp:</strong> <span style="color:#ffffff;">{now_str}</span></p>
        <p style="margin:0; color:#94a3b8;"><strong>Account Status:</strong> <span style="color:#34d399; font-weight:700;">Active &amp; In Good Standing</span></p>
      </div>

      <div style="text-align:center; margin:26px 0;">
        <a href="https://saastascholar.durgaaisolutions.in/login" class="btn-primary">
          Open Scholar Portal
        </a>
      </div>
    """
    full_html_new = build_brand_email_template("New Primary Email Confirmed", preheader_new, html_new)
    return send_system_email(subject_new, new_email, text_new, full_html_new)


# ==============================================================================
# NOTIFICATION 2: ACCOUNT PROFILE DETAILS UPDATED
# ==============================================================================
def send_account_details_updated_email(
    user,
    changes: dict,
    ip_address: str = "Unknown IP",
) -> tuple:
    """
    Sends Instant Notification When Student Changes Name, Phone, Target CGPA, Or Bio
    """
    from django.utils import timezone
    now_str = timezone.now().strftime("%d %B %Y, %I:%M %p IST")
    full_name = getattr(user, "full_name", "") or getattr(user, "username", "") or "Scholar"

    subject = "Account Details Successfully Updated · SaastaScholar"
    preheader = f"Your SaastaScholar profile details were updated on {now_str}."

    rows_html = ""
    rows_text = ""
    for field_label, (old_val, new_val) in changes.items():
        rows_text += f"- {field_label}: {old_val or 'Not Set'} -> {new_val or 'Not Set'}\n"
        rows_html += f"""
          <tr>
            <td style="padding:8px 0; color:#94a3b8; font-weight:600;">{field_label}:</td>
            <td style="padding:8px 0; text-align:right; color:#cbd5e1;">
              <span style="color:#94a3b8; text-decoration:line-through; font-size:11.5px;">{old_val or 'Empty'}</span>
              <span style="color:#34d399; font-weight:700; margin-left:6px;">{new_val or 'Empty'}</span>
            </td>
          </tr>
        """

    text_body = f"""Hello {full_name},

Your SaastaScholar Student Profile Information Was Updated On:
{now_str}

Summary Of Changes:
{rows_text}

Originating IP Address: {ip_address}

If you made these changes, no further action is necessary.
If you did not authorize these modifications, please contact support@saastascholar.in immediately.

— The SaastaScholar Academic Team
"""
    html_content = f"""
      <span class="badge">Profile Updated</span>
      <h2 style="color:#ffffff; font-size:18px; font-weight:800; margin-top:0; text-transform:uppercase;">Account Details Updated</h2>
      <p>Hello <strong>{full_name}</strong>,</p>
      <p>We Are Writing To Confirm That Your Student Profile Information Was Modified On <strong>{now_str}</strong>.</p>
      
      <div style="background-color:#0b140c; border:1px solid #1f3322; padding:16px; margin:20px 0;">
        <table style="width:100%; border-collapse:collapse; font-size:12.5px;">
          {rows_html}
        </table>
      </div>

      <p style="font-size:12px; color:#64748b;">
        Originating Request: <code>{ip_address}</code>. If You Did Not Perform This Update, Please Notify Our Academic Security Team.
      </p>

      <div style="text-align:center; margin:26px 0 10px 0;">
        <a href="https://saastascholar.durgaaisolutions.in/dashboard?tab=profile" class="btn-primary">
          View Profile Settings
        </a>
      </div>
    """
    full_html = build_brand_email_template("Account Details Updated", preheader, html_content)
    return send_system_email(subject, user.email, text_body, full_html)


# ==============================================================================
# NOTIFICATION 3: ACADEMIC COHORT UPDATED (PROGRAM, SEMESTER, SECTION)
# ==============================================================================
def send_cohort_updated_email(
    user,
    old_cohort: dict,
    new_cohort: dict,
) -> tuple:
    """
    Sends Notification When Student Changes Degree Program, Semester, Or Section
    """
    from django.utils import timezone
    now_str = timezone.now().strftime("%d %B %Y, %I:%M %p IST")
    full_name = getattr(user, "full_name", "") or getattr(user, "username", "") or "Scholar"

    subject = f"Academic Cohort Updated: Sem {new_cohort.get('semester')} ({new_cohort.get('section')}) · SaastaScholar"
    preheader = f"Your curriculum and class schedule have been aligned with {new_cohort.get('program')} Semester {new_cohort.get('semester')}."

    text_body = f"""Hello {full_name},

Your Academic Cohort Has Been Updated On SaastaScholar:
- Degree Program: {new_cohort.get('program')}
- Semester: Semester {new_cohort.get('semester')}
- Section: Section {new_cohort.get('section')}

Previous Cohort:
- Program: {old_cohort.get('program')}
- Semester: Semester {old_cohort.get('semester')}
- Section: Section {old_cohort.get('section')}

Your Timetable, Course Materials, Lab Manuals, And Assignment Roster Have Been Automatically Synced To Your New Semester.

Open Your Updated Curriculum:
https://saastascholar.durgaaisolutions.in/dashboard

— The SaastaScholar Academic Desk
"""
    html_content = f"""
      <span class="badge">Curriculum Synced</span>
      <h2 style="color:#ffffff; font-size:18px; font-weight:800; margin-top:0; text-transform:uppercase;">Academic Cohort Updated</h2>
      <p>Hello <strong>{full_name}</strong>,</p>
      <p>Your Student Profile Has Been Re-Aligned With Your Updated University Cohort On <strong>{now_str}</strong>.</p>
      
      <div style="background-color:#0b140c; border:1px solid #1f3322; padding:16px; margin:20px 0; font-size:12.5px;">
        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0; color:#94a3b8;">Degree Program:</td>
            <td style="padding:6px 0; text-align:right; font-weight:700; color:#34d399;">{new_cohort.get('program')}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#94a3b8;">Enrolled Semester:</td>
            <td style="padding:6px 0; text-align:right; font-weight:700; color:#ffffff;">Semester {new_cohort.get('semester')}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#94a3b8;">Class Section:</td>
            <td style="padding:6px 0; text-align:right; font-weight:700; color:#ffffff;">Section {new_cohort.get('section')}</td>
          </tr>
        </table>
      </div>

      <div style="background-color:#0b140c; border:1px solid #1f3322; padding:12px 16px; margin:20px 0; font-size:12px; color:#94a3b8;">
        <p style="margin:0;">
          <strong>AUTOMATIC SYNC:</strong> Your Daily Lecture Timetable, Enrolled Subjects, Solved PYQs, And Lab Practical Roster Have Been Switched To Match This Cohort.
        </p>
      </div>

      <div style="text-align:center; margin:26px 0 10px 0;">
        <a href="https://saastascholar.durgaaisolutions.in/dashboard" class="btn-primary">
          View Enrolled Subjects
        </a>
      </div>
    """
    full_html = build_brand_email_template("Academic Cohort Updated", preheader, html_content)
    return send_system_email(subject, user.email, text_body, full_html)


# ==============================================================================
# NOTIFICATION 4: PROFILE PHOTO / AVATAR UPDATED
# ==============================================================================
def send_avatar_updated_email(user) -> tuple:
    """
    Sends Confirmation Notification When Student Successfully Uploads A New Profile Picture
    """
    from django.utils import timezone
    now_str = timezone.now().strftime("%d %B %Y, %I:%M %p IST")
    full_name = getattr(user, "full_name", "") or getattr(user, "username", "") or "Scholar"

    subject = "Profile Picture Successfully Updated · SaastaScholar"
    preheader = f"Your SaastaScholar profile photo was updated on {now_str}."

    text_body = f"""Hello {full_name},

This email confirms that your student profile photo was updated successfully on:
{now_str}

Your new profile avatar is now visible across your student dashboard, discussion threads, and peer study groups.

If you did not upload a new picture, please secure your account immediately by changing your password.

— The SaastaScholar Academic Team
"""
    html_content = f"""
      <span class="badge">Photo Updated</span>
      <h2 style="color:#ffffff; font-size:18px; font-weight:800; margin-top:0; text-transform:uppercase;">Profile Picture Updated</h2>
      <p>Hello <strong>{full_name}</strong>,</p>
      <p>Your Student Avatar Photo Was Updated On <strong>{now_str}</strong> And Is Now Active Across Your Workspace.</p>
      
      <div style="background-color:#0b140c; border:1px solid #1f3322; padding:16px; margin:20px 0; font-size:12.5px;">
        <p style="margin:0 0 6px 0; color:#94a3b8;"><strong>Scholar Name:</strong> <span style="color:#ffffff; font-weight:700;">{full_name}</span></p>
        <p style="margin:0 0 6px 0; color:#94a3b8;"><strong>Timestamp:</strong> <span style="color:#ffffff;">{now_str}</span></p>
        <p style="margin:0; color:#94a3b8;"><strong>Status:</strong> <span style="color:#34d399; font-weight:700;">High-Resolution Asset Synced</span></p>
      </div>

      <div style="text-align:center; margin:26px 0 10px 0;">
        <a href="https://saastascholar.durgaaisolutions.in/dashboard?tab=profile" class="btn-primary">
          View Profile Avatar
        </a>
      </div>
    """
    full_html = build_brand_email_template("Profile Picture Updated", preheader, html_content)
    return send_system_email(subject, user.email, text_body, full_html)


# ==============================================================================
# NOTIFICATION 5: MEMBERSHIP TIER CHANGED / UPGRADED
# ==============================================================================
def send_membership_tier_changed_email(
    user,
    old_tier: str,
    new_tier: str,
    reason: str = "",
) -> tuple:
    """
    Sends Notification When Student Membership Tier Is Changed By Admin Or Upgrade
    """
    from django.utils import timezone
    now_str = timezone.now().strftime("%d %B %Y, %I:%M %p IST")
    full_name = getattr(user, "full_name", "") or getattr(user, "username", "") or "Scholar"

    subject = f"Membership Tier Updated To {new_tier} · SaastaScholar Access"
    preheader = f"Your SaastaScholar subscription tier has been upgraded to {new_tier}."

    text_body = f"""Hello {full_name},

Your SaastaScholar Membership Access Tier Has Been Updated:
- Previous Tier: {old_tier}
- Updated Access Tier: {new_tier}
- Updated On: {now_str}
{f"- Note: {reason}" if reason else ""}

You Can Now Enjoy All Privileges Associated With The {new_tier} Tier In Your Student Dashboard.

Access Your Study Portal:
https://saastascholar.durgaaisolutions.in/dashboard

— The SaastaScholar Billing & Membership Team
"""
    html_content = f"""
      <span class="badge">Tier Updated</span>
      <h2 style="color:#ffffff; font-size:18px; font-weight:800; margin-top:0; text-transform:uppercase;">Access Tier Updated</h2>
      <p>Hello <strong>{full_name}</strong>,</p>
      <p>Your SaastaScholar Student Account Has Been Upgraded To <strong>{new_tier}</strong> Access On <strong>{now_str}</strong>.</p>
      
      <div style="background-color:#0b140c; border:1px solid #1f3322; padding:16px; margin:20px 0; font-size:12.5px;">
        <p style="margin:0 0 6px 0; color:#94a3b8;"><strong>Previous Tier:</strong> <span style="color:#cbd5e1;">{old_tier}</span></p>
        <p style="margin:0 0 6px 0; color:#94a3b8;"><strong>Active Access Tier:</strong> <span style="color:#34d399; font-weight:800; text-transform:uppercase;">{new_tier} Membership</span></p>
        {f'<p style="margin:0; color:#94a3b8;"><strong>Remarks:</strong> <span style="color:#cbd5e1;">{reason}</span></p>' if reason else ''}
      </div>

      <div style="text-align:center; margin:26px 0 10px 0;">
        <a href="https://saastascholar.durgaaisolutions.in/dashboard" class="btn-primary">
          Explore {new_tier} Resources
        </a>
      </div>
    """
    full_html = build_brand_email_template(f"Membership Updated: {new_tier}", preheader, html_content)
    return send_system_email(subject, user.email, text_body, full_html)


# ==============================================================================
# NOTIFICATION 6: NEWSLETTER SUBSCRIBER CONFIRMATION
# ==============================================================================
def send_newsletter_welcome_email(email_address: str, unsubscribe_url: str = None) -> tuple:
    """
    Sends Anti-Spam Compliant Welcome Email When Scholar Subscribes To Weekly Dispatch
    """
    subject = "Welcome To Weekly Academic Dispatch · SaastaScholar"
    preheader = "You're now subscribed to Monday exam alerts, lab viva cheat-sheets, and curated notes."

    text_body = f"""Welcome To SaastaScholar Weekly Academic Dispatch!

Thank you for subscribing with {email_address}.

What to expect in your inbox every Monday morning:
- Upcoming University Exam Alerts & Solved PYQs
- Lab Viva Voce Cheat-Sheets & Practical Instructions
- Assignment Solutions & Academic Bulletins
- Faculty Courseware Updates

Zero Spam. You can unsubscribe anytime with a single click.

Manage Your Subscription Or Unsubscribe:
{unsubscribe_url or 'https://saastascholar.durgaaisolutions.in/unsubscribe'}

— The SaastaScholar Academic Editorial Team
"""
    html_content = f"""
      <span class="badge">Weekly Academic Dispatch</span>
      <h2 style="color:#ffffff; font-size:18px; font-weight:800; margin-top:0; text-transform:uppercase;">Subscription Confirmed</h2>
      <p>Hello Scholar,</p>
      <p>You Are Officially Subscribed To The <strong>SaastaScholar Weekly Academic Dispatch</strong>.</p>

      <div style="background-color:#0b140c; border:1px solid #1f3322; padding:16px; margin:20px 0; font-size:12.5px; line-height:1.7;">
        <p style="margin:0 0 6px 0; font-weight:700; color:#34d399;">Delivered Directly To Your Inbox Every Monday:</p>
        <p style="margin:0 0 4px 0;">✔ High-Yield Unit Notes &amp; Solved Previous Year Papers</p>
        <p style="margin:0 0 4px 0;">✔ Lab Viva Voce Cheat-Sheets &amp; Experiment Viva Questions</p>
        <p style="margin:0 0 4px 0;">✔ Semester Assignment Deadlines &amp; Academic Notifications</p>
        <p style="margin:0;">✔ Verified Curricula Aligned To Your University Syllabus</p>
      </div>

      <div style="text-align:center; margin:26px 0 10px 0;">
        <a href="https://saastascholar.durgaaisolutions.in" class="btn-primary">
          Browse Study Repository
        </a>
      </div>
    """
    full_html = build_brand_email_template("Weekly Academic Dispatch Confirmed", preheader, html_content, is_marketing=True, unsubscribe_url=unsubscribe_url)
    return send_system_email(
        subject,
        email_address,
        text_body,
        full_html,
        email_type="marketing",
        unsubscribe_url=unsubscribe_url,
    )


# ==============================================================================
# NOTIFICATION 7: MARKETING / WEEKLY BROADCAST DISPATCHER
# ==============================================================================
def send_marketing_dispatch_email(
    recipient_email: str,
    subject: str,
    preheader: str,
    html_body: str,
    unsubscribe_url: str = None,
) -> tuple:
    """
    Sends High-Deliverability Anti-Spam Marketing Broadcast / Academic Dispatch
    Includes Canonical One-Click Unsubscribe RFC Headers
    """
    # Generate Clean Plain Text Alternative
    clean_text = re.sub(r"<[^>]+>", " ", html_body)
    clean_text = re.sub(r"\s+", " ", clean_text).strip()
    
    text_body = f"""{subject}

{clean_text}

---
You are receiving this communication from SaastaScholar.
To unsubscribe with a single click: {unsubscribe_url or 'https://saastascholar.durgaaisolutions.in/unsubscribe'}
SaastaScholar · Owned & Engineered By DurgaAI Solutions · Jaipur Knowledge City, Rajasthan 303121
"""

    full_html = build_brand_email_template(
        subject,
        preheader or subject,
        html_body,
        is_marketing=True,
        unsubscribe_url=unsubscribe_url,
    )

    return send_system_email(
        subject,
        recipient_email,
        text_body,
        full_html,
        email_type="marketing",
        unsubscribe_url=unsubscribe_url,
    )


# ==============================================================================
# EXISTING SYSTEM EMAILS (ENHANCED WITH ANTI-SPAM COMPLIANCE)
# ==============================================================================
def send_password_reset_email(user, otp: str) -> tuple:
    """
    Sends High-Security 6-Digit Password Reset Verification Code Email
    """
    full_name = getattr(user, "full_name", "") or getattr(user, "username", "") or "Scholar"
    subject = f"Your Verification Code: {otp} · SaastaScholar Security"
    preheader = f"Your 6-Digit Password Reset Verification Code is {otp}."

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
      <h2 style="color:#ffffff; font-size:18px; font-weight:800; margin-top:0; text-transform:uppercase; letter-spacing:0.5px;">Password Reset Verification Code</h2>
      <p>Hello <strong>{full_name}</strong>,</p>
      <p>We Received An Official Request To Reset The Password For Your SaastaScholar Account (<code>{user.email}</code>).</p>
      <div class="otp-box">
        <p style="font-size:11px; color:#94a3b8; text-transform:uppercase; margin:0 0 8px 0; font-weight:800; letter-spacing:1.2px;">6-Digit Verification Code</p>
        <p class="otp-code">{otp}</p>
      </div>
      <div style="background-color:#0b140c; border:1px solid #1f3322; padding:12px 16px; margin:20px 0; font-size:12px; color:#94a3b8; line-height:1.5;">
        <p style="margin:0 0 4px 0;"><strong>CONFIDENTIALITY NOTICE:</strong> This Verification Code Will Expire In 15 Minutes.</p>
        <p style="margin:0;"><strong>SECURITY ADVISORY:</strong> For Your Account Protection, Never Disclose This Code To Anyone.</p>
      </div>
      <p style="margin-top:20px; font-size:12px; color:#64748b;">
        If You Did Not Request This Password Reset, No Action Is Needed — Your Account Remains Secure.
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
      <h2 style="color:#ffffff; font-size:18px; font-weight:800; margin-top:0; text-transform:uppercase; letter-spacing:0.5px;">Welcome To SaastaScholar™</h2>
      <p>Hello <strong>{full_name}</strong>,</p>
      <p>Your Academic Account Has Been Initialized Successfully. You Now Have Instant Access To Verified University Notes, Solved Exam Papers, Lab Practicals, And Syllabus Guides.</p>
      
      <div style="background-color:#0b140c; border:1px solid #1f3322; padding:16px; margin:20px 0;">
        <p style="margin:0 0 6px 0; font-size:12.5px;"><strong>Degree Program:</strong> <span style="color:#34d399; font-weight:700;">{program}</span></p>
        <p style="margin:0 0 6px 0; font-size:12.5px;"><strong>Roll Number:</strong> <span style="color:#34d399; font-family:monospace;">{roll}</span></p>
        <p style="margin:0; font-size:12.5px;"><strong>Membership Tier:</strong> <span style="color:#34d399; font-weight:700;">{tier}</span></p>
      </div>

      <div style="text-align:center; margin:28px 0;">
        <a href="https://saastascholar.durgaaisolutions.in/login" class="btn-primary">
          Open Student Study Portal
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

Thank you for subscribing to SaastaScholar.

Transaction Details:
- Invoice Number: {invoice_no}
- Plan Tier: {plan_tier}
- Amount Paid: ₹{amount_inr}
- Payment ID: {payment_id}
- Status: Confirmed & Paid

Your account has been upgraded with instant access to premium notes and lab manuals.

Access Your Dashboard:
https://saastascholar.durgaaisolutions.in/dashboard

— SaastaScholar Commerce & Billing
"""

    html_content = f"""
      <span class="badge">Payment Verified · Official Tax Invoice</span>
      <h2 style="color:#ffffff; font-size:18px; font-weight:800; margin-top:0; text-transform:uppercase; letter-spacing:0.5px;">Payment Confirmed</h2>
      <p>Dear <strong>{full_name}</strong>,</p>
      <p>Thank You For Subscribing To SaastaScholar. Your Payment Has Been Captured And Verified Via The Razorpay Banking Gateway.</p>
      
      <div style="background-color:#0b140c; border:1px solid #1f3322; padding:18px; margin:20px 0;">
        <table style="width:100%; border-collapse:collapse; font-size:12.5px;">
          <tr>
            <td style="padding:6px 0; color:#94a3b8;">Invoice Number:</td>
            <td style="padding:6px 0; text-align:right; font-weight:700; color:#ffffff; font-family:monospace;">{invoice_no}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#94a3b8;">Plan Tier:</td>
            <td style="padding:6px 0; text-align:right; font-weight:700; color:#34d399; text-transform:uppercase;">{plan_tier} Membership</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#94a3b8;">Payment Reference:</td>
            <td style="padding:6px 0; text-align:right; font-family:monospace; color:#cbd5e1;">{payment_id}</td>
          </tr>
          <tr style="border-top:1px solid #1f3322;">
            <td style="padding:10px 0 0 0; color:#ffffff; font-weight:800; font-size:14px; text-transform:uppercase;">Total Paid:</td>
            <td style="padding:10px 0 0 0; text-align:right; font-weight:900; font-size:16px; color:#34d399;">₹{amount_inr}</td>
          </tr>
        </table>
      </div>

      <div style="text-align:center; margin:28px 0;">
        <a href="https://saastascholar.durgaaisolutions.in/dashboard" class="btn-primary">
          Launch Scholar Dashboard
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

This is an official confirmation that the password for your SaastaScholar account ({user.email}) was successfully updated on:
{now_str}

If you made this change:
No further action is needed. You can log in with your new password.

If you did NOT make this change:
Your account may be compromised. Please contact support@saastascholar.in immediately.

— The SaastaScholar Academic Security Team
"""

    html_content = f"""
      <span class="badge">Security Notice</span>
      <h2 style="color:#ffffff; font-size:18px; font-weight:800; margin-top:0; text-transform:uppercase; letter-spacing:0.5px;">Password Successfully Updated</h2>
      <p>Hello <strong>{full_name}</strong>,</p>
      <p>This Is An Automated Confirmation That The Password For Your SaastaScholar Account (<code>{user.email}</code>) Was Successfully Changed On <strong>{now_str}</strong>.</p>
      
      <div style="background-color:#0b140c; border:1px solid #1f3322; padding:16px; margin:20px 0;">
        <p style="margin:0 0 6px 0; font-size:12.5px; color:#94a3b8;"><strong>Timestamp:</strong> <span style="color:#ffffff;">{now_str}</span></p>
        <p style="margin:0; font-size:12.5px; color:#94a3b8;"><strong>Status:</strong> <span style="color:#34d399; font-weight:700;">Password Updated &amp; Sessions Synced</span></p>
      </div>

      <div style="background-color:#0b140c; border:1px solid #1f3322; padding:12px 16px; margin:20px 0; font-size:12px; color:#94a3b8; line-height:1.5;">
        <p style="margin:0 0 4px 0;"><strong>VERIFICATION NOTICE:</strong> If You Initiated This Password Change, No Further Action Is Required.</p>
        <p style="margin:0; color:#f87171;"><strong>SECURITY ALERT:</strong> If You Did Not Perform This Password Update, Contact Academic Support Immediately At support@saastascholar.in To Lock Your Account.</p>
      </div>

      <div style="text-align:center; margin:28px 0 10px 0;">
        <a href="https://saastascholar.durgaaisolutions.in/login" class="btn-primary">
          Log In To Student Portal
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

This is an official confirmation that a refund of ₹{amount_inr} for your order ({order.order_id}) was successfully initiated on:
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
According to Razorpay and RBI banking standards, the refunded amount will credit directly back to your original payment source (UPI / NetBanking / Debit Card) within 5-7 working days.

If you have any questions regarding this transaction, please reply directly to support@saastascholar.in.

— The SaastaScholar Accounts & Billing Team
"""

    html_content = f"""
      <span class="badge" style="background-color:rgba(239, 68, 68, 0.15); color:#f87171; border:1px solid #ef4444;">Refund Processed</span>
      <h2 style="color:#ffffff; font-size:18px; font-weight:800; margin-top:0; text-transform:uppercase; letter-spacing:0.5px;">Refund Processed Successfully</h2>
      <p>Hello <strong>{full_name}</strong>,</p>
      <p>Your Refund Of <strong>₹{amount_inr}</strong> For Order <code>{order.order_id}</code> Has Been Successfully Initiated Via The Razorpay Payment Gateway On <strong>{now_str}</strong>.</p>
      
      <div style="background-color:#0b140c; border:1px solid #1f3322; padding:16px; margin:20px 0;">
        <table style="width:100%; font-size:12.5px; color:#cbd5e1; border-collapse:collapse;">
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
            <td style="padding:6px 0; font-weight:800; text-align:right; color:#34d399; font-size:14px;">₹{amount_inr}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#94a3b8;"><strong>Access Tier:</strong></td>
            <td style="padding:6px 0; text-align:right; color:#f87171; font-weight:700; text-transform:uppercase;">Reverted To FREE</td>
          </tr>
        </table>
      </div>

      <div style="background-color:#0b140c; border:1px solid #1f3322; padding:12px 16px; margin-bottom:20px;">
        <p style="margin:0; font-size:11.5px; color:#94a3b8; line-height:1.5;">
          <strong>EXPECTED SETTLEMENT TIMELINE:</strong> Under Standard Banking Protocols, Funds Typically Reflect In Your Source Account (Bank / UPI / Card) Within <strong>5 To 7 Working Days</strong>.
        </p>
      </div>

      <p style="font-size:11.5px; color:#64748b;">
        If You Need Any Further Assistance Or Did Not Request This Action, Please Reach Out To Our Support Desk At <code>support@saastascholar.in</code>.
      </p>
    """

    full_html = build_brand_email_template("Refund Confirmation", preheader, html_content)
    return send_system_email(subject, user.email, text_body, full_html)
