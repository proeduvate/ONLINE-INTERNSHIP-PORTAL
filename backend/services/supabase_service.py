import os
from supabase import create_client, Client
from typing import Optional
import logging
from fastapi import HTTPException

logger = logging.getLogger(__name__)

class SupabaseService:
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_ANON_KEY")
        if not self.url or not self.key:
            logger.warning("[SupabaseService] SUPABASE_URL or SUPABASE_ANON_KEY not set!")
            self.client = None
        else:
            self.client: Client = create_client(self.url, self.key)

    def register_user(self, email: str, password: str) -> Optional[str]:
        """
        Registers a new user in Supabase Authentication and returns their supabase_id.
        """
        if not self.client:
            logger.error("[SupabaseService] Cannot register user: Supabase client not initialized")
            return None

        try:
            logger.info(f"[SupabaseService] Registering user {email} in Supabase Auth...")
            response = self.client.auth.sign_up({
                "email": email,
                "password": password
            })
            
            if response.user:
                logger.info(f"[SupabaseService] Successfully registered user {email}")
                return response.user.id
            else:
                logger.error(f"[SupabaseService] Registration failed for {email}: No user returned")
                return None
        except Exception as e:
            logger.error(f"[SupabaseService] Error registering user {email}: {str(e)}")
            return None

    def upload_file(self, file_content: bytes, bucket_name: str, filename: str, content_type: str = "application/pdf") -> Optional[str]:
        """
        Uploads a file to a Supabase Storage bucket and returns its public URL.
        """
        if not self.client:
            logger.error(f"[SupabaseService] Cannot upload {filename}: Supabase client not initialized")
            return None

        try:
            logger.info(f"[SupabaseService] Uploading {filename} to bucket '{bucket_name}'...")
            
            # Ensure bucket exists (or at least attempt to upload, let it fail if bucket is missing)
            res = self.client.storage.from_(bucket_name).upload(
                path=filename,
                file=file_content,
                file_options={"content-type": content_type, "upsert": "true"}
            )
            
            public_url = self.client.storage.from_(bucket_name).get_public_url(filename)
            logger.info(f"[SupabaseService] Successfully uploaded {filename}. Public URL: {public_url}")
            return public_url
            
        except Exception as e:
            logger.error(f"[SupabaseService] Upload failed for {filename}: {str(e)}")
            # Sometimes supabase returns an error string in exception, we should handle it gracefully
            return None

supabase_service = SupabaseService()
