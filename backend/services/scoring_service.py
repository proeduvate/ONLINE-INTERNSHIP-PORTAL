import json
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
from datetime import datetime, timezone
import math

def calculate_final_grade(db: Session, intern: models.User, force_recalculate: bool = False):
    """
    Calculates the 30-day final grade for an intern.
    Returns the FinalEvaluation record (or creates one).
    """
    if intern.role != models.UserRole.INTERN:
        return None

    evaluation = db.query(models.FinalEvaluation).filter(models.FinalEvaluation.intern_id == intern.id).first()
    if evaluation and evaluation.is_completed and not force_recalculate:
        return evaluation
        
    if not evaluation:
        evaluation = models.FinalEvaluation(intern_id=intern.id)
        db.add(evaluation)

    # 1. Determine 30-day Completion Condition
    # Check if 30 days of attendance exist.
    is_completed = False
    attendance_count = db.query(models.AttendanceLog).filter(
        models.AttendanceLog.intern_id == intern.id,
        models.AttendanceLog.status == "present"
    ).count()
    if attendance_count >= 30:
        is_completed = True

    evaluation.is_completed = is_completed

    # 2. Get Config
    config = db.query(models.FinalGradeConfig).first()
    if not config:
        config = models.FinalGradeConfig()
        db.add(config)
        db.commit()

    # 3. Calculate MCQ Performance Percentage
    # We take the average percentage of all MCQAttempts for this intern
    mcq_attempts = db.query(models.MCQAttempt).filter(
        models.MCQAttempt.intern_id == intern.id,
        models.MCQAttempt.status == models.MCQAttemptStatus.SUBMITTED
    ).all()
    
    mcq_percentage = 0.0
    if mcq_attempts:
        total_pct = sum(atm.percentage for atm in mcq_attempts)
        mcq_percentage = total_pct / len(mcq_attempts)
        
    evaluation.mcq_final_mark = round((mcq_percentage / 100.0) * config.mcq_weight, 2)

    # 4. Calculate Code Assessment Performance Percentage
    # The AI score is out of 100 per submission (usually).
    # We take the average of all ai_score
    code_submissions = db.query(models.Submission).filter(
        models.Submission.intern_id == intern.id,
        models.Submission.status.in_(["submitted", "approved", "rejected"])
    ).all()
    
    code_percentage = 0.0
    if code_submissions:
        total_ai = sum(s.ai_score for s in code_submissions if s.ai_score)
        code_percentage = total_ai / len(code_submissions)
        
    evaluation.code_final_mark = round((code_percentage / 100.0) * config.code_weight, 2)

    # 5. Calculate Airdrop Performance
    # Total available = sum of max points for all published/finalized airdrops applicable to this intern
    airdrops_query = db.query(models.BonusAirdrop).filter(
        models.BonusAirdrop.status.in_(["PUBLISHED", "FINALIZED"])
    )
    
    total_available_airdrop = 0.0
    domain_obj = db.query(models.Domain).filter(models.Domain.id == intern.domain_id).first() if getattr(intern, 'domain_id', None) else None
    intern_domain_name = domain_obj.name if domain_obj else None
    for airdrop in airdrops_query.all():
        # Check domain and batch applicability
        if airdrop.domain and airdrop.domain != intern_domain_name:
            continue
        if airdrop.batch_id and airdrop.batch_id != intern.batch_id:
            continue
            
        try:
            points_arr = [int(p.strip()) for p in airdrop.points_distribution.split(",") if p.strip().isdigit()]
            if points_arr:
                total_available_airdrop += points_arr[0]
        except:
            pass

    # Total earned = sum of bonus_points in AirdropResult
    earned_airdrop = 0.0
    results = db.query(models.AirdropResult).filter(models.AirdropResult.intern_id == intern.id).all()
    earned_airdrop = sum(res.bonus_points for res in results)
    
    if total_available_airdrop > 0:
        airdrop_ratio = earned_airdrop / total_available_airdrop
        evaluation.airdrop_final_mark = round(airdrop_ratio * config.airdrop_weight, 2)
    else:
        evaluation.airdrop_final_mark = 0.0

    # 6. Calculate Mentor Evaluation Performance
    # Instead of a single final manual score, average the daily mentor evaluations
    mentor_percentage = 0.0
    if code_submissions:
        # Mentor score is out of 100
        # Only include submissions where the mentor has actually provided a score (status == 'approved' or 'rejected')
        reviewed_subs = [s for s in code_submissions if s.mentor_score is not None and s.mentor_score > 0]
        if reviewed_subs:
            total_mentor = sum(s.mentor_score for s in reviewed_subs)
            mentor_percentage = total_mentor / len(reviewed_subs)
        
    evaluation.mentor_evaluation_mark = round((mentor_percentage / 100.0) * config.mentor_weight, 2)

    # 7. Final Score Formula (only if completed)
    # 7. Final Score Formula
    final_score = (
        evaluation.mcq_final_mark +
        evaluation.code_final_mark +
        evaluation.airdrop_final_mark +
        evaluation.mentor_evaluation_mark
    )
    evaluation.final_score = round(final_score, 2)

    # 8. Grade Calculation
    if not evaluation.is_completed:
        evaluation.grade = None
        db.commit()
        db.refresh(evaluation)
        return evaluation

    # 8. Grade Calculation
    try:
        grade_ranges = json.loads(config.grade_ranges_json)
        # Assuming grade_ranges is dict like {"A+": 90, "A": 80, ...}
        assigned_grade = "F"
        # Sort by threshold descending
        sorted_grades = sorted(grade_ranges.items(), key=lambda item: item[1], reverse=True)
        for grade_name, threshold in sorted_grades:
            if final_score >= threshold:
                assigned_grade = grade_name
                break
        evaluation.grade = assigned_grade
    except:
        evaluation.grade = "N/A"

    db.commit()
    db.refresh(evaluation)
    return evaluation

def bulk_calculate_final_grades(db: Session, interns: list, force_recalculate: bool = False):
    """
    Calculates the 30-day final grades for a list of interns in bulk to prevent N+1 queries.
    Returns a list of FinalEvaluation records.
    """
    if not interns:
        return []

    intern_ids = [intern.id for intern in interns]
    
    # 1. Get existing evaluations
    existing_evals = {e.intern_id: e for e in db.query(models.FinalEvaluation).filter(models.FinalEvaluation.intern_id.in_(intern_ids)).all()}
    
    evaluations_to_return = []
    interns_to_process = []
    evaluations_to_process = {}
    
    for intern in interns:
        evaluation = existing_evals.get(intern.id)
        if evaluation and evaluation.is_completed and not force_recalculate:
            evaluations_to_return.append(evaluation)
        else:
            if not evaluation:
                evaluation = models.FinalEvaluation(intern_id=intern.id)
                db.add(evaluation)
            interns_to_process.append(intern)
            evaluations_to_process[intern.id] = evaluation

    if not interns_to_process:
        return evaluations_to_return

    # 2. Get Config
    config = db.query(models.FinalGradeConfig).first()
    if not config:
        config = models.FinalGradeConfig()
        db.add(config)
        db.commit()

    try:
        grade_ranges = json.loads(config.grade_ranges_json)
        sorted_grades = sorted(grade_ranges.items(), key=lambda item: item[1], reverse=True)
    except:
        sorted_grades = []

    # 3. Bulk fetch data for all interns_to_process
    process_ids = [intern.id for intern in interns_to_process]
    
    # Submissions
    submissions = db.query(models.Submission).filter(
        models.Submission.intern_id.in_(process_ids),
        models.Submission.status.in_(["submitted", "approved", "rejected"])
    ).all()
    sub_by_intern = {i: [] for i in process_ids}
    for sub in submissions:
        sub_by_intern[sub.intern_id].append(sub)

    # MCQ Attempts
    mcqs = db.query(models.MCQAttempt).filter(
        models.MCQAttempt.intern_id.in_(process_ids),
        models.MCQAttempt.status == models.MCQAttemptStatus.SUBMITTED
    ).all()
    mcq_by_intern = {i: [] for i in process_ids}
    for m in mcqs:
        mcq_by_intern[m.intern_id].append(m)
        
    # Airdrops
    airdrops = db.query(models.BonusAirdrop).filter(
        models.BonusAirdrop.status.in_(["PUBLISHED", "FINALIZED"])
    ).all()
    domain_map = {d.id: d.name for d in db.query(models.Domain).all()}
    
    # Airdrop Results
    airdrop_results = db.query(models.AirdropResult).filter(
        models.AirdropResult.intern_id.in_(process_ids)
    ).all()
    airdrop_res_by_intern = {i: [] for i in process_ids}
    for ar in airdrop_results:
        airdrop_res_by_intern[ar.intern_id].append(ar)

    # Attendance Logs
    attendances = db.query(models.AttendanceLog).filter(
        models.AttendanceLog.intern_id.in_(process_ids),
        models.AttendanceLog.status == "present"
    ).all()
    attendance_by_intern = {i: 0 for i in process_ids}
    for att in attendances:
        attendance_by_intern[att.intern_id] += 1

    # Now calculate per intern
    for intern in interns_to_process:
        evaluation = evaluations_to_process[intern.id]
        
        # Completion
        is_completed = False
        if attendance_by_intern[intern.id] >= 30:
            is_completed = True
        evaluation.is_completed = is_completed
        
        # MCQ
        intern_mcqs = mcq_by_intern[intern.id]
        mcq_percentage = 0.0
        if intern_mcqs:
            total_pct = sum(atm.percentage for atm in intern_mcqs)
            mcq_percentage = total_pct / len(intern_mcqs)
        evaluation.mcq_final_mark = round((mcq_percentage / 100.0) * config.mcq_weight, 2)
        
        # Code
        intern_subs = sub_by_intern[intern.id]
        code_percentage = 0.0
        if intern_subs:
            total_ai = sum(s.ai_score for s in intern_subs if s.ai_score)
            code_percentage = total_ai / len(intern_subs)
        evaluation.code_final_mark = round((code_percentage / 100.0) * config.code_weight, 2)
        
        # Airdrop
        total_available_airdrop = 0.0
        domain_id_val = getattr(intern, 'domain_id', None)
        intern_domain_name = domain_map.get(domain_id_val) if domain_id_val else None
        for airdrop in airdrops:
            if airdrop.domain and airdrop.domain != intern_domain_name:
                continue
            if airdrop.batch_id and airdrop.batch_id != intern.batch_id:
                continue
            try:
                points_arr = [int(p.strip()) for p in airdrop.points_distribution.split(",") if p.strip().isdigit()]
                if points_arr:
                    total_available_airdrop += points_arr[0]
            except:
                pass
                
        earned_airdrop = sum(res.bonus_points for res in airdrop_res_by_intern[intern.id])
        if total_available_airdrop > 0:
            airdrop_ratio = earned_airdrop / total_available_airdrop
            evaluation.airdrop_final_mark = round(airdrop_ratio * config.airdrop_weight, 2)
        else:
            evaluation.airdrop_final_mark = 0.0
            
        # Mentor
        mentor_percentage = 0.0
        if intern_subs:
            reviewed_subs = [s for s in intern_subs if s.mentor_score is not None and s.mentor_score > 0]
            if reviewed_subs:
                total_mentor = sum(s.mentor_score for s in reviewed_subs)
                mentor_percentage = total_mentor / len(reviewed_subs)
        evaluation.mentor_evaluation_mark = round((mentor_percentage / 100.0) * config.mentor_weight, 2)
        
        # Final Score
        final_score = (
            evaluation.mcq_final_mark +
            evaluation.code_final_mark +
            evaluation.airdrop_final_mark +
            evaluation.mentor_evaluation_mark
        )
        evaluation.final_score = round(final_score, 2)
        
        if not evaluation.is_completed:
            evaluation.grade = None
        else:
            assigned_grade = "F"
            if sorted_grades:
                for grade_name, threshold in sorted_grades:
                    if final_score >= threshold:
                        assigned_grade = grade_name
                        break
                evaluation.grade = assigned_grade
            else:
                evaluation.grade = "N/A"
                
        evaluations_to_return.append(evaluation)

    db.commit()
    for ev in evaluations_to_process.values():
        db.refresh(ev)
        
    return evaluations_to_return
