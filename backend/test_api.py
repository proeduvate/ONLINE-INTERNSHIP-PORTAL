import unittest
import requests
import json
import subprocess
import time
import os

BASE_URL = "http://127.0.0.1:8000"

class TestInternshipPortal(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # We start the backend server in a subprocess to run integration tests
        # We find python path
        cls.backend_proc = subprocess.Popen(
            ["backend\\venv\\Scripts\\python.exe", "-m", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", "8000"],
            cwd=os.path.join(os.getcwd(), "backend"),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        time.sleep(2.0) # wait for uvicorn to start

    @classmethod
    def tearDownClass(cls):
        cls.backend_proc.terminate()
        cls.backend_proc.wait()

    def test_01_root(self):
        r = requests.get(f"{BASE_URL}/")
        self.assertEqual(r.status_code, 200)
        self.assertIn("AI Internship Portal API", r.json()["message"])

    def test_02_login_and_roles(self):
        # Admin Login
        payload = {"email": "admin@gmail.com", "password": "admin123"}
        r = requests.post(f"{BASE_URL}/login", json=payload)
        self.assertEqual(r.status_code, 200)
        admin_data = r.json()
        self.assertEqual(admin_data["role"], "admin")
        self.assertIsNotNone(admin_data["access_token"])
        admin_token = admin_data["access_token"]
        
        # Intern Login
        payload = {"email": "intern@gmail.com", "password": "intern123"}
        r = requests.post(f"{BASE_URL}/login", json=payload)
        self.assertEqual(r.status_code, 200)
        intern_data = r.json()
        self.assertEqual(intern_data["role"], "intern")
        intern_token = intern_data["access_token"]

        # Attempt admin action with intern token (Onboard user)
        headers = {"Authorization": f"Bearer {intern_token}"}
        onboard_payload = {
            "name": "Jane Doe",
            "email": "jane@gmail.com",
            "password": "internjane",
            "role": "intern",
            "college": "MIT"
        }
        r = requests.post(f"{BASE_URL}/admin/onboard", json=onboard_payload, headers=headers)
        self.assertEqual(r.status_code, 403) # Forbidden for Intern

    def test_03_tasks_and_ai_evaluation(self):
        # Login as intern
        payload = {"email": "intern@gmail.com", "password": "intern123"}
        r = requests.post(f"{BASE_URL}/login", json=payload)
        intern_data = r.json()
        token = intern_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Fetch intern tasks
        r = requests.get(f"{BASE_URL}/tasks/intern", headers=headers)
        self.assertEqual(r.status_code, 200)
        tasks = r.json()
        self.assertTrue(len(tasks) > 0)
        
        # Day 1 should be unlocked, Day 2 locked
        self.assertTrue(tasks[0]["unlocked"])
        self.assertEqual(tasks[0]["day_number"], 1)
        self.assertFalse(tasks[1]["unlocked"])

        # Submit task 1 code
        sub_payload = {
            "task_id": tasks[0]["id"],
            "code_submission": "def greeting(name):\n    return f'Hello, {name}!'",
            "mcq_answers": json.dumps({"1": "A JavaScript Library for building UIs", "2": "Facebook / Meta"})
        }
        r = requests.post(f"{BASE_URL}/submissions", json=sub_payload, headers=headers)
        self.assertEqual(r.status_code, 200)
        res = r.json()
        self.assertEqual(res["mcq_score"], 100)
        self.assertTrue(res["ai_score"] > 50)
        self.assertIsNotNone(res["ai_feedback"])
        
        # Verify Day 2 has now unlocked because Day 1 was submitted!
        r = requests.get(f"{BASE_URL}/tasks/intern", headers=headers)
        tasks_after = r.json()
        self.assertTrue(tasks_after[1]["unlocked"])

    def test_04_messaging_restrictions(self):
        # Login as Intern
        r1 = requests.post(f"{BASE_URL}/login", json={"email": "intern@gmail.com", "password": "intern123"})
        intern_token = r1.json()["access_token"]
        
        # Fetch users to get mentor ID and another user ID
        # Wait, get users requires Admin/Mentor auth, but let's query ourselves or write a message
        headers = {"Authorization": f"Bearer {intern_token}"}
        
        # Fetching dashboard analytics to get assigned mentor info
        r2 = requests.get(f"{BASE_URL}/analytics/dashboard", headers=headers)
        self.assertEqual(r2.status_code, 200)
        
        # Sending a message to mentor (Sarah Connor id is 2 in fresh seeding)
        msg_payload = {
            "receiver_id": 2,
            "content": "Hi Mentor, I completed Day 1 task."
        }
        r3 = requests.post(f"{BASE_URL}/messages", json=msg_payload, headers=headers)
        self.assertEqual(r3.status_code, 200)
        self.assertEqual(r3.json()["content"], "Hi Mentor, I completed Day 1 task.")

        # Attempt to message another intern (Admin id is 1, let's say id is 3 or other. In our DB, admin is 1, mentor is 2, intern is 3).
        # Let's onboard a second intern as Admin first
        # Admin Login
        r_admin = requests.post(f"{BASE_URL}/login", json={"email": "admin@gmail.com", "password": "admin123"})
        admin_token = r_admin.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        onboard_payload = {
            "name": "Intern Two",
            "email": "intern2@gmail.com",
            "password": "intern2pass",
            "role": "intern",
            "college": "MIT"
        }
        r_onboard = requests.post(f"{BASE_URL}/admin/onboard", json=onboard_payload, headers=admin_headers)
        intern2_id = r_onboard.json()["user_id"]

        # Now try to message intern2 from intern1 (Should fail due to restriction: Intern cannot message another intern)
        msg_payload_fail = {
            "receiver_id": intern2_id,
            "content": "Hi there fellow intern!"
        }
        r_msg_fail = requests.post(f"{BASE_URL}/messages", json=msg_payload_fail, headers=headers)
        # Should return 400 Bad Request
        self.assertEqual(r_msg_fail.status_code, 400)
        self.assertIn("Interns cannot message other interns", r_msg_fail.json()["detail"])

if __name__ == "__main__":
    unittest.main()
