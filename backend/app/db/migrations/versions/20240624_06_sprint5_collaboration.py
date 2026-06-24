"""Sprint 5: campaign_applications, campaign_invitations, collaborations tables."""
from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg

revision = "20240624_06"
down_revision = "20240624_05"
branch_labels = None
depends_on = None


def upgrade():
    # --- campaign_applications ---
    op.create_table(
        "campaign_applications",
        sa.Column("id", pg.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("campaign_id", pg.UUID(as_uuid=True), sa.ForeignKey("campaigns.id"), nullable=False),
        sa.Column("promoter_profile_id", pg.UUID(as_uuid=True), sa.ForeignKey("promoter_profiles.id"), nullable=False),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="PENDING"),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_campaign_applications_campaign_id", "campaign_applications", ["campaign_id"])
    op.create_index("ix_campaign_applications_promoter_id", "campaign_applications", ["promoter_profile_id"])
    op.create_unique_constraint(
        "uq_campaign_promoter_application", "campaign_applications", ["campaign_id", "promoter_profile_id"]
    )

    # --- campaign_invitations ---
    op.create_table(
        "campaign_invitations",
        sa.Column("id", pg.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("campaign_id", pg.UUID(as_uuid=True), sa.ForeignKey("campaigns.id"), nullable=False),
        sa.Column("promoter_profile_id", pg.UUID(as_uuid=True), sa.ForeignKey("promoter_profiles.id"), nullable=False),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="PENDING"),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_campaign_invitations_campaign_id", "campaign_invitations", ["campaign_id"])
    op.create_index("ix_campaign_invitations_promoter_id", "campaign_invitations", ["promoter_profile_id"])
    op.create_unique_constraint(
        "uq_campaign_promoter_invitation", "campaign_invitations", ["campaign_id", "promoter_profile_id"]
    )

    # --- collaborations ---
    op.create_table(
        "collaborations",
        sa.Column("id", pg.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("campaign_id", pg.UUID(as_uuid=True), sa.ForeignKey("campaigns.id"), nullable=False),
        sa.Column("business_profile_id", pg.UUID(as_uuid=True), sa.ForeignKey("business_profiles.id"), nullable=False),
        sa.Column("promoter_profile_id", pg.UUID(as_uuid=True), sa.ForeignKey("promoter_profiles.id"), nullable=False),
        sa.Column("application_id", pg.UUID(as_uuid=True), sa.ForeignKey("campaign_applications.id"), nullable=True),
        sa.Column("invitation_id", pg.UUID(as_uuid=True), sa.ForeignKey("campaign_invitations.id"), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="ACTIVE"),
        sa.Column("started_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("completed_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_collaborations_campaign_id", "collaborations", ["campaign_id"])
    op.create_index("ix_collaborations_business_id", "collaborations", ["business_profile_id"])
    op.create_index("ix_collaborations_promoter_id", "collaborations", ["promoter_profile_id"])


def downgrade():
    op.drop_index("ix_collaborations_promoter_id", table_name="collaborations")
    op.drop_index("ix_collaborations_business_id", table_name="collaborations")
    op.drop_index("ix_collaborations_campaign_id", table_name="collaborations")
    op.drop_table("collaborations")
    op.drop_index("ix_campaign_invitations_promoter_id", table_name="campaign_invitations")
    op.drop_index("ix_campaign_invitations_campaign_id", table_name="campaign_invitations")
    op.drop_constraint("uq_campaign_promoter_invitation", "campaign_invitations")
    op.drop_table("campaign_invitations")
    op.drop_index("ix_campaign_applications_promoter_id", table_name="campaign_applications")
    op.drop_index("ix_campaign_applications_campaign_id", table_name="campaign_applications")
    op.drop_constraint("uq_campaign_promoter_application", "campaign_applications")
    op.drop_table("campaign_applications")
