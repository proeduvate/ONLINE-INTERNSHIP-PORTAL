import os
import requests
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=env_path, override=True)

EMAILJS_SERVICE_ID = os.getenv('EMAILJS_SERVICE_ID') or os.getenv('REACT_APP_EMAILJS_SERVICE_ID')
EMAILJS_TEMPLATE_ID = os.getenv('EMAILJS_TEMPLATE_ID') or os.getenv('REACT_APP_EMAILJS_TEMPLATE_ID')
EMAILJS_PUBLIC_KEY = os.getenv('EMAILJS_PUBLIC_KEY') or os.getenv('REACT_APP_EMAILJS_PUBLIC_KEY')
EMAILJS_PRIVATE_KEY = os.getenv('EMAILJS_PRIVATE_KEY') or os.getenv('REACT_APP_EMAILJS_PRIVATE_KEY')

def run_test():
    print('--- Testing EmailJS Notification ---')
    print(f'Service ID:  {EMAILJS_SERVICE_ID}')
    print(f'Template ID: {EMAILJS_TEMPLATE_ID}')
    print(f'Public Key:  {EMAILJS_PUBLIC_KEY}')
    print(f'Private Key: {"Found" if EMAILJS_PRIVATE_KEY else "Missing"}')
    
    if not all([EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY]):
        print('\n[ERROR] Missing required credentials in .env!')
        return

    url = 'https://api.emailjs.com/api/v1.0/email/send'
    payload = {
        'service_id': EMAILJS_SERVICE_ID,
        'template_id': EMAILJS_TEMPLATE_ID,
        'user_id': EMAILJS_PUBLIC_KEY,
        'accessToken': EMAILJS_PRIVATE_KEY,
        'template_params': {
            'to_email': 'sesicca@gmail.com',
            'notification_title': 'Weekly Live Mentoring Session Alert',
            'message_body': 'Your mentor has created a new session. Please join at 4:00 PM.',
            'action_link': 'https://localhost:3000/learning',
            'timestamp': 'Just now'
        }
    }
    headers = {'Content-Type': 'application/json'}
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            print('\n[SUCCESS] Test email dispatched successfully to sesicca@gmail.com!')
        else:
            print(f'\n[FAILED] Error {response.status_code}: {response.text}')
    except Exception as e:
        print(f'\n[FAILED] Exception occurred: {e}')

if __name__ == '__main__':
    run_test()
