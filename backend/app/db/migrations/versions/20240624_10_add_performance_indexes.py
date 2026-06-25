"""Add performance indexes for filtered/sorted columns.

Revision ID: 20240624_10
Revises: 20240624_09
Create Date: 2026-06-25
"""
from alembic import op
import sqlalchemy as sa


revision = "20240624_10"
down_revision = "20240624_09"
branch_labels = None
depends_on = None


INDEXES = [
    # Campaign filters
    ("ix_campaigns_visibility", "campaigns", ["visibility"]),
    ("ix_campaigns_category", "campaigns", ["category"]),
    ("ix_campaigns_location", "campaigns", ["location"]),
    ("ix_campaigns_status_business", "campaigns", ["status", "business_profile_id"]),
    # Promoter profile filters
    ("ix_promoter_profiles_experience", "promoter_profiles", ["years_experience"]),
    # User auth filters
    ("ix_users_is_active", "users", ["is_active"]),
    ("ix_users_is_verified", "users", ["is_verified"]),
    ("ix_users_verification_token", "users", ["verification_token"]),
    # Collaboration filters
    ("ix_collaborations_status", "collaborations", ["status"]),
    # MatchResult filters/sorts
    ("ix_match_results_classification", "match_results", ["classification"]),
    # CampaignApplication filters
    ("ix_campaign_applications_status", "campaign_applications", ["status"]),
    ("ix_campaign_applications_campaign_status", "campaign_applications", ["campaign_id", "status"]),
    # CampaignInvitation filters
    ("ix_campaign_invitations_status", "campaign_invitations", ["status"]),
    ("ix_campaign_invitations_campaign_status", "campaign_invitations", ["campaign_id", "status"]),
    # Review group-by
    ("ix_reviews_rating", "reviews", ["rating"]),
    # AuditLog filters
    ("ix_audit_logs_entity_type", "audit_logs", ["entity_type"]),
]


def upgrade():
    for name, table, columns in INDEXES:
        try:
            op.create_index(name, table, columns)
        except sa.exc.ProgrammingError:
            pass  # index already exists


def downgrade():
    for name, table, columns in reversed(INDEXES):
        try:
            op.drop_index(name)
        except sa.exc.ProgrammingError:
            pass  # index does not exist
