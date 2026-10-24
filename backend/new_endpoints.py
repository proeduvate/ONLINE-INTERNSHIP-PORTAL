from pydantic import BaseModel

class StatusUpdate(BaseModel):
    status: str

@router.get("/applications/{application_id}")
def get_application_details(application_id: str, db: Session = Depends(get_db)):
    app_id = int(application_id.replace("APP-", "")) if application_id.startswith("APP-") else int(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    return {
        "applicationId": f"APP-{db_app.id}",
        "name": db_app.name,
        "email": db_app.email,
        "phone": db_app.phone,
        "college": db_app.college,
        "department": db_app.department,
        "domain": db_app.domain,
        "status": db_app.status.value,
        "resume": db_app.resume_url,
        "offer_letter_url": getattr(db_app, 'offer_letter_url', None),
        "tc_url": getattr(db_app, 'tc_url', None),
        "signed_offer_letter_url": getattr(db_app, 'signed_offer_letter_url', None),
        "signed_tc_url": getattr(db_app, 'signed_tc_url', None)
    }

@router.post("/applications/{application_id}/status")
def update_application_status(application_id: str, update: StatusUpdate, db: Session = Depends(get_db)):
    app_id = int(application_id.replace("APP-", "")) if application_id.startswith("APP-") else int(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    db_app.status = update.status
    db.commit()
    return {"message": "Status updated"}

class InterviewReq(BaseModel):
    required: bool
    meet_link: Optional[str] = None
    scheduled_time: Optional[str] = None
    payment_form_link: Optional[str] = None

@router.post("/{application_id}/interview")
def schedule_interview(application_id: str, req: InterviewReq, db: Session = Depends(get_db)):
    app_id = int(application_id.replace("APP-", "")) if application_id.startswith("APP-") else int(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if req.required:
        db_app.status = models.ApplicationStatus.INTERVIEW_SCHEDULED
    else:
        db_app.status = models.ApplicationStatus.PAYMENT_PENDING
        
    db.commit()
    return {"message": "Interview decision recorded"}

class InterviewRes(BaseModel):
    passed: bool
    payment_form_link: Optional[str] = None

@router.post("/{application_id}/interview/result")
def interview_result(application_id: str, res: InterviewRes, db: Session = Depends(get_db)):
    app_id = int(application_id.replace("APP-", "")) if application_id.startswith("APP-") else int(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if res.passed:
        db_app.status = models.ApplicationStatus.INTERVIEW_PASSED
    else:
        db_app.status = models.ApplicationStatus.INTERVIEW_FAILED
        
    db.commit()
    return {"message": "Interview result recorded"}

class PaymentVerifyReq(BaseModel):
    verified: bool

@router.post("/{application_id}/payment/verify")
def verify_payment(application_id: str, req: PaymentVerifyReq, db: Session = Depends(get_db)):
    app_id = int(application_id.replace("APP-", "")) if application_id.startswith("APP-") else int(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if req.verified:
        db_app.status = models.ApplicationStatus.DOCUMENTS_PENDING
    else:
        db_app.status = models.ApplicationStatus.PAYMENT_REJECTED
        
    db.commit()
    return {"message": "Payment verification recorded"}

@router.post("/{application_id}/generate-documents")
def generate_documents(application_id: str, db: Session = Depends(get_db)):
    app_id = int(application_id.replace("APP-", "")) if application_id.startswith("APP-") else int(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db_app.status = models.ApplicationStatus.ACCOUNT_CREATION_PENDING
    # Mock URLs for testing
    setattr(db_app, 'offer_letter_url', f"https://example.com/offer_{app_id}.pdf")
    setattr(db_app, 'tc_url', f"https://example.com/tc_{app_id}.pdf")
    db.commit()
    
    return {"urls": {"offer_letter_url": f"https://example.com/offer_{app_id}.pdf"}}

class AssignMentorReq(BaseModel):
    mentor_id: int

@router.post("/{application_id}/assign-mentor")
def assign_mentor(application_id: str, req: AssignMentorReq, db: Session = Depends(get_db)):
    return {"message": "Mentor assigned"}

@router.post("/{application_id}/create-account")
def create_account(application_id: str, db: Session = Depends(get_db)):
    app_id = int(application_id.replace("APP-", "")) if application_id.startswith("APP-") else int(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db_app.status = models.ApplicationStatus.ACTIVE
    db.commit()
    return {"message": "Account created"}
