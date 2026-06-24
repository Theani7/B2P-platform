"""Sprint 4: saved_promoters table + discovery indexes on promoter_profiles."""

from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg

revision = "20240624_05"
down_revision = "20240624_04"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "saved_promoters",
        sa.Column("id", pg.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("business_profile_id", pg.UUID(as_uuid=True), sa.ForeignKey("business_profiles.id"), nullable=False),
        sa.Column("promoter_profile_id", pg.UUID(as_uuid=True), sa.ForeignKey("promoter_profiles.id"), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_unique_constraint(
        "uq_business_promoter_saved", "saved_promoters", ["business_profile_id", "promoter_profile_id"]
    )
    op.create_index("ix_saved_promoters_business_id", "saved_promoters", ["business_profile_id"])
    op.create_index("ix_saved_promoters_promoter_id", "saved_promoters", ["promoter_profile_id"])

    # Indexes for discovery performance
    op.create_index("ix_promoter_profiles_niche", "promoter_profiles", ["niche"])
    op.create_index("ix_promoter_profiles_location", "promoter_profiles", ["location"])
    op.create_index("ix_promoter_profiles_followers_count", "promoter_profiles", ["followers_count"])
    op.create_index("ix_promoter_profiles_verified", "promoter_profiles", ["verified"])


def downgrade():
    op.drop_index("ix_promoter_profiles_verified", table_name="promoter_profiles")
    op.drop_index("ix_promoter_profiles_followers_count", table_name="promoter_profiles")
    op.drop_index("ix_promoter_profiles_location", table_name="promoter_profiles")
    op.drop_index("ix_promoter_profiles_niche", table_name="promoter_profiles")
    op.drop_index("ix_saved_promoters_promoter_id", table_name="saved_promoters")
    op.drop_index("ix_saved_promoters_business_id", table_name="saved_promoters")
    op.drop_constraint("uq_business_promoter_saved", "saved_promoters")
    op.drop_table("saved_promoters")
