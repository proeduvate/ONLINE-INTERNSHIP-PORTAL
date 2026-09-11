"""add breakout_rooms table

Revision ID: breakout_rooms_001
Revises: 
Create Date: 2026-08-29

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'breakout_rooms_001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        'breakout_rooms',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('meeting_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('room_code', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), server_default='active', nullable=True),
        sa.Column('max_participants', sa.Integer(), server_default='10', nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['meeting_id'], ['meetings.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('room_code')
    )
    op.create_index(op.f('ix_breakout_rooms_id'), 'breakout_rooms', ['id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_breakout_rooms_id'), table_name='breakout_rooms')
    op.drop_table('breakout_rooms')
