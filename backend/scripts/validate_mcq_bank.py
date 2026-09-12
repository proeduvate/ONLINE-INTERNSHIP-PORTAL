import json
import glob
import os

def validate_bank(bank_dir="c:/proeduvate/ONLINE-INTERNSHIP-PORTAL/backend/question_bank"):
    files = glob.glob(os.path.join(bank_dir, "*.json"))
    if len(files) != 30:
        print(f"ERROR: Expected 30 files, found {len(files)}.")
        return False
        
    all_ids = set()
    total_questions = 0
    day_counts = {}
    
    for fpath in sorted(files):
        with open(fpath, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        day = data.get("day")
        if not (1 <= day <= 30):
            print(f"ERROR in {fpath}: Invalid day {day}")
            return False
            
        questions = data.get("questions", [])
        if len(questions) != 50:
            print(f"ERROR in {fpath}: Expected 50 questions, found {len(questions)}.")
            return False
            
        day_counts[day] = len(questions)
        
        for q in questions:
            q_id = q.get("id")
            if not q_id:
                print(f"ERROR in {fpath}: Missing question id.")
                return False
                
            if q_id in all_ids:
                print(f"ERROR in {fpath}: Duplicate ID found: {q_id}")
                return False
            all_ids.add(q_id)
            
            if not q_id.startswith(f"D{day}-"):
                print(f"ERROR in {fpath}: Invalid ID prefix: {q_id}")
                return False
                
            options = q.get("options", {})
            if len(options) != 4 or set(options.keys()) != {"A", "B", "C", "D"}:
                print(f"ERROR in {fpath}: Invalid options for {q_id}.")
                return False
                
            correct_answer = q.get("correct_answer")
            if correct_answer not in {"A", "B", "C", "D"}:
                print(f"ERROR in {fpath}: Invalid correct_answer for {q_id}.")
                return False
                
        total_questions += len(questions)
        print(f"Day {day}: {len(questions)} questions OK")
        
    print(f"\nTotal: {total_questions} questions OK")
    if total_questions == 1500:
        print("Validation PASSED.")
        return True
    return False

if __name__ == "__main__":
    validate_bank()
