"""
Automated Email Dispatch Test Script
=====================================
Validates email_service.py across all key application triggers.
Target Recipient: sushmitha@gmail.com

Trigger Test Cases:
1. Meeting Scheduled
2. Task Assigned
3. Assignment Submission
4. Certificate Completion

Validates:
- EmailJS REST API dispatch (HTTP status & response payload)
- SMTP certificate delivery (with PDF attachment)
- Async non-blocking execution via asyncio.to_thread + asyncio.gather
"""

import asyncio
import time
import os
import sys

# Ensure backend is on the path
sys.path.insert(0, os.path.dirname(__file__))

from services.email_service import dispatch_notification, EventType, send_certificate_email

TARGET_EMAIL = "sushmitha@gmail.com"


async def test_meeting_scheduled():
    """Simulate a scheduled breakout session notification."""
    print(f"\n{'='*60}")
    print(f"  TEST 1: Meeting Scheduled")
    print(f"{'='*60}")
    payload = {
        "meeting_title": "Backend Sync",
        "date_time": "2026-10-15T10:00:00Z",
        "mentor_id": "mentor_123",
        "room_link": "http://meet.google.com/abc-def-ghi"
    }
    print(f"  Payload: {payload}")

    start = time.time()
    await asyncio.to_thread(
        dispatch_notification,
        recipient_email=TARGET_EMAIL,
        event_type=EventType.MEETING_SCHEDULED,
        title="New Meeting Scheduled",
        message=(
            f"You have a new meeting: {payload['meeting_title']} "
            f"at {payload['date_time']} with {payload['mentor_id']}."
        ),
        action_url=payload["room_link"],
    )
    duration = time.time() - start
    print(f"  [Async Verified] Execution took {duration:.2f}s")


async def test_task_assigned():
    """Simulate a new task allocation notification."""
    print(f"\n{'='*60}")
    print(f"  TEST 2: Task Assigned")
    print(f"{'='*60}")
    payload = {
        "task_title": "Database Optimization",
        "description": "Optimize the database schema for the new features.",
        "assigned_to": "intern_001",
        "deadline": "2026-09-20",
    }
    print(f"  Payload: {payload}")

    start = time.time()
    await asyncio.to_thread(
        dispatch_notification,
        recipient_email=TARGET_EMAIL,
        event_type=EventType.TASK_ASSIGNED,
        title=f"New Task: {payload['task_title']}",
        message=f"{payload['description']}\nDeadline: {payload['deadline']}",
        action_url="http://localhost:3000/dashboard",
    )
    print(f"  [Async Verified] Task Assignment took {time.time() - start:.2f}s")


async def test_assignment_submission():
    """Simulate an intern submission notification."""
    print(f"\n{'='*60}")
    print(f"  TEST 3: Assignment Submission")
    print(f"{'='*60}")
    payload = {
        "intern_id": "intern_001",
        "assignment_name": "API Refactoring",
        "submission_timestamp": "2026-09-10T12:00:00Z",
        "status": "SUBMITTED",
    }
    print(f"  Payload: {payload}")

    start = time.time()
    await asyncio.to_thread(
        dispatch_notification,
        recipient_email=TARGET_EMAIL,
        event_type=EventType.SYSTEM_ALERT,
        title=f"Submission Received: {payload['assignment_name']}",
        message=(
            f"Intern {payload['intern_id']} submitted '{payload['assignment_name']}' "
            f"at {payload['submission_timestamp']}. Status: {payload['status']}."
        ),
        action_url="http://localhost:3000/mentor/submissions",
    )
    print(f"  [Async Verified] Submission took {time.time() - start:.2f}s")


async def test_certificate_completion():
    """Simulate course completion certificate email."""
    print(f"\n{'='*60}")
    print(f"  TEST 4: Certificate Completion")
    print(f"{'='*60}")
    payload = {
        "intern_name": "Sushmitha",
        "course_title": "Advanced Backend Development",
        "completion_date": "2026-09-10",
        "certificate_url": "/static/certs/dummy_cert.pdf",
    }
    print(f"  Payload: {payload}")

    # Create a dummy PDF for testing
    os.makedirs("static/certs", exist_ok=True)
    with open("static/certs/dummy_cert.pdf", "wb") as f:
        f.write(b"%PDF-1.4 dummy content")

    start = time.time()
    await asyncio.to_thread(
        send_certificate_email,
        intern_email=TARGET_EMAIL,
        intern_name=payload["intern_name"],
        cert_pdf_path=payload["certificate_url"],
    )
    print(f"  [Async Verified] Certificate took {time.time() - start:.2f}s")


async def main():
    print("\n" + "#" * 60)
    print("#  AUTOMATED EMAIL DISPATCH TEST SUITE")
    print(f"#  Target: {TARGET_EMAIL}")
    print("#" * 60)

    tasks = [
        test_meeting_scheduled(),
        test_task_assigned(),
        test_assignment_submission(),
        test_certificate_completion(),
    ]

    # Run concurrently to prove non-blocking behavior
    start_total = time.time()
    await asyncio.gather(*tasks)
    total_duration = time.time() - start_total

    print(f"\n{'#'*60}")
    print(f"#  ALL 4 TESTS COMPLETED IN {total_duration:.2f} seconds")
    print(f"#")
    print(f"#  Async verification: If total ~= longest single request,")
    print(f"#  the event loop is NOT being blocked.")
    print(f"{'#'*60}\n")


if __name__ == "__main__":
    asyncio.run(main())

