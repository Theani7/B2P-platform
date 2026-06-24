"""create user table with extended fields and revoked refresh tokens"""

from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg

revision = "20240624_02"
down_revision = "20240624_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("username", sa.String(150), nullable=False))
    op.add_column("users", sa.Column("last_login_at", pg.TIMESTAMP(timezone=True), nullable=True))
    op.add_column("users", sa.Column("failed_login_attempts", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("users", sa.Column("locked_until", pg.TIMESTAMP(timezone=True), nullable=True))
    op.add_column("users", sa.Column("is_verified", sa.Boolean(), nullable=False, server_default="false"))
    op.add_column("users", sa.Column("verification_token", sa.String(255), nullable=True))
    op.add_column("users", sa.Column("verification_token_expiry", pg.TIMESTAMP(timezone=True), nullable=True))
    op.create_unique_constraint("uq_users_username", "users", ["username"])
    op.create_index("ix_users_role", "users", ["role"], unique=False)
    op.create_index("ix_users_created_at", "users", ["created_at"], unique=False)

    op.create_table(
        "revoked_refresh_tokens",
        sa.Column("id", pg.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("token_hash", sa.String(255), nullable=False, unique=True),
        sa.Column("expires_at", pg.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("created_at", pg.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_revoked_token_hash", "revoked_refresh_tokens", ["token_hash"], unique=False)


def downgrade() -> None:
    op.drop_table("revoked_refresh_tokens")
    op.drop_constraint("uq_users_username", "users", type_="unique")
    op.drop_index("ix_users_role", table_name="users")
    op.drop_index("ix_users_created_at", table_name="users")
    op.drop_column("users", "verification_token_expiry")
    op.drop_column("users", "verification_token")
    op.drop_column("users", "is_verified")
    op.drop_column("users", "locked_until")
    op.drop_column("users", "failed_login_attempts")
    op.drop_column("users", "last_login_at")
    op.drop_column("users", "username")
