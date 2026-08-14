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

router = APIRouter(prefix="/tickets", tags=["Tickets / Support"])


# ==========================================
#    STATUS FLOW VALIDATION
# ==========================================

# Allowed status transitions (role-independent base rules)
VALID_TRANSITIONS = {
    models.TicketStatus.OPEN: [models.TicketStatus.IN_PROGRESS],
    models.TicketStatus.IN_PROGRESS: [models.TicketStatus.RESOLVED],
    models.TicketStatus.RESOLVED: [models.TicketStatus.CLOSED],
    models.TicketStatus.CLOSED: [],
}

# Admins can additionally close an OPEN ticket directly (e.g., spam/invalid)
ADMIN_EXTRA_TRANSITIONS = {
    models.TicketStatus.OPEN: [models.TicketStatus.CLOSED],
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
        "category": ticket.category.value,
        "priority": ticket.priority.value,
        "status": ticket.status.value,
        "created_at": ticket.created_at,
        "updated_at": ticket.updated_at,
    }


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
    description="Interns can create a new support ticket. If the intern has an assigned mentor, the ticket is auto-assigned to that mentor."
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

    # Auto-assign to the intern's mentor if one exists
    assigned_to = current_user.mentor_id if current_user.mentor_id else None

    new_ticket = models.Ticket(
        created_by=current_user.id,
        assigned_to=assigned_to,
        title=data.title,
        description=data.description,
        category=models.TicketCategory(data.category.value),
        priority=models.TicketPriority(data.priority.value),
        status=models.TicketStatus.OPEN,
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return _ticket_to_response(new_ticket)


# ==========================================
#    LIST MY TICKETS (Intern)
# ==========================================

@router.get(
    "/my",
    response_model=List[schemas_tickets.TicketResponse],
    summary="List my tickets",
    description="Interns can view all tickets they have created."
)
def get_my_tickets(
    status_filter: Optional[str] = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Intern role required"
        )

    query = db.query(models.Ticket).filter(
        models.Ticket.created_by == current_user.id
    )

    if status_filter:
        try:
            status_enum = models.TicketStatus(status_filter)
            query = query.filter(models.Ticket.status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid status filter: {status_filter}. Must be one of: open, in_progress, resolved, closed"
            )

    tickets = query.order_by(models.Ticket.created_at.desc()).all()
    return [_ticket_to_response(t) for t in tickets]


# ==========================================
#    LIST TICKETS (Mentor/Admin)
# ==========================================

@router.get(
    "",
    response_model=List[schemas_tickets.TicketResponse],
    summary="List tickets (Mentor/Admin)",
    description=(
        "Mentors see tickets assigned to them and tickets from their interns. "
        "Admins see all tickets. Supports optional status filter."
    )
)
def get_tickets(
    status_filter: Optional[str] = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role == models.UserRole.INTERN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Use /tickets/my to view your own tickets"
        )

    if current_user.role == models.UserRole.ADMIN:
        query = db.query(models.Ticket)
    elif current_user.role == models.UserRole.MENTOR:
        # Get IDs of interns assigned to this mentor
        intern_ids = [
            i.id for i in
            db.query(models.User).filter(models.User.mentor_id == current_user.id).all()
        ]
        query = db.query(models.Ticket).filter(
            (models.Ticket.assigned_to == current_user.id) |
            (models.Ticket.created_by.in_(intern_ids))
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied"
        )

    if status_filter:
        try:
            status_enum = models.TicketStatus(status_filter)
            query = query.filter(models.Ticket.status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid status filter: {status_filter}. Must be one of: open, in_progress, resolved, closed"
            )

    tickets = query.order_by(models.Ticket.created_at.desc()).all()
    return [_ticket_to_response(t) for t in tickets]


# ==========================================
#    GET TICKET DETAIL
# ==========================================

@router.get(
    "/{ticket_id}",
    response_model=schemas_tickets.TicketDetailResponse,
    summary="View ticket details",
    description="View a ticket with all its messages. Access is controlled by role."
)
def get_ticket_detail(
    ticket_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    _check_ticket_access(ticket, current_user)
    return _ticket_to_detail_response(ticket)


# ==========================================
#    ADD MESSAGE / REPLY
# ==========================================

@router.post(
    "/{ticket_id}/messages",
    response_model=schemas_tickets.TicketMessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Reply to a ticket",
    description="Add a message/reply to an existing ticket. All parties with access can reply."
)
def add_ticket_message(
    ticket_id: int,
    data: schemas_tickets.TicketMessageCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    _check_ticket_access(ticket, current_user)

    # Don't allow messages on closed tickets
    if ticket.status == models.TicketStatus.CLOSED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot add messages to a closed ticket"
        )

    new_message = models.TicketMessage(
        ticket_id=ticket.id,
        sender_id=current_user.id,
        message=data.message,
    )
    db.add(new_message)

    # Update ticket's updated_at timestamp
    ticket.updated_at = datetime.utcnow()
    db.add(ticket)

    db.commit()
    db.refresh(new_message)

    return _message_to_response(new_message)


# ==========================================
#    UPDATE TICKET STATUS
# ==========================================

@router.patch(
    "/{ticket_id}/status",
    response_model=schemas_tickets.TicketResponse,
    summary="Change ticket status",
    description=(
        "Update a ticket's status with controlled flow: "
        "OPEN → IN_PROGRESS → RESOLVED → CLOSED. "
        "Admins can additionally close OPEN tickets directly."
    )
)
def update_ticket_status(
    ticket_id: int,
    data: schemas_tickets.TicketStatusUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role not in [models.UserRole.MENTOR, models.UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Only mentors and admins can change ticket status"
        )

    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    _check_ticket_access(ticket, current_user)

    new_status = models.TicketStatus(data.status.value)
    is_admin = current_user.role == models.UserRole.ADMIN

    if not _is_valid_transition(ticket.status, new_status, is_admin):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Invalid status transition: {ticket.status.value} → {new_status.value}"
        )

    ticket.status = new_status
    ticket.updated_at = datetime.utcnow()
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return _ticket_to_response(ticket)


# ==========================================
#    ASSIGN TICKET
# ==========================================

@router.patch(
    "/{ticket_id}/assign",
    response_model=schemas_tickets.TicketResponse,
    summary="Assign a ticket",
    description="Assign a ticket to a mentor or admin. Only mentors and admins can assign tickets."
)
def assign_ticket(
    ticket_id: int,
    data: schemas_tickets.TicketAssignUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role not in [models.UserRole.MENTOR, models.UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Only mentors and admins can assign tickets"
        )

    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    # Verify the assignee exists and is a mentor or admin
    assignee = db.query(models.User).filter(models.User.id == data.assigned_to).first()
    if not assignee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignee user not found"
        )
    if assignee.role not in [models.UserRole.MENTOR, models.UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Tickets can only be assigned to mentors or admins"
        )

    ticket.assigned_to = data.assigned_to
    ticket.updated_at = datetime.utcnow()
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return _ticket_to_response(ticket)


# ==========================================
#    UPDATE TICKET PRIORITY
# ==========================================

@router.patch(
    "/{ticket_id}/priority",
    response_model=schemas_tickets.TicketResponse,
    summary="Change ticket priority",
    description="Update a ticket's priority level. Only mentors and admins can change priority."
)
def update_ticket_priority(
    ticket_id: int,
    data: schemas_tickets.TicketPriorityUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role not in [models.UserRole.MENTOR, models.UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Only mentors and admins can change ticket priority"
        )

    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    _check_ticket_access(ticket, current_user)

    ticket.priority = models.TicketPriority(data.priority.value)
    ticket.updated_at = datetime.utcnow()
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return _ticket_to_response(ticket)
