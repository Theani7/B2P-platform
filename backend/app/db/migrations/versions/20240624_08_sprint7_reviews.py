"""Sprint 7: reviews table for Review & Rating System."""
from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg

revision = "20240624_08"
down_revision = "20240624_07"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "reviews",
        sa.Column("id", pg.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("collaboration_id", pg.UUID(as_uuid=True), sa.ForeignKey("collaborations.id"), nullable=False),
        sa.Column("reviewer_id", pg.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("reviewee_id", pg.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_reviews_collaboration_id", "reviews", ["collaboration_id"])
    op.create_index("ix_reviews_reviewer_id", "reviews", ["reviewer_id"])
    op.create_index("ix_reviews_reviewee_id", "reviews", ["reviewee_id"])
    op.create_unique_constraint(
        "uq_collaboration_reviewer", "reviews", ["collaboration_id", "reviewer_id"]
    )


def downgrade():
    op.drop_index("ix_reviews_reviewee_id", table_name="reviews")
    op.drop_index("ix_reviews_reviewer_id", table_name="reviews")
    op.drop_index("ix_reviews_collaboration_id", table_name="reviews")
    op.drop_constraint("uq_collaboration_reviewer", "reviews")
    op.drop_table("reviews")
