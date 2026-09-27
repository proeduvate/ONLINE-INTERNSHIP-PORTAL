from fastapi import APIRouter
from pydantic import BaseModel
from pathlib import Path
import json

router = APIRouter()

# The data is now in backend/data/curriculum
DATA = Path(__file__).resolve().parents[1] / "data" / "curriculum"

class CurriculumUpdate(BaseModel):
    topic: str | None = None
    learningObjectives: list[str] | None = None
    activities: list[dict] | None = None

@router.get("/{day}")
def get_day(day: int):
    p = DATA / f"day-{day:02d}.json"
    if not p.exists(): return {"error": "day not found"}
    return json.loads(p.read_text(encoding="utf-8"))

@router.put("/{day}")
def update_day(day: int, body: CurriculumUpdate):
    p = DATA / f"day-{day:02d}.json"
    if not p.exists(): return {"error": "day not found"}
    data = json.loads(p.read_text(encoding="utf-8"))
    patch = body.model_dump(exclude_none=True)
    data.update(patch)
    data["version"] = data.get("version", 1) + 1
    p.write_text(json.dumps(data, indent=2), encoding="utf-8")
    return data
