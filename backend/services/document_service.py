import os
import io
import tempfile
import logging
from datetime import datetime
from fpdf import FPDF
import models
from .supabase_service import supabase_service

logger = logging.getLogger(__name__)

class DocumentService:
    def generate_intern_id(self, user: models.User) -> str:
        """Generates a unique intern ID if not present."""
        if user.intern_id:
            return user.intern_id
        
        # Example format: PE-2026-0001
        year = datetime.utcnow().year
        new_id = f"PE-{year}-{user.id:04d}"
        return new_id

    def generate_offer_letter_pdf(self, user: models.User) -> str:
        """Generates the offer letter PDF and saves to a temporary file."""
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", "B", 20)
        pdf.cell(0, 20, "OFFER LETTER", ln=True, align="C")
        
        pdf.set_font("Arial", "", 12)
        pdf.ln(10)
        pdf.cell(0, 10, f"Date: {datetime.utcnow().strftime('%B %d, %Y')}", ln=True)
        pdf.cell(0, 10, f"Name: {user.name}", ln=True)
        pdf.cell(0, 10, f"Intern ID: {user.intern_id}", ln=True)
        
        pdf.ln(10)
        
        domain_name = user.domain.name if user.domain else "your assigned domain"
        start = user.start_date.strftime("%B %d, %Y") if user.start_date else "the specified start date"
        end = user.end_date.strftime("%B %d, %Y") if user.end_date else "the specified end date"
        
        content = (
            f"Dear {user.name},\n\n"
            f"We are thrilled to officially offer you an internship position at ProEduvate in {domain_name}. "
            f"Your skills and background have impressed our team, and we believe you will be a great addition to our organization.\n\n"
            f"Your internship is scheduled to commence on {start} and will conclude on {end}. "
            f"Please carefully review the attached terms and conditions. If you accept this offer, please sign and return the documents.\n\n"
            f"Welcome to the team!\n\n"
            f"Sincerely,\n"
            f"The ProEduvate Team"
        )
        pdf.multi_cell(0, 10, content)
        
        tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        pdf.output(tmp_file.name)
        return tmp_file.name

    def generate_terms_and_conditions_pdf(self, user: models.User) -> str:
        """Generates the T&C PDF and saves to a temporary file."""
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", "B", 20)
        pdf.cell(0, 20, "TERMS AND CONDITIONS", ln=True, align="C")
        
        pdf.set_font("Arial", "", 12)
        pdf.ln(10)
        
        domain_name = user.domain.name if user.domain else "your assigned domain"
        start = user.start_date.strftime("%B %d, %Y") if user.start_date else "the specified start date"
        end = user.end_date.strftime("%B %d, %Y") if user.end_date else "the specified end date"
        
        content = (
            f"1. Position and Duration: You will be working as an intern in {domain_name}. "
            f"Your internship will start on {start} and end on {end}, unless terminated earlier in accordance with these terms.\n\n"
            f"2. Confidentiality: You acknowledge that during your internship, you will have access to confidential information. "
            f"You agree not to disclose or use any confidential information outside the scope of your internship duties.\n\n"
            f"3. Professional Conduct: You are expected to act professionally, adhere to our policies, and complete assigned tasks "
            f"diligently. You will participate in scheduled meetings and maintain a minimum attendance and progress percentage.\n\n"
            f"4. Intellectual Property: Any work, code, designs, or other intellectual property created during your internship "
            f"will remain the exclusive property of ProEduvate.\n\n"
            f"5. Compensation: This is an unpaid educational internship, unless a specific stipend was otherwise agreed upon in writing.\n\n"
            f"6. Termination: Either party may terminate this internship at any time, with or without cause, by providing written notice."
        )
        pdf.multi_cell(0, 10, content)
        
        tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        pdf.output(tmp_file.name)
        return tmp_file.name

    def process_document_generation(self, user: models.User) -> dict:
        """Orchestrates document generation and upload to Google Drive."""
        try:
            offer_path = self.generate_offer_letter_pdf(user)
            tnc_path = self.generate_terms_and_conditions_pdf(user)
            
            offer_filename = f"Offer_Letter_{user.intern_id}.pdf"
            tnc_filename = f"Terms_and_Conditions_{user.intern_id}.pdf"
            
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
            logger.error(f"[DocumentService] Error processing documents for {user.id}: {e}")
            raise e

document_service = DocumentService()
