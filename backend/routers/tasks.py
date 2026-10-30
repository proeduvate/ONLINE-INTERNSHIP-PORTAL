from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import APIRouter, status, Depends, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import database
from database import get_db
from dependencies import get_current_user
import models
import schemas
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
import ast, re, tempfile, subprocess, sys, os, random, json, difflib, uuid, io

try:
    from fpdf import FPDF
except ImportError:
    class FPDF:
        def __init__(self, *args, **kwargs): pass
        def add_page(self): pass
        def set_auto_page_break(self, *args, **kwargs): pass
        def set_font(self, *args, **kwargs): pass
        def cell(self, *args, **kwargs): pass
        def ln(self, *args, **kwargs): pass
        def multi_cell(self, *args, **kwargs): pass
        def output(self, *args, **kwargs): return "PDF Content".encode("utf-8")

SIGNALING_ROOMS: Dict[str, Dict[str, Any]] = {}

sandbox_run_submission = None
try:
    import importlib.util
    if importlib.util.find_spec("sandbox_runner") is not None:
        import sandbox_runner  # type: ignore
        sandbox_run_submission = getattr(sandbox_runner, "run_submission", None)
except Exception:
    sandbox_run_submission = None

router = APIRouter(prefix="", tags=["Tasks"])


@router.get("/tasks", response_model=List[schemas.TaskResponse])
def get_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Task).all()


@router.post("/tasks", response_model=schemas.TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.MENTOR]:
        raise HTTPException(status_code=403, detail="Only admins and mentors can create tasks")
    task_data = task_in.dict() if hasattr(task_in, "dict") else task_in.model_dump()
    task = models.Task(**task_data, created_by=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/tasks/{task_id}", response_model=schemas.TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("/tasks/intern")
def get_intern_tasks_with_unlock_status(
    dev_domain: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(status_code=403, detail="Intern role required")
        
    target_domain_id = current_user.domain_id
    # Only allow overriding target domain if testing as admin
    if dev_domain and current_user.role == models.UserRole.ADMIN:
        domain_record = db.query(models.Domain).filter(models.Domain.name.ilike(f"%{dev_domain}%")).first()
        if domain_record:
            target_domain_id = domain_record.id

    if target_domain_id is None:
        return {"tasks": [], "message": "No domain assigned yet"}
        
    tasks = db.query(models.Task).filter(models.Task.domain_id == target_domain_id).order_by(models.Task.day_number).all()
    submissions = db.query(models.Submission).filter(models.Submission.intern_id == current_user.id).all()
    
    sub_map = {sub.task_id: sub for sub in submissions}
    
    from datetime import datetime, timedelta
    current_date = datetime.utcnow()
    start_date = current_user.start_date or current_date
    internship_day = (current_date - start_date).days + 1
    if internship_day < 1:
        internship_day = 1

    # Sequential Day Locking logic:
    # Day 1 is unlocked if internship_day >= 1
    # Day N is unlocked if Day N-1 is submitted or approved.
    results = []
    sequential_unlocked = True
    
    for idx, t in enumerate(tasks):
        sub = sub_map.get(t.id)
        status_val = "Not started"
        score_val = 0
        ai_score_val = 0
        mentor_score_val = 0
        
        if sub:
            status_val = sub.status
            score_val = (sub.mcq_score or 0) + (sub.ai_score or 0) + (sub.mentor_score or 0)
            ai_score_val = sub.ai_score or 0
            mentor_score_val = sub.mentor_score or 0
            
        is_unlocked = sequential_unlocked
        day_state = "COMPLETED" if (sub and sub.status in ["approved", "submitted"]) else ("CURRENT" if is_unlocked else "LOCKED")
        due_date = (start_date + timedelta(days=t.day_number)).strftime("%Y-%m-%d") if t.day_number else None
            
        results.append({
            "id": t.id,
            "day_number": t.day_number,
            "title": t.title,
            "description": t.description if is_unlocked else "Task locked. Complete previous days to unlock.",
            "video_url": t.video_url if is_unlocked else None,
            "document_url": t.document_url if is_unlocked else None,
            "notes": t.notes if is_unlocked else None,
            "resources": t.resources if is_unlocked else None,
            "mcq_questions": t.mcq_questions if is_unlocked else None,
            "coding_prompt": t.coding_prompt if is_unlocked else None,
            "interactive_json": t.interactive_json if is_unlocked else None,
            "unlocked": is_unlocked,
            "day_state": day_state,
            "due_date": due_date,
            "status": status_val,
            "score": score_val,
            "ai_score": ai_score_val,
            "mentor_score": mentor_score_val,
            "mcq_score": sub.mcq_score if sub else 0,
            "ai_feedback": sub.ai_feedback if sub else None,
            "mentor_feedback": sub.mentor_feedback if sub else None,
            "submitted_at": sub.submitted_at if sub else None,
            "started_at": sub.created_at if sub and hasattr(sub, "created_at") else None
        })
        
        # Next task unlock status depends on whether this task was submitted/approved
        if not sub or sub.status not in ["submitted", "approved"]:
            sequential_unlocked = False
            
    return results


@router.post("/tasks/{task_id}/start")
def start_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(status_code=403, detail="Only interns can start tasks")
    
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if task.domain_id and current_user.domain_id != task.domain_id:
        current_user.domain_id = task.domain_id
        db.add(current_user)
        db.commit()
        
    if task.day_number > 1:
        previous_task = db.query(models.Task).filter(
            models.Task.domain_id == task.domain_id,
            models.Task.day_number == task.day_number - 1
        ).first()
        prev_sub = None
        if previous_task:
            prev_sub = db.query(models.Submission).filter(
                models.Submission.intern_id == current_user.id,
                models.Submission.task_id == previous_task.id
            ).first()
            
        if not prev_sub or prev_sub.status not in ["submitted", "approved"]:
            raise HTTPException(status_code=403, detail="Previous task not completed")
            
    existing = db.query(models.Submission).filter(
        models.Submission.intern_id == current_user.id,
        models.Submission.task_id == task_id
    ).first()
    
    if existing:
        if existing.status == "not_started":
            existing.status = "in_progress"
            db.commit()
        return {"message": "Task already started", "status": existing.status}
        
    new_sub = models.Submission(
        intern_id=current_user.id,
        task_id=task_id,
        status="in_progress"
    )
    db.add(new_sub)
    db.commit()
    
    return {"message": "Task started successfully", "status": "in_progress"}

# ==========================================
#           AI CODE EVALUATOR HEURISTICS
# ==========================================


def calculate_final_score_and_grade(mcq_score: int, ai_score: int, mentor_score: int) -> dict:
    final_score = mcq_score + ai_score + mentor_score
    # Standard 300-point total scale normalized to percentage
    pct = round((final_score / 300.0) * 100, 1)
    if pct >= 90:
        grade = "A+"
    elif pct >= 80:
        grade = "A"
    elif pct >= 70:
        grade = "B+"
    elif pct >= 60:
        grade = "B"
    elif pct >= 45:
        grade = "C"
    else:
        grade = "F"
    from services.scoring_service import get_performance_classification
    classification = get_performance_classification(grade)
    return {"final_score": final_score, "grade": grade, "performance_classification": classification}


def build_portfolio_payload(user: models.User, db: Session) -> dict:
    submissions = db.query(models.Submission).filter(models.Submission.intern_id == user.id).all()
    completed_tasks = []
    total_score = 0
    for sub in submissions:
        task = db.query(models.Task).filter(models.Task.id == sub.task_id).first()
        completed_tasks.append({
            "task_id": sub.task_id,
            "day": task.day_number if task else None,
            "title": task.title if task else "Unknown",
            "status": sub.status,
            "mcq_score": sub.mcq_score,
            "ai_score": sub.ai_score,
            "mentor_score": sub.mentor_score,
        })
        total_score += sub.mcq_score + sub.ai_score + sub.mentor_score

    mentor = db.query(models.User).filter(models.User.id == user.mentor_id).first() if user.mentor_id else None
    domain = db.query(models.Domain).filter(models.Domain.id == user.domain_id).first() if user.domain_id else None
    grade_summary = calculate_final_score_and_grade(0, 0, 0)
    if submissions:
        mcq_total = sum(s.mcq_score for s in submissions)
        ai_total = sum(s.ai_score for s in submissions)
        mentor_total = sum(s.mentor_score for s in submissions)
        grade_summary = calculate_final_score_and_grade(mcq_total, ai_total, mentor_total)

    return {
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "college": user.college,
        "domain": domain.name if domain else None,
        "mentor": mentor.name if mentor else None,
        "progress_pct": user.progress_pct,
        "attendance_pct": user.attendance_pct,
        "total_score": grade_summary["final_score"],
        "grade": grade_summary["grade"],
        "submissions": completed_tasks,
    }


def _infer_function_spec(code: str, task: models.Task) -> tuple[Optional[str], int]:
    """Infer the primary function name and its positional argument count."""
    try:
        tree = ast.parse(code)
        for node in tree.body:
            if isinstance(node, ast.FunctionDef):
                return node.name, len(node.args.args)
    except Exception:
        pass

    for source in (task.coding_prompt, getattr(task, 'coding_solution', None)):
        if source:
            match = re.search(r"def\s+(\w+)\s*\(([^)]*)\)", source)
            if match:
                func_name = match.group(1)
                arg_count = 0 if not match.group(2).strip() else len([p for p in match.group(2).split(",") if p.strip()])
                return func_name, arg_count

    return None, 0


def _parse_test_input(raw_input: str):
    if raw_input is None:
        return None
    if not isinstance(raw_input, str):
        return raw_input
    try:
        return ast.literal_eval(raw_input)
    except Exception:
        return raw_input


def run_ai_evaluation(code: str, task: models.Task) -> dict:
    if not code or len(code.strip()) < 5:
        return {
            "score": 0,
            "syntax_valid": False,
            "quality": "Critical Error",
            "feedback": json.dumps({
                "summary": "AI Evaluation failed. Submission was empty or too brief.",
                "syntax_check": "No code detected.",
                "code_quality": "Critical",
                "complexity": "N/A",
                "test_results": ["Test cases: 0/0 passed"],
                "suggestions": ["Please input a complete coding block and try again."]
            })
        }

    syntax_valid = True
    syntax_error_details = ""
    try:
        compile(code, "<string>", "exec")
    except SyntaxError as e:
        syntax_valid = False
        syntax_error_details = f"Syntax Error: {e.msg} on line {e.lineno}"

    # Basic complexity heuristic
    loops = len(re.findall(r"\b(for|while)\b", code))
    has_funcs = len(re.findall(r"\bdef\b", code)) > 0
    complexity = "O(1) constant time" if loops == 0 else ("O(N^2) quadratic time" if loops > 1 else "O(N) linear time")

    # Evaluate test cases by executing code in the secure runner when possible
    total_test_cases = 0
    test_cases_passed = 0
    tc_details = []
    runtime_eval = None

    if task.test_cases:
        try:
            test_cases = json.loads(task.test_cases)
            total_test_cases = len(test_cases)
            if syntax_valid:
                # Use the secure executor to run actual test cases for more accurate scoring
                try:
                    runtime_eval = execute_code_submission(code, task)
                    test_cases_passed = runtime_eval.get("test_cases_passed", 0)
                    for tr in runtime_eval.get("test_case_results", []):
                        status_str = "PASSED" if tr.get("passed") else "FAILED"
                        tc_details.append(f"Test Case {tr.get('case_number')}: Input: {tr.get('input')} -> {status_str}")
                except Exception as e:
                    tc_details.append(f"Runtime evaluation failed: {str(e)}")
            else:
                for idx, tc in enumerate(test_cases):
                    tc_details.append(f"Test Case {idx+1}: Input: {tc.get('input')} -> FAILED (Syntax Error)")
        except Exception:
            total_test_cases = 1
            test_cases_passed = 0
            tc_details.append("Test Case 1: Could not parse test cases")
    else:
        total_test_cases = 0
        test_cases_passed = 0
        tc_details.append("No test cases provided for this task.")

    # Scoring: combine syntax, runtime test success, and code quality heuristics
    # Additional code-quality metrics
    loc = len(code.splitlines())
    func_count = len(re.findall(r"\bdef\s+\w+\s*\(", code))
    comments = len(re.findall(r"#", code))
    docstring_present = bool(re.search(r'"""|\'\'\'', code))
    list_comp = bool(re.search(r"\[.*for .* in .*=*.*\]", code))
    import_count = len(re.findall(r"\bimport\b|\bfrom\b", code))

    code_metrics = {
        "lines_of_code": loc,
        "function_count": func_count,
        "comments": comments,
        "docstring_present": docstring_present,
        "list_comprehension_used": list_comp,
        "import_count": import_count,
        "complexity_guess": complexity
    }

    if not syntax_valid:
        ai_score = 0
    else:
        # Quality score derived from length, functions, comments and docstrings
        quality_points = 5
        quality_points += min(10, max(2, int(loc / 5)))
        quality_points += min(10, func_count * 5)
        quality_points += 5 if docstring_present else 0
        quality_points += 5 if list_comp else 0

        if total_test_cases > 0:
            tc_ratio = test_cases_passed / total_test_cases
            tc_score = int(tc_ratio * 70)
            if test_cases_passed == 0:
                qual = min(10, quality_points)
            else:
                qual = min(30, quality_points)
            ai_score = min(100, tc_score + qual)
        else:
            qual = min(40, quality_points * 2)
            ai_score = min(100, 60 + qual)

    feedback = {
        "summary": "AI Evaluation Completed Successfully." if syntax_valid else "AI Evaluation failed. Code syntax error detected.",
        "syntax_check": "Syntax passes syntax parser." if syntax_valid else f"Failed compiler check: {syntax_error_details}",
        "code_quality": "High" if (syntax_valid and ai_score >= 80) else ("Medium" if syntax_valid and ai_score >= 50 else "Low"),
        "complexity": complexity,
        "test_results": tc_details,
        "runtime_evaluation": runtime_eval,
        "code_metrics": code_metrics,
        "suggestions": [
            "Write unit tests for edge cases and handle invalid inputs.",
            "Refactor long functions into smaller units for readability.",
            f"Estimated complexity: {complexity}."
        ]
    }

    return {
        "score": ai_score,
        "syntax_valid": syntax_valid,
        "quality": "High" if ai_score >= 80 else ("Medium" if ai_score >= 50 else "Low"),
        "feedback": json.dumps(feedback),
        "test_cases": f"{test_cases_passed}/{total_test_cases} passed"
    }


def execute_code_submission(code: str, task: models.Task) -> dict:
    if not code or len(code.strip()) < 5:
        return {
            "syntax_valid": False,
            "runtime_score": 0,
            "test_cases_passed": 0,
            "total_test_cases": 0,
            "runtime_feedback": "Submission was empty or too brief for execution.",
            "test_case_results": [],
            "stdout": None,
            "stderr": None,
            "successful": False
        }

    syntax_valid = True
    syntax_error = None
    try:
        compile(code, "<user_code>", "exec")
    except SyntaxError as exc:
        syntax_valid = False
        syntax_error = f"Syntax Error: {exc.msg} on line {exc.lineno}"

    temp_file = None
    test_case_results = []
    passed = 0
    total = 0
    stdout_capture = ""
    stderr_capture = ""
    runtime_ok = True

    if task.test_cases:
        try:
            test_cases = json.loads(task.test_cases)
        except Exception:
            test_cases = []
    else:
        test_cases = []

    if not syntax_valid:
        return {
            "syntax_valid": False,
            "runtime_score": 0,
            "test_cases_passed": 0,
            "total_test_cases": len(test_cases),
            "runtime_feedback": syntax_error,
            "test_case_results": [],
            "stdout": None,
            "stderr": None,
            "successful": False
        }

    # If an isolated sandbox runner is available, prefer it (Docker-backed).
    if sandbox_run_submission is not None:
        try:
            return sandbox_run_submission(code, test_cases, timeout=6)
        except Exception:
            # If sandbox runner fails for any reason, fall back to local subprocess execution below
            pass

    func_name, func_arg_count = _infer_function_spec(code, task)
    try:
        if not test_cases:
            test_cases = [{"input": "", "expected": ""}]

        for idx, tc in enumerate(test_cases):
            total += 1
            tc_input = tc.get("input", "")
            expected = str(tc.get("expected", "")).strip()
            input_value = _parse_test_input(tc_input)

            if func_name:
                if isinstance(input_value, tuple):
                    args = input_value
                elif isinstance(input_value, list):
                    if func_arg_count == 1 or len(input_value) != func_arg_count:
                        args = (input_value,)
                    else:
                        args = tuple(input_value)
                else:
                    args = (input_value,)
                invocation = f"print({func_name}({', '.join(repr(a) for a in args)}))"
                wrapper_code = f"{code}\n{invocation}\n"
            else:
                wrapper_code = f"{code}\n"

            temp_file = tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False, encoding="utf-8")
            temp_file.write(wrapper_code)
            temp_file.flush()
            temp_file.close()

            try:
                proc = subprocess.run(
                    [sys.executable, "-I", temp_file.name],
                    capture_output=True,
                    text=True,
                    timeout=6,
                    env={
                        "PYTHONIOENCODING": "utf-8",
                        "PYTHONUNBUFFERED": "1",
                        "PATH": os.environ.get("PATH", "")
                    }
                )
                stdout_capture = proc.stdout.strip()
                stderr_capture = proc.stderr.strip()
                success = False
                if expected == "":
                    success = proc.returncode == 0
                else:
                    success = stdout_capture.strip() == expected

                if success:
                    passed += 1

                test_case_results.append({
                    "case_number": idx + 1,
                    "input": tc_input,
                    "expected": expected,
                    "stdout": stdout_capture,
                    "stderr": stderr_capture,
                    "passed": success,
                    "return_code": proc.returncode
                })
            except subprocess.TimeoutExpired:
                runtime_ok = False
                test_case_results.append({
                    "case_number": idx + 1,
                    "input": tc_input,
                    "expected": expected,
                    "stdout": "",
                    "stderr": "TimeoutExpired: Process exceeded time limit.",
                    "passed": False,
                    "return_code": None
                })
            except Exception as runtime_exc:
                runtime_ok = False
                test_case_results.append({
                    "case_number": idx + 1,
                    "input": tc_input,
                    "expected": expected,
                    "stdout": "",
                    "stderr": str(runtime_exc),
                    "passed": False,
                    "return_code": None
                })
            finally:
                if temp_file and os.path.exists(temp_file.name):
                    try:
                        os.remove(temp_file.name)
                    except Exception:
                        pass
                    temp_file = None
    finally:
        if temp_file and temp_file.name and os.path.exists(temp_file.name):
            try:
                os.remove(temp_file.name)
            except Exception:
                pass

    if not runtime_ok:
        runtime_score = 0
    elif total > 0:
        runtime_score = int((passed / total) * 100) if passed > 0 else 0
    else:
        runtime_score = 100 if runtime_ok else 0

    runtime_feedback = (
        "Code executed successfully across test cases." if passed == total and runtime_ok
        else "Code execution completed with issues. Review stderr and failing test cases."
    )

    return {
        "syntax_valid": True,
        "runtime_score": runtime_score,
        "test_cases_passed": passed,
        "total_test_cases": total,
        "runtime_feedback": runtime_feedback,
        "test_case_results": test_case_results,
        "stdout": stdout_capture,
        "stderr": stderr_capture,
        "successful": passed == total and runtime_ok
    }


@router.post("/code/execute", response_model=schemas.CodeExecutionResponse)
def execute_code(
    data: schemas.CodeExecutionRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(status_code=403, detail="Only interns can execute code submissions")

    # Safe task resolution
    task = None
    try:
        task_id_val = int(data.task_id)
        task = db.query(models.Task).filter(models.Task.id == task_id_val).first()
    except (ValueError, TypeError):
        task_id_val = 1

    if not task and current_user.domain_id:
        task = db.query(models.Task).filter(
            models.Task.domain_id == current_user.domain_id,
            models.Task.day_number == task_id_val
        ).first()

    if not task:
        task = db.query(models.Task).filter(models.Task.day_number == task_id_val).first()

    if not task:
        task = db.query(models.Task).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.domain_id and current_user.domain_id != task.domain_id:
        current_user.domain_id = task.domain_id
        db.add(current_user)
        db.commit()

    code_to_exec = data.code_submission or data.code or ""
    result = execute_code_submission(code_to_exec, task)
    ai_eval = run_ai_evaluation(code_to_exec, task)
    combined = min(100, int((ai_eval["score"] * 0.6) + (result["runtime_score"] * 0.4))) if result.get("syntax_valid") else 0
    return {
        "task_id": task.id,
        "syntax_valid": result.get("syntax_valid", True),
        "runtime_score": result.get("runtime_score", 0),
        "test_cases_passed": result.get("test_cases_passed", 0),
        "total_test_cases": result.get("total_test_cases", 0),
        "runtime_feedback": result.get("runtime_feedback", "Success"),
        "test_case_results": result.get("test_case_results", []),
        "stdout": result.get("stdout", ""),
        "stderr": result.get("stderr", ""),
        "successful": result.get("successful", False),
        "ai_score": combined,
        "ai_feedback": ai_eval.get("feedback")
    }


# ==========================================
#           SUBMISSION MANAGEMENT
# ==========================================

@router.post("/submissions")
def create_submission(
    data: schemas.SubmissionCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(status_code=403, detail="Only interns can submit tasks")
        
    # Ensure code_submission is set if code was provided
    if not data.code_submission and data.code:
        data.code_submission = data.code

    task = None
    try:
        task_id_val = int(data.task_id)
        task = db.query(models.Task).filter(models.Task.id == task_id_val).first()
    except (ValueError, TypeError):
        task_id_val = 1

    if not task and current_user.domain_id:
        task = db.query(models.Task).filter(
            models.Task.domain_id == current_user.domain_id,
            models.Task.day_number == task_id_val
        ).first()
    if not task:
        task = db.query(models.Task).filter(models.Task.day_number == task_id_val).first()
    if not task:
        task = db.query(models.Task).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Use the resolved task ID
    data.task_id = task.id

    if task.domain_id and current_user.domain_id != task.domain_id:
        current_user.domain_id = task.domain_id
        db.add(current_user)
        db.commit()

    if task.day_number > 1:
        previous_task = db.query(models.Task).filter(
            models.Task.domain_id == task.domain_id,
            models.Task.day_number == task.day_number - 1
        ).first()
        prev_submission = None
        if previous_task:
            prev_submission = db.query(models.Submission).filter(
                models.Submission.intern_id == current_user.id,
                models.Submission.task_id == previous_task.id
            ).first()

        if not prev_submission or prev_submission.status not in ["submitted", "approved"]:
            raise HTTPException(
                status_code=403,
                detail="This task is locked until the previous day's task has been completed and submitted"
            )
        
    # Check if a submission already exists
    existing = db.query(models.Submission).filter(
        models.Submission.intern_id == current_user.id,
        models.Submission.task_id == data.task_id
    ).first()
    
    # Calculate MCQ Score
    mcq_score = 0
    if data.mcq_answers and task.mcq_questions:
        try:
            answers = json.loads(data.mcq_answers)
            questions = json.loads(task.mcq_questions)
            # Question structure: list of {"id", "correct_option"}
            # answers structure: dict of {question_id: selected_option}
            correct = 0
            for q in questions:
                q_id = str(q.get("id"))
                if answers.get(q_id) == q.get("correct_option"):
                    correct += 1
            mcq_score = int((correct / len(questions)) * 100) if questions else 0
        except Exception:
            mcq_score = data.mcq_score if data.mcq_score is not None else 0
    elif data.mcq_score is not None:
        mcq_score = data.mcq_score
            
    # Save code to filesystem
    file_name = None
    if data.code_submission:
        domain_name = current_user.domain.name if current_user.domain else "Unknown"
        domain_name_clean = re.sub(r'[^a-zA-Z0-9]', '_', domain_name)
        
        ext_map = {
            "python": "py",
            "javascript": "js",
            "typescript": "ts",
            "java": "java",
            "c": "c",
            "c++": "cpp",
            "c#": "cs"
        }
        lang = getattr(data, 'language', None)
        lang = lang.lower() if lang else "txt"
        ext = ext_map.get(lang, lang)
        
        base_dir = os.path.join(os.getcwd(), "submissions")
        domain_dir = os.path.join(base_dir, domain_name_clean)
        intern_dir = os.path.join(domain_dir, f"intern_{current_user.id}")
        
        try:
            os.makedirs(intern_dir, exist_ok=True)
            custom_filename = getattr(data, 'filename', None)
            if custom_filename:
                file_name = custom_filename
            else:
                file_name = f"day{task.day_number}.{ext}"
            file_path = os.path.join(intern_dir, file_name)
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(data.code_submission)
        except Exception as e:
            print(f"Error saving submission file: {e}")
            raise HTTPException(status_code=500, detail="Unable to save your submission. Please try again.")

    # Trigger AI Evaluator and secure runtime execution for code submission
    ai_eval_result = {"score": 0, "feedback": None}
    runtime_result = None
    if data.code_submission:
        ai_eval_result = run_ai_evaluation(data.code_submission, task)
        runtime_result = execute_code_submission(data.code_submission, task)
        combined_score = min(100, int((ai_eval_result["score"] * 0.6) + (runtime_result["runtime_score"] * 0.4)))
    else:
        combined_score = 0

    if existing:
        existing.code_submission = data.code_submission
        existing.mcq_answers = data.mcq_answers
        existing.mcq_score = mcq_score
        existing.ai_score = combined_score
        existing.ai_feedback = json.dumps({
            "ai_analysis": ai_eval_result,
            "runtime_evaluation": runtime_result
        }) if runtime_result else ai_eval_result["feedback"]
        existing.status = "submitted"
        existing.filename = file_name
        existing.submitted_at = datetime.utcnow()
        existing.attendance_marked = True
        db.add(existing)
        sub = existing
    else:
        new_sub = models.Submission(
            intern_id=current_user.id,
            task_id=data.task_id,
            status="submitted",
            code_submission=data.code_submission,
            mcq_answers=data.mcq_answers,
            mcq_score=mcq_score,
            ai_score=combined_score,
            ai_feedback=json.dumps({
                "ai_analysis": ai_eval_result,
                "runtime_evaluation": runtime_result
            }) if runtime_result else ai_eval_result["feedback"],
            filename=file_name,
            attendance_marked=True
        )
        db.add(new_sub)
        sub = new_sub
    
    db.commit()
    db.refresh(sub)
    
    # Update Attendance and Progress for Intern
    # Progress: total tasks submitted divided by 30 (total days)
    total_domain_tasks = db.query(models.Task).filter(models.Task.domain_id == current_user.domain_id).count() or 30
    user_subs = db.query(models.Submission).filter(
        models.Submission.intern_id == current_user.id,
        models.Submission.status.in_(["submitted", "approved"])
    ).count()
    
    current_user.progress_pct = min(100, int((user_subs / total_domain_tasks) * 100))
    
    # Attendance Calculation (A9.1 & A9.3 derived dynamically from submitted days vs elapsed days)
    from sqlalchemy import func
    elapsed_days = max(1, min(30, (datetime.utcnow() - (current_user.start_date or datetime.utcnow())).days + 1))
    submitted_unique_days = db.query(func.count(func.distinct(models.Task.day_number))).join(
        models.Submission, models.Task.id == models.Submission.task_id
    ).filter(
        models.Submission.intern_id == current_user.id,
        models.Submission.status.in_(["submitted", "approved"])
    ).scalar() or 0
    current_user.attendance_pct = min(100, int((submitted_unique_days / elapsed_days) * 100))

    attendance_log = db.query(models.AttendanceLog).filter(
        models.AttendanceLog.intern_id == current_user.id,
        models.AttendanceLog.log_date >= datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0),
        models.AttendanceLog.log_date < datetime.utcnow().replace(hour=23, minute=59, second=59, microsecond=999999)
    ).first()
    if not attendance_log:
        db.add(models.AttendanceLog(intern_id=current_user.id, status="present", note="Submitted daily task"))
    
    # Streak tracking logic
    now_dt = datetime.utcnow()
    last_comp = current_user.last_task_completion_date
    if last_comp:
        # Check if difference is around 1 day (between 12 and 48 hours to be safe for "consecutive")
        diff_hours = (now_dt - last_comp).total_seconds() / 3600
        if diff_hours < 48 and now_dt.date() > last_comp.date():
            current_user.learning_streak += 1
        elif now_dt.date() > last_comp.date():
             # missed a day
            current_user.learning_streak = 1
    else:
        current_user.learning_streak = 1
        
    current_user.last_task_completion_date = now_dt
    
    db.add(current_user)
    db.commit()

    # Cancel any pending reminders for today
    today = datetime.utcnow().date()
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False,
        models.Notification.type == "daily_reminder"
    ).update({"is_read": True})
    
    # Send a motivation notification
    motivations = [
        "🎉 Excellent work! You have successfully completed today's task. Keep up the great progress!",
        "🚀 Great job! You're one step closer to completing your internship successfully.",
        "🌟 Amazing consistency! Completing tasks daily will improve your skills and increase your final score.",
        "💪 Fantastic! Today's attendance has been marked as Present. Keep your learning streak alive!",
        "🏆 You're doing great! Small daily efforts lead to big achievements."
    ]
    streak_messages = {
        7: "🔥 Amazing! You have maintained a 7-day learning streak. Keep it going!",
        15: "🏅 Congratulations! You've completed tasks for 15 consecutive days. Consistency is your strength!"
    }
    
    if current_user.learning_streak in streak_messages:
        motivational_message = streak_messages[current_user.learning_streak]
    else:
        motivational_message = random.choice(motivations)
        
    motivation_notification = models.Notification(
        user_id=current_user.id,
        title="Task Completed",
        message=motivational_message,
        type="motivation"
    )
    db.add(motivation_notification)
    db.commit()
    
    response = {
        "message": "Submission recorded",
        "mcq_score": mcq_score,
        "ai_score": combined_score,
        "ai_feedback": json.dumps({
            "ai_analysis": ai_eval_result,
            "runtime_evaluation": runtime_result
        }) if runtime_result else ai_eval_result["feedback"]
    }
    if runtime_result:
        response.update({
            "runtime_score": runtime_result["runtime_score"],
            "runtime_feedback": runtime_result["runtime_feedback"],
            "test_cases_passed": runtime_result["test_cases_passed"],
            "total_test_cases": runtime_result["total_test_cases"]
        })
    return response


@router.get("/submissions")
def get_submissions(
    intern_id: int = None,
    task_id: int = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Submission)
    
    if current_user.role == models.UserRole.INTERN:
        # Intern only sees their own submissions
        query = query.filter(models.Submission.intern_id == current_user.id)
    elif current_user.role == models.UserRole.MENTOR:
        # Mentor sees assigned interns' submissions
        intern_ids = [i.id for i in current_user.interns]
        query = query.filter(models.Submission.intern_id.in_(intern_ids))
        
    if intern_id and current_user.role != models.UserRole.INTERN:
        query = query.filter(models.Submission.intern_id == intern_id)
    if task_id:
        query = query.filter(models.Submission.task_id == task_id)
        
    return query.all()


@router.post("/submissions/{submission_id}/evaluate")
def evaluate_submission(
    submission_id: int,
    eval_data: schemas.SubmissionEvaluate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.MENTOR:
        raise HTTPException(status_code=403, detail="Access Denied: Only Mentors can evaluate submissions")
        
    sub = db.query(models.Submission).filter(models.Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    # Check if this is an assigned intern
    intern = db.query(models.User).filter(models.User.id == sub.intern_id).first()
    if intern.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access Denied: This intern is not assigned to you")
        
    sub.mentor_score = eval_data.mentor_score
    sub.mentor_feedback = eval_data.mentor_feedback
    sub.status = "approved"
    
    db.add(sub)
    db.commit()
    db.refresh(sub)
    
    return {"message": "Mentor review updated successfully", "submission": sub}


# ==========================================
#           COMMUNICATION & MEETINGS (DELEGATED)
# Canonical logic lives in routers.notifications and routers.meetings
# ==========================================
from routers.notifications import (
    create_announcement,
    get_announcements,
    send_message,
    get_messages,
)
from routers.meetings import (
    create_meeting,
    get_meetings,
    signaling_websocket,
    get_meeting_breakouts,
    close_meeting,
)


@router.get("/plagiarism/check/{submission_id}")
def plagiarism_check(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Only mentors and admins are allowed to run plagiarism checks
    if current_user.role not in [models.UserRole.MENTOR, models.UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only mentors or admins can run plagiarism checks")

    sub = db.query(models.Submission).filter(models.Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    others = db.query(models.Submission).filter(
        models.Submission.task_id == sub.task_id,
        models.Submission.id != submission_id,
        models.Submission.code_submission != None
    ).all()

    comparisons = []
    for o in others:
        if not o.code_submission:
            continue
        try:
            ratio = difflib.SequenceMatcher(None, str(sub.code_submission), str(o.code_submission)).ratio()
        except Exception:
            ratio = 0.0
        comparisons.append({
            "submission_id": o.id,
            "intern_id": o.intern_id,
            "similarity_pct": round(ratio * 100, 2)
        })

    comparisons = sorted(comparisons, key=lambda x: x["similarity_pct"], reverse=True)
    return {"submission_id": submission_id, "comparisons": comparisons}


# ==========================================
#           ANALYTICS & PROGRESS TRACKING
# ==========================================

@router.get("/analytics/final-grade")
def get_final_grade(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(status_code=403, detail="Intern role required")

    from services.scoring_service import calculate_final_grade, get_performance_classification
    evaluation = calculate_final_grade(db, current_user, force_recalculate=True)
    grade = evaluation.grade or "F"
    classification = get_performance_classification(grade)
    return {
        "user_id": current_user.id,
        "final_score": evaluation.final_score,
        "grade": grade,
        "performance_classification": classification,
        "is_credential_eligible": bool(evaluation.final_score is not None and evaluation.final_score >= 45.0),
        "mcq_score": evaluation.mcq_final_mark,
        "code_score": evaluation.code_final_mark,
        "airdrop_score": evaluation.airdrop_final_mark,
        "mentor_score": evaluation.mentor_evaluation_mark,
        "is_completed": evaluation.is_completed
    }


@router.get("/analytics/dashboard")
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role == models.UserRole.ADMIN:
        total_interns = db.query(models.User).filter(models.User.role == models.UserRole.INTERN).count()
        total_mentors = db.query(models.User).filter(models.User.role == models.UserRole.MENTOR).count()
        total_domains = db.query(models.Domain).count()
        
        # Calculate system averages
        subs = db.query(models.Submission).all()
        avg_score = 0
        if subs:
            total_sum = sum(s.mcq_score + s.ai_score + s.mentor_score for s in subs)
            # max achievable score per task is 300 (100 MCQ + 100 AI + 100 Mentor)
            avg_score = int((total_sum / (len(subs) * 300)) * 100)
            
        # rank list of top interns
        interns = db.query(models.User).filter(models.User.role == models.UserRole.INTERN).all()
        intern_ranks = []
        for i in interns:
            i_subs = [s for s in subs if s.intern_id == i.id]
            i_score = sum(s.mcq_score + s.ai_score + s.mentor_score for s in i_subs)
            intern_ranks.append({
                "id": i.id,
                "intern_id": i.intern_id,
                "name": i.name,
                "college": i.college,
                "domain": i.domain.name if i.domain else "Unassigned",
                "progress": i.progress_pct,
                "attendance": i.attendance_pct,
                "total_score": i_score
            })
        intern_ranks = sorted(intern_ranks, key=lambda x: x["total_score"], reverse=True)[:10]
        
        return {
            "total_interns": total_interns,
            "total_mentors": total_mentors,
            "total_domains": total_domains,
            "system_average_score": avg_score,
            "intern_rankings": intern_ranks
        }
        
    elif current_user.role == models.UserRole.MENTOR:
        assigned_interns = db.query(models.User).filter(models.User.mentor_id == current_user.id).all()
        intern_ids = [i.id for i in assigned_interns]
        
        pending_reviews = db.query(models.Submission).filter(
            models.Submission.intern_id.in_(intern_ids),
            models.Submission.status == "submitted"
        ).count()
        
        active_meetings = db.query(models.Meeting).filter(
            models.Meeting.mentor_id == current_user.id,
            models.Meeting.status == "active"
        ).count()
        
        intern_list = []
        for i in assigned_interns:
            i_subs = db.query(models.Submission).filter(models.Submission.intern_id == i.id).all()
            i_score = sum(s.mcq_score + s.ai_score + s.mentor_score for s in i_subs)
            intern_list.append({
                "id": i.id,
                "name": i.name,
                "progress": i.progress_pct,
                "attendance": i.attendance_pct,
                "college": i.college,
                "total_score": i_score
            })
            
        return {
            "total_assigned_interns": len(assigned_interns),
            "pending_reviews": pending_reviews,
            "active_meetings": active_meetings,
            "intern_list": intern_list
        }
        
    elif current_user.role == models.UserRole.INTERN:
        my_subs = db.query(models.Submission).filter(models.Submission.intern_id == current_user.id).all()
        
        total_score = sum(s.mcq_score + s.ai_score + s.mentor_score for s in my_subs)
        # Average score percentage
        max_possible = len(my_subs) * 300
        avg_pct = int((total_score / max_possible) * 100) if max_possible > 0 else 0
        
        completed_days = len([s for s in my_subs if s.status == "approved"])
        pending_days = len([s for s in my_subs if s.status == "submitted"])
        
        # Weak area identification (MCQ and coding logic)
        weak_areas = []
        low_score_subs = [s for s in my_subs if (s.mcq_score + s.ai_score) < 120]
        for ls in low_score_subs:
            task = db.query(models.Task).filter(models.Task.id == ls.task_id).first()
            if task:
                weak_areas.append(f"Day {task.day_number}: {task.title}")
                
        mentor = db.query(models.User).filter(models.User.id == current_user.mentor_id).first() if current_user.mentor_id else None
        return {
            "progress_pct": current_user.progress_pct,
            "attendance_pct": current_user.attendance_pct,
            "total_score": total_score,
            "average_score_pct": avg_pct,
            "completed_tasks": completed_days,
            "pending_tasks": pending_days,
            "weak_areas": weak_areas[:3],
            "mentor_id": current_user.mentor_id,
            "mentor_name": mentor.name if mentor else None
        }


# ==========================================
#           ATTENDANCE & PORTFOLIO
# ==========================================

@router.get("/attendance", response_model=List[schemas.AttendanceLogResponse])
def get_attendance_logs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != models.UserRole.INTERN:
        raise HTTPException(status_code=403, detail="Intern role required")

    logs = db.query(models.AttendanceLog).filter(models.AttendanceLog.intern_id == current_user.id).order_by(models.AttendanceLog.log_date.desc()).all()
    return logs


@router.get("/portfolio", response_model=schemas.PortfolioResponse)
def get_portfolio(
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if user_id is None:
        target_user = current_user
    else:
        if current_user.role == models.UserRole.INTERN and current_user.id != user_id:
            raise HTTPException(status_code=403, detail="You can only view your own portfolio")
        target_user = db.query(models.User).filter(models.User.id == user_id).first()
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")

    return build_portfolio_payload(target_user, db)


# ==========================================
#     CERTIFICATES & NOTIFICATIONS (DELEGATED)
# Canonical logic lives in routers.certificates,
# routers.notifications, and services.scheduler_service
# ==========================================
from routers.certificates import verify_certificate_endpoint
from routers.notifications import (
    get_notifications,
    mark_notification_read,
    mark_all_notifications_read,
)
from services.scheduler_service import (
    send_daily_reminders,
    process_end_of_day_deadline,
    start_scheduler,
)


@router.get("/certificate/verify/{certificate_id}")
def verify_certificate(
    certificate_id: str,
    db: Session = Depends(get_db)
):
    return verify_certificate_endpoint(certificate_id=certificate_id, db=db)


# ==========================================
#      BACKWARD COMPATIBILITY ENDPOINTS
# ==========================================

@router.post("/internships", status_code=status.HTTP_201_CREATED)
def create_internship(
    internship_data: schemas.InternshipCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_internship = models.Internship(
        title=internship_data.title,
        company_name=internship_data.company_name,
        description=internship_data.description,
        location=internship_data.location,
        stipend=internship_data.stipend,
        posted_by=current_user.id
    )
    db.add(new_internship)
    db.commit()
    db.refresh(new_internship)
    return {"message": "Internship posted", "internship_id": new_internship.id}


@router.get("/internships")
def get_all_internships(db: Session = Depends(get_db)):
    return db.query(models.Internship).all()


@router.post("/apply", status_code=status.HTTP_201_CREATED)
def apply_for_internship(
    application_data: schemas.ApplicationCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_application = models.Application(
        internship_id=application_data.internship_id,
        user_id=current_user.id,
        resume_url=application_data.resume_url,
        status="Pending"
    )
    db.add(new_application)
    db.commit()
    return {"message": "Application submitted"}

