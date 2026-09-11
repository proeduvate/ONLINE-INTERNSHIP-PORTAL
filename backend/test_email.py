from dotenv import load_dotenv
load_dotenv()
import asyncio
from services.email_service import email_service

async def test_email():
    res = await email_service.send_email(
        "sakthi23cse@gmail.com", 
        "Activate Your Account", 
        {"intern_name": "Test", "temp_password": "123", "login_url": "http://localhost:3000/login"}, 
        template_id=email_service.activation_template_id
    )
    print("Email sent:", res)

asyncio.run(test_email())
