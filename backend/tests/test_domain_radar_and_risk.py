import sys
import os
import pytest
from datetime import datetime, timedelta

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import models
from database import SessionLocal, engine, Base
from routers.leaderboard import get_domain_radar, get_leaderboard, RADAR_DOMAINS
from routers.mentor import get_dashboard_stats


@pytest.fixture(scope="module")
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()


def test_radar_domains_specification():
    """Verify B7.1 domain axes match the specification exactly."""
    expected_domains = [
        "Data Science",
        "Frontend",
        "Artificial Intelligence",
        "Cyber Security",
        "Fullstack",
        "Python",
        "UI/UX",
        "Java"
    ]
    assert RADAR_DOMAINS == expected_domains


def test_domain_radar_admin_access(setup_db):
    """Verify admin can query radar across domains."""
    db = setup_db
    admin_user = models.User(
        id=9001,
        name="Admin Test",
        email="admin_radar@test.com",
        hashed_password="hash",
        role=models.UserRole.ADMIN
    )
    radar = get_domain_radar(intern_id=None, batch_filter=None, db=db, current_user=admin_user)
    assert radar is not None
    assert len(radar.axes) == 8
    subjects = [axis.subject for axis in radar.axes]
    assert "Data Science" in subjects
    assert "Frontend" in subjects
    assert "Artificial Intelligence" in subjects


def test_domain_radar_mentor_denied(setup_db):
    """Verify B7.5 access matrix: Mentor has no domain radar view (403 Forbidden)."""
    db = setup_db
    mentor_user = models.User(
        id=9002,
        name="Mentor Test",
        email="mentor_radar@test.com",
        hashed_password="hash",
        role=models.UserRole.MENTOR
    )
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc_info:
        get_domain_radar(intern_id=None, batch_filter=None, db=db, current_user=mentor_user)
    assert exc_info.value.status_code == 403


def test_zero_drop_leaderboard(setup_db):
    """Verify B7.2: newly enrolled interns with zero points are included in rankings."""
    db = setup_db
    # Create an intern with 0 points
    zero_intern = db.query(models.User).filter(models.User.email == "zero_pts@test.com").first()
    if not zero_intern:
        zero_intern = models.User(
            id=9003,
            name="Zero Points Intern",
            email="zero_pts@test.com",
            hashed_password="hash",
            role=models.UserRole.INTERN,
            college="MIT"
        )
        db.add(zero_intern)
        db.commit()

    admin_user = models.User(id=9001, name="Admin", email="admin@test.com", hashed_password="h", role=models.UserRole.ADMIN)
    results = get_leaderboard(period="all", domain_filter=None, batch_filter=None, limit=100, db=db, current_user=admin_user)

    intern_ids = [entry.user_id for entry in results]
    assert zero_intern.id in intern_ids


def test_institution_batch_filter(setup_db):
    """Verify B7.3: filtering by named institution batches (e.g. MIT, Berkeley)."""
    db = setup_db
    admin_user = models.User(id=9001, name="Admin", email="admin@test.com", hashed_password="h", role=models.UserRole.ADMIN)
    results_mit = get_leaderboard(period="all", batch_filter="MIT", limit=50, db=db, current_user=admin_user)
    for entry in results_mit:
        assert "MIT" in (entry.college or "") or "MIT" in (entry.batch or "")

