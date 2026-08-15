"""
Pydantic schemas for the Ticket / Support System module.
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


# ==========================================
#    TICKET ENUMS (for schema validation)
# ==========================================

class TicketCategorySchema(str, Enum):
    TECHNICAL = "technical"
    TASK = "task"
    SUBMISSION = "submission"
    ACCOUNT = "account"
    OTHER = "other"


class TicketPrioritySchema(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TicketStatusSchema(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


# ==========================================
#    TICKET CREATE / UPDATE SCHEMAS
# ==========================================

class TicketCreate(BaseModel):
    """Schema for creating a new support ticket."""
    title: str = Field(..., min_length=1, max_length=200, description="Brief summary of the issue")
    description: str = Field(..., min_length=1, description="Detailed description of the issue")
    category: TicketCategorySchema = Field(..., description="Category of the issue")
    priority: TicketPrioritySchema = Field(
        default=TicketPrioritySchema.MEDIUM,
        description="Priority level of the ticket"
    )


class TicketStatusUpdate(BaseModel):
    """Schema for updating a ticket's status."""
    status: TicketStatusSchema


class TicketAssignUpdate(BaseModel):
    """Schema for assigning a ticket to a mentor/admin."""
    assigned_to: int = Field(..., description="User ID of the mentor/admin to assign")





# ==========================================
#    TICKET MESSAGE SCHEMAS
# ==========================================

class TicketMessageCreate(BaseModel):
    """Schema for adding a reply/message to a ticket."""
    message: str = Field(..., min_length=1, description="The message content")


class TicketMessageResponse(BaseModel):
    """Schema for a ticket message in responses."""
    id: int
    ticket_id: int
    sender_id: int
    sender_name: Optional[str] = None
    sender_role: Optional[str] = None
    message: str
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
#    TICKET RESPONSE SCHEMAS
# ==========================================

class TicketResponse(BaseModel):
    """Schema for a ticket in list responses."""
    id: int
    created_by: int
    creator_name: Optional[str] = None
    assigned_to: Optional[int] = None
    assignee_name: Optional[str] = None
    title: str
    description: str
    category: TicketCategorySchema
    priority: TicketPrioritySchema
    status: TicketStatusSchema
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TicketDetailResponse(TicketResponse):
    """Schema for a ticket with its messages (detail view)."""
    messages: List[TicketMessageResponse] = []
