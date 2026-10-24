import os
import logging
from typing import Optional
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

logger = logging.getLogger(__name__)

SCOPES = ['https://www.googleapis.com/auth/drive.file']

class GoogleDriveService:
    def __init__(self):
        self.credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        self.drive_folder_id = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
        self.is_configured = bool(self.credentials_path and os.path.exists(self.credentials_path))
        
        if not self.is_configured:
            logger.warning("[GoogleDriveService] Google Application Credentials not found or invalid. Drive operations will be mocked.")
        
        self.service = None
        if self.is_configured:
            try:
                creds = service_account.Credentials.from_service_account_file(
                    self.credentials_path, scopes=SCOPES)
                self.service = build('drive', 'v3', credentials=creds)
            except Exception as e:
                logger.error(f"[GoogleDriveService] Error initializing Google Drive service: {e}")
                self.is_configured = False

    def upload_file(self, file_path: str, filename: str, mime_type: str = "application/pdf") -> Optional[str]:
        """
        Uploads a file to Google Drive and returns the webViewLink (URL).
        """
        if not self.is_configured or not self.service:
            logger.info(f"[GoogleDriveService - MOCK] Uploading {filename} to Google Drive...")
            return f"https://mock-drive-url.com/{filename}"

        try:
            file_metadata = {
                'name': filename,
                'parents': [self.drive_folder_id] if self.drive_folder_id else []
            }
            media = MediaFileUpload(file_path, mimetype=mime_type, resumable=True)
            
            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, webViewLink'
            ).execute()
            
            # Make the file accessible to anyone with the link
            self.service.permissions().create(
                fileId=file.get('id'),
                body={'type': 'anyone', 'role': 'reader'}
            ).execute()
            
            return file.get('webViewLink')
        except Exception as e:
            logger.error(f"[GoogleDriveService] Upload failed for {filename}: {e}")
            return None

google_drive_service = GoogleDriveService()
