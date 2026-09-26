import os

filepath = "backend/models.py"
with open(filepath, "r") as f:
    content = f.read()

new_model = """class BonusAirdrop(Base):
    __tablename__ = 'bonus_airdrops'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=True)
    task_type = Column(String(100), nullable=True)
    question = Column(String(500), nullable=False)
    mcq_options = Column(Text, nullable=True)
    correct_answer = Column(String(200), nullable=True)
    time_limit_seconds = Column(Integer, default=60)
    reward_points = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)"""

# replace the old BonusAirdrop model
import re
content = re.sub(r'class BonusAirdrop\(Base\):.*?is_active = Column\(Boolean, default=True\)', new_model, content, flags=re.DOTALL)

with open(filepath, "w") as f:
    f.write(content)
print("Updated models.py")
