"""
Ticket / Support System Router
Provides endpoints for creating, viewing, replying to, and managing
support tickets with controlled status flow and role-based access.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

import models
import database
import schemas_tickets
from core.dependencies import get_current_user
from core.utils_notifications import notify_user, notify_admins
import json

router = APIRouter(prefix="/tickets", tags=["Tickets / Support"])


# ==========================================
#    STATUS FLOW VALIDATION
# ==========================================

# Allowed status transitions (role-independent base rules)
VALID_TRANSITIONS = {
    models.TicketStatus.OPEN: [models.TicketStatus.ASSIGNED, models.TicketStatus.IN_PROGRESS, models.TicketStatus.RESOLVED],
    models.TicketStatus.ASSIGNED: [models.TicketStatus.IN_PROGRESS, models.TicketStatus.RESOLVED],
    models.TicketStatus.IN_PROGRESS: [models.TicketStatus.RESOLVED],
    models.TicketStatus.RESOLVED: [models.TicketStatus.CLOSED],
    models.TicketStatus.CLOSED: [],
}

# Admins can additionally close an OPEN ticket directly (e.g., spam/invalid)
ADMIN_EXTRA_TRANSITIONS = {
    models.TicketStatus.OPEN: [models.TicketStatus.CLOSED],
    models.TicketStatus.ASSIGNED: [models.TicketStatus.CLOSED],
    models.TicketStatus.IN_PROGRESS: [models.TicketStatus.CLOSED],
}


def _is_valid_transition(current_status: models.TicketStatus, new_status: models.TicketStatus, is_admin: bool) -> bool:
    """Check if a status transition is allowed."""
    allowed = VALID_TRANSITIONS.get(current_status, [])
    if is_admin:
        allowed = allowed + ADMIN_EXTRA_TRANSITIONS.get(current_status, [])
    return new_status in allowed


# ==========================================
#    HELPER: BUILD TICKET RESPONSE
# ==========================================

def _ticket_to_response(ticket: models.Ticket) -> dict:
    """Convert a Ticket ORM object to a response dict with creator/assignee names."""
    return {
        "id": ticket.id,
        "created_by": ticket.created_by,
        "creator_name": ticket.creator.name if ticket.creator else None,
        "assigned_to": ticket.assigned_to,
        "assignee_name": ticket.assignee.name if ticket.assignee else None,
        "title": ticket.title,
        "description": ticket.description,
        "domain": ticket.domain,
        "status": ticket.status.value,
        "created_at": ticket.created_at,
        "updated_at": ticket.updated_at,
        "resolved_by": ticket.resolved_by,
        "resolved_at": ticket.resolved_at,
        "resolution": ticket.resolution,
        "closed_by": ticket.closed_by,
        "closed_at": ticket.closed_at,
        "closure_reason": ticket.closure_reason,
    }

def _add_ticket_history(db: Session, ticket_id: int, actor_id: int, action: str, 
                       old_status: Optional[models.TicketStatus] = None, 
                       new_status: Optional[models.TicketStatus] = None, 
                       metadata: dict = None):
    history = models.TicketHistory(
        ticket_id=ticket_id,
        actor_id=actor_id,
        action=action,
        old_status=old_status,
        new_status=new_status,
        metadata_json=json.dumps(metadata) if metadata else None
    )
    db.add(history)
    db.commit()


def _ticket_to_detail_response(ticket: models.Ticket) -> dict:
    """Convert a Ticket ORM object to a detail response with messages."""
    resp = _ticket_to_response(ticket)
    resp["messages"] = [
        {
            "id": msg.id,
            "ticket_id": msg.ticket_id,
            "sender_id": msg.sender_id,
            "sender_name": msg.sender.name if msg.sender else None,
            "sender_role": msg.sender.role.value if msg.sender else None,
            "message": msg.message,
            "created_at": msg.created_at,
        }
        for msg in ticket.messages
    ]
    return resp


def _message_to_response(msg: models.TicketMessage) -> dict:
    """Convert a TicketMessage ORM object to a response dict."""
    return {
        "id": msg.id,
        "ticket_id": msg.ticket_id,
        "sender_id": msg.sender_id,
        "sender_name": msg.sender.name if msg.sender else None,
        "sender_role": msg.sender.role.value if msg.sender else None,
        "message": msg.message,
        "created_at": msg.created_at,
    }


# ==========================================
#    HELPER: PERMISSION CHECK
# ==========================================

def _check_ticket_access(ticket: models.Ticket, current_user: models.User) -> None:
    """
    Raise 403 if the current user cannot access this ticket.
    - Interns: can only access their own tickets.
    - Mentors: can access tickets they are assigned to, or tickets from their interns.
    - Admins: can access all tickets.
    """
    if current_user.role == models.UserRole.ADMIN:
        return  # Admin has full access

    if current_user.role == models.UserRole.INTERN:
        if ticket.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: You can only view your own tickets"
            )

    elif current_user.role == models.UserRole.MENTOR:
        # Mentor can access if assigned, or if ticket creator is their intern
        is_assigned = ticket.assigned_to == current_user.id
        creator = ticket.creator
        is_their_intern = creator and creator.mentor_id == current_user.id
        if not (is_assigned or is_their_intern):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: This ticket is not assigned to you and the intern is not under your supervision"
            )


# ==========================================
#    CREATE TICKET (Intern)
# ==========================================

@router.post(
    "",
    response_model=schemas_tickets.TicketResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a support ticket",
    description="Interns can create a new support ticket. If the intern has an assigned mentor, the ticket is auto-assigned to that mentor.",
    response_model_exclude_none=True
)
def create_ticket(
    data: schemas_tickets.TicketCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Only interns can create support tickets"
        )

    new_ticket = models.Ticket(
        created_by=current_user.id,
        assigned_to=None,
        title=data.title,
        description=data.description,
        domain=data.domain,
        status=models.TicketStatus.OPEN,
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    _add_ticket_history(db, new_ticket.id, current_user.id, "created", new_status=models.TicketStatus.OPEN)
    
    notify_admins(db, "New Support Ticket", f"Intern: {current_user.name}\nTitle: {new_ticket.title}\nDomain: {new_ticket.domain}")

    return _ticket_to_response(new_ticket)


@router.get(
    "",
    response_model=List[schemas_tickets.TicketResponse],
    summary="List tickets",
    description="Role-based ticket listing. Returns all tickets for Admins, assigned/supervised tickets for Mentors, and created tickets for Interns.",
    response_model_exclude_none=True
)
def get_tickets(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role == models.UserRole.ADMIN:
        query = db.query(models.Ticket)
    elif current_user.role == models.UserRole.MENTOR:
        intern_ids = [
            i.id for i in db.query(models.User).filter(models.User.mentor_id == current_user.id).all()
        ]
        query = db.query(models.Ticket).filter(
            (models.Ticket.assigned_to == current_user.id) |
            (models.Ticket.created_by.in_(intern_ids))
        )
    elif current_user.role == models.UserRole.INTERN:
        query = db.query(models.Ticket).filter(models.Ticket.created_by == current_user.id)
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied")

    tickets = query.order_by(models.Ticket.created_at.desc()).all()
    
    results = []
    for t in tickets:
        resp = _ticket_to_response(t)
        resp["messages"] = [_message_to_response(m) for m in t.messages]
        results.append(resp)
        
    return results


# ==========================================
#    UNIFIED TICKET ACTION (PATCH)
# ==========================================

@router.patch(
    "/{ticket_id}",
    response_model=schemas_tickets.TicketResponse,
    summary="Update ticket (Assign, Message, Resolve, Close)",
    description="Unified endpoint for all ticket actions. Action types: assign, message, resolve, close.",
    response_model_exclude_none=True
)
def update_ticket(
    ticket_id: int,
    data: schemas_tickets.TicketPatchRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    _check_ticket_access(ticket, current_user)

    action = data.action

    if action == schemas_tickets.TicketAction.ASSIGN:
        if current_user.role not in [models.UserRole.MENTOR, models.UserRole.ADMIN]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only mentors/admins can assign tickets")
        if not data.assigned_to:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="assigned_to is required")
            
        if ticket.assigned_to == data.assigned_to:
            # Ticket is already assigned to this user; avoid duplicating history logs
            return _ticket_to_response(ticket)
        
        assignee = db.query(models.User).filter(models.User.id == data.assigned_to).first()
        if not assignee or assignee.role not in [models.UserRole.MENTOR, models.UserRole.ADMIN]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid assignee")
            
        ticket.assigned_to = assignee.id
        old_status = ticket.status
        if ticket.status == models.TicketStatus.OPEN:
            ticket.status = models.TicketStatus.ASSIGNED
        
        _add_ticket_history(db, ticket.id, current_user.id, "assigned", old_status=old_status, new_status=ticket.status, metadata={"assigned_to": assignee.id, "assignee_name": assignee.name})
        notify_user(db, assignee.id, f"Ticket #{ticket.id} Assigned", f"Assigned by {current_user.name}")

    elif action == schemas_tickets.TicketAction.MESSAGE:
        if not data.message:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="message is required")
        if ticket.status == models.TicketStatus.CLOSED:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ticket is closed")
            
        # Prevent duplicate consecutive messages from the same user
        if ticket.messages:
            last_msg = ticket.messages[-1]
            if last_msg.sender_id == current_user.id and last_msg.message == data.message:
                resp = _ticket_to_response(ticket)
                resp["messages"] = [_message_to_response(m) for m in ticket.messages]
                return resp
            
        new_msg = models.TicketMessage(ticket_id=ticket.id, sender_id=current_user.id, message=data.message)
        db.add(new_msg)
        
        if ticket.status in [models.TicketStatus.OPEN, models.TicketStatus.ASSIGNED] and current_user.role != models.UserRole.INTERN:
            old_status = ticket.status
            ticket.status = models.TicketStatus.IN_PROGRESS
            _add_ticket_history(db, ticket.id, current_user.id, "status_changed", old_status=old_status, new_status=ticket.status, metadata={"reason": "Automatic transition on reply"})
            
        _add_ticket_history(db, ticket.id, current_user.id, "message_sent")
        
        other_user_id = ticket.created_by if current_user.id != ticket.created_by else ticket.assigned_to
        if other_user_id:
            notify_user(db, other_user_id, f"New message on Ticket #{ticket.id}", f"Message: {data.message[:50]}...")

    elif action == schemas_tickets.TicketAction.RESOLVE:
        if current_user.role not in [models.UserRole.MENTOR, models.UserRole.ADMIN]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only mentors/admins can resolve")
        if not data.resolution:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="resolution is required")
        if not _is_valid_transition(ticket.status, models.TicketStatus.RESOLVED, current_user.role == models.UserRole.ADMIN):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Invalid transition to resolved")
            
        old_status = ticket.status
        ticket.status = models.TicketStatus.RESOLVED
        ticket.resolved_by = current_user.id
        ticket.resolved_at = datetime.utcnow()
        ticket.resolution = data.resolution
        _add_ticket_history(db, ticket.id, current_user.id, "resolved", old_status=old_status, new_status=ticket.status, metadata={"resolution": data.resolution})
        notify_user(db, ticket.created_by, f"Ticket #{ticket.id} Resolved", "Your ticket has been resolved.")

    elif action == schemas_tickets.TicketAction.CLOSE:
        if current_user.role != models.UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can close tickets")
        if not _is_valid_transition(ticket.status, models.TicketStatus.CLOSED, True):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Invalid transition to closed")
            
        old_status = ticket.status
        ticket.status = models.TicketStatus.CLOSED
        ticket.closed_by = current_user.id
        ticket.closed_at = datetime.utcnow()
        ticket.closure_reason = data.closure_reason
        _add_ticket_history(db, ticket.id, current_user.id, "closed", old_status=old_status, new_status=ticket.status, metadata={"closure_reason": data.closure_reason})
        notify_user(db, ticket.created_by, f"Ticket #{ticket.id} Closed", "Your ticket has been closed.")

    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown action")

    ticket.updated_at = datetime.utcnow()
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    # Build full response
    resp = _ticket_to_response(ticket)
    resp["messages"] = [_message_to_response(m) for m in ticket.messages]
    return resp




