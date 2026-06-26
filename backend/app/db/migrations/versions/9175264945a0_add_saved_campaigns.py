"""Add saved campaigns

Revision ID: 9175264945a0
Revises: 20260625_17
Create Date: 2026-06-26 21:56:41.536152

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9175264945a0'
down_revision: Union[str, None] = '20260625_17'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'saved_campaigns',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('promoter_profile_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('campaign_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['campaign_id'], ['campaigns.id'], ),
        sa.ForeignKeyConstraint(['promoter_profile_id'], ['promoter_profiles.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('promoter_profile_id', 'campaign_id', name='uq_saved_campaign')
    )

def downgrade() -> None:
    op.drop_table('saved_campaigns')
