"""add reason to stock_history

Revision ID: 1b6814358839
Revises: 5497bbca3cb0
Create Date: 2025-06-11 11:23:06.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '1b6814358839'
down_revision = '5497bbca3cb0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('stock_history', sa.Column('reason', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('stock_history', 'reason')
