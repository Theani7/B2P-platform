"""Sprint 6: match_results table for Smart Matching System."""
from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg

revision = "20240624_07"
down_revision = "20240624_06"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "match_results",
        sa.Column("id", pg.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("campaign_id", pg.UUID(as_uuid=True), sa.ForeignKey("campaigns.id"), nullable=False),
        sa.Column("promoter_profile_id", pg.UUID(as_uuid=True), sa.ForeignKey("promoter_profiles.id"), nullable=False),
        sa.Column("score", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("classification", sa.String(20), nullable=False),
        sa.Column("score_breakdown", sa.JSON(), nullable=False, server_default='{}'),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_match_results_campaign_id", "match_results", ["campaign_id"])
    op.create_index("ix_match_results_promoter_id", "match_results", ["promoter_profile_id"])
    op.create_index("ix_match_results_campaign_score", "match_results", ["campaign_id", "score"])
    op.create_unique_constraint("uq_campaign_promoter_match", "match_results", ["campaign_id", "promoter_profile_id"])


def downgrade():
    op.drop_index("ix_match_results_campaign_score", table_name="match_results")
    op.drop_index("ix_match_results_promoter_id", table_name="match_results")
    op.drop_index("ix_match_results_campaign_id", table_name="match_results")
    op.drop_constraint("uq_campaign_promoter_match", "match_results")
    op.drop_table("match_results")
