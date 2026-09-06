from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.db.analytics_session import get_analytics_db
from app.models.analytics_models import AnalyticsBatch, InternAnalytics
from app.dependencies.auth import get_current_user
from app.models import User, UserRole

router = APIRouter(tags=["Batch Analytics"])

@router.get("/batch-analytics/batches", summary="Get all batches")
def get_batches(db: Session = Depends(get_analytics_db)):
    batches = db.query(AnalyticsBatch).all()
    # If empty, populate with some defaults
    if not batches:
        default_batches = ["MIT", "Stanford", "IIT", "Harvard", "Berkeley"]
        for b in default_batches:
            db.add(AnalyticsBatch(name=b))
        db.commit()
        batches = db.query(AnalyticsBatch).all()
        
    return [{"id": b.id, "name": b.name} for b in batches]

@router.get("/batch-analytics/interns", summary="Get interns with optional filtering")
def get_interns(
    batch: str = None, 
    domain: str = None, 
    db: Session = Depends(get_analytics_db)
):
    query = db.query(InternAnalytics)
    if batch and batch != "All Batches":
        query = query.filter(InternAnalytics.college == batch)
    if domain and domain != "All Domains":
        query = query.filter(InternAnalytics.domain == domain)
        
    interns = query.all()
    
    # Auto-seed if empty
    if db.query(InternAnalytics).count() == 0:
        seed_interns = [
            {"intern_id": "INT001", "name": "John Doe", "college": "MIT", "domain": "Artificial Intelligence", "mentor": "Dr. Sakthi", "progress_pct": 60, "attendance_pct": 95},
            {"intern_id": "INT002", "name": "Raj Patel", "college": "Stanford", "domain": "Data Science", "mentor": "Dr. Sakthi", "progress_pct": 80, "attendance_pct": 90},
            {"intern_id": "INT003", "name": "Anu Sharma", "college": "IIT", "domain": "Cyber Security", "mentor": "Dr. Sakthi", "progress_pct": 75, "attendance_pct": 88},
            {"intern_id": "INT004", "name": "Emily Watson", "college": "MIT", "domain": "Artificial Intelligence", "mentor": "Dr. Sakthi", "progress_pct": 45, "attendance_pct": 92},
            {"intern_id": "INT005", "name": "Michael Chang", "college": "MIT", "domain": "Data Science", "mentor": "Dr. Sakthi", "progress_pct": 70, "attendance_pct": 88},
            {"intern_id": "INT035", "name": "Ethan Hunt", "college": "Harvard", "domain": "Artificial Intelligence", "mentor": "Dr. Sakthi", "progress_pct": 65, "attendance_pct": 94},
            {"intern_id": "INT047", "name": "Harry Potter", "college": "Berkeley", "domain": "Artificial Intelligence", "mentor": "Dr. Sakthi", "progress_pct": 95, "attendance_pct": 99},
        ]
        for data in seed_interns:
            intern = InternAnalytics(**data)
            db.add(intern)
        db.commit()
        
    # Re-run query after potential seed
    query = db.query(InternAnalytics)
    if batch and batch != "All Batches":
        query = query.filter(InternAnalytics.college == batch)
    if domain and domain != "All Domains":
        query = query.filter(InternAnalytics.domain == domain)
    interns = query.all()
        
    return interns

@router.get("/batch-analytics/performance/{intern_id}", summary="Get intern performance analytics")
def get_performance(intern_id: str, db: Session = Depends(get_analytics_db)):
    intern = db.query(InternAnalytics).filter(InternAnalytics.intern_id == intern_id).first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found")
        
    # Mock performance data for chart
    return {
        "intern": {
            "id": intern.intern_id,
            "name": intern.name,
            "college": intern.college,
            "domain": intern.domain,
            "progress_pct": intern.progress_pct,
            "attendance_pct": intern.attendance_pct
        },
        "chart_data": [
            {"date": "2023-08-01", "final_score": intern.progress_pct * 0.4, "mcq_score": 40, "coding_score": 35},
            {"date": "2023-08-08", "final_score": intern.progress_pct * 0.6, "mcq_score": 60, "coding_score": 55},
            {"date": "2023-08-15", "final_score": intern.progress_pct * 0.8, "mcq_score": 80, "coding_score": 75},
            {"date": "2023-08-22", "final_score": intern.progress_pct, "mcq_score": 90, "coding_score": 85},
        ]
    }
