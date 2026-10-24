import re
import os

doc_service_path = 'backend/services/document_service.py'
with open(doc_service_path, 'r') as f:
    doc_content = f.read()

# Make DocumentService more flexible to accept OnboardingApplication
new_generate_offer = """
    def generate_offer_letter_pdf(self, user) -> str:
        \"\"\"Generates the offer letter PDF and saves to a temporary file.\"\"\"
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", "B", 20)
        pdf.cell(0, 20, "OFFER LETTER", ln=True, align="C")
        
        pdf.set_font("Arial", "", 12)
        pdf.ln(10)
        pdf.cell(0, 10, f"Date: {datetime.utcnow().strftime('%B %d, %Y')}", ln=True)
        pdf.cell(0, 10, f"Name: {user.name}", ln=True)
        
        intern_id = getattr(user, 'intern_id', None) or f"APP-{user.id}"
        pdf.cell(0, 10, f"Intern ID: {intern_id}", ln=True)
        
        pdf.ln(10)
        
        if hasattr(user, 'domain') and hasattr(user.domain, 'name'):
            domain_name = user.domain.name
        else:
            domain_name = getattr(user, 'domain', "your assigned domain")
            
        start_date = getattr(user, 'start_date', None)
        end_date = getattr(user, 'end_date', None)
        start = start_date.strftime("%B %d, %Y") if start_date else "the specified start date"
        end = end_date.strftime("%B %d, %Y") if end_date else "the specified end date"
        
        content = (
            f"Dear {user.name},\\n\\n"
            f"We are thrilled to officially offer you an internship position at ProEduvate in {domain_name}. "
            f"Your skills and background have impressed our team, and we believe you will be a great addition to our organization.\\n\\n"
            f"Your internship is scheduled to commence on {start} and will conclude on {end}. "
            f"Please carefully review the attached terms and conditions. If you accept this offer, please sign and return the documents.\\n\\n"
            f"Welcome to the team!\\n\\n"
            f"Sincerely,\\n"
            f"The ProEduvate Team"
        )
        pdf.multi_cell(0, 10, content)
        
        tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        pdf.output(tmp_file.name)
        return tmp_file.name
"""

new_generate_tnc = """
    def generate_terms_and_conditions_pdf(self, user) -> str:
        \"\"\"Generates the T&C PDF and saves to a temporary file.\"\"\"
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", "B", 20)
        pdf.cell(0, 20, "TERMS AND CONDITIONS", ln=True, align="C")
        
        pdf.set_font("Arial", "", 12)
        pdf.ln(10)
        
        if hasattr(user, 'domain') and hasattr(user.domain, 'name'):
            domain_name = user.domain.name
        else:
            domain_name = getattr(user, 'domain', "your assigned domain")
            
        start_date = getattr(user, 'start_date', None)
        end_date = getattr(user, 'end_date', None)
        start = start_date.strftime("%B %d, %Y") if start_date else "the specified start date"
        end = end_date.strftime("%B %d, %Y") if end_date else "the specified end date"
        
        content = (
            f"1. Position and Duration: You will be working as an intern in {domain_name}. "
            f"Your internship will start on {start} and end on {end}, unless terminated earlier in accordance with these terms.\\n\\n"
            f"2. Confidentiality: You acknowledge that during your internship, you will have access to confidential information. "
            f"You agree not to disclose or use any confidential information outside the scope of your internship duties.\\n\\n"
            f"3. Professional Conduct: You are expected to act professionally, adhere to our policies, and complete assigned tasks "
            f"diligently. You will participate in scheduled meetings and maintain a minimum attendance and progress percentage.\\n\\n"
            f"4. Intellectual Property: Any work, code, designs, or other intellectual property created during your internship "
            f"will remain the exclusive property of ProEduvate.\\n\\n"
            f"5. Compensation: This is an unpaid educational internship, unless a specific stipend was otherwise agreed upon in writing.\\n\\n"
            f"6. Termination: Either party may terminate this internship at any time, with or without cause, by providing written notice."
        )
        pdf.multi_cell(0, 10, content)
        
        tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        pdf.output(tmp_file.name)
        return tmp_file.name
"""

new_process_doc = """
    def process_document_generation(self, user) -> dict:
        \"\"\"Orchestrates document generation and upload to Google Drive.\"\"\"
        try:
            offer_path = self.generate_offer_letter_pdf(user)
            tnc_path = self.generate_terms_and_conditions_pdf(user)
            
            intern_id = getattr(user, 'intern_id', None) or f"APP-{user.id}"
            offer_filename = f"Offer_Letter_{intern_id}.pdf"
            tnc_filename = f"Terms_and_Conditions_{intern_id}.pdf"
            
            with open(offer_path, "rb") as f:
                offer_bytes = f.read()
            with open(tnc_path, "rb") as f:
                tnc_bytes = f.read()

            offer_url = supabase_service.upload_file(offer_bytes, "documents", offer_filename)
            tnc_url = supabase_service.upload_file(tnc_bytes, "documents", tnc_filename)
            
            # Clean up temporary files
            os.remove(offer_path)
            os.remove(tnc_path)
            
            return {
                "offer_letter_url": offer_url,
                "terms_url": tnc_url
            }
        except Exception as e:
            logger.error(f"[DocumentService] Error processing documents for {getattr(user, 'id', 'unknown')}: {e}")
            raise e
"""

# Very simple replacement logic via regex
doc_content = re.sub(r'def generate_offer_letter_pdf.*?def generate_terms_and_conditions_pdf', new_generate_offer.strip() + '\\n\\n    def generate_terms_and_conditions_pdf', doc_content, flags=re.DOTALL)
doc_content = re.sub(r'def generate_terms_and_conditions_pdf.*?def process_document_generation', new_generate_tnc.strip() + '\\n\\n    def process_document_generation', doc_content, flags=re.DOTALL)
doc_content = re.sub(r'def process_document_generation.*$', new_process_doc.strip() + '\\n\\ndocument_service = DocumentService()\\n', doc_content, flags=re.DOTALL)

with open(doc_service_path, 'w') as f:
    f.write(doc_content)

# Now modify onboarding.py to use this
onboarding_path = 'backend/routers/onboarding.py'
with open(onboarding_path, 'r') as f:
    onboarding = f.read()
    
if "from services.document_service import document_service" not in onboarding:
    onboarding = onboarding.replace("from database import get_db", "from database import get_db\\nfrom services.document_service import document_service")

# Replace generate_documents function
new_gen_endpoint = """
@router.post("/{application_id}/generate-documents")
def generate_documents(application_id: str, db: Session = Depends(get_db)):
    app_id = int(application_id.replace("APP-", "")) if application_id.startswith("APP-") else int(application_id)
    db_app = db.query(models.OnboardingApplication).filter(models.OnboardingApplication.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db_app.status = models.ApplicationStatus.ACCOUNT_CREATION_PENDING
    
    # Generate REAL documents using DocumentService
    urls = document_service.process_document_generation(db_app)
    
    db_app.offer_letter_url = urls.get('offer_letter_url')
    db_app.tc_url = urls.get('terms_url')
    db.commit()
    
    return {"urls": urls}
"""

onboarding = re.sub(r'@router\.post\("/\{application_id\}/generate-documents"\).*?return \{"urls".*?\}', new_gen_endpoint.strip(), onboarding, flags=re.DOTALL)

with open(onboarding_path, 'w') as f:
    f.write(onboarding)

print("Files updated successfully!")
