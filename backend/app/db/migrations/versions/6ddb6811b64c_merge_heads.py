"""Merge heads

Revision ID: 6ddb6811b64c
Revises: 20260627_16, 9175264945a0
Create Date: 2026-06-29 08:36:54.104784

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6ddb6811b64c'
down_revision: Union[str, None] = ('20260627_16', '9175264945a0')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
