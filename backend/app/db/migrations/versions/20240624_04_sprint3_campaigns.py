"""Sprint 3 model: campaigns"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg

revision = "20240624_04"
down_revision = "20240624_03"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "campaigns",
        sa.Column("id", pg.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("business_profile_id", pg.UUID(as_uuid=True), sa.ForeignKey("business_profiles.id"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("budget", sa.Float(), nullable=False),
        sa.Column("location", sa.String(255), nullable=False),
        sa.Column("target_audience", sa.Text(), nullable=True),
        sa.Column("requirements", sa.Text(), nullable=True),
        sa.Column("start_date", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("end_date", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="DRAFT"),
        sa.Column("visibility", sa.String(20), nullable=False, server_default="PUBLIC"),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_campaigns_business_profile_id", "campaigns", ["business_profile_id"])
    op.create_index("ix_campaigns_status", "campaigns", ["status"])


def downgrade():
    op.drop_table("campaigns")
