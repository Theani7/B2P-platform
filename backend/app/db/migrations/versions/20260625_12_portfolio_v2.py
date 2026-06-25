"""Update portfolio items and add portfolio media"""

from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg

revision = "20260625_12"
down_revision = "20240624_11"
branch_labels = None
depends_on = None

def upgrade():
    # portfolio_items modifications
    op.add_column("portfolio_items", sa.Column("client_name", sa.String(255), nullable=True))
    op.add_column("portfolio_items", sa.Column("campaign_type", sa.String(100), nullable=True))
    op.add_column("portfolio_items", sa.Column("cover_image", sa.String(500), nullable=True))
    op.add_column("portfolio_items", sa.Column("featured", sa.Boolean(), server_default="false", nullable=False))
    op.add_column("portfolio_items", sa.Column("views", sa.Integer(), server_default="0", nullable=False))
    op.add_column("portfolio_items", sa.Column("likes", sa.Integer(), server_default="0", nullable=False))
    op.add_column("portfolio_items", sa.Column("engagement_rate", sa.Float(), server_default="0.0", nullable=False))
    op.add_column("portfolio_items", sa.Column("platforms", pg.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column("portfolio_items", sa.Column("tags", pg.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column("portfolio_items", sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False))
    
    op.drop_column("portfolio_items", "image_url")
    op.drop_column("portfolio_items", "external_link")

    # portfolio_media table
    op.create_table(
        "portfolio_media",
        sa.Column("id", pg.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("portfolio_item_id", pg.UUID(as_uuid=True), sa.ForeignKey("portfolio_items.id", ondelete="CASCADE"), nullable=False),
        sa.Column("file_path", sa.String(500), nullable=False),
        sa.Column("media_type", sa.String(50), nullable=False),
        sa.Column("display_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_portfolio_media_portfolio_item_id", "portfolio_media", ["portfolio_item_id"])

def downgrade():
    op.drop_table("portfolio_media")
    
    op.add_column("portfolio_items", sa.Column("external_link", sa.VARCHAR(length=500), autoincrement=False, nullable=True))
    op.add_column("portfolio_items", sa.Column("image_url", sa.VARCHAR(length=500), autoincrement=False, nullable=True))
    
    op.drop_column("portfolio_items", "updated_at")
    op.drop_column("portfolio_items", "tags")
    op.drop_column("portfolio_items", "platforms")
    op.drop_column("portfolio_items", "engagement_rate")
    op.drop_column("portfolio_items", "likes")
    op.drop_column("portfolio_items", "views")
    op.drop_column("portfolio_items", "featured")
    op.drop_column("portfolio_items", "cover_image")
    op.drop_column("portfolio_items", "campaign_type")
    op.drop_column("portfolio_items", "client_name")
