import io
from typing import Optional, Dict, Any
from app.services.html_certificate_service import build_certificate_pdf, grade_for_score


def generate_certificate_from_html(
    cert_id: str = "",
    intern_name: str = "",
    domain: str = "",
    issue_date: str = "",
    start_date: str = "",
    end_date: str = "",
    duration: str = "1 Month",
    grade: str = "A",
    intern_data: Optional[dict] = None
) -> bytes:
    data: Dict[str, Any] = {
        "cert_id": cert_id,
        "intern_name": intern_name,
        "domain": domain,
        "issue_date": issue_date,
        "start_date": start_date,
        "end_date": end_date,
        "duration": duration,
        "grade": grade,
    }
    if intern_data:
        data.update(intern_data)

    return build_certificate_pdf(data, include_authorization=True)
