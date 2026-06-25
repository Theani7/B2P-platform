"""Add achievements tables

Revision ID: 20260625_16
Revises: 20260625_15
Create Date: 2026-06-25 23:29:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20260625_16'
down_revision = '20260625_15'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('achievements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('key', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=100), nullable=False),
        sa.Column('description', sa.String(length=500), nullable=False),
        sa.Column('icon', sa.String(length=200), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('points', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_achievements_id'), 'achievements', ['id'], unique=False)
    op.create_index(op.f('ix_achievements_key'), 'achievements', ['key'], unique=True)

    op.create_table('user_achievements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('achievement_id', sa.Integer(), nullable=False),
        sa.Column('earned_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('progress', sa.Float(), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['achievement_id'], ['achievements.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_achievements_id'), 'user_achievements', ['id'], unique=False)
    op.create_index(op.f('ix_user_achievements_user_id'), 'user_achievements', ['user_id'], unique=False)

def downgrade():
    op.drop_index(op.f('ix_user_achievements_user_id'), table_name='user_achievements')
    op.drop_index(op.f('ix_user_achievements_id'), table_name='user_achievements')
    op.drop_table('user_achievements')
    op.drop_index(op.f('ix_achievements_key'), table_name='achievements')
    op.drop_index(op.f('ix_achievements_id'), table_name='achievements')
    op.drop_table('achievements')
