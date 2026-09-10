import os

env_path = "backend/.env"
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        content = f.read()
    
    if "SMTP_EMAIL" not in content:
        with open(env_path, 'a') as f:
            f.write("\n\n# --- Certificate Email Configurations ---\n")
            f.write("SMTP_SERVER=smtp.gmail.com\n")
            f.write("SMTP_PORT=465\n")
            f.write("SMTP_EMAIL=your_email@gmail.com\n")
            f.write("SMTP_PASSWORD=your_app_password\n")
        print("Updated backend/.env with SMTP placeholders.")
    else:
        print("SMTP variables already present in .env.")
else:
    print("No .env found in backend directory.")
