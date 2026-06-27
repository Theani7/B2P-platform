"""Add notification_preferences table

Revision ID: 20260627_16
Revises: 20260625_17
Create Date: 2026-06-27 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '20260627_16'
down_revision = '20260625_17'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'notification_preferences',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('enabled', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_notification_pref_user_type', 'notification_preferences', ['user_id', 'type'], unique=True)


def downgrade():
    op.drop_index('ix_notification_pref_user_type', table_name='notification_preferences')
    op.drop_table('notification_preferences')
