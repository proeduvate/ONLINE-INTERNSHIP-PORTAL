from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import json

from database import get_db
from models import Ticket, TicketMessage, TicketHistory, TicketStatus, User
from schemas import (
    TicketCreate, TicketPatchRequest, TicketResponse, 
    TicketMessageResponse, TicketAction, TicketStatusSchema
)
from dependencies import get_current_user

router = APIRouter()

def _format_ticket_response(ticket: Ticket) -> dict:
    messages = []
    comments = []
    for msg in ticket.messages:
        sender_name = msg.sender.name if msg.sender else f"User {msg.sender_id}"
        sender_role = msg.sender.role.value if msg.sender and hasattr(msg.sender.role, 'value') else (str(msg.sender.role) if msg.sender else "user")
        messages.append({
            "id": msg.id,
            "ticket_id": msg.ticket_id,
            "sender_id": msg.sender_id,
            "sender_name": sender_name,
            "sender_role": sender_role,
            "message": msg.message,
            "created_at": msg.created_at
        })
        comments.append({
            "author": sender_name,
            "text": msg.message,
            "time": msg.created_at.isoformat() if msg.created_at else None
        })
    
    creator_name = ticket.creator.name if ticket.creator else f"User {ticket.created_by}"
    date_str = ticket.created_at.strftime("%b %d, %Y") if ticket.created_at else "Recently"

    return {
        "id": ticket.id,
        "created_by": ticket.created_by,
        "creator_name": creator_name,
        "user": creator_name,
        "user_name": creator_name,
        "assigned_to": ticket.assigned_to,
        "assignee_name": ticket.assignee.name if ticket.assignee else None,
        "title": ticket.title,
        "description": ticket.description,
        "domain": ticket.domain,
        "status": ticket.status.value if hasattr(ticket.status, 'value') else str(ticket.status),
        "created_at": ticket.created_at,
        "updated_at": ticket.updated_at,
        "date": date_str,
        "resolved_by": ticket.resolved_by,
        "resolved_at": ticket.resolved_at,
        "resolution": ticket.resolution,
        "closed_by": ticket.closed_by,
        "closed_at": ticket.closed_at,
        "closure_reason": ticket.closure_reason,
        "messages": messages,
        "comments": comments
    }

@router.post("/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(
    ticket_in: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new support ticket."""
    new_ticket = Ticket(
        created_by=current_user.id,
        title=ticket_in.title,
        description=ticket_in.description,
        domain=ticket_in.domain,
        status=TicketStatus.OPEN
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    # Initial history log
    history_log = TicketHistory(
        ticket_id=new_ticket.id,
        actor_id=current_user.id,
        action="created",
        new_status=TicketStatus.OPEN,
        metadata_json=json.dumps({"title": new_ticket.title})
    )
    db.add(history_log)
    db.commit()

    return _format_ticket_response(new_ticket)

@router.get("/", response_model=List[TicketResponse])
def get_tickets(
    domain: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve tickets. Interns see their own tickets; Mentors and Admins see relevant/all tickets."""
    query = db.query(Ticket)
    
    role_str = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
    if role_str == "intern":
        query = query.filter(Ticket.created_by == current_user.id)
    elif role_str == "mentor":
        query = query.filter((Ticket.assigned_to == current_user.id) | (Ticket.created_by == current_user.id) | (Ticket.status == TicketStatus.OPEN))
    
    if domain:
        query = query.filter(Ticket.domain == domain)
    if status_filter:
        query = query.filter(Ticket.status == status_filter)
        
    tickets = query.order_by(Ticket.created_at.desc()).all()
    return [_format_ticket_response(t) for t in tickets]

@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket_details(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get full details of a specific ticket."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    role_str = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
    if role_str == "intern" and ticket.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this ticket")
        
    return _format_ticket_response(ticket)

@router.patch("/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: int,
    req: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Perform action on a ticket (assign, message, resolve, close, status, comments)."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    old_status = ticket.status
    action = req.get("action")
    history_action = "updated"

    if action == "assign" or req.get("assigned_to"):
        ticket.assigned_to = req.get("assigned_to")
        ticket.status = TicketStatus.ASSIGNED
        history_action = "assigned"

    if action == "message" or req.get("message") or req.get("comments"):
        msg_text = req.get("message")
        if not msg_text and req.get("comments"):
            c_val = req.get("comments")
            if isinstance(c_val, list) and len(c_val) > 0:
                last_c = c_val[-1]
                msg_text = last_c.get("text") if isinstance(last_c, dict) else str(last_c)
            elif isinstance(c_val, str):
                msg_text = c_val
        if msg_text:
            new_msg = TicketMessage(
                ticket_id=ticket.id,
                sender_id=current_user.id,
                message=msg_text
            )
            db.add(new_msg)
            if ticket.status == TicketStatus.OPEN:
                ticket.status = TicketStatus.IN_PROGRESS
            history_action = "message_added"

    status_val = req.get("status")
    if action == "resolve" or status_val == "Resolved":
        ticket.status = TicketStatus.RESOLVED
        ticket.resolved_by = current_user.id
        ticket.resolved_at = datetime.utcnow()
        ticket.resolution = req.get("resolution") or "Resolved by staff"
        history_action = "resolved"
    elif action == "close" or status_val == "Closed":
        ticket.status = TicketStatus.CLOSED
        ticket.closed_by = current_user.id
        ticket.closed_at = datetime.utcnow()
        ticket.closure_reason = req.get("closure_reason") or "Closed"
        history_action = "closed"
    elif status_val == "In Progress" or status_val == "in_progress":
        ticket.status = TicketStatus.IN_PROGRESS

    ticket.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(ticket)

    # Log history
    history_log = TicketHistory(
        ticket_id=ticket.id,
        actor_id=current_user.id,
        action=history_action,
        old_status=old_status,
        new_status=ticket.status,
        metadata_json=json.dumps({"actor_name": current_user.name})
    )
    db.add(history_log)
    db.commit()

    return _format_ticket_response(ticket)
