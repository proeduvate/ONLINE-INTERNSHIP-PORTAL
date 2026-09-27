"""
sandbox_runner.py

Optional Docker-based code sandbox for secure code execution.
When Docker is unavailable, main.py falls back to local subprocess execution.
This module provides the expected interface so imports resolve cleanly.
"""
from __future__ import annotations
from typing import Any, Dict, Optional
import subprocess
import tempfile
import os
import sys


def run_submission(
    code: str,
    language: str = "python",
    timeout: int = 10,
    test_inputs=None,
):
    """
    Run code in a sandboxed environment.
    Tries Docker first, falls back to local subprocess.
    Returns dict: success, output, error, runtime_score, execution_time_ms
    """
    try:
        return _run_with_docker(code, language, timeout, test_inputs)
    except Exception:
        return _run_local_fallback(code, language, timeout)


def _run_with_docker(code, language, timeout, test_inputs):
    import shutil, time
    if not shutil.which("docker"):
        raise RuntimeError("Docker not found")
    image_map = {"python": "python:3.11-slim", "javascript": "node:18-slim"}
    image = image_map.get(language.lower(), "python:3.11-slim")
    ext_map = {"python": "py", "javascript": "js"}
    ext = ext_map.get(language.lower(), "py")
    with tempfile.TemporaryDirectory() as tmpdir:
        code_file = os.path.join(tmpdir, f"solution.{ext}")
        with open(code_file, "w") as f:
            f.write(code)
        cmd = ["python", f"/code/solution.{ext}"] if language == "python" else ["node", f"/code/solution.{ext}"]
        docker_cmd = ["docker", "run", "--rm", "--memory", "128m", "--cpus", "0.5", "--network", "none", "-v", f"{tmpdir}:/code:ro", image] + cmd
        start = time.time()
        result = subprocess.run(docker_cmd, capture_output=True, text=True, timeout=timeout)
        elapsed_ms = int((time.time() - start) * 1000)
        success = result.returncode == 0
        return {"success": success, "output": result.stdout[:2000], "error": result.stderr[:500] if not success else "", "runtime_score": 80 if success else 30, "execution_time_ms": elapsed_ms}


def _run_local_fallback(code, language, timeout):
    import time
    if language.lower() != "python":
        return {"success": False, "output": "", "error": f"Local sandbox only supports Python", "runtime_score": 0, "execution_time_ms": 0}
    with tempfile.NamedTemporaryFile(suffix=".py", delete=False, mode="w") as f:
        f.write(code)
        tmp_path = f.name
    try:
        start = time.time()
        result = subprocess.run([sys.executable, tmp_path], capture_output=True, text=True, timeout=timeout)
        elapsed_ms = int((time.time() - start) * 1000)
        success = result.returncode == 0
        return {"success": success, "output": result.stdout[:2000], "error": result.stderr[:500] if not success else "", "runtime_score": 70 if success else 25, "execution_time_ms": elapsed_ms}
    except subprocess.TimeoutExpired:
        return {"success": False, "output": "", "error": f"Execution timed out after {timeout}s", "runtime_score": 0, "execution_time_ms": timeout * 1000}
    finally:
        try: os.unlink(tmp_path)
        except: pass
