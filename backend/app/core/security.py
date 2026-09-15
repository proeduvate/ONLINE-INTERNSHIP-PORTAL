"""
Authentication and security utilities (separated from core business logic)
"""
import jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Dict, Optional

# Setup secure password hashing configuration
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

import os
from dotenv import load_dotenv

load_dotenv()

# JWT security configurations
SECRET_KEY = os.environ.get("SECRET_KEY", "SUPER_SECRET_COMPLEX_KEY_HERE_THAT_IS_LONGER_THAN_32_BYTES")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 240


def hash_password(password: str) -> str:
    """Hash a plain text password"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain text password against a hashed password"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: int, role: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token for a user"""
    if expires_delta is None:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    expire = datetime.utcnow() + expires_delta
    token_payload = {"user_id": user_id, "role": role, "exp": expire}
    encoded_jwt = jwt.encode(token_payload, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Dict:
    """Decode and validate a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
