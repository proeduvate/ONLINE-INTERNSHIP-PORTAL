import os
import io
import tempfile
import logging
from datetime import datetime
from fpdf import FPDF
import models
from .supabase_service import supabase_service

logger = logging.getLogger(__name__)

class TermsPDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 14)
        self.set_text_color(15, 23, 42)
        self.cell(0, 7, 'PROEDUVATE', ln=True, align='C')
        self.set_font('Arial', 'B', 11)
        self.set_text_color(37, 99, 235)
        self.cell(0, 5, 'INTERNSHIP TERMS & CONDITIONS', ln=True, align='C')
        self.set_font('Arial', 'I', 8)
        self.set_text_color(100, 116, 139)
        self.cell(0, 5, 'Please read the following Terms & Conditions carefully before accepting the internship.', ln=True, align='C')
        self.ln(2)
        self.set_draw_color(226, 232, 240)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(148, 163, 184)
        self.cell(0, 10, 'PROEDUVATE | Internship Terms & Conditions', align='C')


class DocumentService:
    def generate_intern_id(self, user: models.User) -> str:
        """Generates a unique intern ID if not present."""
        if hasattr(user, 'intern_id') and user.intern_id:
            return user.intern_id
        year = datetime.utcnow().year
        user_id_val = getattr(user, 'id', 1)
        return f"PE-{year}-{user_id_val:04d}"

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
        """Generates the official multi-page ProEduvate Terms & Conditions PDF with intern details and digital signature."""
        pdf = TermsPDF()
        pdf.set_auto_page_break(auto=True, margin=20)
        pdf.add_page()
        
        intern_name = getattr(user, 'name', 'Intern Candidate')
        intern_id = getattr(user, 'intern_id', None) or (f"APP-{user.id}" if hasattr(user, 'id') else "APP-2026")
        today_date = datetime.now().strftime("%d %B %Y")

        pdf.set_font("Arial", "B", 10)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(0, 6, f"DATE: {today_date}", ln=True)
        pdf.ln(1)
        
        pdf.set_font("Arial", "", 10)
        pdf.cell(0, 6, f"Dear {intern_name} (Candidate ID: {intern_id}),", ln=True)
        pdf.ln(1)
        pdf.multi_cell(0, 5, "We are pleased to offer you an Internship opportunity with PROEDUVATE under the following terms and conditions:")
        pdf.ln(3)

        sections = [
            ("1. Internship Program", [
                "The internship is a structured 30-day learning and practical development program.",
                "Interns will actively participate throughout the internship period.",
                "The internship will include learning, assessments, practical assignments, mentor interaction, and project-based activities."
            ]),
            ("2. Internship Fee", [
                "The internship fee is Rs.500 (Five Hundred Indian Rupees only).",
                "The fee will be paid after selection and acceptance of the internship.",
                "Payment of the fee will not automatically guarantee successful completion, certification, employment, or placement."
            ]),
            ("3. Internship Activation", [
                "The internship will be activated only after: Selection/Interview; Acceptance of Internship; Acceptance of Terms & Conditions; Payment of Rs.500 fee; Payment verification; Admin approval; Portal access activation."
            ]),
            ("4. Internship Duration", [
                "The standard internship duration will be 30 days.",
                "Interns will complete assigned activities within the specified period.",
                "Extensions, if applicable, will be subject to approval from ProEduvate Management."
            ]),
            ("5. Internship Domains", [
                "Interns will participate in domains offered by ProEduvate, including Python, Java, Frontend Development, Full Stack Development, UI/UX Design, AI/ML, and other applicable domains."
            ]),
            ("6. Internship Portal", [
                "Interns will receive access to the ProEduvate internship portal.",
                "The portal will contain learning materials, interactive activities, MCQ assessments, practical assignments, coding tasks, project tasks, progress tracking, mentor feedback, AI-assisted evaluation, and certificate information, as applicable."
            ]),
            ("7. Daily Learning Process", [
                "Interns will follow the assigned daily learning path.",
                "The general workflow will be: Learning Content -> Interactive Activity -> MCQ -> Practical Task -> Submission -> Evaluation -> Next-Day Unlock."
            ]),
            ("8. Daily Tasks", [
                "Tasks will be assigned based on the intern's selected domain and internship requirements.",
                "Tasks will include theoretical, practical, coding, design, analytical, or project-based activities as applicable.",
                "Interns will complete assigned tasks within the specified deadlines."
            ]),
            ("9. Practical Assignments", [
                "Practical assignments will form an important part of the internship.",
                "Interns will submit their own work through the designated portal.",
                "Required practical submission will be used for attendance and progression where applicable."
            ]),
            ("10. Attendance", [
                "Attendance will be linked to participation and required task submission.",
                "Failure to participate or submit required activities will result in the corresponding day being marked incomplete/absent.",
                "Attendance records will be considered during final evaluation."
            ]),
            ("11. MCQ Assessments", [
                "Interns will complete assigned daily or periodic MCQ assessments.",
                "MCQ scores will contribute to the overall internship evaluation.",
                "Interns will complete assessments honestly and without unauthorized assistance."
            ]),
            ("12. AI-Assisted Evaluation", [
                "ProEduvate will use AI-based systems to evaluate practical/coding submissions as part of the internship evaluation process.",
                "AI evaluation will consider correctness, logic, code quality, problem-solving, output, efficiency, and task requirements.",
                "AI evaluation will be supplemented or reviewed by mentors where required."
            ]),
            ("13. Mentor Evaluation", [
                "Mentors will periodically review intern performance.",
                "Mentor evaluation will consider task completion, technical performance, learning progress, practical implementation, communication, participation, and project performance."
            ]),
            ("14. Adaptive Tasks", [
                "ProEduvate Management and mentors will have the authority to modify or assign additional tasks based on an intern's performance.",
                "Additional learning or remedial activities will be provided when required.",
                "Mentors will update or assign tasks during the internship based on project and learning requirements."
            ]),
            ("15. Mentor Interaction", [
                "Interns will be able to communicate with assigned mentors for doubt clarification, task discussions, project guidance, technical assistance, and performance reviews.",
                "Intern-to-intern communication within the internship platform will be restricted where applicable."
            ]),
            ("16. Real-Time Client Exposure", [
                "Selected interns will receive opportunities to work on real-world client requirements and project scenarios, subject to project availability and organizational requirements.",
                "Such opportunities will include understanding client requirements, requirement analysis, project discussions, development/design work, mentor feedback, and solution implementation as applicable."
            ]),
            ("17. Project Work", [
                "Interns will be assigned individual or team-based projects based on internship requirements.",
                "Projects will follow requirements and guidelines provided by ProEduvate or the assigned mentor.",
                "Interns will be responsible for completing their assigned project responsibilities."
            ]),
            ("18. Originality & Plagiarism", [
                "Interns will submit original work.",
                "Copying another intern's work, submitting purchased work, or falsely claiming another person's work as their own is prohibited.",
                "Plagiarism or fraudulent submissions will result in disciplinary action, which may include termination."
            ]),
            ("19. Use of AI Tools", [
                "AI tools will be permitted for learning and development where specified by ProEduvate.",
                "Interns will not use AI tools to falsely represent work they have not understood or completed.",
                "ProEduvate may require an explanation, demonstration, or project defense to verify understanding."
            ]),
            ("20. Confidentiality", [
                "Interns will maintain confidentiality regarding company information, client information, project requirements, source code, credentials, internal documents, and business information.",
                "Confidential information will not be shared publicly or with unauthorized persons."
            ]),
            ("21. Intellectual Property", [
                "Ownership and permitted use of project work, source code, designs, documents, and client-related deliverables will be governed by applicable project/company terms.",
                "Interns will not publish confidential company/client work without authorization."
            ]),
            ("22. Portal Account Security", [
                "Interns will keep their login credentials secure.",
                "Sharing portal credentials with another person is prohibited.",
                "Interns will be responsible for activities performed through their account."
            ]),
            ("23. Deadlines", [
                "Interns will follow the deadlines specified for assignments and assessments.",
                "Repeated failure to complete tasks will affect attendance, progress, evaluation, completion status, and certificate eligibility."
            ]),
            ("24. Technical Issues", [
                "Interns will report genuine technical problems through the designated support channel.",
                "Technical issues will be reported as soon as possible with relevant screenshots or details where required."
            ]),
            ("25. Performance Evaluation", [
                "Final performance will be evaluated using MCQ performance, practical/task performance, AI-assisted evaluation, mentor evaluation, project performance, attendance, and participation."
            ]),
            ("26. Completion Requirements", [
                "An intern will be considered eligible for successful completion after satisfying applicable requirements, including required internship days, learning activities, assessments, practical tasks, mentor reviews, project work, and performance requirements."
            ]),
            ("27. Certificate", [
                "A certificate will be issued to interns who successfully satisfy applicable completion requirements and receive approval from ProEduvate Management.",
                "Certificate eligibility will be subject to verification of internship completion.",
                "Payment of the internship fee will not guarantee a certificate."
            ]),
            ("28. Certificate Verification", [
                "Certificates will contain a unique Certificate ID and/or QR code where applicable.",
                "Certificate authenticity will be verified through the ProEduvate verification system."
            ]),
            ("29. Certificate Revocation", [
                "ProEduvate Management may revoke a certificate if false information was provided, the certificate was obtained fraudulently, academic misconduct occurred, internship requirements were not genuinely completed, or the certificate was misused.",
                "The online verification status will be updated to Revoked/Invalid where applicable."
            ]),
            ("30. Code of Conduct", [
                "Interns will behave professionally and respectfully toward mentors, staff, clients, and other participants.",
                "Interns will avoid abusive, discriminatory, threatening, or inappropriate behavior.",
                "Interns will follow company and project guidelines and will not misuse company resources."
            ]),
            ("31. Prohibited Activities", [
                "Unauthorized access to systems; sharing confidential information; hacking or attempting unauthorized access; misuse of portal accounts; fraudulent submissions; plagiarism or cheating; harassment or inappropriate behavior; manipulation of attendance or evaluation records; and any activity that may harm ProEduvate, its clients, mentors, or other interns are prohibited."
            ]),
            ("32. Termination by ProEduvate", [
                "ProEduvate Management may terminate an internship for serious misconduct, repeated non-participation, continuous failure to complete assigned tasks, plagiarism or cheating, unauthorized system access, confidentiality violations, misuse of company/client information, false information, fraudulent activity, or violation of internship terms."
            ]),
            ("33. Termination by Intern", [
                "An intern will be able to request discontinuation of the internship by informing the designated ProEduvate authority.",
                "Discontinuation will result in incomplete internship status and will affect certificate eligibility."
            ]),
            ("34. Effect of Termination", [
                "Upon termination, portal access will be suspended or deactivated.",
                "Pending tasks will be marked incomplete.",
                "The intern will become ineligible for the internship completion certificate unless otherwise approved by ProEduvate Management.",
                "Confidentiality and applicable intellectual-property obligations will continue after termination."
            ]),
            ("35. Payment and Refunds", [
                "The internship fee is Rs.500.",
                "The applicable refund policy will be communicated during registration/payment.",
                "Interns will review the refund conditions before completing payment."
            ]),
            ("36. No Employment Guarantee", [
                "Completion of the internship will not guarantee employment, placement, job offer, salary, client employment, or future internship opportunities."
            ]),
            ("37. Program Changes", [
                "ProEduvate Management will have the authority to modify learning content, tasks, assessments, project requirements, portal features, or schedules when required.",
                "Such changes will be made to improve the internship experience or meet project requirements."
            ]),
            ("38. Data & Information", [
                "Information submitted by interns will be used for legitimate internship-related purposes such as registration, communication, evaluation, attendance, certification, and internship administration."
            ]),
            ("39. Intern Responsibility", [
                "Each intern will be responsible for completing assigned work, maintaining account security, meeting deadlines, providing accurate information, following the Terms & Conditions, maintaining professional conduct, and taking responsibility for submitted work."
            ]),
            ("40. Management Decision & Authority", [
                "All decisions regarding the internship program, including selection, task allocation, evaluation, attendance, performance, mentor assessment, internship continuation, termination, completion status, certificate eligibility, and certificate issuance, will be taken by ProEduvate Management.",
                "The decision taken by ProEduvate Management regarding the above matters will be final and binding.",
                "Interns will comply with the decisions, instructions, and guidelines issued by ProEduvate Management during the internship.",
                "ProEduvate Management will have the authority to take appropriate action in cases of policy violations, misconduct, non-performance, or failure to meet internship requirements."
            ]),
            ("41. Acceptance of Terms", [
                "By registering for the ProEduvate internship, the intern confirms that they have read, understood, and agreed to the Terms & Conditions.",
                "The intern acknowledges that Rs.500 payment does not guarantee completion, certification, employment, or placement.",
                "The intern agrees to participate honestly and professionally throughout the internship."
            ])
        ]

        for title, points in sections:
            pdf.set_font("Arial", "B", 10)
            pdf.set_text_color(15, 23, 42)
            pdf.cell(0, 5, title, ln=True)
            pdf.set_font("Arial", "", 9)
            pdf.set_text_color(51, 65, 85)
            for pt in points:
                pdf.multi_cell(0, 4.2, f"-  {pt}")
                pdf.ln(0.5)
            pdf.ln(1.5)

        # INTERN ACKNOWLEDGEMENT & SIGNATURE SECTION ON LAST PAGE
        pdf.ln(3)
        pdf.set_font("Arial", "B", 11)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(0, 6, "INTERN ACKNOWLEDGEMENT", ln=True, align="C")
        pdf.ln(2)

        pdf.set_font("Arial", "", 9.5)
        pdf.set_text_color(51, 65, 85)
        ack_text = f"I, {intern_name} confirm that I have read, understood, and agreed to the ProEduvate Internship Terms & Conditions and agree to comply with the rules, requirements, evaluation procedures, confidentiality obligations, and internship guidelines."
        pdf.multi_cell(0, 5, ack_text)
        pdf.ln(4)

        pdf.set_font("Arial", "B", 9.5)
        pdf.cell(0, 5, f"Intern Name: {intern_name}", ln=True)
        pdf.cell(0, 5, f"Date: {today_date}", ln=True)
        pdf.ln(4)

        # Draw Signature Block
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

            pdf.image(sig_file.name, x=15, w=50, h=18)
            os.remove(sig_file.name)
            pdf.ln(2)
        else:
            pdf.set_font("Arial", "I", 9)
            pdf.set_text_color(148, 163, 184)
            pdf.cell(0, 5, "[ Digital Signature Pending ]", ln=True)

        pdf.set_font("Arial", "B", 9.5)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(0, 5, "Candidate Signature", ln=True)
        pdf.set_font("Arial", "", 9)
        pdf.cell(0, 5, f"({intern_name})", ln=True)

        pdf.ln(6)
        pdf.set_font("Arial", "B", 9.5)
        pdf.cell(0, 5, "Yours Faithfully,", ln=True)
        pdf.cell(0, 5, "HR TEAM", ln=True)
        pdf.cell(0, 5, "ProEduvate", ln=True)

        tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        pdf.output(tmp_file.name)
        return tmp_file.name

    def process_document_generation(self, user) -> dict:
        """Orchestrates document generation and upload to Supabase."""
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
