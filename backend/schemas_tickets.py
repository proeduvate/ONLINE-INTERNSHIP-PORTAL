"""
Pydantic schemas for the Ticket / Support System module.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime
import json
from enum import Enum


# ==========================================
#    TICKET ENUMS (for schema validation)
# ==========================================




class TicketStatusSchema(str, Enum):
    OPEN = "open"
    ASSIGNED = "assigned"
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
    domain: str = Field(..., min_length=1, max_length=100, description="Domain of the issue")


class TicketAction(str, Enum):
    ASSIGN = "assign"
    MESSAGE = "message"
    RESOLVE = "resolve"
    CLOSE = "close"

class TicketPatchRequest(BaseModel):
    """Unified schema for updating a ticket (assign, message, resolve, close)."""
    action: TicketAction = Field(..., description="The action to perform on the ticket")
    
    # Fields used depending on the action:
    assigned_to: Optional[int] = Field(None, description="User ID to assign the ticket to (for action='assign')")
    message: Optional[str] = Field(None, description="Message content (for action='message')")
    resolution: Optional[str] = Field(None, description="Resolution details (for action='resolve')")
    closure_reason: Optional[str] = Field(None, description="Reason for closure (for action='close')")


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
    domain: str
    status: TicketStatusSchema
    created_at: datetime
    updated_at: datetime
    
    resolved_by: Optional[int] = None
    resolved_at: Optional[datetime] = None
    resolution: Optional[str] = None
    
    closed_by: Optional[int] = None
    closed_at: Optional[datetime] = None
    closure_reason: Optional[str] = None
    
    messages: List[TicketMessageResponse] = []

    class Config:
        from_attributes = True


class TicketHistoryResponse(BaseModel):
    """Schema for ticket history."""
    id: int
    ticket_id: int
    actor_id: int
    actor_name: Optional[str] = None
    action: str
    old_status: Optional[TicketStatusSchema] = None
    new_status: Optional[TicketStatusSchema] = None
    parsed_metadata: Optional[Dict[str, Any]] = Field(None, alias="metadata")
    created_at: datetime

    def __init__(self, **data):
        if "metadata_json" in data and data["metadata_json"]:
            try:
                data["parsed_metadata"] = json.loads(data["metadata_json"])
            except:
                data["parsed_metadata"] = {}
        super().__init__(**data)

    class Config:
        from_attributes = True
