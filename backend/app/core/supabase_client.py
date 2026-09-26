import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://vilcgxfidyjunirdkxxu.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY") or os.environ.get("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbGNneGZpZHlqdW5pcmRreHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNTA0MDAsImV4cCI6MjA1NTkyNjQwMH0.placeholder")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_KEY)

_supabase_client = None
_supabase_admin = None

def get_supabase_client():
    """
    Get or initialize standard Supabase client for public/auth operations.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not SUPABASE_URL:
        return None

    try:
        from supabase import create_client, Client
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        return _supabase_client
    except Exception as e:
        print(f"Warning: Could not initialize Supabase client: {e}")
        return None

def get_supabase_admin():
    """
    Get or initialize Supabase client with admin/service-role privileges for user management and storage.
    """
    global _supabase_admin
    if _supabase_admin is not None:
        return _supabase_admin

    if not SUPABASE_URL:
        return None

    key = SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY
    try:
        from supabase import create_client, Client
        _supabase_admin = create_client(SUPABASE_URL, key)
        return _supabase_admin
    except Exception as e:
        print(f"Warning: Could not initialize Supabase admin client: {e}")
        return None

