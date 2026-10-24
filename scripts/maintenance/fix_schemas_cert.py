import os

filepath = "backend/schemas.py"
with open(filepath, 'r') as f:
    content = f.read()

new_schemas = """
# --- CERTIFICATES ---
from datetime import datetime

class CertificateRequest(BaseModel):
    duration: str
    achievement: Optional[str] = None
    grade: Optional[str] = None
    final_score: Optional[int] = None

class CertificateResponse(BaseModel):
    id: int
    intern_id: int
    intern_name: str
    certificate_id: str
    domain: str
    duration: str
    achievement: Optional[str] = None
    status: str
    pdf_path: Optional[str] = None
    issued_date: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
"""

if "class CertificateRequest" not in content:
    with open(filepath, 'a') as f:
        f.write(new_schemas)
    print("Added Certificate schemas.")
else:
    print("Schemas already exist.")
