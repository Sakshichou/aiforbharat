import uuid
import enum
from sqlalchemy import Column, String, Text, DateTime, Enum, func, Float, Integer
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base

class ReportStatus(str, enum.Enum):
    PENDING = "Pending"
    RESOLVED = "Resolved"

class Report(Base):
    __tablename__ = "reports"

    report_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(String(255), nullable=False, index=True)
    ward_area = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    lat = Column(Float, nullable=False, default=0.0)
    lng = Column(Float, nullable=False, default=0.0)
    ai_category = Column(String(100), nullable=True)
    status = Column(Enum(ReportStatus), default=ReportStatus.PENDING)
    evidence_url = Column(String(1024), nullable=True) # S3 link
    confirmations = Column(Integer, default=0)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
