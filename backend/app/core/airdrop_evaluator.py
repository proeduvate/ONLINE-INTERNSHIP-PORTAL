import json
from typing import Any, Dict

def evaluate_airdrop_submission(task_type: str, task_config: Dict[str, Any], submitted_answer: Any) -> bool:
    """
    Evaluates an airdrop submission deterministically.
    """
    if task_type == "mcq":
        # MCQ: The submitted answer must match the exact string in correct_answer
        correct_answer = str(task_config.get("correct_answer", ""))
        submitted = str(submitted_answer).strip() if submitted_answer is not None else ""
        return submitted == correct_answer

    elif task_type == "pattern":
        # Pattern: exact string match (case insensitive, stripped)
        correct_answer = str(task_config.get("correct_answer", "")).strip().lower()
        submitted = str(submitted_answer).strip().lower() if submitted_answer is not None else ""
        return submitted == correct_answer

    elif task_type == "true_false":
        # True/False: strict boolean match
        correct_answer = bool(task_config.get("correct_answer", False))
        
        # Parse submitted answer to bool
        if isinstance(submitted_answer, bool):
            submitted = submitted_answer
        elif isinstance(submitted_answer, str):
            submitted = submitted_answer.strip().lower() in ['true', '1', 'yes']
        elif isinstance(submitted_answer, int):
            submitted = bool(submitted_answer)
        else:
            submitted = False
            
        return submitted == correct_answer

    elif task_type == "fill_blank":
        # Match EXACT string, case insensitive
        correct_answer = str(task_config.get("correct_answer", "")).strip().lower()
        submitted = str(submitted_answer).strip().lower() if submitted_answer is not None else ""
        return submitted == correct_answer

    elif task_type == "match":
        # Match: Pairs validation. submitted_answer should be a dict of {key: matched_value}
        correct_pairs = task_config.get("pairs", {})
        if not isinstance(submitted_answer, dict):
            # Try to parse JSON if string
            if isinstance(submitted_answer, str):
                try:
                    submitted_answer = json.loads(submitted_answer)
                except:
                    return False
            else:
                return False
                
        # Must match length and exact pairs
        if len(submitted_answer) != len(correct_pairs):
            return False
            
        for k, v in correct_pairs.items():
            if submitted_answer.get(k) != v:
                return False
        return True

    elif task_type == "arrange":
        # Arrange: order validation. submitted_answer should be an ordered list
        correct_order = task_config.get("correct_order", [])
        if not isinstance(submitted_answer, list):
            # Try to parse JSON if string
            if isinstance(submitted_answer, str):
                try:
                    submitted_answer = json.loads(submitted_answer)
                except:
                    return False
            else:
                return False
                
        if len(submitted_answer) != len(correct_order):
            return False
            
        for i in range(len(correct_order)):
            if str(submitted_answer[i]).strip() != str(correct_order[i]).strip():
                return False
        return True

    elif task_type == "code_output_mcq":
        # Same as MCQ
        correct_answer = str(task_config.get("correct_answer", ""))
        submitted = str(submitted_answer).strip() if submitted_answer is not None else ""
        return submitted == correct_answer

    return False
