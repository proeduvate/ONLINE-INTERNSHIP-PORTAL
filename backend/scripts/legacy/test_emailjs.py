import asyncio
import os
from dotenv import load_dotenv

load_dotenv()
from services.email_service import email_service

async def main():
    res = await email_service.send_email(
        "admin1@gmail.com",
        "Test Subject",
        {"intern_name": "Test User", "temp_password": "pwd", "login_url": "link"},
        template_id=email_service.activation_template_id
    )
    print("Email send result:", res)

if __name__ == "__main__":
    asyncio.run(main())
