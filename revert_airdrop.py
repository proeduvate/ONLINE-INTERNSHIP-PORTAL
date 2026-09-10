import re

# 1. Revert backend/models.py
filepath_models = "backend/models.py"
with open(filepath_models, "r") as f:
    content_models = f.read()

original_model = """class BonusAirdrop(Base):
    __tablename__ = 'bonus_airdrops'
    id = Column(Integer, primary_key=True, index=True)
    question = Column(String(500), nullable=False)
    time_limit_seconds = Column(Integer, default=60)
    reward_points = Column(Integer, default=10)
    is_active = Column(Boolean, default=True)"""

content_models = re.sub(r'class BonusAirdrop\(Base\):.*?is_active = Column\(Boolean, default=True\)', original_model, content_models, flags=re.DOTALL)

with open(filepath_models, "w") as f:
    f.write(content_models)


# 2. Revert backend/schemas.py
filepath_schemas = "backend/schemas.py"
with open(filepath_schemas, "r") as f:
    content_schemas = f.read()

original_schema = """class BonusAirdropBase(BaseModel):
    title: str
    description: str
    claim_code: Optional[str] = None
    is_active: Optional[bool] = True

class BonusAirdropCreate(BonusAirdropBase):
    pass

class BonusAirdropResponse(BonusAirdropBase):
    id: int
    class Config:
        from_attributes = True"""

content_schemas = re.sub(r'class BonusAirdropBase\(BaseModel\):.*?from_attributes = True', original_schema, content_schemas, flags=re.DOTALL)

with open(filepath_schemas, "w") as f:
    f.write(content_schemas)

print("Reverted models.py and schemas.py to original state.")
