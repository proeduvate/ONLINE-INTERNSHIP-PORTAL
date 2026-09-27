import re

filepath = "backend/models.py"
with open(filepath, 'r') as f:
    content = f.read()

new_cert_model = """class Certificate(Base):
    __tablename__ = "certificates"
    
    id = Column(Integer, primary_key=True, index=True)
    intern_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    intern_name = Column(String(150), nullable=False)
    certificate_id = Column(String(100), nullable=False, unique=True)
    domain = Column(String(100), nullable=False)
    duration = Column(String(50), nullable=False)
    achievement = Column(String(100), nullable=True)
    status = Column(String(50), default="PENDING_ADMIN_APPROVAL")
    grade = Column(String(5), nullable=True)
    final_score = Column(Integer, nullable=True)
    pdf_path = Column(String(255), nullable=True)
    issued_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    intern = relationship("User", back_populates="certificates")"""

# Replace the old class
pattern = r'class Certificate\(Base\):.*?intern = relationship\("User", back_populates="certificates"\)'
content = re.sub(pattern, new_cert_model, content, flags=re.DOTALL)

with open(filepath, 'w') as f:
    f.write(content)
print("Updated models.py with new Certificate schema.")
