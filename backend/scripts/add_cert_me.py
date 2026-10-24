import re

filepath = "backend/routers/certificates.py"
with open(filepath, 'r') as f:
    content = f.read()

endpoint_code = """
@router.get("/me", response_model=schemas.CertificateResponse)
def get_my_certificate(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user_from_token)):
    cert = db.query(models.Certificate).filter(models.Certificate.intern_id == current_user.id).order_by(models.Certificate.id.desc()).first()
    if not cert:
        raise HTTPException(status_code=404, detail="No certificate found")
    return cert
"""

if "@router.get(\"/me\"" not in content:
    content = content.replace("def request_certificate", endpoint_code + "\n@router.post(\"/request\", response_model=schemas.CertificateResponse)\ndef request_certificate")
    with open(filepath, 'w') as f:
        f.write(content)
    print("Added /me endpoint")
else:
    print("Already added")
