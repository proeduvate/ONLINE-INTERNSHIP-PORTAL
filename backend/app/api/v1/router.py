from fastapi import APIRouter, Depends

try:
    from app.api.deps import get_db
except ImportError:
    try:
        from app.db.session import get_db
    except ImportError:
        from backend.app.api.deps import get_db

api_router = APIRouter()

def _safe_include(module_path, prefix="", tags=None):
    try:
        import importlib
        mod = importlib.import_module(module_path)
        if hasattr(mod, "router"):
            if prefix:
                api_router.include_router(mod.router, prefix=prefix, tags=tags or [])
            else:
                api_router.include_router(mod.router)
            return mod
    except Exception:
        pass
    return None

auth_mod = _safe_include("app.api.v1.endpoints.auth", prefix="/auth", tags=["auth"])
users_mod = _safe_include("app.api.v1.endpoints.users", prefix="/users", tags=["users"])
meetings_mod = _safe_include("app.api.v1.endpoints.meetings")
cert_mod = _safe_include("app.api.v1.endpoints.certificates", prefix="/certificates", tags=["certificates"])

_safe_include("app.api.v1.endpoints.tasks")
_safe_include("app.api.v1.endpoints.simulation")
_safe_include("app.api.v1.endpoints.mcq")
_safe_include("app.api.v1.endpoints.questions", prefix="/questions", tags=["questions"])
_safe_include("app.api.v1.endpoints.analytics", prefix="/analytics", tags=["analytics"])
_safe_include("app.api.v1.endpoints.leaderboard")
_safe_include("app.api.v1.endpoints.onboarding")
_safe_include("app.api.v1.endpoints.airdrops")
_safe_include("app.api.v1.endpoints.tickets")
_safe_include("app.api.v1.endpoints.facts")
_safe_include("app.api.v1.endpoints.health")
