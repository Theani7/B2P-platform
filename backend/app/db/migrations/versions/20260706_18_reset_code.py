"""Add reset code columns to users

Revision ID: 20260706_18_reset_code
Revises: 5df3c79dc1fe
Create Date: 2026-07-06 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20260706_18_reset_code'
down_revision: Union[str, None] = '5df3c79dc1fe'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('reset_code', sa.String(length=16), nullable=True))
    op.create_index(op.f('ix_users_reset_code'), 'users', ['reset_code'], unique=False)
    op.add_column('users', sa.Column('reset_code_expiry', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'reset_code_expiry')
    op.drop_index(op.f('ix_users_reset_code'), table_name='users')
    op.drop_column('users', 'reset_code')
