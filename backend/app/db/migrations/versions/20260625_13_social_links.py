"""Add social links

Revision ID: 20260625_13
Revises: 20260625_12
Create Date: 2026-06-25 21:15:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20260625_13'
down_revision = '20260625_12'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_table('social_links')
    op.create_table('social_links',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('platform', sa.String(length=50), nullable=False),
        sa.Column('username', sa.String(length=150), nullable=False),
        sa.Column('url', sa.String(length=500), nullable=False),
        sa.Column('followers_count', sa.Integer(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'platform', name='uix_user_platform')
    )


def downgrade():
    op.drop_table('social_links')
