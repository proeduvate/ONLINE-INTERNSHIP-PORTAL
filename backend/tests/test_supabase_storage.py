import io
import os
from dotenv import load_dotenv
from reportlab.lib.pagesizes import landscape, A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://vilcgxfidyjunirdkxxu.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbGNneGZpZHlqdW5pcmRreHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNTA0MDAsImV4cCI6MjA1NTkyNjQwMH0.placeholder"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def test_upload():
    test_user_id = "test-user-001"
    cert_id = "PRO-INT-26-839"
    file_path = f"{test_user_id}/{cert_id}.pdf"

    # 1. Create a sample PDF in-memory
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=landscape(A4))
    width, height = landscape(A4)
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(width / 2.0, height - 120, "CERTIFICATE OF COMPLETION")
    c.setFont("Helvetica", 14)
    c.drawCentredString(width / 2.0, height - 160, "THIS CERTIFICATE IS AWARDED TO")
    c.setFont("Helvetica-Bold", 20)
    c.setFillColor(colors.HexColor("#0b63c5"))
    c.drawCentredString(width / 2.0, height - 200, "MAGHALAKSHMI. P")
    c.save()

    pdf_bytes = buffer.getvalue()

    # 2. Upload to Supabase Storage Bucket
    print(f"Uploading {file_path} to 'certificates' bucket...")
    try:
        upload_res = supabase.storage.from_("certificates").upload(
            path=file_path,
            file=pdf_bytes,
            file_options={"content-type": "application/pdf", "upsert": "true"}
        )
        print("Upload response:", upload_res)
    except Exception as e:
        print(f"Supabase Storage Note/Handling: {e}")

    # 3. Retrieve Public URL
    public_url = supabase.storage.from_("certificates").get_public_url(file_path)
    print("Upload operation completed!")
    print(f"Public Certificate URL: {public_url}")

if __name__ == "__main__":
    test_upload()

