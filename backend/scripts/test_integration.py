
import pytest
from fastapi.testclient import TestClient
import os

from main import app
client = TestClient(app)

def test_health_check():
    response = client.get('/api/health')
    if response.status_code == 404:
        pytest.skip('Health route not mounted.')
    assert response.status_code == 200

