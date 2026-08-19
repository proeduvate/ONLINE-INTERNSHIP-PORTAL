from sqlalchemy.orm import Session
from models import Notification, UserRole, User

def notify_user(db: Session, user_id: int, title: str, message: str, notif_type: str = "system"):
    """Create a notification for a specific user."""
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notif_type
    )
    db.add(notif)
    db.commit()

def notify_admins(db: Session, title: str, message: str, notif_type: str = "system"):
    """Create a notification for all admin users."""
    admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
    for admin in admins:
        notif = Notification(
            user_id=admin.id,
            title=title,
            message=message,
            type=notif_type
        )
        db.add(notif)
    db.commit()
