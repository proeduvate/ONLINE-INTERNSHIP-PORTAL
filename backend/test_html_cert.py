import os
import sys
from pathlib import Path

# Add backend directory to sys.path so app modules import cleanly
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.services.html_certificate_service import HTMLCertificateService


def test_generate_html_certificate():
    print("=" * 60)
    print("STARTING HTML CERTIFICATE GENERATION TEST")
    print("=" * 60)

    # 1. Instantiate Service
    service = HTMLCertificateService()

    # 2. Define Mock Data per specifications
    mock_data = {
        "intern_name": "John Doe",
        "domain": "Full Stack Development",
        "score": 92,
        "start_date": "01 June 2026",
        "end_date": "30 June 2026",
        "duration": "1 Month",
        "cert_id": "PE-2026-FSD-0123",
        "issue_date": "01 July 2026"
    }

    print(f"Mock Input Data:\n  Intern: {mock_data['intern_name']}\n  Domain: {mock_data['domain']}\n  Score: {mock_data['score']}\n  Duration: {mock_data['duration']}\n  Cert ID: {mock_data['cert_id']}\n")

    # 3. Generate PDF Bytes
    pdf_bytes = service.generate_certificate_pdf(mock_data)

    # 4. Save to output_test_cert.pdf in backend directory
    output_filename = "output_test_cert.pdf"
    output_path = BACKEND_DIR / output_filename
    
    with open(output_path, "wb") as f:
        f.write(pdf_bytes)

    byte_size = len(pdf_bytes)
    file_size = os.path.getsize(output_path)

    print("-" * 60)
    print(f"Generated Output File: {output_path}")
    print(f"Exact Byte Size: {byte_size:,} bytes ({byte_size / 1024:.2f} KB)")
    print("-" * 60)

    # 5. Assertions
    assert output_path.exists(), f"Error: {output_filename} was not created on disk."
    assert file_size > 50000, f"Error: File size ({file_size} bytes) is <= 50 KB limit."

    print("ASSERTION PASSED: Output file exists and size > 50 KB.")
    print("SUCCESS: HTML/Jinja2 Certificate Generation Service Test Completed Successfully!")
    print("=" * 60)


if __name__ == "__main__":
    test_generate_html_certificate()

