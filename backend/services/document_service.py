import os
import io
import tempfile
import logging
from datetime import datetime
from fpdf import FPDF
import models
from .google_drive_service import google_drive_service

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
        pdf.multi_cell(0, 10, "Dear Candidate, \n\nWe are pleased to offer you an internship position at ProEduvate. Your dedication and skills have impressed us. Please sign and return the terms and conditions.")
        
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
        pdf.multi_cell(0, 10, "1. Confidentiality: You must not disclose any proprietary information.\n2. Duration: As specified in your onboarding details.\n3. Conduct: Professional conduct is required at all times.")
        
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
            
            offer_url = google_drive_service.upload_file(offer_path, offer_filename)
            tnc_url = google_drive_service.upload_file(tnc_path, tnc_filename)
            
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
