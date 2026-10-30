import sys
import os
import json
import pytest
from datetime import datetime, timedelta

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import models
from database import SessionLocal, engine, Base
from routers.tasks import (
    run_ai_evaluation,
    execute_code_submission,
    get_intern_tasks_with_unlock_status,
    calculate_final_score_and_grade,
    get_final_grade
)
from services.scoring_service import (
    calculate_final_grade,
    get_performance_classification,
    bulk_calculate_final_grades
)


@pytest.fixture(scope="module")
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()


# ----------------------------------------------------
# B1: AI Code Evaluation Engine Tests
# ----------------------------------------------------

def test_code_evaluation_syntax_error():
    """B1.8: Syntax errors must yield score 0 and syntax_valid False."""
    task = models.Task(
        id=9901,
        title="Sum Task",
        test_cases=json.dumps([{"input": "2, 3", "expected": "5"}])
    )
    bad_code = "def sum(a, b\n    return a + b"
    
    # Test secure runtime execution
    runtime_res = execute_code_submission(bad_code, task)
    assert runtime_res["syntax_valid"] is False
    assert runtime_res["runtime_score"] == 0
    assert runtime_res["successful"] is False

    # Test AI evaluation
    ai_res = run_ai_evaluation(bad_code, task)
    assert ai_res["syntax_valid"] is False
    assert ai_res["score"] == 0


def test_code_evaluation_passing_all_test_cases():
    """B1.2 & B1.3: Correct implementation passes test cases and scores high."""
    task = models.Task(
        id=9902,
        title="Sum Task",
        test_cases=json.dumps([
            {"input": "2, 3", "expected": "5"},
            {"input": "10, 20", "expected": "30"}
        ])
    )
    good_code = (
        "def solution(a, b):\n"
        "    '''Adds two numbers together.'''\n"
        "    return a + b\n"
    )

    runtime_res = execute_code_submission(good_code, task)
    assert runtime_res["syntax_valid"] is True
    assert runtime_res["test_cases_passed"] == 2
    assert runtime_res["total_test_cases"] == 2
    assert runtime_res["successful"] is True
    assert runtime_res["runtime_score"] == 100

    ai_res = run_ai_evaluation(good_code, task)
    assert ai_res["syntax_valid"] is True
    assert ai_res["score"] >= 80


def test_code_evaluation_failing_test_cases_not_fabricated():
    """B1.8: If all test cases fail, scores must not be fabricated."""
    task = models.Task(
        id=9903,
        title="Sum Task",
        test_cases=json.dumps([
            {"input": "2, 3", "expected": "5"},
            {"input": "10, 20", "expected": "30"}
        ])
    )
    wrong_code = (
        "def solution(a, b):\n"
        "    return a - b\n"
    )

    runtime_res = execute_code_submission(wrong_code, task)
    assert runtime_res["syntax_valid"] is True
    assert runtime_res["test_cases_passed"] == 0
    assert runtime_res["successful"] is False
    assert runtime_res["runtime_score"] == 0

    ai_res = run_ai_evaluation(wrong_code, task)
    assert ai_res["syntax_valid"] is True
    # Capped low: cannot pass with 0/2 test cases
    assert ai_res["score"] <= 15


# ----------------------------------------------------
# B3: Hybrid Scoring & Grading Tests
# ----------------------------------------------------

def test_performance_classification_matrix():
    """B3.3: Verify standard grade boundaries and classification strings."""
    assert get_performance_classification("A+") == "Outstanding / Elite Performance"
    assert get_performance_classification("A") == "Excellent Performance"
    assert get_performance_classification("B+") == "Very Good Performance"
    assert get_performance_classification("B") == "Good Performance"
    assert get_performance_classification("C") == "Satisfactory Performance"
    assert get_performance_classification("F") == "Ineligible / Unsatisfactory"


def test_calculate_final_score_and_grade_helper():
    """B3.2 & B3.3: Test helper score normalization and grade assignment."""
    res_a_plus = calculate_final_score_and_grade(95, 95, 95)
    assert res_a_plus["grade"] == "A+"

    res_b_plus = calculate_final_score_and_grade(75, 75, 75)
    assert res_b_plus["grade"] == "B+"

    res_c = calculate_final_score_and_grade(48, 48, 48)
    assert res_c["grade"] == "C"

    res_fail = calculate_final_score_and_grade(30, 30, 30)
    assert res_fail["grade"] == "F"


def test_hybrid_scoring_service(setup_db):
    """B3.1 - B3.7: Test full hybrid evaluation with separate component marks."""
    db = setup_db
    intern = models.User(
        id=8801,
        name="Hybrid Intern",
        email="hybrid_test@test.com",
        hashed_password="hash",
        role=models.UserRole.INTERN,
        start_date=datetime.utcnow() - timedelta(days=10)
    )
    db.merge(intern)
    db.commit()

    evaluation = calculate_final_grade(db, intern, force_recalculate=True)
    assert evaluation is not None
    assert evaluation.intern_id == 8801
    assert hasattr(evaluation, "mcq_final_mark")
    assert hasattr(evaluation, "code_final_mark")
    assert hasattr(evaluation, "airdrop_final_mark")
    assert hasattr(evaluation, "mentor_evaluation_mark")
    assert hasattr(evaluation, "final_score")
    assert hasattr(evaluation, "grade")


# ----------------------------------------------------
# A6 & A7: Sequential Progression & Content Masking
# ----------------------------------------------------

def test_sequential_task_unlock_and_content_masking(setup_db):
    """A6.2, A6.3, A7.2: Verify locked tasks mask content and reflect day_state."""
    db = setup_db
    
    # Create domain
    domain = models.Domain(id=7701, name="Test Domain Python")
    db.merge(domain)
    db.commit()

    # Create Task Day 1 and Task Day 2
    task1 = models.Task(
        id=7701,
        domain_id=7701,
        day_number=1,
        title="Day 1 Intro",
        description="Day 1 Intro Desc",
        mcq_questions=json.dumps([{"id": 1, "question": "What is Python?"}]),
        coding_prompt="Write hello world"
    )
    task2 = models.Task(
        id=7702,
        domain_id=7701,
        day_number=2,
        title="Day 2 Advanced",
        description="Day 2 Advanced Desc",
        mcq_questions=json.dumps([{"id": 2, "question": "What is an iterator?"}]),
        coding_prompt="Implement generator"
    )
    db.merge(task1)
    db.merge(task2)
    db.commit()

    intern = models.User(
        id=7710,
        name="Sequential Intern",
        email="seq_test@test.com",
        hashed_password="hash",
        role=models.UserRole.INTERN,
        domain_id=7701,
        start_date=datetime.utcnow()
    )
    db.merge(intern)
    db.commit()

    # Query intern tasks before Day 1 is submitted
    tasks_res = get_intern_tasks_with_unlock_status(db=db, current_user=intern)
    assert len(tasks_res) >= 2
    
    t1 = next(t for t in tasks_res if t["day_number"] == 1)
    t2 = next(t for t in tasks_res if t["day_number"] == 2)

    # Day 1 is unlocked and CURRENT
    assert t1["unlocked"] is True
    assert t1["day_state"] == "CURRENT"
    assert t1["coding_prompt"] == "Write hello world"
    assert t1["due_date"] is not None

    # Day 2 is LOCKED and content is masked
    assert t2["unlocked"] is False
    assert t2["day_state"] == "LOCKED"
    assert t2["coding_prompt"] is None
    assert t2["mcq_questions"] is None
    assert "locked" in t2["description"].lower()

