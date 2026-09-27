class SignDocumentReq(BaseModel):
    document_type: str
    signature_base64: str

@router.post("/{application_id}/sign-document-inline")
def sign_document_inline(application_id: str, req: SignDocumentReq, db: Session = Depends(get_db)):
    app_id = int(application_id.replace("APP-", "")) if application_id.startswith("APP-") else int(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if req.document_type == "offer_letter":
        # Mock saving the signed document
        db_app.signed_offer_letter_url = f"https://example.com/signed_offer_{app_id}.pdf"
    elif req.document_type == "tc":
        db_app.signed_tc_url = f"https://example.com/signed_tc_{app_id}.pdf"
        
    # If both are signed, update status
    if db_app.signed_offer_letter_url and db_app.signed_tc_url:
        db_app.status = models.ApplicationStatus.DOCUMENTS_UPLOADED
        
    db.commit()
    return {"message": "Document signed successfully"}
