try:
    from app.api.deps import get_current_user, get_db
except ImportError:
    from backend.app.api.deps import get_current_user, get_db
