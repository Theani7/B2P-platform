"""Email sending utilities.

In production replace with real SMTP (e.g., SendGrid, AWS SES).
"""
import logging

logger = logging.getLogger(__name__)


def send_verification_email(to_email: str, token: str):
    logger.info(f"[EMAIL] verification for {to_email} token={token}")
    # TODO: integrate real SMTP provider


def send_password_reset_email(to_email: str, token: str):
    logger.info(f"[EMAIL] password reset for {to_email} token={token}")
    # TODO: integrate real SMTP provider
