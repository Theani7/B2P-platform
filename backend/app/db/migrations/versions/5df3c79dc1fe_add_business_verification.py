"""Add business verification

Revision ID: 5df3c79dc1fe
Revises: b2dd85e0af69
Create Date: 2026-06-30 20:28:32.129022

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5df3c79dc1fe'
down_revision: Union[str, None] = 'b2dd85e0af69'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add verified column to business_profiles
    op.add_column('business_profiles', sa.Column('verified', sa.Boolean(), server_default='false', nullable=False))
    
    # 2. Update verification_requests table
    op.alter_column('verification_requests', 'promoter_profile_id', existing_type=sa.UUID(), nullable=True)
    op.add_column('verification_requests', sa.Column('business_profile_id', sa.UUID(), nullable=True))
    op.create_index(op.f('ix_verification_requests_business_profile_id'), 'verification_requests', ['business_profile_id'], unique=False)
    op.create_foreign_key(None, 'verification_requests', 'business_profiles', ['business_profile_id'], ['id'])


def downgrade() -> None:
    # 1. Revert verification_requests
    op.drop_constraint(None, 'verification_requests', type_='foreignkey')
    op.drop_index(op.f('ix_verification_requests_business_profile_id'), table_name='verification_requests')
    op.drop_column('verification_requests', 'business_profile_id')
    op.alter_column('verification_requests', 'promoter_profile_id', existing_type=sa.UUID(), nullable=False)
    
    # 2. Revert business_profiles
    op.drop_column('business_profiles', 'verified')
