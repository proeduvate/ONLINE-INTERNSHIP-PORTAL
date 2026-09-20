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

    def generate_offer_letter_pdf(self, user, signature_base64=None) -> str:
        """Generates the offer letter PDF and saves to a temporary file, optionally adding a signature."""
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

        if signature_base64:
            import base64
            if "," in signature_base64:
                encoded = signature_base64.split(",", 1)[1]
            else:
                encoded = signature_base64
            sig_data = base64.b64decode(encoded)
            sig_file = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
            sig_file.write(sig_data)
            sig_file.close()

            pdf.ln(15)
            pdf.cell(0, 10, "Accepted and Agreed by:", ln=True)
            pdf.image(sig_file.name, x=10, w=50)
            os.remove(sig_file.name)
        
        tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        pdf.output(tmp_file.name)
        return tmp_file.name

    def generate_terms_and_conditions_pdf(self, user, signature_base64=None) -> str:
        """Generates the T&C PDF and saves to a temporary file, optionally adding a signature."""
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

        if signature_base64:
            import base64
            if "," in signature_base64:
                encoded = signature_base64.split(",", 1)[1]
            else:
                encoded = signature_base64
            sig_data = base64.b64decode(encoded)
            sig_file = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
            sig_file.write(sig_data)
            sig_file.close()

            pdf.ln(15)
            pdf.cell(0, 10, "Accepted and Agreed by:", ln=True)
            pdf.image(sig_file.name, x=10, w=50)
            os.remove(sig_file.name)
        
        tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        pdf.output(tmp_file.name)
        return tmp_file.name

    def process_document_generation(self, user) -> dict:
        """Orchestrates document generation and upload to Google Drive."""
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

    def process_signed_document_generation(self, user, doc_type: str, signature_base64: str) -> str:
        """Generates a signed document and uploads it to Supabase."""
        try:
            intern_id = getattr(user, 'intern_id', None) or f"APP-{user.id}"
            if doc_type == "offer_letter":
                pdf_path = self.generate_offer_letter_pdf(user, signature_base64)
                filename = f"Signed_Offer_Letter_{intern_id}.pdf"
            elif doc_type == "tc":
                pdf_path = self.generate_terms_and_conditions_pdf(user, signature_base64)
                filename = f"Signed_Terms_and_Conditions_{intern_id}.pdf"
            else:
                raise ValueError("Invalid document type")

            with open(pdf_path, "rb") as f:
                pdf_bytes = f.read()

            from .supabase_service import supabase_service
            url = supabase_service.upload_file(pdf_bytes, "documents", filename)
            
            os.remove(pdf_path)
            return url
        except Exception as e:
            logger.error(f"[DocumentService] Error processing signed document for {getattr(user, 'id', 'unknown')}: {e}")
            raise e

document_service = DocumentService()
