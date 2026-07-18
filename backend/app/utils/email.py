"""Email sending utilities.

Sends real email via SMTP (smtplib) when SMTP credentials are configured.
If credentials are absent, the message is logged so local dev still works.
"""
import logging
import smtplib
from email.message import EmailMessage

from ..core.config import settings

logger = logging.getLogger(__name__)


def _send(to_email: str, subject: str, html_body: str, text_body: str) -> None:
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        logger.warning(
            "[EMAIL] SMTP not configured — skipping real send. "
            "Set SMTP_USERNAME/SMTP_PASSWORD in .env to deliver mail.\n"
            "  To: %s\n  Subject: %s\n  Body:\n%s",
            to_email,
            subject,
            text_body,
        )
        return

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to_email
    msg.set_content(text_body)
    msg.add_alternative(html_body, subtype="html")

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
        logger.info("[EMAIL] sent to %s subject='%s'", to_email, subject)
    except Exception as exc:  # pragma: no cover - network failures shouldn't crash request
        logger.error("[EMAIL] failed to send to %s: %s", to_email, exc)


def send_verification_email(to_email: str, token: str):
    link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    subject = "Verify your Byparsathy email"
    text = (
        f"Welcome to Byparsathy!\n\n"
        f"Please verify your email address by opening the link below:\n{link}\n\n"
        f"This link expires in 24 hours."
    )
    html = f"""
    <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#020520">Verify your email</h2>
      <p>Welcome to Byparsathy. Confirm your address to activate your account.</p>
      <p><a href="{link}" style="background:#145aff;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;display:inline-block">Verify email</a></p>
      <p style="color:#696a72;font-size:13px">This link expires in 24 hours.</p>
    </div>
    """
    _send(to_email, subject, html, text)


def send_password_reset_email(to_email: str, code: str):
    subject = "Your Byparsathy password reset code"
    text = (
        f"We received a request to reset your Byparsathy password.\n\n"
        f"Your verification code is: {code}\n\n"
        f"This code expires in 1 hour. If you didn't request this, you can ignore this email."
    )
    html = f"""
    <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#020520">Password reset</h2>
      <p>We received a request to reset your password. Use the code below:</p>
      <p style="font-size:32px;letter-spacing:8px;font-weight:700;color:#145aff;margin:16px 0">{code}</p>
      <p style="color:#696a72;font-size:13px">This code expires in 1 hour. If you didn't request this, you can ignore the email.</p>
    </div>
    """
    _send(to_email, subject, html, text)


def send_email(to: str, subject: str, body: str):
    logger.info(f"[EMAIL] to={to} subject={subject} body={body}")
