import os
import requests
from dotenv import load_dotenv
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

users = [
    ("admin@gmail.com", "admin123"),
    ("mentor@gmail.com", "mentor123"),
    ("intern@gmail.com", "intern123"),
]

for email, password in users:
    print(f"Registering {email}...")
    res = requests.post(
        f"{SUPABASE_URL.rstrip('/')}/auth/v1/signup",
        headers={"apikey": SUPABASE_ANON_KEY, "Authorization": f"Bearer {SUPABASE_ANON_KEY}", "Content-Type": "application/json"},
        json={"email": email, "password": password, "email_confirm": True},
    )
    if res.status_code >= 400:
        print(f"Error for {email}: {res.text}")
    else:
        print(f"Success: {email}")
