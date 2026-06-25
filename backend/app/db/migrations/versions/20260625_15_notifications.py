"""Add notifications table

Revision ID: 20260625_15
Revises: 20260625_14
Create Date: 2026-06-25 23:25:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20260625_15'
down_revision = '20260625_14'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('notifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('recipient_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('actor_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('type', sa.Enum('APPLICATION_RECEIVED', 'APPLICATION_ACCEPTED', 'APPLICATION_REJECTED', 'INVITATION_RECEIVED', 'INVITATION_ACCEPTED', 'INVITATION_DECLINED', 'NEW_MESSAGE', 'REVIEW_RECEIVED', 'COLLABORATION_STARTED', 'COLLABORATION_COMPLETED', 'CAMPAIGN_MATCH_READY', 'SYSTEM', name='notificationtype'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('entity_type', sa.String(length=50), nullable=True),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=False),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['actor_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['recipient_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notifications_created_at'), 'notifications', ['created_at'], unique=False)
    op.create_index(op.f('ix_notifications_is_read'), 'notifications', ['is_read'], unique=False)
    op.create_index(op.f('ix_notifications_recipient_id'), 'notifications', ['recipient_id'], unique=False)

def downgrade():
    op.drop_index(op.f('ix_notifications_recipient_id'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_is_read'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_created_at'), table_name='notifications')
    op.drop_table('notifications')
    op.execute("DROP TYPE notificationtype")
