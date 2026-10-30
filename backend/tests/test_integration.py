import sys
import os
import pytest

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app, health_check


def test_health_check():
    res = health_check()
    assert res is not None
    assert res.get("status") == "healthy"
    assert "timestamp" in res
    assert res.get("version") == "1.0.0"
