import os
import subprocess
import tempfile
import time
import sys
import json
import ast
from typing import Optional


def _infer_function_spec(code: str) -> tuple[Optional[str], int]:
    try:
        tree = ast.parse(code)
        for node in tree.body:
            if isinstance(node, ast.FunctionDef):
                return node.name, len(node.args.args)
    except Exception:
        pass
    return None, 0


def _parse_test_input(raw_input):
    if raw_input is None:
        return None
    if not isinstance(raw_input, str):
        return raw_input
    try:
        return ast.literal_eval(raw_input)
    except Exception:
        return raw_input


def _docker_available():
    try:
        subprocess.run(["docker", "--version"], capture_output=True, check=True)
        return True
    except Exception:
        return False

def _run_in_docker(host_dir: str, timeout: int):
    # Run the submission inside a lightweight python image
    cmd = [
        "docker", "run", "--rm",
        "-v", f"{host_dir}:/app",
        "-w", "/app",
        "--network", "none",
        "--memory", "256m",
        "--cpus", "0.5",
        "--pids-limit", "64",
        "python:3.11-slim",
        "python", "submission.py"
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    return proc

def run_submission(code: str, test_cases: list, timeout: int = 6) -> dict:
    """Run the provided `code` against `test_cases` in an isolated runner.
    Attempts to use Docker; falls back to local subprocess execution if Docker is unavailable.
    Returns a dict matching the shape of `execute_code_submission`'s result.
    """
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

    # Ensure test_cases is a list
    if not isinstance(test_cases, list):
        test_cases = []

    # Create a temporary directory to hold the submission file
    tmpdir = tempfile.mkdtemp()
    host_dir = os.path.abspath(tmpdir)
    submission_path = os.path.join(host_dir, "submission.py")
    with open(submission_path, "w", encoding="utf-8") as f:
        f.write(code + "\n")

    test_case_results = []
    passed = 0
    total = 0
    stdout_capture = ""
    stderr_capture = ""
    runtime_ok = True

    use_docker = _docker_available()

    try:
        if not test_cases:
            test_cases = [{"input": "", "expected": ""}]

        func_name, func_arg_count = _infer_function_spec(code)
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

                wrapper_code = code + "\n" + f"print({func_name}({', '.join(repr(a) for a in args)}))\n"
            else:
                wrapper_code = code + "\n"

            with open(submission_path, "w", encoding="utf-8") as f:
                f.write(wrapper_code)

            try:
                if use_docker:
                    # For docker, run the container and pass input via stdin
                    proc = subprocess.run(
                        ["docker", "run", "--rm", "-v", f"{host_dir}:/app", "-w", "/app", "--network", "none", "--memory", "256m", "--cpus", "0.5", "--pids-limit", "64", "python:3.11-slim", "python", "submission.py"],
                        capture_output=True,
                        text=True,
                        timeout=timeout
                    )
                else:
                    proc = subprocess.run(
                        [sys.executable, submission_path],
                        capture_output=True,
                        text=True,
                        timeout=timeout,
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
        # Best-effort cleanup
        try:
            os.remove(submission_path)
        except Exception:
            pass
        try:
            os.rmdir(host_dir)
        except Exception:
            pass

    pass_ratio = passed / max(1, total)
    runtime_score = int(pass_ratio * 70) + (20 if runtime_ok else 0) + (10 if len(code) > 120 else 0)
    runtime_score = min(runtime_score, 100)

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
