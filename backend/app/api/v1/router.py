from fastapi import APIRouter, Depends

try:
    from app.api.v1.endpoints import (
        auth,
        users,
        meetings,
        tasks,
        simulation,
        mcq,
        questions,
        analytics,
        leaderboard,
        onboarding,
        airdrops,
        tickets,
        facts,
        health,
    )
except Exception:
    from .endpoints import (
        auth,
        users,
        meetings,
        tasks,
        simulation,
        mcq,
        questions,
        analytics,
        leaderboard,
        onboarding,
        airdrops,
        tickets,
        facts,
        health,
    )

try:
    from app.api.v1.endpoints import certificates
except ImportError:
    try:
        from .endpoints import certificates
    except ImportError:
        certificates = None

api_router = APIRouter()

# Authentication & User Management
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])

# Core Features
api_router.include_router(meetings.router)
if certificates:
    api_router.include_router(certificates.router, prefix="/certificates", tags=["certificates"])

    # Standalone QR Code Verification Route (/verify/{certificate_id})
    verify_router = APIRouter()
    @verify_router.get("/verify/{certificate_id}")
    async def standalone_verify_certificate(certificate_id: str, db=Depends(certificates.get_db)):
        return await certificates.verify_certificate(certificate_id, db)

    api_router.include_router(verify_router, tags=["certificates"])

api_router.include_router(tasks.router)
api_router.include_router(simulation.router)
api_router.include_router(mcq.router)
api_router.include_router(questions.router, prefix="/questions", tags=["questions"])

# Analytics & Engagement
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(leaderboard.router)
api_router.include_router(onboarding.router)
api_router.include_router(airdrops.router)
api_router.include_router(tickets.router)
api_router.include_router(facts.router)
api_router.include_router(health.router)

