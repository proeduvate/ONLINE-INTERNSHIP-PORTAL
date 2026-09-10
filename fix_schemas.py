import re

filepath = "backend/schemas.py"
with open(filepath, "r") as f:
    content = f.read()

new_schema = """class BonusAirdropBase(BaseModel):
    title: str
    task_type: str
    question: str
    mcq_options: str | None = None
    correct_answer: str | None = None
    time_limit_seconds: int = 60
    reward_points: str | None = None
    is_active: bool = True

class BonusAirdropCreate(BonusAirdropBase):
    pass

class BonusAirdropResponse(BonusAirdropBase):
    id: int
    class Config:
        from_attributes = True"""

content = re.sub(r'class BonusAirdropBase\(BaseModel\):.*?from_attributes = True', new_schema, content, flags=re.DOTALL)
with open(filepath, "w") as f:
    f.write(content)
print("Updated schemas.py")
